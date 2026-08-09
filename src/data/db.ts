import Dexie, { type EntityTable } from "dexie";
import type {
  CardDraft,
  CardRecord,
  Meaning,
  ReviewEvent,
  ReviewHistoryStats,
  ReviewResult,
  StudyItem,
  TestExample,
  VocabularyCard,
} from "../domain/types";
import { normalizeAnswer } from "../domain/scoring";

const DATABASE_VERSION = 1;
const DATABASE_NAME = "wordseed-v2";

class WordseedDatabase extends Dexie {
  cards!: EntityTable<CardRecord, "id">;
  meanings!: EntityTable<Meaning, "id">;
  reviewEvents!: EntityTable<ReviewEvent, "id">;

  constructor() {
    super(DATABASE_NAME);
    this.version(DATABASE_VERSION).stores({
      cards: "id, &normalizedTerm, *tags, createdAt",
      meanings:
        "id, cardId, [cardId+position], status, partOfSpeech, *searchTokens",
      reviewEvents:
        "++id, cardId, meaningId, fromStatus, toStatus, timestamp, [meaningId+timestamp], [fromStatus+toStatus+timestamp]",
    });
  }
}

export const db = new WordseedDatabase();

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return Array.from(
    new Set(
      tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter(Boolean),
    ),
  );
}

export function createSearchTokens(...values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => value?.split(/[\s,;/·]+/) ?? [])
        .map((value) => value.normalize("NFKC").trim().toLocaleLowerCase())
        .filter(Boolean),
    ),
  );
}

function normalizeRelations(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeMeaningRecord(meaning: Meaning): Meaning {
  const synonyms = normalizeRelations(meaning.synonyms);
  const antonyms = normalizeRelations(meaning.antonyms);
  return {
    ...meaning,
    synonyms,
    antonyms,
    searchTokens: createSearchTokens(
      meaning.expression,
      meaning.definitionKo,
      meaning.definitionEn,
      ...synonyms,
      ...antonyms,
    ),
  };
}

export async function getAllCards(): Promise<VocabularyCard[]> {
  const [cards, meanings] = await Promise.all([
    db.cards.toArray(),
    db.meanings.orderBy("[cardId+position]").toArray(),
  ]);
  const meaningsByCard = new Map<string, Meaning[]>();
  for (const storedMeaning of meanings) {
    const meaning = normalizeMeaningRecord(storedMeaning);
    const group = meaningsByCard.get(meaning.cardId) ?? [];
    group.push(meaning);
    meaningsByCard.set(meaning.cardId, group);
  }
  return cards.map((card) => ({
    ...card,
    meanings: meaningsByCard.get(card.id) ?? [],
  }));
}

export async function getCard(id: string) {
  const card = await db.cards.get(id);
  if (!card) return undefined;
  const meanings = await db.meanings
    .where("cardId")
    .equals(id)
    .sortBy("position");
  return { ...card, meanings: meanings.map(normalizeMeaningRecord) };
}

export async function getReviewHistoryStats() {
  const events = await db.reviewEvents
    .orderBy("[meaningId+timestamp]")
    .toArray();
  const stats: Record<string, ReviewHistoryStats> = {};
  for (const event of events) {
    const current = stats[event.meaningId] ?? {
      reviewCount: 0,
      difficultCount: 0,
      lastReviewedAt: event.timestamp,
    };
    current.reviewCount += 1;
    if (event.toStatus === "unknown" || event.toStatus === "confusing")
      current.difficultCount += 1;
    current.lastReviewedAt = event.timestamp;
    stats[event.meaningId] = current;
  }
  return stats;
}

function draftToRecords(draft: CardDraft, previous?: VocabularyCard) {
  const timestamp = new Date().toISOString();
  const cardId = previous?.id ?? draft.id ?? crypto.randomUUID();
  const card: CardRecord = {
    id: cardId,
    term: draft.term.trim(),
    normalizedTerm: normalizeAnswer(draft.term),
    tags: normalizeTags(draft.tags ?? previous?.tags),
    createdAt: previous?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  const previousMeanings = new Map(
    previous?.meanings.map((meaning) => [meaning.id, meaning]) ?? [],
  );
  const meanings: Meaning[] = draft.meanings
    .filter((meaning) => meaning.definitionKo.trim())
    .map((meaning, position) => {
      const previousMeaning = meaning.id
        ? previousMeanings.get(meaning.id)
        : undefined;
      const testExamples = (meaning.testExamples ?? [])
        .filter(
          (example) =>
            example.en.trim() && example.ko?.trim() && example.answer?.trim(),
        )
        .map(
          (example): TestExample => ({
            en: example.en.trim(),
            ko: example.ko!.trim(),
            answer: example.answer!.trim(),
            type: example.type,
          }),
        );
      return {
        id: previousMeaning?.id ?? meaning.id ?? crypto.randomUUID(),
        cardId,
        position,
        expression: meaning.expression.trim(),
        definitionKo: meaning.definitionKo.trim(),
        definitionEn: meaning.definitionEn?.trim() || undefined,
        searchTokens: createSearchTokens(
          meaning.expression,
          meaning.definitionKo,
          meaning.definitionEn,
          ...(meaning.synonyms ?? []),
          ...(meaning.antonyms ?? []),
        ),
        partOfSpeech: meaning.partOfSpeech?.trim() || undefined,
        pronunciation: meaning.pronunciation?.trim() || undefined,
        acceptedVariants: Array.from(
          new Set(
            [meaning.expression, ...(meaning.acceptedVariants ?? [])]
              .map(normalizeAnswer)
              .filter(Boolean),
          ),
        ),
        synonyms: normalizeRelations(meaning.synonyms),
        antonyms: normalizeRelations(meaning.antonyms),
        examples: meaning.examples
          .filter((example) => example.en.trim())
          .map((example) => ({
            en: example.en.trim(),
            ko: example.ko?.trim() || undefined,
            type: example.type,
          })),
        testExamples,
        status: previousMeaning?.status ?? "unknown",
      };
    });
  return { card, meanings };
}

export async function saveDraft(draft: CardDraft, overwrite = false) {
  const normalizedTerm = normalizeAnswer(draft.term);
  const duplicate = await db.cards
    .where("normalizedTerm")
    .equals(normalizedTerm)
    .first();
  if (duplicate && !overwrite && duplicate.id !== draft.id)
    return { duplicate, saved: undefined };
  const previousId = duplicate && overwrite ? duplicate.id : draft.id;
  const previous = previousId ? await getCard(previousId) : undefined;
  const { card, meanings } = draftToRecords(draft, previous);
  await db.transaction("rw", db.cards, db.meanings, async () => {
    await db.cards.put(card);
    await db.meanings.where("cardId").equals(card.id).delete();
    await db.meanings.bulkPut(meanings);
  });
  return { duplicate, saved: { ...card, meanings } };
}

export async function deleteCard(cardId: string) {
  await db.transaction(
    "rw",
    db.cards,
    db.meanings,
    db.reviewEvents,
    async () => {
      await db.cards.delete(cardId);
      await db.meanings.where("cardId").equals(cardId).delete();
      await db.reviewEvents.where("cardId").equals(cardId).delete();
    },
  );
}

export async function recordReview(
  item: StudyItem,
  result: ReviewResult,
) {
  const now = new Date().toISOString();
  const updatedMeaning: Meaning = { ...item.meaning, status: result };
  await db.transaction("rw", db.meanings, db.reviewEvents, async () => {
    await db.meanings.put(updatedMeaning);
    await db.reviewEvents.add({
      cardId: item.card.id,
      meaningId: item.meaning.id,
      fromStatus: item.meaning.status,
      toStatus: result,
      timestamp: now,
    });
  });
  return { ...item, meaning: updatedMeaning };
}

export async function exportDatabase() {
  return JSON.stringify(
    {
      version: DATABASE_VERSION,
      exportedAt: new Date().toISOString(),
      cards: await db.cards.toArray(),
      meanings: (await db.meanings.toArray()).map(normalizeMeaningRecord),
      reviewEvents: await db.reviewEvents.toArray(),
    },
    null,
    2,
  );
}

export async function importDatabase(raw: string) {
  const parsed = JSON.parse(raw) as {
    version?: number;
    cards?: CardRecord[];
    meanings?: Meaning[];
    reviewEvents?: ReviewEvent[];
  };
  if (
    parsed.version !== DATABASE_VERSION ||
    !Array.isArray(parsed.cards) ||
    !Array.isArray(parsed.meanings) ||
    !Array.isArray(parsed.reviewEvents) ||
    !parsed.cards.every((card) => card.id && card.term) ||
    !parsed.meanings.every(
      (meaning) =>
        meaning.id &&
        meaning.cardId &&
        meaning.expression &&
        meaning.definitionKo,
    ) ||
    !parsed.reviewEvents.every(
      (event) =>
        event.meaningId &&
        event.cardId &&
        ["unknown", "confusing", "correct"].includes(event.fromStatus) &&
        ["unknown", "confusing", "correct"].includes(event.toStatus) &&
        event.timestamp,
    )
  ) {
    throw new Error("지원하지 않는 백업 파일이에요.");
  }
  const cards = parsed.cards;
  const meanings = parsed.meanings.map(normalizeMeaningRecord);
  await db.transaction(
    "rw",
    db.cards,
    db.meanings,
    db.reviewEvents,
    async () => {
      await db.cards.clear();
      await db.meanings.clear();
      await db.reviewEvents.clear();
      await db.cards.bulkPut(cards);
      await db.meanings.bulkPut(meanings);
      await db.reviewEvents.bulkPut(parsed.reviewEvents ?? []);
    },
  );
}
