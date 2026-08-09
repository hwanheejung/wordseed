import { useReducer, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { navigate } from "@/shared/navigation";
import { normalizeTags, type VocabularyCard, useCardsQuery } from "@/entities/card";
import { CardVisibilitySheet, useCardVisibilityPreferences } from "@/features/configure-card-visibility";
import { CardActionsMenu, CardEditor } from "@/features/manage-cards";
import { buildFocusQueue, createStudySession, getCurrentStudyItem, getNextStudyItem, getPreviousStudyItem, LearningCardSession, studySessionReducer, submitStudyReview, type StudyQueueItem } from "@/features/study-session";
import { AppHeader } from "@/shared/ui/app-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageLoadingState } from "@/shared/ui/page-loading-state";

export function FocusStudyPage() {
  const { cards, isLoading } = useCardsQuery({
    statuses: ["unknown", "confusing"],
  });

  if (isLoading)
    return (
      <>
        <AppHeader title="몰랐어요 · 헷갈려요" onBack={() => navigate({ page: "home" })} />
        <PageLoadingState />
      </>
    );

  return <FocusStudyPageSession cards={cards} items={buildFocusQueue(cards)} />;
}

interface FocusStudyPageSessionProps {
  cards: VocabularyCard[];
  items: StudyQueueItem[];
}

function FocusStudyPageSession({ cards, items }: FocusStudyPageSessionProps) {
  const [session, dispatch] = useReducer(studySessionReducer, items, createStudySession);
  const item = getCurrentStudyItem(session);
  const { preferences, savePreferences } = useCardVisibilityPreferences();
  const [editingCard, setEditingCard] = useState<VocabularyCard>();
  const [visibilityOpen, setVisibilityOpen] = useState(false);

  if (editingCard)
    return (
      <CardEditor
        card={editingCard}
        availableTags={normalizeTags(cards.flatMap((card) => card.tags))}
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
        <AppHeader title="몰랐어요 · 헷갈려요" onBack={() => navigate({ page: "home" })} />
        <main className="min-h-[calc(100vh-84px)] p-5">
          <EmptyState
            title="집중 학습할 단어가 없어요"
            description="몰랐어요 또는 헷갈려요로 표시한 단어가 여기에 모여요."
            action={<ActionButton onClick={() => navigate({ page: "home" })}>돌아가기</ActionButton>}
          />
        </main>
      </>
    );

  return (
    <>
      <AppHeader
        title="몰랐어요 · 헷갈려요"
        subtitle={`${session.queue.length}개 뜻`}
        onBack={() => navigate({ page: "home" })}
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
        layerCount={Math.max(session.queue.length, session.history.length)}
        navigationRevision={session.revision}
        concealedFields={preferences.concealedFields}
        removeCorrectFromQueue
        onNavigate={(direction) => dispatch({ type: "navigated", direction })}
        onReview={async (result) =>
          dispatch({
            type: "reviewRecorded",
            item: await submitStudyReview(item, result),
            removeCorrectFromQueue: true,
          })
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
