import { describe, expect, it } from "vitest";
import { CardSchema, hasValidFillInBlankContexts } from "./cards.js";

const validCard = CardSchema.parse({
  term: "induce",
  meanings: [{
    expression: "induce",
    definitionKo: "유발하다",
    definitionEn: "to cause",
    partOfSpeech: "verb",
    pronunciation: "/ɪnˈduːs/",
    acceptedVariants: ["induce", "induced"],
    synonyms: ["cause", "prompt"],
    antonyms: ["prevent"],
    provenance: "ai",
    examples: [{ en: "The policy may induce companies to reduce spending.", ko: null, type: "sentence", provenance: "ai" }],
    fillInBlankExamples: [
      { en: "A sudden temperature drop can induce dormancy in seeds.", ko: "갑작스러운 기온 하락은 씨앗의 휴면을 유도할 수 있다.", answer: "induce", type: "sentence", provenance: "ai" },
      { en: "A: What could induce consumers to switch brands?\nB: A lower price might persuade them.", ko: "A: 무엇이 소비자의 브랜드 변경을 유도할까? B: 더 낮은 가격이라면 가능할 거야.", answer: "induce", type: "dialogue", provenance: "ai" },
    ],
  }],
});

describe("generated card validation", () => {
  it("accepts distinct contexts with semantic clues", () => {
    expect(hasValidFillInBlankContexts(validCard)).toBe(true);
  });

  it("accepts natural answer spans for an abstract grammar pattern", () => {
    expect(hasValidFillInBlankContexts(CardSchema.parse({
      ...validCard,
      term: "have A do B",
      meanings: [{
        ...validCard.meanings[0],
        expression: "have A do B",
        definitionKo: "A에게 B를 하게 하다",
        acceptedVariants: ["have A do B"],
        examples: [{ en: "She had a technician repair the printer.", ko: null, type: "sentence", provenance: "source" }],
        fillInBlankExamples: [
          { en: "The manager had an assistant reschedule the meeting.", ko: "관리자는 비서에게 회의 일정을 다시 잡게 했다.", answer: "had an assistant reschedule", type: "sentence", provenance: "ai" },
          { en: "A: Who will update the website?\nB: I'll have our designer handle it.", ko: "A: 누가 웹사이트를 업데이트할까? B: 디자이너에게 맡길게.", answer: "have our designer handle", type: "dialogue", provenance: "ai" },
        ],
      }],
    }))).toBe(true);
  });

  it("rejects generic filler", () => {
    expect(hasValidFillInBlankContexts({
      ...validCard,
      meanings: [{
        ...validCard.meanings[0],
        fillInBlankExamples: [
          { ...validCard.meanings[0].fillInBlankExamples[0], en: "The professor used the term induce to clarify the central idea." },
          { ...validCard.meanings[0].fillInBlankExamples[1] },
        ],
      }],
    })).toBe(false);
  });
});
