import { Injectable } from "@nestjs/common";
import type { DictionaryEntry } from "../domain/dictionary-entry";
import { normalizeDictionaryHeadword } from "../domain/dictionary-entry";
import { DictionaryRepository } from "../domain/dictionary.repository";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const CURSOR_PREFIX = "dictionary-entry:";

export interface SearchDictionaryEntriesInput {
  query?: string;
  first?: number;
  after?: string;
}

export interface DictionaryEntryEdge {
  cursor: string;
  node: DictionaryEntry;
}

export interface DictionaryEntryPage {
  edges: readonly DictionaryEntryEdge[];
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

  findById(id: string): Promise<DictionaryEntry | null> {
    return this.repository.findById(id);
  }

  async search(input: SearchDictionaryEntriesInput): Promise<DictionaryEntryPage> {
    const first = input.first ?? DEFAULT_PAGE_SIZE;

    if (!Number.isInteger(first) || first < 1 || first > MAX_PAGE_SIZE) {
      throw new InvalidDictionaryQueryError(
        `first must be between 1 and ${MAX_PAGE_SIZE}.`,
      );
    }

    const normalizedQuery = input.query
      ? normalizeDictionaryHeadword(input.query)
      : null;
    const offset = input.after ? decodeCursor(input.after) + 1 : 0;
    const result = await this.repository.search({
      normalizedQuery: normalizedQuery || null,
      offset,
      limit: first,
    });
    const edges = result.entries.map((entry, index) => ({
      cursor: encodeCursor(offset + index),
      node: entry,
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
