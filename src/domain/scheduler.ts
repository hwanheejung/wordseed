import type {
  ReviewHistoryStats,
  ReviewResult,
  StudyItem,
  VocabularyCard,
} from "./types";
import { isSpecificTestContext } from "./scoring";

const STATUS_PRIORITY: Record<ReviewResult, number> = {
  unknown: 0,
  confusing: 1,
  correct: 2,
};

export function toStudyItems(cards: VocabularyCard[]): StudyItem[] {
  return cards.flatMap((card) =>
    card.meanings.map((meaning) => ({ card, meaning })),
  );
}

export function buildStudyQueue(cards: VocabularyCard[]) {
  return cards
    .map((card, index) => ({
      card,
      index,
      priority: Math.min(
        ...card.meanings.map((meaning) => STATUS_PRIORITY[meaning.status]),
      ),
    }))
    .sort(
      (left, right) =>
        left.priority - right.priority ||
        left.index - right.index,
    )
    .flatMap(({ card }) =>
      card.meanings.map((meaning) => ({ card, meaning })),
    );
}

export function buildFocusQueue(cards: VocabularyCard[]) {
  return toStudyItems(cards).filter(
    ({ meaning }) =>
      meaning.status === "unknown" || meaning.status === "confusing",
  );
}

export function startQueueAt<T>(items: T[], startIndex: number) {
  if (!items.length) return [];
  const safeIndex = Math.min(Math.max(0, startIndex), items.length - 1);
  return [...items.slice(safeIndex), ...items.slice(0, safeIndex)];
}

export function shouldRecheckMeaning(
  status: ReviewResult,
  stats?: ReviewHistoryStats,
) {
  return (
    status === "correct" &&
    Boolean(
      stats &&
        stats.reviewCount >= 3 &&
        stats.difficultCount * 2 >= stats.reviewCount,
    )
  );
}

export function moveReviewedCardToBack(
  items: StudyItem[],
  updated: StudyItem,
) {
  return [...items.slice(1), updated];
}

export function updateFocusQueue(items: StudyItem[], updated: StudyItem) {
  return updated.meaning.status === "correct"
    ? items.slice(1)
    : moveReviewedCardToBack(items, updated);
}

export function buildTestQueue(
  cards: VocabularyCard[],
  random: () => number = Math.random,
) {
  const queue = toStudyItems(cards).filter(({ meaning }) =>
    meaning.testExamples.some((example) =>
      Boolean(example.ko.trim()) &&
      isSpecificTestContext(example.en, example.answer),
    ),
  );
  for (let index = queue.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [queue[index], queue[swapIndex]] = [queue[swapIndex], queue[index]];
  }
  return queue;
}
