import type { ConcealableCardField, ReviewResult } from "@/entities/card";
import { reviewResultMeta } from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";
import { SwipeableCardStack } from "./swipeable-card-stack";

export function LearningCardSession({
  item,
  previousItem,
  nextItem,
  navigationRevision,
  concealedFields = [],
  removeCorrectFromQueue = false,
  onNavigate,
  onReview,
}: {
  item: StudyQueueItem;
  previousItem?: StudyQueueItem;
  nextItem?: StudyQueueItem;
  navigationRevision: number;
  concealedFields?: ConcealableCardField[];
  removeCorrectFromQueue?: boolean;
  onNavigate: (direction: "next" | "previous") => void;
  onReview: (result: ReviewResult) => void | Promise<void>;
}) {
  return (
    <>
      <main className="min-h-[calc(100vh-84px)] overflow-y-hidden! bg-[var(--seed-color-bg-layer-basement)] p-5 pb-[130px]">
        <SwipeableCardStack
          item={item}
          previousItem={previousItem}
          nextItem={nextItem}
          navigationRevision={navigationRevision}
          concealedFields={concealedFields}
          onNavigate={onNavigate}
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
              onClick={() => void onReview(result)}
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
