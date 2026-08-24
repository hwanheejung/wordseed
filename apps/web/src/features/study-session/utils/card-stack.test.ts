import { describe, expect, it } from "vitest";
import type { Meaning, VocabularyCard } from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";
import { getRemainingCardLayerCount } from "./card-stack";

function createMeanings(count: number): Meaning[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `meaning-${index + 1}`,
    cardId: "card-1",
    position: index,
    expression: "balance",
    definitionKo: `뜻 ${index + 1}`,
    searchTokens: [],
    acceptedVariants: [],
    synonyms: [],
    antonyms: [],
    examples: [],
    fillInBlankExamples: [],
    status: "unknown",
  }));
}

function createItem(meanings: Meaning[], index: number): StudyQueueItem {
  const card: VocabularyCard = {
    id: "card-1",
    term: "balance",
    normalizedTerm: "balance",
    tags: [],
    createdAt: "2026-08-10T00:00:00.000Z",
    updatedAt: "2026-08-10T00:00:00.000Z",
    meanings,
  };

  return { card, meaning: meanings[index] };
}

describe("getRemainingCardLayerCount", () => {
  it("removes one visual layer for each successive meaning", () => {
    const meanings = createMeanings(4);

    expect(
      meanings.map((_, index) =>
        getRemainingCardLayerCount(createItem(meanings, index)),
      ),
    ).toEqual([4, 3, 2, 1]);
  });
});
