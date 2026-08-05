import type { ReviewResult, VocabularyCard } from "./types";

export const CORRECT_INTERVALS_DAYS = [1, 2, 4, 7, 14, 30] as const;

export function calculateNextReview(
  card: Pick<VocabularyCard, "stage">,
  result: ReviewResult,
  now = new Date(),
) {
  if (result === "unknown") {
    return { stage: 0, nextReviewAt: new Date(now.getTime() + 5 * 60_000).toISOString() };
  }

  if (result === "confusing") {
    return { stage: card.stage, nextReviewAt: new Date(now.getTime() + 12 * 60 * 60_000).toISOString() };
  }

  const stage = Math.min(card.stage + 1, CORRECT_INTERVALS_DAYS.length);
  const days = CORRECT_INTERVALS_DAYS[Math.max(0, stage - 1)];
  return { stage, nextReviewAt: new Date(now.getTime() + days * 86_400_000).toISOString() };
}

export function buildReviewQueue(cards: VocabularyCard[], now = new Date(), newLimit = 10) {
  const due = cards
    .filter((card) => !card.isNew && new Date(card.nextReviewAt).getTime() <= now.getTime())
    .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt));
  const fresh = cards
    .filter((card) => card.isNew)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, newLimit);
  return [...due, ...fresh];
}
