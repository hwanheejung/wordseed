import { describe, expect, it } from "vitest";
import type { ReviewHistoryStats, VocabularyCard } from "../types/card";
import { queryCards } from "./card-collection-query";

const NOW = new Date("2026-08-20T12:00:00.000Z");

const cards = [
  makeCard("untouched", "2026-08-20T08:00:00.000Z", "unknown"),
  makeCard("unknown", "2026-08-19T08:00:00.000Z", "unknown"),
  makeCard("confusing", "2026-08-18T08:00:00.000Z", "confusing"),
  makeCard("correct", "2026-08-17T08:00:00.000Z", "correct"),
];
const reviewStats: Record<string, ReviewHistoryStats> = {
  "unknown-meaning": makeStats("2026-08-20T10:00:00.000Z"),
  "confusing-meaning": makeStats("2026-08-19T10:00:00.000Z"),
  "correct-meaning": makeStats("2026-07-01T10:00:00.000Z"),
};

describe("card collection query", () => {
  it("distinguishes unreviewed meanings from an explicit unknown result", () => {
    expect(
      queryCards(cards, reviewStats, { statuses: ["unreviewed"] }, NOW).map(
        ({ id }) => id,
      ),
    ).toEqual(["untouched"]);
    expect(
      queryCards(cards, reviewStats, { statuses: ["unknown"] }, NOW).map(
        ({ id }) => id,
      ),
    ).toEqual(["unknown"]);
  });

  it("combines multiple statuses with a review period", () => {
    expect(
      queryCards(
        cards,
        reviewStats,
        {
          statuses: ["unknown", "confusing"],
          reviewPeriod: "3d",
          sort: "reviewed-desc",
        },
        NOW,
      ).map(({ id }) => id),
    ).toEqual(["unknown", "confusing"]);
  });

  it("puts unreviewed cards first when sorting by oldest review", () => {
    expect(
      queryCards(cards, reviewStats, { sort: "reviewed-asc" }, NOW).map(
        ({ id }) => id,
      ),
    ).toEqual(["untouched", "correct", "confusing", "unknown"]);
  });

  it("sorts terms alphabetically without case sensitivity", () => {
    expect(
      queryCards(
        [
          makeCard("Zulu", "2026-08-20T08:00:00.000Z", "unknown"),
          makeCard("alpha", "2026-08-19T08:00:00.000Z", "unknown"),
        ],
        {},
        { sort: "alphabetical" },
        NOW,
      ).map(({ term }) => term),
    ).toEqual(["alpha", "Zulu"]);
  });
});

function makeCard(
  id: string,
  createdAt: string,
  status: "unknown" | "confusing" | "correct",
): VocabularyCard {
  return {
    id,
    term: id,
    normalizedTerm: id.toLocaleLowerCase(),
    tags: [],
    createdAt,
    updatedAt: createdAt,
    meanings: [
      {
        id: `${id}-meaning`,
        cardId: id,
        position: 0,
        expression: id,
        definitionKo: id,
        searchTokens: [id],
        acceptedVariants: [id],
        synonyms: [],
        antonyms: [],
        examples: [],
        fillInBlankExamples: [],
        status,
      },
    ],
  };
}

function makeStats(lastReviewedAt: string): ReviewHistoryStats {
  return { reviewCount: 1, difficultCount: 0, lastReviewedAt };
}
