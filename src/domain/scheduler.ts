import type { ReviewResult, VocabularyCard } from "./types";
import { getTestAnswer, isSpecificTestContext } from "./scoring";

const STATUS_PRIORITY: Record<ReviewResult, number> = {
  unknown: 0,
  confusing: 1,
  correct: 2,
};

export function buildStudyQueue(cards: VocabularyCard[]) {
  return cards
    .map((card, index) => ({ card, index }))
    .sort((left, right) => STATUS_PRIORITY[left.card.status] - STATUS_PRIORITY[right.card.status] || left.index - right.index)
    .map(({ card }) => card);
}

export function buildFocusQueue(cards: VocabularyCard[]) {
  return cards.filter((card) => card.status === "unknown" || card.status === "confusing");
}

export function startQueueAt(cards: VocabularyCard[], startIndex: number) {
  if (!cards.length) return [];
  const safeIndex = Math.min(Math.max(0, startIndex), cards.length - 1);
  return [...cards.slice(safeIndex), ...cards.slice(0, safeIndex)];
}

export function moveReviewedCardToBack(cards: VocabularyCard[], updated: VocabularyCard) {
  return [...cards.slice(1), updated];
}

export function updateFocusQueue(cards: VocabularyCard[], updated: VocabularyCard) {
  return updated.status === "correct" ? cards.slice(1) : moveReviewedCardToBack(cards, updated);
}

export function buildTestQueue(cards: VocabularyCard[], random: () => number = Math.random) {
  const queue = cards.filter((card) => card.testExamples.some((example) => isSpecificTestContext(example.en, getTestAnswer(example, card.term))));
  for (let index = queue.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [queue[index], queue[swapIndex]] = [queue[swapIndex], queue[index]];
  }
  return queue;
}
