import { describe, expect, it } from "vitest";
import { dictionarySeedLexemes, dictionarySeedSenseRelations, dictionarySeedSynsets } from "./dictionary-seed-data";
describe("dictionary lexeme seed", () => {
  it("contains complete references and polysemy", () => {
    const synsetIds = new Set(dictionarySeedSynsets.map(({ id }) => id));
    const senses = dictionarySeedLexemes.flatMap(({ senses }) => senses);
    const senseIds = new Set(senses.map(({ id }) => id));
    expect(dictionarySeedLexemes).toHaveLength(63);
    const converseLexemes = dictionarySeedLexemes.filter(({ canonicalLemma }) => canonicalLemma === "converse");
    expect(new Set(converseLexemes.map(({ lexicalCategoryCode }) => lexicalCategoryCode))).toEqual(new Set(["ADJECTIVE", "NOUN", "VERB"]));
    expect(senses.every(({ synsetId }) => synsetIds.has(synsetId))).toBe(true);
    expect(dictionarySeedSenseRelations.every(({ sourceSenseId, targetSenseId }) => senseIds.has(sourceSenseId) && senseIds.has(targetSenseId))).toBe(true);
    const examples = senses.flatMap(({ examples = [] }) => examples);
    expect(new Set(examples.map(({ id }) => id)).size).toBe(examples.length);
    expect(dictionarySeedLexemes.every(({ lexicalCategoryCode }) => lexicalCategoryCode !== "UNKNOWN")).toBe(true);
  });

  it("does not duplicate a form within a lexeme", () => {
    for (const lexeme of dictionarySeedLexemes) {
      const forms = lexeme.forms ?? [];
      const formKeys = forms.map(
        ({ featureKey, surface }) => `${surface}:${featureKey}`,
      );

      expect(new Set(formKeys).size, lexeme.canonicalLemma).toBe(
        formKeys.length,
      );
    }
  });
});
