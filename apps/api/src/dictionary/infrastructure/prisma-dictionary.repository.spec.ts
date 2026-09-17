import { describe, expect, it } from "vitest";
import { rankRecommendationCandidates } from "./prisma-dictionary.repository";
describe("rankRecommendationCandidates", () => {
  it("prefers shared concepts", () => {
    const ranked = rankRecommendationCandidates([
      { lexemeId: "a", senseId: "a", lemma: "halt", category: "NOUN", score: 1, reason: "RELATED" },
      { lexemeId: "b", senseId: "b", lemma: "grind to a halt", category: "PHRASE", score: 0.5, reason: "SAME_SYNSET" },
    ]);
    expect(ranked.map(({ lexemeId }) => lexemeId)).toEqual(["b", "a"]);
  });
});
