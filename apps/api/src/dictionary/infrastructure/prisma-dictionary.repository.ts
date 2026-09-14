import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { Prisma } from "../../generated/prisma/client";
import {
  DictionaryEntryKind,
  DictionarySenseRecommendationReason,
  type DictionaryEntry,
  type DictionarySenseRecommendation,
  type DictionarySenseRecommendationReason as RecommendationReason,
} from "../domain/dictionary-entry";
import {
  DictionaryRepository,
  type SearchDictionaryEntriesCriteria,
  type SearchDictionaryEntriesResult,
} from "../domain/dictionary.repository";

const dictionaryEntryInclude = {
  senses: {
    include: {
      synset: {
        include: {
          definitions: { orderBy: { languageTag: "asc" } },
          examples: {
            include: { translations: { orderBy: { languageTag: "asc" } } },
            orderBy: { id: "asc" },
          },
        },
      },
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
      commonnessScore: sense.commonnessScore,
      synset: {
        id: sense.synset.id,
        partOfSpeech: sense.synset.partOfSpeech,
        definitions: sense.synset.definitions,
        examples: sense.synset.examples.map((example) => ({
          id: example.id,
          sourceLanguageTag: example.sourceLanguageTag,
          sourceText: example.sourceText,
          translations: example.translations,
        })),
      },
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

const recommendationPriority: Record<RecommendationReason, number> = {
  SAME_SYNSET: 0,
  DERIVED_FROM: 1,
  DERIVATIVE: 1,
  CONFUSABLE: 2,
  ANTONYM: 3,
  RELATED: 4,
  HYPERNYM: 5,
  HYPONYM: 5,
};

interface RecommendationCandidate {
  entryId: string;
  senseId: string;
  headword: string;
  kind: "WORD" | "EXPRESSION";
  commonnessScore: number | null;
  reason: RecommendationReason;
}

export function rankRecommendationCandidates(
  candidates: readonly RecommendationCandidate[],
): readonly RecommendationCandidate[] {
  const bestBySenseId = new Map<string, RecommendationCandidate>();

  for (const candidate of candidates) {
    const previous = bestBySenseId.get(candidate.senseId);
    if (
      !previous ||
      recommendationPriority[candidate.reason] <
        recommendationPriority[previous.reason] ||
      (recommendationPriority[candidate.reason] ===
        recommendationPriority[previous.reason] &&
        (candidate.commonnessScore ?? -1) >
          (previous.commonnessScore ?? -1))
    ) {
      bestBySenseId.set(candidate.senseId, candidate);
    }
  }

  return [...bestBySenseId.values()].sort((left, right) => {
    const priorityDifference =
      recommendationPriority[left.reason] -
      recommendationPriority[right.reason];
    if (priorityDifference !== 0) return priorityDifference;

    if (left.kind !== right.kind) {
      return left.kind === DictionaryEntryKind.EXPRESSION ? -1 : 1;
    }

    const commonnessDifference =
      (right.commonnessScore ?? -1) - (left.commonnessScore ?? -1);
    if (commonnessDifference !== 0) return commonnessDifference;

    const headwordDifference = left.headword.localeCompare(right.headword);
    return (
      headwordDifference ||
      left.entryId.localeCompare(right.entryId) ||
      left.senseId.localeCompare(right.senseId)
    );
  });
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

  async findSenseRecommendations(
    senseId: string,
    limit: number,
  ): Promise<readonly DictionarySenseRecommendation[]> {
    const sourceSense = await this.prisma.dictionarySense.findUnique({
      where: { id: senseId },
      select: {
        synsetId: true,
        entry: { select: { id: true, languageTag: true } },
      },
    });
    if (!sourceSense) return [];

    const [sameSynsetSenses, senseRelations, synsetRelations] =
      await Promise.all([
        this.prisma.dictionarySense.findMany({
          where: {
            synsetId: sourceSense.synsetId,
            id: { not: senseId },
            entry: {
              id: { not: sourceSense.entry.id },
              languageTag: sourceSense.entry.languageTag,
            },
          },
          select: {
            id: true,
            commonnessScore: true,
            entry: { select: { id: true, headword: true, kind: true } },
          },
        }),
        this.prisma.dictionarySenseRelation.findMany({
          where: {
            OR: [
              { sourceSenseId: senseId },
              { targetSenseId: senseId },
            ],
          },
          select: {
            kind: true,
            sourceSenseId: true,
            targetSenseId: true,
            sourceSense: {
              select: {
                id: true,
                commonnessScore: true,
                entry: { select: { id: true, headword: true, kind: true, languageTag: true } },
              },
            },
            targetSense: {
              select: {
                id: true,
                commonnessScore: true,
                entry: { select: { id: true, headword: true, kind: true, languageTag: true } },
              },
            },
          },
        }),
        this.prisma.dictionarySynsetRelation.findMany({
          where: {
            OR: [
              { sourceSynsetId: sourceSense.synsetId },
              { targetSynsetId: sourceSense.synsetId },
            ],
          },
          select: {
            kind: true,
            sourceSynsetId: true,
            targetSynsetId: true,
            sourceSynset: {
              select: {
                senses: {
                  select: {
                    id: true,
                    commonnessScore: true,
                    entry: { select: { id: true, headword: true, kind: true, languageTag: true } },
                  },
                },
              },
            },
            targetSynset: {
              select: {
                senses: {
                  select: {
                    id: true,
                    commonnessScore: true,
                    entry: { select: { id: true, headword: true, kind: true, languageTag: true } },
                  },
                },
              },
            },
          },
        }),
      ]);

    const candidates: RecommendationCandidate[] = sameSynsetSenses.map(
      ({ id, entry, commonnessScore }) => ({
        entryId: entry.id,
        senseId: id,
        headword: entry.headword,
        kind: entry.kind,
        commonnessScore,
        reason: DictionarySenseRecommendationReason.SAME_SYNSET,
      }),
    );
    const addCandidate = (
      related: {
        id: string;
        commonnessScore: number | null;
        entry: { id: string; headword: string; kind: "WORD" | "EXPRESSION"; languageTag: string };
      },
      reason: RecommendationReason,
    ) => {
      if (
        related.id !== senseId &&
        related.entry.id !== sourceSense.entry.id &&
        related.entry.languageTag === sourceSense.entry.languageTag
      ) {
        candidates.push({
          entryId: related.entry.id,
          senseId: related.id,
          headword: related.entry.headword,
          kind: related.entry.kind,
          commonnessScore: related.commonnessScore,
          reason,
        });
      }
    };

    for (const relation of senseRelations) {
      const currentIsSource = relation.sourceSenseId === senseId;
      const related = currentIsSource ? relation.targetSense : relation.sourceSense;
      const reason =
        relation.kind === "DERIVED_FROM"
          ? currentIsSource
            ? DictionarySenseRecommendationReason.DERIVED_FROM
            : DictionarySenseRecommendationReason.DERIVATIVE
          : relation.kind;
      addCandidate(related, reason);
    }

    for (const relation of synsetRelations) {
      const currentIsSource = relation.sourceSynsetId === sourceSense.synsetId;
      const relatedSenses = currentIsSource
        ? relation.targetSynset.senses
        : relation.sourceSynset.senses;
      const reason =
        relation.kind === "HYPERNYM"
          ? currentIsSource
            ? DictionarySenseRecommendationReason.HYPERNYM
            : DictionarySenseRecommendationReason.HYPONYM
          : DictionarySenseRecommendationReason.RELATED;
      for (const related of relatedSenses) addCandidate(related, reason);
    }

    const ranked = rankRecommendationCandidates(candidates).slice(0, limit);
    const entries = await this.prisma.dictionaryEntry.findMany({
      where: { id: { in: ranked.map((candidate) => candidate.entryId) } },
      include: dictionaryEntryInclude,
    });
    const entriesById = new Map(
      entries.map((entry) => [entry.id, toDictionaryEntry(entry)]),
    );

    return ranked.flatMap((candidate) => {
      const entry = entriesById.get(candidate.entryId);
      const targetSense = entry?.senses.find(
        (sense) => sense.id === candidate.senseId,
      );
      return entry && targetSense
        ? [{ targetEntry: entry, targetSense, reason: candidate.reason }]
        : [];
    });
  }
}
