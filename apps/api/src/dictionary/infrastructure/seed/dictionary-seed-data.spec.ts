import { describe, expect, it } from "vitest";
import {
  dictionarySeedEntries,
  dictionarySeedRelations,
} from "./dictionary-seed-data";

describe("dictionary seed data", () => {
  const senses = dictionarySeedEntries.flatMap((entry) => entry.senses);
  const senseIds = new Set(senses.map((sense) => sense.id));

  it("keeps language-scoped headwords and stable IDs unique", () => {
    const entryKeys = dictionarySeedEntries.map(
      (entry) => `${entry.languageTag}:${entry.headword}`,
    );
    const entryIds = dictionarySeedEntries.map((entry) => entry.id);
    const narrativeIds = senses.flatMap((sense) =>
      (sense.narratives ?? []).map((narrative) => narrative.id),
    );
    const exampleIds = senses.flatMap((sense) =>
      (sense.examples ?? []).map((example) => example.id),
    );
    const formIds = senses.flatMap((sense) =>
      (sense.forms ?? []).map((form) => form.id),
    );

    for (const ids of [entryIds, [...senseIds], narrativeIds, exampleIds, formIds]) {
      expect(new Set(ids).size).toBe(ids.length);
    }
    expect(new Set(entryKeys).size).toBe(entryKeys.length);
  });

  it("gives every expression localized definitions", () => {
    const expressions = dictionarySeedEntries.filter(
      (entry) => entry.kind === "EXPRESSION",
    );

    for (const expression of expressions) {
      expect(expression.senses.length).toBeGreaterThan(0);

      for (const sense of expression.senses) {
        const definitionLanguages = sense.definitions.map(
          (definition) => definition.languageTag,
        );

        expect(definitionLanguages).toEqual(expect.arrayContaining(["en", "ko"]));
        expect(new Set(definitionLanguages).size).toBe(
          definitionLanguages.length,
        );
        expect(sense.commonnessScore).toBeGreaterThanOrEqual(0);
        expect(sense.commonnessScore).toBeLessThanOrEqual(1);

        for (const narrative of sense.narratives ?? []) {
          expect(narrative.languageTag).toBe("ko");
          expect(narrative.markdown.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("only links relations to seeded senses", () => {
    for (const relation of dictionarySeedRelations) {
      expect(senseIds.has(relation.sourceSenseId)).toBe(true);
      expect(senseIds.has(relation.targetSenseId)).toBe(true);
      expect(relation.sourceSenseId).not.toBe(relation.targetSenseId);
    }
  });

  it("stores only forms that differ from the entry headword", () => {
    for (const entry of dictionarySeedEntries) {
      for (const sense of entry.senses) {
        expect(
          (sense.forms ?? []).every((form) => form.surface !== entry.headword),
        ).toBe(true);
      }
    }
  });

  it("duplicates grammatical forms for each applicable grind sense", () => {
    const grind = dictionarySeedEntries.find((entry) => entry.headword === "grind");
    const verbFormSets = grind?.senses
      .filter((sense) => sense.partOfSpeech === "VERB")
      .map((sense) =>
        (sense.forms ?? []).map(({ surface, kind }) => `${kind}:${surface}`).sort(),
      );

    expect(verbFormSets).toHaveLength(3);
    expect(verbFormSets?.[0]).toEqual(verbFormSets?.[1]);
    expect(verbFormSets?.[1]).toEqual(verbFormSets?.[2]);
  });
});
