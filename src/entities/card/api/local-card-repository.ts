import Dexie, { type EntityTable } from "dexie";
import type {
  CardRecord,
  CardRepositorySnapshot,
  CardWriteInput,
  Meaning,
  ReviewEvent,
  ReviewHistoryStats,
  ReviewResult,
  FillInBlankExample,
  VocabularyCard,
} from "../types/card";
import { normalizeAnswer } from "@/shared/utils/normalize-answer";

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

type LegacyMeaning = Omit<Meaning, "fillInBlankExamples"> & {
  fillInBlankExamples?: FillInBlankExample[];
  testExamples?: FillInBlankExample[];
};

function normalizeMeaningRecord(meaning: Meaning | LegacyMeaning): Meaning {
  const { testExamples, ...current } = meaning as LegacyMeaning;
  const synonyms = normalizeRelations(meaning.synonyms);
  const antonyms = normalizeRelations(meaning.antonyms);

  return {
    ...current,
    fillInBlankExamples: current.fillInBlankExamples ?? testExamples ?? [],
    memoryAid: meaning.memoryAid?.trim() || undefined,
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

async function getCard(id: string) {
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

function writeInputToRecords(input: CardWriteInput, previous?: VocabularyCard) {
  const timestamp = new Date().toISOString();
  const cardId = previous?.id ?? input.id ?? crypto.randomUUID();
  const card: CardRecord = {
    id: cardId,
    term: input.term.trim(),
    normalizedTerm: normalizeAnswer(input.term),
    tags: normalizeTags(input.tags ?? previous?.tags),
    createdAt: previous?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  const previousMeanings = new Map(
    previous?.meanings.map((meaning) => [meaning.id, meaning]) ?? [],
  );
  const meanings: Meaning[] = input.meanings
    .filter((meaning) => meaning.definitionKo.trim())
    .map((meaning, position) => {
      const previousMeaning = meaning.id
        ? previousMeanings.get(meaning.id)
        : undefined;
      const fillInBlankExamples = (meaning.fillInBlankExamples ?? [])
        .filter(
          (example) =>
            example.en.trim() && example.ko?.trim() && example.answer?.trim(),
        )
        .map(
          (example): FillInBlankExample => ({
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
        examples: meaning.examples.map((example) => ({
          en: example.en.trim(),
          ko: example.ko?.trim() || undefined,
          type: example.type,
        })),
        fillInBlankExamples,
        memoryAid: previousMeaning?.memoryAid,
        status: previousMeaning?.status ?? "unknown",
      };
    });

  return { card, meanings };
}

export async function saveCard(input: CardWriteInput, overwrite = false) {
  const normalizedTerm = normalizeAnswer(input.term);
  const duplicate = await db.cards
    .where("normalizedTerm")
    .equals(normalizedTerm)
    .first();
  if (duplicate && !overwrite && duplicate.id !== input.id)
    return { duplicate, saved: undefined };
  const previousId = duplicate && overwrite ? duplicate.id : input.id;
  const previous = previousId ? await getCard(previousId) : undefined;
  const { card, meanings } = writeInputToRecords(input, previous);
  await db.transaction("rw", db.cards, db.meanings, async () => {
    await db.cards.put(card);
    await db.meanings.where("cardId").equals(card.id).delete();
    await db.meanings.bulkPut(meanings);
  });

  return { duplicate, saved: { ...card, meanings } };
}

export async function removeCard(cardId: string) {
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

export async function renameTag(currentTag: string, nextTag: string) {
  const normalizedCurrentTag = normalizeTags([currentTag])[0];
  const normalizedNextTag = normalizeTags([nextTag])[0];
  if (
    !normalizedCurrentTag ||
    !normalizedNextTag ||
    normalizedCurrentTag === normalizedNextTag
  )
    return;

  const cards = await db.cards
    .where("tags")
    .equals(normalizedCurrentTag)
    .toArray();
  const timestamp = new Date().toISOString();

  await db.cards.bulkPut(
    cards.map((card) => ({
      ...card,
      tags: normalizeTags(
        card.tags.map((tag) =>
          tag === normalizedCurrentTag ? normalizedNextTag : tag,
        ),
      ),
      updatedAt: timestamp,
    })),
  );
}

export async function persistReviewResult(
  cardId: string,
  meaning: Meaning,
  result: ReviewResult,
) {
  const now = new Date().toISOString();
  const updatedMeaning: Meaning = { ...meaning, status: result };
  await db.transaction("rw", db.meanings, db.reviewEvents, async () => {
    await db.meanings.put(updatedMeaning);
    await db.reviewEvents.add({
      cardId,
      meaningId: meaning.id,
      fromStatus: meaning.status,
      toStatus: result,
      timestamp: now,
    });
  });

  return updatedMeaning;
}

export async function persistMemoryAid(
  meaning: Meaning,
  memoryAid: string,
): Promise<Meaning> {
  const normalizedMemoryAid = memoryAid.trim();
  if (!normalizedMemoryAid) throw new Error("외우는 팁이 비어 있어요.");

  const updatedMeaning: Meaning = {
    ...meaning,
    memoryAid: normalizedMemoryAid,
  };
  await db.meanings.put(updatedMeaning);

  return updatedMeaning;
}

export async function readCardRepositorySnapshot(): Promise<CardRepositorySnapshot> {
  return {
    cards: await db.cards.toArray(),
    meanings: (await db.meanings.toArray()).map(normalizeMeaningRecord),
    reviewEvents: await db.reviewEvents.toArray(),
  };
}

export async function replaceCardRepositorySnapshot(
  snapshot: CardRepositorySnapshot,
) {
  await db.transaction(
    "rw",
    db.cards,
    db.meanings,
    db.reviewEvents,
    async () => {
      await db.cards.clear();
      await db.meanings.clear();
      await db.reviewEvents.clear();
      await db.cards.bulkPut(snapshot.cards);
      await db.meanings.bulkPut(snapshot.meanings.map(normalizeMeaningRecord));
      await db.reviewEvents.bulkPut(snapshot.reviewEvents);
    },
  );
}
