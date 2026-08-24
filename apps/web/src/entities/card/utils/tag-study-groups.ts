import type {
  ReviewHistoryStats,
  VocabularyCard,
} from "../types/card";
import { getCardStatus } from "./card-status";

export interface TagStudyGroup {
  tag: string;
  cardCount: number;
  correctCount: number;
  correctPercentage: number;
  lastReviewedAt?: string;
}

export type TagStudyGroupSort =
  | "name"
  | "recentlyReviewed"
  | "leastRecentlyReviewed"
  | "learningPriority";

export function buildTagStudyGroups(
  cards: VocabularyCard[],
  sort: TagStudyGroupSort = "name",
  reviewStats: Record<string, ReviewHistoryStats> = {},
): TagStudyGroup[] {
  const groupedCards = cards.reduce((groups, card) => {
    card.tags.forEach((tag) => {
      const group = groups.get(tag) ?? [];
      group.push(card);
      groups.set(tag, group);
    });

    return groups;
  }, new Map<string, VocabularyCard[]>());

  const groups = Array.from(groupedCards, ([tag, taggedCards]) => {
    const correctCount = taggedCards.filter(
      (card) => getCardStatus(card) === "correct",
    ).length;
    const lastReviewedAt = taggedCards.reduce<string | undefined>(
      (latest, card) =>
        card.meanings.reduce<string | undefined>((meaningLatest, meaning) => {
          const reviewedAt = reviewStats[meaning.id]?.lastReviewedAt;

          return reviewedAt && (!meaningLatest || reviewedAt > meaningLatest)
            ? reviewedAt
            : meaningLatest;
        }, latest),
      undefined,
    );

    return {
      tag,
      cardCount: taggedCards.length,
      correctCount,
      correctPercentage: Math.round(
        (correctCount / taggedCards.length) * 100,
      ),
      lastReviewedAt,
    };
  });

  return groups.sort((left, right) => {
    if (sort === "name") return left.tag.localeCompare(right.tag, "ko");
    if (sort === "recentlyReviewed")
      return (
        compareReviewRecency(left, right, "recentFirst") ||
        left.tag.localeCompare(right.tag, "ko")
      );
    if (sort === "leastRecentlyReviewed")
      return (
        compareReviewRecency(left, right, "oldestFirst") ||
        left.tag.localeCompare(right.tag, "ko")
      );

    return (
      left.correctPercentage - right.correctPercentage ||
      right.cardCount -
        right.correctCount -
        (left.cardCount - left.correctCount) ||
      left.tag.localeCompare(right.tag, "ko")
    );
  });
}

function compareReviewRecency(
  left: TagStudyGroup,
  right: TagStudyGroup,
  direction: "recentFirst" | "oldestFirst",
) {
  if (!left.lastReviewedAt && !right.lastReviewedAt) return 0;
  if (!left.lastReviewedAt) return direction === "oldestFirst" ? -1 : 1;
  if (!right.lastReviewedAt) return direction === "oldestFirst" ? 1 : -1;

  return direction === "recentFirst"
    ? right.lastReviewedAt.localeCompare(left.lastReviewedAt)
    : left.lastReviewedAt.localeCompare(right.lastReviewedAt);
}
