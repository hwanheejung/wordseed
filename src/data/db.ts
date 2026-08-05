import Dexie, { type EntityTable } from "dexie";
import type { CardDraft, ReviewEvent, ReviewResult, VocabularyCard } from "../domain/types";
import { calculateNextReview } from "../domain/scheduler";
import { normalizeAnswer } from "../domain/scoring";
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
  }
}

export const db = new WordseedDatabase();

export async function ensureSeedData() {
  if ((await db.cards.count()) === 0) await db.cards.bulkAdd(seedCards);
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
    meanings: draft.meanings.filter((meaning) => meaning.definitionKo.trim()),
    synonyms: draft.synonyms.map((item) => item.trim()).filter(Boolean),
    antonyms: draft.antonyms.map((item) => item.trim()).filter(Boolean),
    examples: draft.examples.filter((example) => example.en.trim()),
    sourceText: draft.sourceText,
    sourceLabel: draft.sourceLabel,
    status: previous?.status ?? "unknown",
    stage: previous?.stage ?? 0,
    isNew: previous?.isNew ?? true,
    nextReviewAt: previous?.nextReviewAt ?? timestamp,
    lastReviewedAt: previous?.lastReviewedAt,
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
  const schedule = calculateNextReview(card, result, now);
  const updated: VocabularyCard = {
    ...card,
    status: result,
    stage: schedule.stage,
    isNew: false,
    nextReviewAt: schedule.nextReviewAt,
    lastReviewedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await db.transaction("rw", db.cards, db.reviewEvents, async () => {
    await db.cards.put(updated);
    await db.reviewEvents.add({
      cardId: card.id,
      mode,
      result,
      previousStage: card.stage,
      newStage: schedule.stage,
      timestamp: now.toISOString(),
      ...details,
    });
  });
  return updated;
}

export async function exportDatabase() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    cards: await db.cards.toArray(),
    reviewEvents: await db.reviewEvents.toArray(),
  };
  return JSON.stringify(payload, null, 2);
}

export async function importDatabase(raw: string) {
  const parsed = JSON.parse(raw) as { version?: number; cards?: VocabularyCard[]; reviewEvents?: ReviewEvent[] };
  if (parsed.version !== 1 || !Array.isArray(parsed.cards) || !parsed.cards.every((card) => card.id && card.term)) {
    throw new Error("지원하지 않는 백업 파일이에요.");
  }
  await db.transaction("rw", db.cards, db.reviewEvents, async () => {
    await db.cards.clear();
    await db.reviewEvents.clear();
    await db.cards.bulkPut(parsed.cards ?? []);
    await db.reviewEvents.bulkPut(parsed.reviewEvents ?? []);
  });
}
