import type { ReviewResult, VocabularyCard } from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";

const STATUS_PRIORITY: Record<ReviewResult, number> = {
  unknown: 0,
  confusing: 1,
  correct: 2,
};

function toStudyItems(cards: VocabularyCard[]): StudyQueueItem[] {
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

export function moveReviewedCardToBack(
  items: StudyQueueItem[],
  updated: StudyQueueItem,
) {
  return [...items.slice(1), updated];
}

export function updateFocusQueue(
  items: StudyQueueItem[],
  updated: StudyQueueItem,
) {
  return updated.meaning.status === "correct"
    ? items.slice(1)
    : moveReviewedCardToBack(items, updated);
}
