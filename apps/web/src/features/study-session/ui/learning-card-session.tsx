import type {
  ConcealableCardField,
  Meaning,
  ReviewResult,
} from "@/entities/card";
import { reviewResultMeta, useReviewStatsQuery } from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";
import { MemoryAidSection } from "./memory-aid-section";
import { SwipeableCardStack } from "./swipeable-card-stack";

interface LearningCardSessionProps {
  item: StudyQueueItem;
  previousItem?: StudyQueueItem;
  nextItem?: StudyQueueItem;
  navigationRevision: number;
  concealedFields?: ConcealableCardField[];
  removeCorrectFromQueue?: boolean;
  onNavigate: (direction: "next" | "previous") => void;
  onReview: (result: ReviewResult) => void | Promise<void>;
  onMemoryAidSaved: (meaning: Meaning) => void;
}

export function LearningCardSession({
  item,
  previousItem,
  nextItem,
  navigationRevision,
  concealedFields = [],
  removeCorrectFromQueue = false,
  onNavigate,
  onReview,
  onMemoryAidSaved,
}: LearningCardSessionProps) {
  const reviewStats = useReviewStatsQuery();
  const hasReviewHistory =
    (reviewStats[item.meaning.id]?.reviewCount ?? 0) > 0;

  return (
    <>
      <main className="min-h-[calc(100vh-84px)] overflow-y-hidden! bg-[var(--seed-color-bg-layer-basement)] p-5 pb-[130px]">
        <SwipeableCardStack
          item={item}
          previousItem={previousItem}
          nextItem={nextItem}
          navigationRevision={navigationRevision}
          concealedFields={concealedFields}
          activeCardFooter={
            <MemoryAidSection
              key={item.meaning.id}
              item={item}
              onSaved={onMemoryAidSaved}
            />
          }
          onNavigate={onNavigate}
        />
      </main>
      <div className="fixed bottom-0 left-1/2 z-12 w-[min(520px,100%)] -translate-x-1/2 bg-[color-mix(in_srgb,var(--seed-color-bg-layer-default)_86%,transparent)] px-3.5 pt-2.5 pb-[calc(10px+var(--seed-safe-area-bottom))] shadow-[0_-18px_45px_rgba(0,0,0,.08)] backdrop-blur-[24px]">
        <div className="grid grid-cols-3 gap-1.5 rounded-[24px] border border-[color-mix(in_srgb,var(--seed-color-stroke-neutral-subtle)_72%,transparent)] bg-[color-mix(in_srgb,var(--seed-color-bg-layer-fill)_78%,transparent)] p-1.5">
          {(["unknown", "confusing", "correct"] as ReviewResult[]).map(
            (result) => {
              const selected =
                hasReviewHistory && item.meaning.status === result;

              return (
                <button
                  key={result}
                  aria-pressed={selected}
                  className={`${
                    result === "unknown"
                      ? "bg-[var(--seed-color-bg-critical-weak)] text-[var(--seed-color-fg-critical-contrast)]"
                      : result === "confusing"
                        ? "bg-[var(--seed-color-bg-warning-weak)] text-[var(--seed-color-fg-warning-contrast)]"
                        : "bg-[var(--seed-color-bg-positive-weak)] text-[var(--seed-color-fg-positive-contrast)]"
                  } min-h-14 cursor-pointer rounded-[18px] border-0 px-2 transition-[transform,opacity,box-shadow] duration-100 ease-out active:scale-[.95] motion-reduce:transition-none ${selected ? "opacity-100 shadow-[0_4px_14px_rgba(0,0,0,.09)]" : "opacity-55 shadow-none"}`}
                  onClick={() => void onReview(result)}
                >
                  <b className="block text-[length:var(--seed-font-size-t4)]">
                    {reviewResultMeta[result].label}
                  </b>
                  {removeCorrectFromQueue && result === "correct" && (
                    <span className="mt-0.5 block text-[length:var(--seed-font-size-t1)]">
                      목록에서 제외
                    </span>
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>
    </>
  );
}
