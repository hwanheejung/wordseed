import { useReducer, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { navigate } from "@/shared/navigation";
import { type VocabularyCard, useCardsQuery } from "@/entities/card";
import { CardVisibilitySheet, useCardVisibilityPreferences } from "@/features/configure-card-visibility";
import { CardActionsMenu, CardEditor } from "@/features/manage-cards";
import { createStudySession, getCurrentStudyItem, getNextStudyItem, getPreviousStudyItem, LearningCardSession, startQueueAt, studySessionReducer, submitStudyReview, type StudyQueueItem } from "@/features/study-session";
import { AppHeader } from "@/shared/ui/app-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageLoadingState } from "@/shared/ui/page-loading-state";

interface CardPageProps {
  cardIds: string[];
  startIndex: number;
}

export function CardPage({ cardIds, startIndex }: CardPageProps) {
  const { availableTags, cards, isLoading } = useCardsQuery({ ids: cardIds });

  if (isLoading)
    return (
      <>
        <AppHeader title="단어 카드" onBack={() => navigate({ page: "library" })} />
        <PageLoadingState />
      </>
    );

  const items = startQueueAt(cards, startIndex).flatMap((card) =>
    card.meanings.map((meaning) => ({ card, meaning })),
  );

  return (
    <CardPageSession
      availableTags={availableTags}
      items={items}
    />
  );
}

interface CardPageSessionProps {
  availableTags: string[];
  items: StudyQueueItem[];
}

function CardPageSession({ availableTags, items }: CardPageSessionProps) {
  const [session, dispatch] = useReducer(studySessionReducer, items, createStudySession);
  const item = getCurrentStudyItem(session);
  const { preferences, savePreferences } = useCardVisibilityPreferences();
  const [editingCard, setEditingCard] = useState<VocabularyCard>();
  const [visibilityOpen, setVisibilityOpen] = useState(false);

  if (editingCard)
    return (
      <CardEditor
        card={editingCard}
        availableTags={availableTags}
        onClose={() => setEditingCard(undefined)}
        onSaved={(card) => dispatch({ type: "cardReplaced", card })}
        onDeleted={(cardId) => {
          dispatch({ type: "cardRemoved", cardId });
          setEditingCard(undefined);
        }}
      />
    );

  if (!item)
    return (
      <>
        <AppHeader title="단어 카드" onBack={() => navigate({ page: "library" })} />
        <main className="min-h-[calc(100vh-84px)] p-5">
          <EmptyState
            title="표시할 단어가 없어요"
            description="단어장에서 다른 카드를 선택해 주세요."
            action={<ActionButton onClick={() => navigate({ page: "library" })}>단어장 보기</ActionButton>}
          />
        </main>
      </>
    );

  return (
    <>
      <AppHeader
        title="단어 카드"
        subtitle={`${item.card.meanings.length}개 뜻`}
        onBack={() => navigate({ page: "library" })}
        action={
          <CardActionsMenu
            card={item.card}
            onEdit={() => setEditingCard(item.card)}
            onDeleted={(cardId) => dispatch({ type: "cardRemoved", cardId })}
            onVisibility={() => setVisibilityOpen(true)}
          />
        }
      />
      <LearningCardSession
        item={item}
        previousItem={getPreviousStudyItem(session)}
        nextItem={getNextStudyItem(session)}
        navigationRevision={session.revision}
        concealedFields={preferences.concealedFields}
        onNavigate={(direction) => dispatch({ type: "navigated", direction })}
        onReview={async (result) =>
          dispatch({
            type: "reviewRecorded",
            item: await submitStudyReview(item, result),
            removeCorrectFromQueue: false,
          })
        }
        onMemoryAidSaved={(meaning) =>
          dispatch({ type: "memoryAidSaved", meaning })
        }
      />
      <CardVisibilitySheet
        key={preferences.concealedFields.join("|")}
        open={visibilityOpen}
        preferences={preferences}
        onOpenChange={setVisibilityOpen}
        onApply={savePreferences}
      />
    </>
  );
}
