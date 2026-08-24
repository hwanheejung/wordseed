import { describe, expect, it } from "vitest";
import type { VocabularyCard } from "../types/card";
import {
  getMeaningLearningStatus,
  getReviewedCardStatus,
} from "./card-status";

const card: VocabularyCard = {
  id: "card-1",
  term: "coinage",
  normalizedTerm: "coinage",
  tags: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  meanings: [
    {
      id: "meaning-1",
      cardId: "card-1",
      position: 0,
      expression: "coinage",
      definitionKo: "신조어",
      searchTokens: [],
      acceptedVariants: [],
      synonyms: [],
      antonyms: [],
      examples: [],
      fillInBlankExamples: [],
      status: "correct",
    },
    {
      id: "meaning-2",
      cardId: "card-1",
      position: 1,
      expression: "coinage",
      definitionKo: "주화 제조",
      searchTokens: [],
      acceptedVariants: [],
      synonyms: [],
      antonyms: [],
      examples: [],
      fillInBlankExamples: [],
      status: "unknown",
    },
  ],
};

describe("reviewed card status", () => {
  it("hides the status when the card has no review history", () => {
    expect(getReviewedCardStatus(card, {})).toBeUndefined();
  });

  it("ignores the default status of meanings without review history", () => {
    expect(
      getReviewedCardStatus(card, {
        "meaning-1": {
          reviewCount: 1,
          difficultCount: 0,
          lastReviewedAt: "2026-01-02T00:00:00.000Z",
        },
      }),
    ).toBe("correct");
  });

  it("prioritizes an explicitly unknown reviewed meaning", () => {
    expect(
      getReviewedCardStatus(card, {
        "meaning-1": {
          reviewCount: 1,
          difficultCount: 0,
          lastReviewedAt: "2026-01-02T00:00:00.000Z",
        },
        "meaning-2": {
          reviewCount: 1,
          difficultCount: 1,
          lastReviewedAt: "2026-01-03T00:00:00.000Z",
        },
      }),
    ).toBe("unknown");
  });
});

describe("meaning learning status", () => {
  it("treats the stored default as unreviewed until history exists", () => {
    expect(getMeaningLearningStatus(card.meanings[1])).toBe("unreviewed");
    expect(
      getMeaningLearningStatus(card.meanings[1], {
        reviewCount: 1,
        difficultCount: 1,
        lastReviewedAt: "2026-01-03T00:00:00.000Z",
      }),
    ).toBe("unknown");
  });
});
