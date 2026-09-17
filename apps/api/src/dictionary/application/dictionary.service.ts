import { Injectable } from "@nestjs/common";
import type {
  DictionaryLexeme,
  DictionarySenseRecommendation,
} from "../domain/dictionary-lexeme";
import {
  normalizeDictionaryLanguageTag,
  normalizeDictionarySearchQuery,
} from "../domain/dictionary-lexeme";
import { DictionaryRepository } from "../domain/dictionary.repository";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_RECOMMENDATIONS = 5;
const CURSOR_PREFIX = "dictionary-lexeme:";

export interface SearchDictionaryLexemesInput {
  languageTag?: string;
  query?: string;
  first?: number;
  after?: string;
}

export interface DictionaryLexemeEdge {
  cursor: string;
  node: DictionaryLexeme;
}

export interface DictionaryLexemePage {
  edges: readonly DictionaryLexemeEdge[];
  totalCount: number;
  pageInfo: {
    startCursor: string | null;
    endCursor: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class InvalidDictionaryQueryError extends Error {}

function encodeCursor(offset: number): string {
  return Buffer.from(`${CURSOR_PREFIX}${offset}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string): number {
  const decoded = Buffer.from(cursor, "base64url").toString("utf8");

  if (!decoded.startsWith(CURSOR_PREFIX)) {
    throw new InvalidDictionaryQueryError("Invalid dictionary cursor.");
  }

  const offset = Number(decoded.slice(CURSOR_PREFIX.length));

  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new InvalidDictionaryQueryError("Invalid dictionary cursor.");
  }

  return offset;
}

@Injectable()
export class DictionaryService {
  constructor(private readonly repository: DictionaryRepository) {}

  findById(id: string): Promise<DictionaryLexeme | null> {
    return this.repository.findById(id);
  }

  senseRecommendations(
    senseId: string,
    first: number = 3,
  ): Promise<readonly DictionarySenseRecommendation[]> {
    if (!Number.isInteger(first) || first < 1 || first > MAX_RECOMMENDATIONS) {
      throw new InvalidDictionaryQueryError(
        `first must be between 1 and ${MAX_RECOMMENDATIONS}.`,
      );
    }

    return this.repository.findSenseRecommendations(senseId, first);
  }

  async search(
    input: SearchDictionaryLexemesInput,
  ): Promise<DictionaryLexemePage> {
    const first = input.first ?? DEFAULT_PAGE_SIZE;

    if (!Number.isInteger(first) || first < 1 || first > MAX_PAGE_SIZE) {
      throw new InvalidDictionaryQueryError(
        `first must be between 1 and ${MAX_PAGE_SIZE}.`,
      );
    }

    let languageTag: string;

    try {
      languageTag = normalizeDictionaryLanguageTag(input.languageTag ?? "en");
    } catch {
      throw new InvalidDictionaryQueryError("Invalid dictionary language tag.");
    }

    const normalizedQuery = input.query
      ? normalizeDictionarySearchQuery(input.query, languageTag)
      : null;
    const offset = input.after ? decodeCursor(input.after) + 1 : 0;
    const result = await this.repository.search({
      languageTag,
      normalizedQuery: normalizedQuery || null,
      offset,
      limit: first,
    });
    const edges = result.lexemes.map((lexeme, index) => ({
      cursor: encodeCursor(offset + index),
      node: lexeme,
    }));

    return {
      edges,
      totalCount: result.totalCount,
      pageInfo: {
        startCursor: edges.at(0)?.cursor ?? null,
        endCursor: edges.at(-1)?.cursor ?? null,
        hasNextPage: offset + edges.length < result.totalCount,
        hasPreviousPage: offset > 0,
      },
    };
  }
}
