import { describe, expect, it } from "vitest";
import type { CardDraft } from "../types/card-draft";
import { validateDrafts } from "./draft-validation";

const validDraft: CardDraft = {
  term: "induce",
  meanings: [{
    expression: "induce",
    definitionKo: "유발하다",
    examples: [{
      en: "The policy may induce companies to reduce spending.",
      type: "sentence",
    }],
  }],
};

describe("draft validation", () => {
  it("allows a card without fill-in-the-blank contexts", () => {
    expect(validateDrafts([validDraft])).toBeUndefined();
  });

  it("ignores incomplete fill-in-the-blank contexts", () => {
    expect(validateDrafts([{
      ...validDraft,
      meanings: [{
        ...validDraft.meanings[0],
        fillInBlankExamples: [{
          en: "The context is incomplete.",
          type: "sentence",
        }],
      }],
    }])).toBeUndefined();
  });
});
