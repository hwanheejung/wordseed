import { describe, expect, it } from "vitest";
import {
  dictionarySeedEntries,
  dictionarySeedSenseRelations,
  dictionarySeedSynsetRelations,
  dictionarySeedSynsets,
  type DictionarySeedEntry,
} from "./dictionary-seed-data";

const senses = dictionarySeedEntries.flatMap((entry) => entry.senses);
const synsetsById = new Map(
  dictionarySeedSynsets.map((synset) => [synset.id, synset]),
);
const entryBySenseId = new Map(
  dictionarySeedEntries.flatMap((entry) =>
    entry.senses.map((sense) => [sense.id, entry] as const),
  ),
);
const entriesBySynsetId = new Map<string, DictionarySeedEntry[]>();
for (const entry of dictionarySeedEntries) {
  for (const sense of entry.senses) {
    const members = entriesBySynsetId.get(sense.synsetId) ?? [];
    members.push(entry);
    entriesBySynsetId.set(sense.synsetId, members);
  }
}

const expectedHeadwords = [
  "grind", "grind to a halt", "up to speed", "take a toll on",
  "rip someone a new one", "go the extra mile", "I'm down",
  "in broad daylight", "dead end", "circle back", "Would you mind if …?",
  "Actions speak louder than words", "pros and cons", "that said", "stable",
  "stability", "stabilize", "converse", "conversation", "conversely",
  "point out a mistake", "tell someone off", "steady", "unstable",
  "instability", "destabilize", "chat", "talk", "communication", "discussion",
  "reprimand", "scold", "praise", "mistake", "error", "vehicle", "car",
  "automobile", "bicycle", "truck", "stop", "cease", "halt", "advantage",
  "benefit", "disadvantage", "drawback", "affect", "effect", "effective",
] as const;

describe("dictionary seed data", () => {
  it("contains exactly the relationship-validation vocabulary", () => {
    expect(dictionarySeedEntries).toHaveLength(50);
    expect(new Set(dictionarySeedEntries.map((entry) => entry.headword)).size).toBe(50);
    expect(dictionarySeedEntries.map((entry) => entry.headword).sort()).toEqual(
      [...expectedHeadwords].sort(),
    );
  });

  it("uses globally unique IDs without hiding duplicates behind Sets", () => {
    const idGroups = [
      dictionarySeedEntries.map((entry) => entry.id),
      dictionarySeedSynsets.map((synset) => synset.id),
      senses.map((sense) => sense.id),
      senses.flatMap((sense) =>
        (sense.narratives ?? []).map((narrative) => narrative.id),
      ),
      senses.flatMap((sense) =>
        (sense.examples ?? []).map((example) => example.id),
      ),
      senses.flatMap((sense) =>
        (sense.examples ?? []).flatMap((example) =>
          example.translations.map((translation) => translation.id),
        ),
      ),
      dictionarySeedSynsets.flatMap((synset) =>
        synset.examples.map((example) => example.id),
      ),
      dictionarySeedSynsets.flatMap((synset) =>
        synset.examples.flatMap((example) =>
          example.translations.map((translation) => translation.id),
        ),
      ),
      senses.flatMap((sense) => (sense.forms ?? []).map((form) => form.id)),
    ];

    for (const ids of idGroups) {
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("keeps every foreign key valid and every synset reachable", () => {
    const senseIds = new Set(senses.map((sense) => sense.id));
    const synsetIds = new Set(dictionarySeedSynsets.map((synset) => synset.id));

    for (const sense of senses) {
      expect(synsetIds.has(sense.synsetId)).toBe(true);
    }
    for (const relation of dictionarySeedSenseRelations) {
      expect(senseIds.has(relation.sourceSenseId)).toBe(true);
      expect(senseIds.has(relation.targetSenseId)).toBe(true);
      expect(relation.sourceSenseId).not.toBe(relation.targetSenseId);
    }
    for (const relation of dictionarySeedSynsetRelations) {
      expect(synsetIds.has(relation.sourceSynsetId)).toBe(true);
      expect(synsetIds.has(relation.targetSynsetId)).toBe(true);
      expect(relation.sourceSynsetId).not.toBe(relation.targetSynsetId);
    }
    for (const synset of dictionarySeedSynsets) {
      expect(entriesBySynsetId.get(synset.id)?.length).toBeGreaterThan(0);
    }
  });

  it("enforces one membership per entry and synset", () => {
    const memberships = dictionarySeedEntries.flatMap((entry) =>
      entry.senses.map((sense) => `${entry.id}:${sense.synsetId}`),
    );
    expect(new Set(memberships).size).toBe(memberships.length);
  });

  it("keeps scores and localized content valid", () => {
    for (const sense of senses) {
      expect(Number.isFinite(sense.commonnessScore)).toBe(true);
      expect(sense.commonnessScore).toBeGreaterThanOrEqual(0);
      expect(sense.commonnessScore).toBeLessThanOrEqual(1);
      for (const narrative of sense.narratives ?? []) {
        expect(narrative.languageTag.trim()).not.toBe("");
        expect(narrative.markdown.trim()).not.toBe("");
      }
      assertExamplesHaveContent(sense.examples ?? []);
      for (const form of sense.forms ?? []) {
        expect(form.surface.trim()).not.toBe("");
      }
    }

    for (const synset of dictionarySeedSynsets) {
      const languages = synset.definitions.map((definition) => definition.languageTag);
      expect(languages).toEqual(expect.arrayContaining(["en", "ko"]));
      expect(new Set(languages).size).toBe(languages.length);
      for (const definition of synset.definitions) {
        expect(definition.text.trim()).not.toBe("");
      }
      assertExamplesHaveContent(synset.examples);
    }
  });

  it("provides translated examples at the required ownership levels", () => {
    const translatedSynsets = dictionarySeedSynsets.filter((synset) =>
      synset.examples.some(
        (example) =>
          example.sourceLanguageTag === "en" &&
          example.translations.some((translation) => translation.languageTag === "ko"),
      ),
    );
    expect(translatedSynsets.length).toBeGreaterThanOrEqual(10);

    for (const expression of dictionarySeedEntries.filter(
      (entry) => entry.kind === "EXPRESSION",
    )) {
      expect(
        expression.senses.some((sense) =>
          (sense.examples ?? []).some(
            (example) =>
              example.sourceLanguageTag === "en" &&
              example.translations.some(
                (translation) => translation.languageTag === "ko",
              ),
          ),
        ),
      ).toBe(true);
    }
  });

  it("has no duplicate relations or reverse duplicates for symmetric kinds", () => {
    const senseKeys = dictionarySeedSenseRelations.map(
      (relation) =>
        `${relation.kind}:${relation.sourceSenseId}:${relation.targetSenseId}`,
    );
    const synsetKeys = dictionarySeedSynsetRelations.map(
      (relation) =>
        `${relation.kind}:${relation.sourceSynsetId}:${relation.targetSynsetId}`,
    );
    expect(new Set(senseKeys).size).toBe(senseKeys.length);
    expect(new Set(synsetKeys).size).toBe(synsetKeys.length);

    for (const relation of dictionarySeedSenseRelations.filter(
      (candidate) =>
        candidate.kind === "ANTONYM" || candidate.kind === "CONFUSABLE",
    )) {
      expect(senseKeys).not.toContain(
        `${relation.kind}:${relation.targetSenseId}:${relation.sourceSenseId}`,
      );
    }
    for (const relation of dictionarySeedSynsetRelations.filter(
      (candidate) => candidate.kind === "RELATED",
    )) {
      expect(synsetKeys).not.toContain(
        `${relation.kind}:${relation.targetSynsetId}:${relation.sourceSynsetId}`,
      );
    }
  });

  it("keeps the hypernym graph same-POS, narrow-to-broad, and acyclic", () => {
    const hypernyms = dictionarySeedSynsetRelations.filter(
      (relation) => relation.kind === "HYPERNYM",
    );
    const adjacency = new Map<string, string[]>();
    for (const relation of hypernyms) {
      expect(synsetsById.get(relation.sourceSynsetId)?.partOfSpeech).toBe(
        synsetsById.get(relation.targetSynsetId)?.partOfSpeech,
      );
      const targets = adjacency.get(relation.sourceSynsetId) ?? [];
      targets.push(relation.targetSynsetId);
      adjacency.set(relation.sourceSynsetId, targets);
    }

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string): void => {
      expect(visiting.has(id)).toBe(false);
      if (visited.has(id)) return;
      visiting.add(id);
      for (const target of adjacency.get(id) ?? []) visit(target);
      visiting.delete(id);
      visited.add(id);
    };
    for (const synset of dictionarySeedSynsets) visit(synset.id);
  });

  it("meets the graph coverage and relationship fixture targets", () => {
    const expressions = dictionarySeedEntries.filter(
      (entry) => entry.kind === "EXPRESSION",
    );
    const polysemousEntries = dictionarySeedEntries.filter(
      (entry) => entry.senses.length >= 2,
    );
    const entriesWithThreeSenses = dictionarySeedEntries.filter(
      (entry) => entry.senses.length >= 3,
    );
    const sharedSynsets = [...entriesBySynsetId.values()].filter(
      (members) => new Set(members.map((entry) => entry.id)).size >= 2,
    );
    const sharedByThree = sharedSynsets.filter(
      (members) => new Set(members.map((entry) => entry.id)).size >= 3,
    );
    const senseRelationCounts = countKinds(dictionarySeedSenseRelations);
    const synsetRelationCounts = countKinds(dictionarySeedSynsetRelations);
    const graph = buildEntryGraph();
    const coveredEntries = [...graph.values()].filter(
      (neighbors) => neighbors.size > 0,
    ).length;
    const largeComponents = connectedComponents(graph).filter(
      (component) => component.length >= 5,
    );

    expect(senses.length).toBeGreaterThanOrEqual(65);
    expect(expressions.length).toBeGreaterThanOrEqual(15);
    expect(polysemousEntries.length).toBeGreaterThanOrEqual(10);
    expect(entriesWithThreeSenses.length).toBeGreaterThanOrEqual(3);
    expect(sharedSynsets.length).toBeGreaterThanOrEqual(10);
    expect(sharedByThree.length).toBeGreaterThanOrEqual(3);
    expect(senseRelationCounts.get("ANTONYM")).toBeGreaterThanOrEqual(5);
    expect(senseRelationCounts.get("DERIVED_FROM")).toBeGreaterThanOrEqual(5);
    expect(senseRelationCounts.get("CONFUSABLE")).toBeGreaterThanOrEqual(5);
    expect(synsetRelationCounts.get("HYPERNYM")).toBeGreaterThanOrEqual(10);
    expect(synsetRelationCounts.get("RELATED")).toBeGreaterThanOrEqual(5);
    expect(coveredEntries).toBeGreaterThanOrEqual(40);
    expect(largeComponents.length).toBeGreaterThanOrEqual(3);
  });

  it("encodes the intended semantic distinctions", () => {
    expectSharedSynset(["car", "automobile"]);
    expectSharedSynset(["mistake", "error"]);
    expectSharedSynset(["stop", "cease", "halt"], "VERB");
    expectSharedSynset(["disadvantage", "drawback"]);
    expectSharedSynset(["converse", "chat", "talk"], "VERB");
    expectSharedSynset(["reprimand", "scold", "tell someone off"], "VERB");

    const advantageSynsets = new Set(entry("advantage").senses.map((sense) => sense.synsetId));
    const benefitSynsets = new Set(entry("benefit").senses.map((sense) => sense.synsetId));
    expect([...advantageSynsets].some((id) => benefitSynsets.has(id))).toBe(false);
    expect(dictionarySeedSynsetRelations).toContainEqual({
      sourceSynsetId: entry("advantage").senses[0]?.synsetId,
      targetSynsetId: entry("benefit").senses[0]?.synsetId,
      kind: "RELATED",
    });

    const affect = entry("affect");
    const effect = entry("effect");
    expect(
      dictionarySeedSenseRelations.some(
        (relation) =>
          relation.kind === "CONFUSABLE" &&
          entryBySenseId.get(relation.sourceSenseId) === affect &&
          entryBySenseId.get(relation.targetSenseId) === effect,
      ),
    ).toBe(true);

    const automobileSynset = sharedSynset(["car", "automobile"]);
    const vehicleSynset = entry("vehicle").senses[0]?.synsetId;
    expect(dictionarySeedSynsetRelations).toContainEqual({
      sourceSynsetId: automobileSynset,
      targetSynsetId: vehicleSynset,
      kind: "HYPERNYM",
    });
  });
});

function entry(headword: string): DictionarySeedEntry {
  const found = dictionarySeedEntries.find((candidate) => candidate.headword === headword);
  if (!found) throw new Error(`Missing test entry: ${headword}`);
  return found;
}

function sharedSynset(headwords: readonly string[], partOfSpeech?: string): string {
  const [firstHeadword, ...remainingHeadwords] = headwords;
  if (!firstHeadword) throw new Error("A semantic sample needs at least one headword.");
  const firstSynsets = entry(firstHeadword).senses.filter(
    (sense) =>
      partOfSpeech === undefined ||
      synsetsById.get(sense.synsetId)?.partOfSpeech === partOfSpeech,
  );
  const match = firstSynsets.find((sense) =>
    remainingHeadwords.every((headword) =>
      entry(headword).senses.some((candidate) => candidate.synsetId === sense.synsetId),
    ),
  );
  if (!match) throw new Error(`No shared synset for: ${headwords.join(", ")}`);
  return match.synsetId;
}

function expectSharedSynset(headwords: readonly string[], partOfSpeech?: string): void {
  expect(sharedSynset(headwords, partOfSpeech)).toBeTruthy();
}

function assertExamplesHaveContent(
  examples: readonly {
    sourceLanguageTag: string;
    sourceText: string;
    translations: readonly { languageTag: string; text: string }[];
  }[],
): void {
  for (const example of examples) {
    expect(example.sourceLanguageTag.trim()).not.toBe("");
    expect(example.sourceText.trim()).not.toBe("");
    const languages = example.translations.map((translation) => translation.languageTag);
    expect(new Set(languages).size).toBe(languages.length);
    for (const translation of example.translations) {
      expect(translation.languageTag.trim()).not.toBe("");
      expect(translation.text.trim()).not.toBe("");
    }
  }
}

function countKinds<T extends { kind: string }>(relations: readonly T[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const relation of relations) {
    counts.set(relation.kind, (counts.get(relation.kind) ?? 0) + 1);
  }
  return counts;
}

function buildEntryGraph(): Map<string, Set<string>> {
  const graph = new Map(
    dictionarySeedEntries.map((entry) => [entry.id, new Set<string>()]),
  );
  const connect = (left: string, right: string): void => {
    if (left === right) return;
    graph.get(left)?.add(right);
    graph.get(right)?.add(left);
  };

  for (const members of entriesBySynsetId.values()) {
    for (const left of members) {
      for (const right of members) connect(left.id, right.id);
    }
  }
  for (const relation of dictionarySeedSenseRelations) {
    const source = entryBySenseId.get(relation.sourceSenseId);
    const target = entryBySenseId.get(relation.targetSenseId);
    if (source && target) connect(source.id, target.id);
  }
  for (const relation of dictionarySeedSynsetRelations) {
    for (const source of entriesBySynsetId.get(relation.sourceSynsetId) ?? []) {
      for (const target of entriesBySynsetId.get(relation.targetSynsetId) ?? []) {
        connect(source.id, target.id);
      }
    }
  }
  return graph;
}

function connectedComponents(graph: ReadonlyMap<string, ReadonlySet<string>>): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];
  for (const start of graph.keys()) {
    if (visited.has(start) || graph.get(start)?.size === 0) continue;
    const component: string[] = [];
    const pending = [start];
    visited.add(start);
    while (pending.length > 0) {
      const current = pending.pop();
      if (!current) continue;
      component.push(current);
      for (const neighbor of graph.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          pending.push(neighbor);
        }
      }
    }
    components.push(component);
  }
  return components;
}
