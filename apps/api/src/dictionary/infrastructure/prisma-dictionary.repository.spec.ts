import { describe, expect, it } from "vitest";
import { rankRecommendationCandidates } from "./prisma-dictionary.repository";

describe("rankRecommendationCandidates", () => {
  it("deduplicates by target sense and keeps the highest-priority reason", () => {
    const ranked = rankRecommendationCandidates([
      { entryId: "halt", senseId: "halt:stop", headword: "halt", kind: "WORD", commonnessScore: 0.9, reason: "RELATED" },
      { entryId: "halt", senseId: "halt:stop", headword: "halt", kind: "WORD", commonnessScore: 0.7, reason: "SAME_SYNSET" },
    ]);

    expect(ranked).toEqual([
      expect.objectContaining({ entryId: "halt", reason: "SAME_SYNSET" }),
    ]);
  });

  it("keeps distinct senses from the same target entry", () => {
    const ranked = rankRecommendationCandidates([
      { entryId: "converse", senseId: "converse:talk", headword: "converse", kind: "WORD", commonnessScore: 0.9, reason: "RELATED" },
      { entryId: "converse", senseId: "converse:opposite", headword: "converse", kind: "WORD", commonnessScore: 0.5, reason: "ANTONYM" },
    ]);

    expect(ranked.map(({ senseId }) => senseId)).toEqual([
      "converse:opposite",
      "converse:talk",
    ]);
  });

  it("prefers expressions and then commonness within one priority", () => {
    const ranked = rankRecommendationCandidates([
      { entryId: "word", senseId: "word:1", headword: "cease", kind: "WORD", commonnessScore: 0.99, reason: "SAME_SYNSET" },
      { entryId: "phrase", senseId: "phrase:1", headword: "grind to a halt", kind: "EXPRESSION", commonnessScore: 0.7, reason: "SAME_SYNSET" },
      { entryId: "phrase-2", senseId: "phrase-2:1", headword: "come to a halt", kind: "EXPRESSION", commonnessScore: 0.8, reason: "SAME_SYNSET" },
    ]);

    expect(ranked.map(({ entryId }) => entryId)).toEqual([
      "phrase-2",
      "phrase",
      "word",
    ]);
  });
});
