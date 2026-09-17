import type { DictionaryLexeme, DictionarySenseRecommendation } from "./dictionary-lexeme";

export interface SearchDictionaryLexemesCriteria {
  languageTag: string;
  normalizedQuery: string | null;
  offset: number;
  limit: number;
}

export interface SearchDictionaryLexemesResult {
  lexemes: readonly DictionaryLexeme[];
  totalCount: number;
}

export abstract class DictionaryRepository {
  abstract findById(id: string): Promise<DictionaryLexeme | null>;

  abstract search(
    criteria: SearchDictionaryLexemesCriteria,
  ): Promise<SearchDictionaryLexemesResult>;

  abstract findSenseRecommendations(
    senseId: string,
    limit: number,
  ): Promise<readonly DictionarySenseRecommendation[]>;
}
