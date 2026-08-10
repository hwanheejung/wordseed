import type { VocabularyCard } from "../types/card";
import { getCardStatus } from "./card-status";

export interface TagStudyGroup {
  tag: string;
  cardCount: number;
  correctCount: number;
  correctPercentage: number;
}

export function buildTagStudyGroups(cards: VocabularyCard[]): TagStudyGroup[] {
  const groupedCards = cards.reduce((groups, card) => {
    card.tags.forEach((tag) => {
      const group = groups.get(tag) ?? [];
      group.push(card);
      groups.set(tag, group);
    });

    return groups;
  }, new Map<string, VocabularyCard[]>());

  return Array.from(groupedCards, ([tag, taggedCards]) => {
    const correctCount = taggedCards.filter(
      (card) => getCardStatus(card) === "correct",
    ).length;

    return {
      tag,
      cardCount: taggedCards.length,
      correctCount,
      correctPercentage: Math.round(
        (correctCount / taggedCards.length) * 100,
      ),
    };
  }).sort(
    (left, right) =>
      left.correctPercentage - right.correctPercentage ||
      right.cardCount - right.correctCount -
        (left.cardCount - left.correctCount) ||
      left.tag.localeCompare(right.tag, "ko"),
  );
}
