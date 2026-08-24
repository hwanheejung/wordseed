import { describe, expect, it } from "vitest";
import type { ReviewResult, VocabularyCard } from "../types/card";
import { buildTagStudyGroups } from "./tag-study-groups";

const timestamp = "2026-01-01T00:00:00.000Z";

function makeCard(
  id: string,
  tag: string,
  status: ReviewResult,
): VocabularyCard {
  return {
    id,
    term: id,
    normalizedTerm: id,
    tags: [tag],
    createdAt: timestamp,
    updatedAt: timestamp,
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

const cards = [
  makeCard("known-beta", "beta", "correct"),
  makeCard("unknown-zeta", "zeta", "unknown"),
  makeCard("unknown-alpha", "alpha", "unknown"),
  makeCard("known-zeta", "zeta", "correct"),
  makeCard("unknown-gamma", "gamma", "unknown"),
];

const reviewStats = {
  "known-beta-meaning": {
    reviewCount: 1,
    difficultCount: 0,
    lastReviewedAt: "2026-01-03T00:00:00.000Z",
  },
  "unknown-zeta-meaning": {
    reviewCount: 1,
    difficultCount: 1,
    lastReviewedAt: "2026-01-02T00:00:00.000Z",
  },
  "unknown-alpha-meaning": {
    reviewCount: 1,
    difficultCount: 1,
    lastReviewedAt: "2026-01-01T00:00:00.000Z",
  },
};

describe("tag study group sorting", () => {
  it("sorts tags by name by default", () => {
    expect(buildTagStudyGroups(cards).map((group) => group.tag)).toEqual([
      "alpha",
      "beta",
      "gamma",
      "zeta",
    ]);
  });

  it("sorts reviewed tags from most recent to oldest", () => {
    expect(
      buildTagStudyGroups(cards, "recentlyReviewed", reviewStats).map(
        (group) => group.tag,
      ),
    ).toEqual(["beta", "zeta", "alpha", "gamma"]);
  });

  it("puts never-studied tags first when sorting oldest activity first", () => {
    expect(
      buildTagStudyGroups(cards, "leastRecentlyReviewed", reviewStats).map(
        (group) => group.tag,
      ),
    ).toEqual(["gamma", "alpha", "zeta", "beta"]);
  });

  it("can prioritize tags that need more learning", () => {
    expect(
      buildTagStudyGroups(cards, "learningPriority").map(
        (group) => group.tag,
      ),
    ).toEqual(["alpha", "gamma", "zeta", "beta"]);
  });
});
