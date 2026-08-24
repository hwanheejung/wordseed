import type {
  ReviewHistoryStats,
  ReviewResult,
  VocabularyCard,
} from "../types/card";

export type CardLearningStatus = ReviewResult | "unreviewed";
export type CardReviewPeriod =
  | "today"
  | "3d"
  | "7d"
  | "30d"
  | "older-than-30d";
export type CardSort =
  | "added-desc"
  | "added-asc"
  | "reviewed-desc"
  | "reviewed-asc"
  | "alphabetical";

export interface CardsQueryInput {
  search?: string;
  statuses?: CardLearningStatus[];
  reviewPeriod?: CardReviewPeriod;
  tags?: string[];
  sort?: CardSort;
  ids?: string[];
}

export function queryCards(
  cards: VocabularyCard[],
  reviewStats: Record<string, ReviewHistoryStats>,
  input: CardsQueryInput = {},
  now = new Date(),
): VocabularyCard[] {
  const normalizedSearch = input.search?.trim().toLocaleLowerCase() ?? "";
  const idPositions = new Map(input.ids?.map((id, index) => [id, index]));

  return cards
    .filter(
      (card) =>
        (!input.ids || idPositions.has(card.id)) &&
        matchesMeaningFilters(card, reviewStats, input, now) &&
        (!input.tags?.length ||
          input.tags.some((tag) => card.tags.includes(tag))) &&
        (!normalizedSearch ||
          `${card.term} ${card.meanings.map((meaning) => `${meaning.expression} ${meaning.definitionKo}`).join(" ")} ${card.tags.join(" ")}`
            .toLocaleLowerCase()
            .includes(normalizedSearch)),
    )
    .sort((left, right) =>
      compareCards(left, right, reviewStats, input, idPositions),
    );
}

function matchesMeaningFilters(
  card: VocabularyCard,
  reviewStats: Record<string, ReviewHistoryStats>,
  input: CardsQueryInput,
  now: Date,
) {
  if (!input.statuses?.length && !input.reviewPeriod) return true;

  return card.meanings.some((meaning) => {
    const stats = reviewStats[meaning.id];
    const reviewed = (stats?.reviewCount ?? 0) > 0;
    const matchesStatus =
      !input.statuses?.length ||
      (reviewed
        ? input.statuses.includes(meaning.status)
        : input.statuses.includes("unreviewed"));

    return (
      matchesStatus &&
      matchesReviewPeriod(stats?.lastReviewedAt, input.reviewPeriod, now)
    );
  });
}

function matchesReviewPeriod(
  lastReviewedAt: string | undefined,
  period: CardReviewPeriod | undefined,
  now: Date,
) {
  if (!period) return true;
  if (!lastReviewedAt) return false;

  const reviewedAt = new Date(lastReviewedAt).getTime();
  const nowTime = now.getTime();
  if (period === "today") {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    return reviewedAt >= startOfToday.getTime() && reviewedAt <= nowTime;
  }

  const days = period === "3d" ? 3 : period === "7d" ? 7 : 30;
  const boundary = nowTime - days * 24 * 60 * 60 * 1_000;

  return period === "older-than-30d"
    ? reviewedAt < boundary
    : reviewedAt >= boundary && reviewedAt <= nowTime;
}

function compareCards(
  left: VocabularyCard,
  right: VocabularyCard,
  reviewStats: Record<string, ReviewHistoryStats>,
  input: CardsQueryInput,
  idPositions: Map<string, number>,
) {
  if (input.ids?.length)
    return idPositions.get(left.id)! - idPositions.get(right.id)!;
  if (input.sort === "added-asc")
    return (
      left.createdAt.localeCompare(right.createdAt) ||
      left.term.localeCompare(right.term, "en")
    );
  if (input.sort === "alphabetical")
    return left.term.localeCompare(right.term, "en", {
      sensitivity: "base",
    });
  if (input.sort === "reviewed-desc")
    return compareReviewRecency(left, right, reviewStats, "recent-first");
  if (input.sort === "reviewed-asc")
    return compareReviewRecency(left, right, reviewStats, "oldest-first");

  return (
    right.createdAt.localeCompare(left.createdAt) ||
    left.term.localeCompare(right.term, "en")
  );
}

function compareReviewRecency(
  left: VocabularyCard,
  right: VocabularyCard,
  reviewStats: Record<string, ReviewHistoryStats>,
  direction: "recent-first" | "oldest-first",
) {
  const leftReviewedAt = getCardLastReviewedAt(left, reviewStats);
  const rightReviewedAt = getCardLastReviewedAt(right, reviewStats);

  if (!leftReviewedAt && !rightReviewedAt)
    return left.term.localeCompare(right.term, "en");
  if (!leftReviewedAt) return direction === "oldest-first" ? -1 : 1;
  if (!rightReviewedAt) return direction === "oldest-first" ? 1 : -1;

  return direction === "recent-first"
    ? rightReviewedAt.localeCompare(leftReviewedAt) ||
        left.term.localeCompare(right.term, "en")
    : leftReviewedAt.localeCompare(rightReviewedAt) ||
        left.term.localeCompare(right.term, "en");
}

function getCardLastReviewedAt(
  card: VocabularyCard,
  reviewStats: Record<string, ReviewHistoryStats>,
) {
  return card.meanings.reduce<string | undefined>((latest, meaning) => {
    const reviewedAt = reviewStats[meaning.id]?.lastReviewedAt;

    return reviewedAt && (!latest || reviewedAt > latest) ? reviewedAt : latest;
  }, undefined);
}
