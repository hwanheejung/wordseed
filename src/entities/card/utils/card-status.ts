import type {
  Meaning,
  ReviewHistoryStats,
  ReviewResult,
  VocabularyCard,
} from "../types/card";
import type { CardLearningStatus } from "./card-collection-query";

export const reviewResultMeta: Record<
  ReviewResult,
  { label: string; tone: "critical" | "warning" | "positive" }
> = {
  unknown: { label: "몰랐어요", tone: "critical" },
  confusing: { label: "헷갈려요", tone: "warning" },
  correct: { label: "알고 있어요", tone: "positive" },
};

export function getCardStatus(card: VocabularyCard): ReviewResult {
  if (card.meanings.some((meaning) => meaning.status === "unknown"))
    return "unknown";
  if (card.meanings.some((meaning) => meaning.status === "confusing"))
    return "confusing";

  return "correct";
}

export function getReviewedCardStatus(
  card: VocabularyCard,
  reviewStats: Record<string, ReviewHistoryStats>,
): ReviewResult | undefined {
  const reviewedMeanings = card.meanings.filter(
    (meaning) => (reviewStats[meaning.id]?.reviewCount ?? 0) > 0,
  );

  if (!reviewedMeanings.length) return undefined;
  if (reviewedMeanings.some((meaning) => meaning.status === "unknown"))
    return "unknown";
  if (reviewedMeanings.some((meaning) => meaning.status === "confusing"))
    return "confusing";

  return "correct";
}

export function getMeaningLearningStatus(
  meaning: Meaning,
  stats?: ReviewHistoryStats,
): CardLearningStatus {
  return (stats?.reviewCount ?? 0) > 0 ? meaning.status : "unreviewed";
}
