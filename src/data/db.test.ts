import { describe, expect, it } from "vitest";
import { normalizeStoredCard } from "./db";

describe("stored card normalization", () => {
  it("pairs legacy examples with meanings and copies sense metadata", () => {
    const card = normalizeStoredCard({
      id: "charge",
      term: "charge",
      normalizedTerm: "charge",
      acceptedVariants: ["charge"],
      partOfSpeech: "noun",
      pronunciation: "/tʃɑːrdʒ/",
      meanings: [
        { definitionKo: "청구하다", partOfSpeech: "verb", provenance: "source" },
        { definitionKo: "요금", partOfSpeech: "noun", provenance: "source" },
      ],
      synonyms: [],
      antonyms: [],
      examples: [
        { en: "The company will charge a small fee.", type: "sentence", provenance: "source" },
        { en: "The hotel added a service charge.", type: "sentence", provenance: "source" },
      ],
      status: "unknown",
      stage: 0,
      isNew: true,
      nextReviewAt: "2026-08-05T00:00:00.000Z",
      createdAt: "2026-08-05T00:00:00.000Z",
      updatedAt: "2026-08-05T00:00:00.000Z",
    });

    expect(card.meanings[0].examples[0].en).toContain("will charge");
    expect(card.meanings[1].examples[0].en).toContain("service charge");
    expect(card.meanings[0].partOfSpeech).toBe("verb");
    expect(card.meanings[1].partOfSpeech).toBe("noun");
    expect(card.meanings[0].pronunciation).toBe("/tʃɑːrdʒ/");
    expect(card.testExamples).toHaveLength(0);
    expect(card).not.toHaveProperty("examples");
    expect(card).not.toHaveProperty("stage");
    expect(card).not.toHaveProperty("isNew");
    expect(card).not.toHaveProperty("nextReviewAt");
  });

  it("adds a legacy answer span only when the saved term appears in the test context", () => {
    const card = normalizeStoredCard({
      id: "induce",
      term: "induce",
      normalizedTerm: "induce",
      acceptedVariants: ["induce"],
      meanings: [{
        definitionKo: "유발하다",
        provenance: "ai",
        examples: [{ en: "The medicine may induce drowsiness.", type: "sentence", provenance: "ai" }],
      }],
      synonyms: [],
      antonyms: [],
      testExamples: [{
        en: "A sudden shock can induce a stress response.",
        type: "sentence",
        provenance: "ai",
      }],
      status: "unknown",
      createdAt: "2026-08-05T00:00:00.000Z",
      updatedAt: "2026-08-05T00:00:00.000Z",
    });

    expect(card.testExamples[0].answer).toBe("induce");
  });
});
