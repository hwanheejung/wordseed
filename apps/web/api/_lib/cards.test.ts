import { describe, expect, it } from "vitest";
import { zodTextFormat } from "openai/helpers/zod";
import { CardsResponseSchema, CardSchema, toClientCard } from "./cards.js";

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
    examples: [{
      en: "The policy may induce companies to reduce spending.",
      ko: null,
      type: "sentence",
      provenance: "ai",
    }],
    fillInBlankExamples: [{
      en: "A sudden temperature drop can induce dormancy in seeds.",
      ko: "갑작스러운 기온 하락은 씨앗의 휴면을 유도할 수 있다.",
      answer: "induce",
      type: "sentence",
      provenance: "ai",
    }],
  }],
});

describe("generated card schema", () => {
  it("remains compatible with strict structured outputs", () => {
    expect(() => zodTextFormat(CardsResponseSchema, "vocabulary_cards")).not.toThrow();
  });

  it("accepts meanings without fill-in-the-blank contexts", () => {
    const card = CardSchema.parse({
      ...validCard,
      meanings: [{
        ...validCard.meanings[0],
        fillInBlankExamples: [],
      }],
    });

    expect(card.meanings[0].fillInBlankExamples).toEqual([]);
  });

  it("accepts incomplete generated contexts without rejecting the card", () => {
    const card = CardSchema.parse({
      ...validCard,
      meanings: [{
        ...validCard.meanings[0],
        fillInBlankExamples: [{
          en: "The context is incomplete.",
          ko: null,
          answer: null,
          type: "sentence",
          provenance: "ai",
        }],
      }],
    });

    expect(toClientCard(card).meanings[0].fillInBlankExamples).toEqual([
      { en: "The context is incomplete.", type: "sentence", provenance: "ai" },
    ]);
  });
});
