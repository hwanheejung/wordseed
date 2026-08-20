import type {
  ReviewHistoryStats,
  ReviewResult,
  VocabularyCard,
} from "../types/card";

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

export function shouldRecheckMeaning(
  status: ReviewResult,
  stats?: ReviewHistoryStats,
): boolean {
  return (
    status === "correct" &&
    Boolean(
      stats &&
        stats.reviewCount >= 3 &&
        stats.difficultCount * 2 >= stats.reviewCount,
    )
  );
}
