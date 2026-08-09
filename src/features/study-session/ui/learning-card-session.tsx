import type { ReviewResult, VocabularyCard } from "@/entities/card";
import { reviewResultMeta } from "@/entities/card";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { AppHeader } from "@/shared/ui/app-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { submitStudyReview } from "../actions/submit-study-review";
import type { StudyQueueItem } from "../types/study-queue-item";
import {
  createStudySession,
  getCurrentStudyItem,
  getNextStudyItem,
  getPreviousStudyItem,
  navigateStudySession,
  reviewStudySession,
} from "../utils/study-session-navigation";
import { SwipeableCardStack } from "./swipeable-card-stack";

export function LearningCardSession({
  title,
  items,
  emptyTitle,
  emptyDescription,
  onBack,
  removeCorrectFromQueue = false,
  onEdit,
  subtitle,
}: {
  title: string;
  items: StudyQueueItem[];
  emptyTitle: string;
  emptyDescription: string;
  onBack: () => void;
  removeCorrectFromQueue?: boolean;
  onEdit?: (card: VocabularyCard) => void;
  subtitle?: (item: StudyQueueItem, itemCount: number) => string;
}) {
  const [session, setSession] = useState(() => createStudySession(items));
  const item = getCurrentStudyItem(session);

  if (!item)
    return (
      <>
        <AppHeader title={title} onBack={onBack} />
        <main className="min-h-[calc(100vh-84px)] p-5">
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={<ActionButton onClick={onBack}>돌아가기</ActionButton>}
          />
        </main>
      </>
    );

  const navigateWithoutRating = (direction: "next" | "previous") => {
    setSession((current) => navigateStudySession(current, direction));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitReview = async (result: ReviewResult) => {
    const updated = await submitStudyReview(item, result);
    setSession((current) =>
      reviewStudySession(current, updated, removeCorrectFromQueue),
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <AppHeader
        title={title}
        subtitle={
          subtitle?.(item, session.queue.length) ??
          `${session.queue.length}개 뜻`
        }
        onBack={onBack}
        action={
          onEdit ? (
            <ActionButton
              size="small"
              variant="neutralWeak"
              onClick={() => onEdit(item.card)}
              aria-label={`${item.card.term} 카드 수정`}
            >
              ✎ 수정
            </ActionButton>
          ) : undefined
        }
      />
      <main className="min-h-[calc(100vh-84px)] overflow-y-hidden! bg-[var(--seed-color-bg-layer-basement)] p-5 pb-[130px]">
        <SwipeableCardStack
          item={item}
          previousItem={getPreviousStudyItem(session)}
          nextItem={getNextStudyItem(session)}
          itemCount={Math.max(session.queue.length, session.history.length)}
          navigationRevision={session.revision}
          onNavigate={navigateWithoutRating}
        />
      </main>
      <div className="fixed bottom-0 left-1/2 z-12 grid w-[min(520px,100%)] -translate-x-1/2 grid-cols-3 gap-2 border-t border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] px-3.5 pt-3 pb-[calc(12px+var(--seed-safe-area-bottom))] [&_button]:min-h-[68px] [&_button]:cursor-pointer [&_button]:rounded-[18px] [&_button]:border-0 [&_b]:block [&_b]:text-[length:var(--seed-font-size-t4)] [&_span]:mt-1 [&_span]:block [&_span]:text-[length:var(--seed-font-size-t2)]">
        {(["unknown", "confusing", "correct"] as ReviewResult[]).map(
          (result) => (
            <button
              key={result}
              aria-pressed={item.meaning.status === result}
              className={`${
                result === "unknown"
                  ? "bg-[var(--seed-color-bg-critical-weak)] text-[var(--seed-color-fg-critical-contrast)]"
                  : result === "confusing"
                    ? "bg-[var(--seed-color-bg-warning-weak)] text-[var(--seed-color-fg-warning-contrast)]"
                    : "bg-[var(--seed-color-bg-positive-weak)] text-[var(--seed-color-fg-positive-contrast)]"
              } ${item.meaning.status === result ? "ring-2 ring-inset ring-current" : "opacity-70"}`}
              onClick={() => void submitReview(result)}
            >
              <b>{reviewResultMeta[result].label}</b>
              <span>
                {removeCorrectFromQueue && result === "correct"
                  ? "목록에서 제외"
                  : ""}
              </span>
            </button>
          ),
        )}
      </div>
    </>
  );
}
