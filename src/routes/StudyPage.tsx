import { useReducer, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { navigate } from "@/shared/navigation";
import {
  type VocabularyCard,
  useCardsQuery,
} from "@/entities/card";
import {
  CardVisibilitySheet,
  useCardVisibilityPreferences,
} from "@/features/configure-card-visibility";
import { CardActionsMenu, CardEditor } from "@/features/manage-cards";
import {
  buildStudyQueue,
  createStudySession,
  getCurrentStudyItem,
  getNextStudyItem,
  getPreviousStudyItem,
  LearningCardSession,
  startQueueAt,
  studySessionReducer,
  submitStudyReview,
  type StudyQueueItem,
} from "@/features/study-session";
import { AppHeader } from "@/shared/ui/app-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageLoadingState } from "@/shared/ui/page-loading-state";

interface StudyPageProps {
  tag?: string;
  meaningId?: string;
}

export function StudyPage({ tag, meaningId }: StudyPageProps) {
  const { availableTags, cards, isLoading } = useCardsQuery({
    tags: tag ? [tag] : [],
  });
  const title = tag ? `#${tag} 학습` : "학습 모드";

  if (isLoading)
    return (
      <>
        <AppHeader title={title} onBack={() => navigate({ page: "home" })} />
        <PageLoadingState />
      </>
    );

  return (
    <StudyPageSession
      availableTags={availableTags}
      title={title}
      items={startQueueAtMeaning(
        buildStudyQueue(cards),
        meaningId,
      )}
    />
  );
}

interface StudyPageSessionProps {
  availableTags: string[];
  title: string;
  items: StudyQueueItem[];
}

function StudyPageSession({ availableTags, title, items }: StudyPageSessionProps) {
  const [session, dispatch] = useReducer(
    studySessionReducer,
    items,
    createStudySession,
  );
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
        <AppHeader title={title} onBack={() => navigate({ page: "home" })} />
        <main className="min-h-[calc(100vh-84px)] p-5">
          <EmptyState
            title="학습할 단어가 없어요"
            description="단어를 추가하거나 다른 학습 목록을 선택해 주세요."
            action={
              <ActionButton onClick={() => navigate({ page: "home" })}>
                돌아가기
              </ActionButton>
            }
          />
        </main>
      </>
    );

  return (
    <>
      <AppHeader
        title={title}
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
        navigationRevision={session.revision}
        concealedFields={preferences.concealedFields}
        onNavigate={(direction) =>
          dispatch({ type: "navigated", direction })
        }
        onReview={async (result) => {
          dispatch({
            type: "reviewRecorded",
            item: await submitStudyReview(item, result),
            removeCorrectFromQueue: false,
          });
        }}
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

function startQueueAtMeaning(items: StudyQueueItem[], meaningId?: string) {
  if (!meaningId) return items;
  const startIndex = items.findIndex((item) => item.meaning.id === meaningId);

  return startIndex > 0 ? startQueueAt(items, startIndex) : items;
}
