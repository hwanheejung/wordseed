import { describe, expect, it } from "vitest";
import { CardSchema, hasValidTestContexts } from "./cards.js";

const validCard = CardSchema.parse({
  term: "induce",
  acceptedVariants: ["induced"],
  partOfSpeech: "verb",
  pronunciation: "/ɪnˈduːs/",
  meanings: [{
    definitionKo: "유발하다",
    definitionEn: "to cause",
    context: null,
    partOfSpeech: "verb",
    pronunciation: "/ɪnˈduːs/",
    provenance: "ai",
    examples: [{ en: "The policy may induce companies to reduce spending.", ko: null, type: "sentence", provenance: "ai" }],
    synonyms: ["cause"],
    antonyms: ["prevent"],
  }],
  testExamples: [
    { en: "A sudden temperature drop can induce dormancy in seeds.", ko: null, answer: "induce", type: "sentence", provenance: "ai" },
    { en: "A: What could induce consumers to switch brands?\nB: A lower price might persuade them.", ko: null, answer: "induce", type: "dialogue", provenance: "ai" },
  ],
  sourceText: null,
  sourceLabel: null,
});

describe("generated card validation", () => {
  it("accepts distinct contexts with semantic clues", () => {
    expect(hasValidTestContexts(validCard)).toBe(true);
  });

  it("accepts natural answer spans for an abstract grammar pattern", () => {
    expect(hasValidTestContexts(CardSchema.parse({
      ...validCard,
      term: "have A do B",
      acceptedVariants: [],
      meanings: [{
        ...validCard.meanings[0],
        definitionKo: "A에게 B를 하게 하다",
        examples: [{ en: "She had a technician repair the printer.", ko: null, type: "sentence", provenance: "source" }],
      }],
      testExamples: [
        { en: "The manager had an assistant reschedule the meeting.", ko: null, answer: "had an assistant reschedule", type: "sentence", provenance: "ai" },
        { en: "A: Who will update the website?\nB: I'll have our designer handle it.", ko: null, answer: "have our designer handle", type: "dialogue", provenance: "ai" },
      ],
    }))).toBe(true);
  });

  it("rejects generic filler", () => {
    expect(hasValidTestContexts({
      ...validCard,
      testExamples: [
        { ...validCard.testExamples[0], en: "The professor used the term induce to clarify the central idea." },
        { ...validCard.testExamples[1] },
      ],
    })).toBe(false);
  });
});
