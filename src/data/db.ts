import Dexie, { type EntityTable } from "dexie";
import type { CardDraft, Example, Meaning, ReviewEvent, ReviewResult, VocabularyCard } from "../domain/types";
import { getTestAnswer, isSpecificTestContext, normalizeAnswer } from "../domain/scoring";
import { seedCards } from "./seed";

class WordseedDatabase extends Dexie {
  cards!: EntityTable<VocabularyCard, "id">;
  reviewEvents!: EntityTable<ReviewEvent, "id">;

  constructor() {
    super("wordseed");
    this.version(1).stores({
      cards: "id, normalizedTerm, nextReviewAt, isNew, status, createdAt",
      reviewEvents: "++id, cardId, mode, timestamp",
    });
    this.version(2).stores({
      cards: "id, normalizedTerm, nextReviewAt, isNew, status, createdAt",
      reviewEvents: "++id, cardId, mode, timestamp",
    }).upgrade(async (transaction) => {
      await transaction.table("cards").toCollection().modify((card) => {
        Object.assign(card, normalizeStoredCard(card as LegacyCard));
        delete (card as LegacyCard).examples;
      });
    });
    this.version(3).stores({
      cards: "id, normalizedTerm, nextReviewAt, isNew, status, createdAt",
      reviewEvents: "++id, cardId, mode, timestamp",
    }).upgrade(async (transaction) => {
      await transaction.table("cards").toCollection().modify((card) => {
        Object.assign(card, normalizeStoredCard(card as LegacyCard));
        delete (card as LegacyCard).examples;
      });
    });
    this.version(4).stores({
      cards: "id, normalizedTerm, nextReviewAt, isNew, status, createdAt",
      reviewEvents: "++id, cardId, mode, timestamp",
    }).upgrade(async (transaction) => {
      await transaction.table("cards").toCollection().modify((card) => {
        Object.assign(card, normalizeStoredCard(card as LegacyCard));
      });
    });
    this.version(5).stores({
      cards: "id, normalizedTerm, status, createdAt",
      reviewEvents: "++id, cardId, mode, timestamp",
    }).upgrade(async (transaction) => {
      await transaction.table("cards").toCollection().modify((card) => {
        Object.assign(card, normalizeStoredCard(card as LegacyCard));
        delete card.stage;
        delete card.isNew;
        delete card.nextReviewAt;
        delete card.lastReviewedAt;
      });
      await transaction.table("reviewEvents").toCollection().modify((event) => {
        delete event.previousStage;
        delete event.newStage;
      });
    });
    this.version(6).stores({
      cards: "id, normalizedTerm, status, createdAt",
      reviewEvents: "++id, cardId, mode, timestamp",
    }).upgrade(async (transaction) => {
      const demoTestExamples = new Map(seedCards.map((card) => [card.id, card.testExamples]));
      await transaction.table("cards").toCollection().modify((card) => {
        const testExamples = demoTestExamples.get(card.id);
        if (testExamples) card.testExamples = testExamples;
      });
    });
    this.version(7).stores({
      cards: "id, normalizedTerm, status, createdAt",
      reviewEvents: "++id, cardId, mode, timestamp",
    }).upgrade(async (transaction) => {
      await transaction.table("cards").toCollection().modify((card) => {
        Object.assign(card, normalizeStoredCard(card as LegacyCard));
      });
    });
    this.version(8).stores({
      cards: "id, normalizedTerm, status, createdAt, *tags",
      reviewEvents: "++id, cardId, mode, timestamp",
    }).upgrade(async (transaction) => {
      await transaction.table("cards").toCollection().modify((card) => {
        card.tags = normalizeTags(card.tags);
      });
    });
    this.version(9).stores({
      cards: "id, normalizedTerm, status, createdAt, *tags",
      reviewEvents: "++id, cardId, mode, timestamp",
    }).upgrade(async (transaction) => {
      await transaction.table("cards").toCollection().modify((card) => {
        Object.assign(card, normalizeStoredCard(card as LegacyCard));
      });
    });
  }
}

export const db = new WordseedDatabase();

export async function ensureSeedData() {
  if ((await db.cards.count()) === 0) await db.cards.bulkAdd(seedCards);
}

type LegacyMeaning = Omit<Meaning, "examples" | "synonyms" | "antonyms"> & { examples?: Example[]; synonyms?: string[]; antonyms?: string[] };
type LegacyCard = Omit<VocabularyCard, "meanings" | "testExamples" | "tags"> & {
  meanings: LegacyMeaning[];
  examples?: Example[];
  synonyms?: string[];
  antonyms?: string[];
  testExamples?: Example[];
  stage?: number;
  isNew?: boolean;
  nextReviewAt?: string;
  lastReviewedAt?: string;
  tags?: string[];
};
type LegacyReviewEvent = ReviewEvent & { previousStage?: number; newStage?: number };

export function createFallbackStudyExample(term: string, partOfSpeech?: string): Example {
  const normalizedPart = partOfSpeech?.toLocaleLowerCase() ?? "";
  const en = normalizedPart.includes("verb")
    ? `The researchers decided to ${term} their original proposal after reviewing the new evidence.`
    : normalizedPart.includes("adjective")
      ? `The report described the result as ${term} after the researchers reviewed the evidence.`
      : normalizedPart.includes("adverb")
        ? `The researchers responded ${term} when the new evidence became available.`
        : `The lecturer explained the meaning of ${term} during the academic discussion.`;
  return { en, type: "sentence", provenance: "fallback" };
}

export function normalizeStoredCard(card: LegacyCard): VocabularyCard {
  const legacyCardExamples = card.examples;
  const cardWithoutLegacyFields = { ...card };
  delete cardWithoutLegacyFields.examples;
  delete cardWithoutLegacyFields.stage;
  delete cardWithoutLegacyFields.isNew;
  delete cardWithoutLegacyFields.nextReviewAt;
  delete cardWithoutLegacyFields.lastReviewedAt;
  delete cardWithoutLegacyFields.synonyms;
  delete cardWithoutLegacyFields.antonyms;
  const legacyExamples = Array.isArray(legacyCardExamples) ? legacyCardExamples : [];
  const meanings = (Array.isArray(card.meanings) ? card.meanings : []).map((meaning, index) => {
    const partOfSpeech = meaning.partOfSpeech ?? card.partOfSpeech;
    const nestedExamples = Array.isArray(meaning.examples) ? meaning.examples.filter((example) => example.en?.trim()) : [];
    const pairedExamples = nestedExamples.length
      ? nestedExamples
      : legacyExamples[index]
        ? [legacyExamples[index]]
        : index === 0 && legacyExamples.length
          ? legacyExamples
          : [createFallbackStudyExample(card.term, partOfSpeech)];
    return {
      ...meaning,
      partOfSpeech,
      pronunciation: meaning.pronunciation ?? card.pronunciation,
      examples: pairedExamples,
      synonyms: normalizeRelationList(meaning.synonyms ?? (index === 0 ? card.synonyms : [])),
      antonyms: normalizeRelationList(meaning.antonyms ?? (index === 0 ? card.antonyms : [])),
    };
  });
  const testExamples = (Array.isArray(card.testExamples) ? card.testExamples : [])
    .map((example) => {
      const answer = getTestAnswer(example, card.term);
      return answer ? { ...example, answer } : undefined;
    })
    .filter((example): example is Example & { answer: string } => Boolean(example && isSpecificTestContext(example.en, example.answer)));
  return {
    ...cardWithoutLegacyFields,
    meanings,
    tags: normalizeTags(card.tags),
    testExamples,
  } as VocabularyCard;
}

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return Array.from(new Set(tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean)));
}

function normalizeRelationList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean)));
}

export function draftToCard(draft: CardDraft, previous?: VocabularyCard): VocabularyCard {
  const timestamp = new Date().toISOString();
  return {
    id: previous?.id ?? draft.id ?? crypto.randomUUID(),
    term: draft.term.trim(),
    normalizedTerm: normalizeAnswer(draft.term),
    acceptedVariants: Array.from(new Set([draft.term, ...(draft.acceptedVariants ?? [])].map(normalizeAnswer).filter(Boolean))),
    partOfSpeech: draft.partOfSpeech?.trim(),
    pronunciation: draft.pronunciation?.trim(),
    meanings: draft.meanings
      .filter((meaning) => meaning.definitionKo.trim())
      .map((meaning) => ({
        ...meaning,
        partOfSpeech: meaning.partOfSpeech?.trim() || draft.partOfSpeech?.trim(),
        pronunciation: meaning.pronunciation?.trim() || draft.pronunciation?.trim(),
        examples: meaning.examples.filter((example) => example.en.trim()),
        synonyms: normalizeRelationList(meaning.synonyms),
        antonyms: normalizeRelationList(meaning.antonyms),
      })),
    tags: normalizeTags(draft.tags ?? previous?.tags),
    testExamples: draft.testExamples.filter((example) => example.en.trim()),
    sourceText: draft.sourceText,
    sourceLabel: draft.sourceLabel,
    status: previous?.status ?? "unknown",
    createdAt: previous?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

export async function saveDraft(draft: CardDraft, overwrite = false) {
  const normalizedTerm = normalizeAnswer(draft.term);
  const duplicate = await db.cards.where("normalizedTerm").equals(normalizedTerm).first();
  if (duplicate && !overwrite && duplicate.id !== draft.id) return { duplicate, saved: undefined };
  const previous = duplicate && overwrite ? duplicate : draft.id ? await db.cards.get(draft.id) : undefined;
  const saved = draftToCard(draft, previous);
  await db.cards.put(saved);
  return { duplicate, saved };
}

export async function recordReview(
  card: VocabularyCard,
  mode: "study" | "test",
  result: ReviewResult,
  details?: Pick<ReviewEvent, "prompt" | "submittedAnswer">,
) {
  const now = new Date();
  const updated: VocabularyCard = {
    ...card,
    status: result,
    updatedAt: now.toISOString(),
  };
  await db.transaction("rw", db.cards, db.reviewEvents, async () => {
    await db.cards.put(updated);
    await db.reviewEvents.add({
      cardId: card.id,
      mode,
      result,
      timestamp: now.toISOString(),
      ...details,
    });
  });
  return updated;
}

export async function exportDatabase() {
  const payload = {
    version: 9,
    exportedAt: new Date().toISOString(),
    cards: await db.cards.toArray(),
    reviewEvents: await db.reviewEvents.toArray(),
  };
  return JSON.stringify(payload, null, 2);
}

export async function importDatabase(raw: string) {
  const parsed = JSON.parse(raw) as { version?: number; cards?: LegacyCard[]; reviewEvents?: LegacyReviewEvent[] };
  if (![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(parsed.version ?? 0) || !Array.isArray(parsed.cards) || !parsed.cards.every((card) => card.id && card.term)) {
    throw new Error("지원하지 않는 백업 파일이에요.");
  }
  const importedCards = parsed.cards;
  await db.transaction("rw", db.cards, db.reviewEvents, async () => {
    await db.cards.clear();
    await db.reviewEvents.clear();
    await db.cards.bulkPut(importedCards.map(normalizeStoredCard));
    await db.reviewEvents.bulkPut((parsed.reviewEvents ?? []).map((event) => {
      const normalized = { ...event };
      delete normalized.previousStage;
      delete normalized.newStage;
      return normalized;
    }));
  });
}
