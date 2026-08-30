import type { DictionaryEntry } from "./dictionary-entry";

export interface SearchDictionaryEntriesCriteria {
  languageTag: string;
  normalizedQuery: string | null;
  offset: number;
  limit: number;
}

export interface SearchDictionaryEntriesResult {
  entries: readonly DictionaryEntry[];
  totalCount: number;
}

export abstract class DictionaryRepository {
  abstract findById(id: string): Promise<DictionaryEntry | null>;

  abstract search(
    criteria: SearchDictionaryEntriesCriteria,
  ): Promise<SearchDictionaryEntriesResult>;
}
