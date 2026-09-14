import { describe, expect, it } from "vitest";
import {
  DictionaryEntryKind,
  type DictionaryEntry,
  type DictionarySenseRecommendation,
} from "../domain/dictionary-entry";
import {
  DictionaryRepository,
  type SearchDictionaryEntriesCriteria,
  type SearchDictionaryEntriesResult,
} from "../domain/dictionary.repository";
import {
  DictionaryService,
  InvalidDictionaryQueryError,
} from "./dictionary.service";

const entries: readonly DictionaryEntry[] = [
  {
    id: "entry:grind",
    headword: "grind",
    languageTag: "en",
    kind: DictionaryEntryKind.WORD,
    senses: [],
  },
  {
    id: "entry:grind-to-a-halt",
    headword: "grind to a halt",
    languageTag: "en",
    kind: DictionaryEntryKind.EXPRESSION,
    senses: [],
  },
];

class TestDictionaryRepository extends DictionaryRepository {
  findById(id: string): Promise<DictionaryEntry | null> {
    return Promise.resolve(entries.find((entry) => entry.id === id) ?? null);
  }

  search(
    criteria: SearchDictionaryEntriesCriteria,
  ): Promise<SearchDictionaryEntriesResult> {
    const languageEntries = entries.filter(
      (entry) => entry.languageTag === criteria.languageTag,
    );
    const matchedEntries = criteria.normalizedQuery
      ? languageEntries.filter((entry) =>
          entry.headword.toLowerCase().includes(criteria.normalizedQuery ?? ""),
        )
      : languageEntries;

    return Promise.resolve({
      entries: matchedEntries.slice(
        criteria.offset,
        criteria.offset + criteria.limit,
      ),
      totalCount: matchedEntries.length,
    });
  }

  findSenseRecommendations(
    senseId: string,
    limit: number,
  ): Promise<readonly DictionarySenseRecommendation[]> {
    void senseId;
    void limit;
    return Promise.resolve([]);
  }
}

describe("DictionaryService", () => {
  const service = new DictionaryService(new TestDictionaryRepository());

  it("normalizes a search and returns a Relay-style page", async () => {
    const page = await service.search({ query: "  GRIND  ", first: 1 });

    expect(page.edges.map((edge) => edge.node.headword)).toEqual(["grind"]);
    expect(page.totalCount).toBe(2);
    expect(page.pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false,
    });
    expect(page.pageInfo.endCursor).not.toBeNull();
  });

  it("continues after an opaque cursor", async () => {
    const firstPage = await service.search({ query: "grind", first: 1 });
    const secondPage = await service.search({
      query: "grind",
      first: 1,
      after: firstPage.pageInfo.endCursor ?? undefined,
    });

    expect(secondPage.edges.map((edge) => edge.node.headword)).toEqual([
      "grind to a halt",
    ]);
    expect(secondPage.pageInfo).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });

  it("rejects an invalid page size", async () => {
    await expect(service.search({ first: 51 })).rejects.toBeInstanceOf(
      InvalidDictionaryQueryError,
    );
  });

  it("rejects an invalid cursor", async () => {
    await expect(
      service.search({ after: "not-a-dictionary-cursor" }),
    ).rejects.toBeInstanceOf(InvalidDictionaryQueryError);
  });

  it("rejects an invalid language tag", async () => {
    await expect(
      service.search({ languageTag: "not_a_language" }),
    ).rejects.toBeInstanceOf(InvalidDictionaryQueryError);
  });

  it("validates recommendation limits before querying the repository", () => {
    expect(() => service.senseRecommendations("sense:grind", 0)).toThrow(
      InvalidDictionaryQueryError,
    );
    expect(() => service.senseRecommendations("sense:grind", 6)).toThrow(
      InvalidDictionaryQueryError,
    );
  });
});
