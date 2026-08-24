import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import type { DictionaryEntry } from "../domain/dictionary-entry";
import {
  DictionaryRepository,
  type SearchDictionaryEntriesCriteria,
  type SearchDictionaryEntriesResult,
} from "../domain/dictionary.repository";

function toDictionaryEntry(record: {
  id: string;
  headword: string;
  kind: "WORD" | "EXPRESSION";
}): DictionaryEntry {
  return {
    id: record.id,
    headword: record.headword,
    kind: record.kind,
  };
}

@Injectable()
export class PrismaDictionaryRepository extends DictionaryRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<DictionaryEntry | null> {
    const entry = await this.prisma.dictionaryEntry.findUnique({
      where: { id },
    });

    return entry ? toDictionaryEntry(entry) : null;
  }

  async search(
    criteria: SearchDictionaryEntriesCriteria,
  ): Promise<SearchDictionaryEntriesResult> {
    const where = criteria.normalizedQuery
      ? {
          normalizedHeadword: {
            contains: criteria.normalizedQuery,
            mode: "insensitive" as const,
          },
        }
      : undefined;
    const [entries, totalCount] = await Promise.all([
      this.prisma.dictionaryEntry.findMany({
        where,
        orderBy: { headword: "asc" },
        skip: criteria.offset,
        take: criteria.limit,
      }),
      this.prisma.dictionaryEntry.count({ where }),
    ]);

    return {
      entries: entries.map(toDictionaryEntry),
      totalCount,
    };
  }
}
