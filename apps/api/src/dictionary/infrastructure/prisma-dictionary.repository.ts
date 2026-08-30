import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { Prisma } from "../../generated/prisma/client";
import type { DictionaryEntry } from "../domain/dictionary-entry";
import {
  DictionaryRepository,
  type SearchDictionaryEntriesCriteria,
  type SearchDictionaryEntriesResult,
} from "../domain/dictionary.repository";

const dictionaryEntryInclude = {
  senses: {
    include: {
      definitions: { orderBy: { languageTag: "asc" } },
      narratives: { orderBy: [{ kind: "asc" }, { languageTag: "asc" }] },
      examples: {
        include: { translations: { orderBy: { languageTag: "asc" } } },
        orderBy: { id: "asc" },
      },
      forms: { orderBy: [{ kind: "asc" }, { surface: "asc" }] },
    },
    orderBy: [
      { commonnessScore: { sort: "desc", nulls: "last" } },
      { id: "asc" },
    ],
  },
} satisfies Prisma.DictionaryEntryInclude;

type DictionaryEntryRecord = Prisma.DictionaryEntryGetPayload<{
  include: typeof dictionaryEntryInclude;
}>;

function toDictionaryEntry(record: DictionaryEntryRecord): DictionaryEntry {
  return {
    id: record.id,
    headword: record.headword,
    languageTag: record.languageTag,
    kind: record.kind,
    senses: record.senses.map((sense) => ({
        id: sense.id,
        partOfSpeech: sense.partOfSpeech,
        commonnessScore: sense.commonnessScore,
        definitions: sense.definitions,
        narratives: sense.narratives,
        examples: sense.examples.map((example) => ({
          id: example.id,
          sourceLanguageTag: example.sourceLanguageTag,
          sourceText: example.sourceText,
          translations: example.translations,
        })),
        forms: sense.forms,
      })),
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
      include: dictionaryEntryInclude,
    });

    return entry ? toDictionaryEntry(entry) : null;
  }

  async search(
    criteria: SearchDictionaryEntriesCriteria,
  ): Promise<SearchDictionaryEntriesResult> {
    const where = {
      languageTag: criteria.languageTag,
      ...(criteria.normalizedQuery
        ? {
            headword: {
              contains: criteria.normalizedQuery,
              mode: "insensitive" as const,
            },
          }
        : {}),
    };
    const [entries, totalCount] = await Promise.all([
      this.prisma.dictionaryEntry.findMany({
        where,
        include: dictionaryEntryInclude,
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
