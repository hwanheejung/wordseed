import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { Prisma } from "../../generated/prisma/client";
import { DictionarySenseRecommendationReason, type DictionaryLexeme, type DictionarySenseRecommendation, type DictionarySenseRecommendationReason as RecommendationReason } from "../domain/dictionary-lexeme";
import { DictionaryRepository, type SearchDictionaryLexemesCriteria, type SearchDictionaryLexemesResult } from "../domain/dictionary.repository";

const lexemeInclude = {
  language: true,
  lexicalCategory: true,
  lemmas: { orderBy: [{ isPrimary: "desc" }, { languageTag: "asc" }] },
  forms: {
    include: {
      representations: { orderBy: [{ languageTag: "asc" }, { value: "asc" }] },
      features: { include: { feature: true }, orderBy: { feature: { key: "asc" } } },
      pronunciations: { orderBy: [{ dialectTag: "asc" }, { id: "asc" }] },
    },
    orderBy: { id: "asc" },
  },
  senses: {
    include: {
      glosses: { orderBy: { languageTag: "asc" } },
      usages: { orderBy: [{ score: { sort: "desc", nulls: "last" } }, { rank: { sort: "asc", nulls: "last" } }] },
      synset: { include: { definitions: { orderBy: { languageTag: "asc" } } } },
      narratives: { orderBy: [{ kind: "asc" }, { languageTag: "asc" }] },
      examples: { include: { translations: { orderBy: { languageTag: "asc" } } }, orderBy: { id: "asc" } },
    },
    orderBy: [{ order: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.DictionaryLexemeInclude;
type LexemeRecord = Prisma.DictionaryLexemeGetPayload<{ include: typeof lexemeInclude }>;

function toLexeme(record: LexemeRecord): DictionaryLexeme {
  return {
    id: record.id,
    canonicalLemma: record.canonicalLemma,
    language: record.language,
    lexicalCategory: record.lexicalCategory,
    lemmas: record.lemmas,
    forms: record.forms.map((form) => ({
      id: form.id,
      representations: form.representations,
      features: form.features.map(({ feature }) => feature),
      pronunciations: form.pronunciations.map(({ id, ipa, audioUrl, dialectTag, syllabification }) => ({ id, ipa, audioUrl, dialectTag, syllabification })),
    })),
    senses: record.senses.map((sense) => ({
      id: sense.id,
      order: sense.order,
      glosses: sense.glosses,
      usages: sense.usages.map(({ id, score, rank, regionTag, register, corpus }) => ({ id, score, rank, regionTag, register, corpus })),
      synset: sense.synset ? { id: sense.synset.id, definitions: sense.synset.definitions } : null,
      narratives: sense.narratives,
      examples: sense.examples.map((example) => ({ id: example.id, languageTag: example.languageTag, text: example.text, translations: example.translations })),
    })),
  };
}

const priority: Record<RecommendationReason, number> = {
  SAME_SYNSET: 0, DERIVED_FROM: 1, DERIVATIVE: 1, CONFUSABLE: 2, SYNONYM: 2,
  ANTONYM: 3, TRANSLATION: 4, RELATED: 5, HYPERNYM: 6, HYPONYM: 6, MERONYM: 7, HOLONYM: 7,
};
interface Candidate { lexemeId: string; senseId: string; lemma: string; category: string; score: number | null; reason: RecommendationReason }
export function rankRecommendationCandidates(candidates: readonly Candidate[]): readonly Candidate[] {
  const best = new Map<string, Candidate>();
  for (const candidate of candidates) {
    const previous = best.get(candidate.senseId);
    if (!previous || priority[candidate.reason] < priority[previous.reason] || (priority[candidate.reason] === priority[previous.reason] && (candidate.score ?? -1) > (previous.score ?? -1))) best.set(candidate.senseId, candidate);
  }
  return [...best.values()].sort((left, right) => priority[left.reason] - priority[right.reason] || Number(right.category === "IDIOM" || right.category === "PHRASE") - Number(left.category === "IDIOM" || left.category === "PHRASE") || (right.score ?? -1) - (left.score ?? -1) || left.lemma.localeCompare(right.lemma) || left.senseId.localeCompare(right.senseId));
}

const relatedSenseSelect = {
  id: true,
  usages: { select: { score: true }, orderBy: { score: { sort: "desc" as const, nulls: "last" as const } }, take: 1 },
  lexeme: { select: { id: true, canonicalLemma: true, language: { select: { code: true } }, lexicalCategory: { select: { code: true } } } },
};
type RelatedSense = Prisma.DictionarySenseGetPayload<{ select: typeof relatedSenseSelect }>;
function scoreOf(sense: RelatedSense): number | null { return sense.usages[0]?.score ?? null; }

@Injectable()
export class PrismaDictionaryRepository extends DictionaryRepository {
  constructor(private readonly prisma: PrismaService) { super(); }
  async findById(id: string): Promise<DictionaryLexeme | null> {
    const lexeme = await this.prisma.dictionaryLexeme.findUnique({ where: { id }, include: lexemeInclude });
    return lexeme ? toLexeme(lexeme) : null;
  }
  async search(criteria: SearchDictionaryLexemesCriteria): Promise<SearchDictionaryLexemesResult> {
    const where = {
      language: { code: criteria.languageTag },
      ...(criteria.normalizedQuery ? { OR: [
        { canonicalLemma: { contains: criteria.normalizedQuery, mode: "insensitive" as const } },
        { lemmas: { some: { value: { contains: criteria.normalizedQuery, mode: "insensitive" as const } } } },
      ] } : {}),
    };
    const [lexemes, totalCount] = await Promise.all([
      this.prisma.dictionaryLexeme.findMany({ where, include: lexemeInclude, orderBy: [{ canonicalLemma: "asc" }, { id: "asc" }], skip: criteria.offset, take: criteria.limit }),
      this.prisma.dictionaryLexeme.count({ where }),
    ]);
    return { lexemes: lexemes.map(toLexeme), totalCount };
  }
  async findSenseRecommendations(senseId: string, limit: number): Promise<readonly DictionarySenseRecommendation[]> {
    const source = await this.prisma.dictionarySense.findUnique({ where: { id: senseId }, select: { synsetId: true, lexeme: { select: { id: true, language: { select: { code: true } } } } } });
    if (!source) return [];
    const [sameSynset, senseRelations, synsetRelations] = await Promise.all([
      source.synsetId ? this.prisma.dictionarySense.findMany({ where: { synsetId: source.synsetId, id: { not: senseId }, lexeme: { id: { not: source.lexeme.id }, language: { code: source.lexeme.language.code } } }, select: relatedSenseSelect }) : Promise.resolve([]),
      this.prisma.dictionarySenseRelation.findMany({ where: { OR: [{ sourceSenseId: senseId }, { targetSenseId: senseId }] }, select: { kind: true, sourceSenseId: true, targetSenseId: true, sourceSense: { select: relatedSenseSelect }, targetSense: { select: relatedSenseSelect } } }),
      source.synsetId ? this.prisma.dictionarySynsetRelation.findMany({ where: { OR: [{ sourceSynsetId: source.synsetId }, { targetSynsetId: source.synsetId }] }, select: { kind: true, sourceSynsetId: true, targetSynsetId: true, sourceSynset: { select: { senses: { select: relatedSenseSelect } } }, targetSynset: { select: { senses: { select: relatedSenseSelect } } } } }) : Promise.resolve([]),
    ]);
    const candidates: Candidate[] = [];
    const add = (sense: RelatedSense, reason: RecommendationReason) => {
      if (sense.id !== senseId && sense.lexeme.id !== source.lexeme.id && sense.lexeme.language.code === source.lexeme.language.code) candidates.push({ lexemeId: sense.lexeme.id, senseId: sense.id, lemma: sense.lexeme.canonicalLemma, category: sense.lexeme.lexicalCategory.code, score: scoreOf(sense), reason });
    };
    for (const sense of sameSynset) add(sense, DictionarySenseRecommendationReason.SAME_SYNSET);
    for (const relation of senseRelations) {
      const outgoing = relation.sourceSenseId === senseId;
      const reason = relation.kind === "DERIVED_FROM" ? (outgoing ? DictionarySenseRecommendationReason.DERIVED_FROM : DictionarySenseRecommendationReason.DERIVATIVE) : relation.kind;
      add(outgoing ? relation.targetSense : relation.sourceSense, reason);
    }
    if (source.synsetId) for (const relation of synsetRelations) {
      const outgoing = relation.sourceSynsetId === source.synsetId;
      const oppositeKind: Record<string, RecommendationReason> = { HYPERNYM: DictionarySenseRecommendationReason.HYPONYM, HYPONYM: DictionarySenseRecommendationReason.HYPERNYM, MERONYM: DictionarySenseRecommendationReason.HOLONYM, HOLONYM: DictionarySenseRecommendationReason.MERONYM, RELATED: DictionarySenseRecommendationReason.RELATED };
      const reason = outgoing ? relation.kind : oppositeKind[relation.kind];
      if (!reason) continue;
      for (const sense of (outgoing ? relation.targetSynset.senses : relation.sourceSynset.senses)) add(sense, reason);
    }
    const ranked = rankRecommendationCandidates(candidates).slice(0, limit);
    const lexemes = await this.prisma.dictionaryLexeme.findMany({ where: { id: { in: ranked.map(({ lexemeId }) => lexemeId) } }, include: lexemeInclude });
    const byId = new Map(lexemes.map((lexeme) => [lexeme.id, toLexeme(lexeme)]));
    return ranked.flatMap((candidate) => {
      const targetLexeme = byId.get(candidate.lexemeId);
      const targetSense = targetLexeme?.senses.find(({ id }) => id === candidate.senseId);
      return targetLexeme && targetSense ? [{ targetLexeme, targetSense, reason: candidate.reason }] : [];
    });
  }
}
