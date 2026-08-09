import { z } from "zod";
import {
  readCardRepositorySnapshot,
  replaceCardRepositorySnapshot,
  type CardRepositorySnapshot,
} from "@/entities/card";

const BACKUP_VERSION = 1;

const reviewResultSchema = z.enum(["unknown", "confusing", "correct"]);
const exampleSchema = z.object({
  en: z.string(),
  ko: z.string().optional(),
  type: z.enum(["sentence", "dialogue"]),
});
const fillInBlankExampleSchema = exampleSchema.extend({
  ko: z.string(),
  answer: z.string(),
});
const cardRecordSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  normalizedTerm: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const meaningSchema = z
  .object({
    id: z.string().min(1),
    cardId: z.string().min(1),
    position: z.number().int().nonnegative(),
    expression: z.string().min(1),
    definitionKo: z.string().min(1),
    definitionEn: z.string().optional(),
    searchTokens: z.array(z.string()),
    partOfSpeech: z.string().optional(),
    pronunciation: z.string().optional(),
    acceptedVariants: z.array(z.string()),
    synonyms: z.array(z.string()),
    antonyms: z.array(z.string()),
    examples: z.array(exampleSchema),
    fillInBlankExamples: z.array(fillInBlankExampleSchema).optional(),
    testExamples: z.array(fillInBlankExampleSchema).optional(),
    status: reviewResultSchema,
  })
  .transform(({ testExamples, ...meaning }) => ({
    ...meaning,
    fillInBlankExamples: meaning.fillInBlankExamples ?? testExamples ?? [],
  }));
const reviewEventSchema = z.object({
  id: z.number().int().positive().optional(),
  cardId: z.string().min(1),
  meaningId: z.string().min(1),
  fromStatus: reviewResultSchema,
  toStatus: reviewResultSchema,
  timestamp: z.string().min(1),
});
const libraryBackupSchema = z.object({
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.string().optional(),
  cards: z.array(cardRecordSchema),
  meanings: z.array(meaningSchema),
  reviewEvents: z.array(reviewEventSchema),
});

export async function createLibraryBackup(): Promise<string> {
  return JSON.stringify(
    {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      ...(await readCardRepositorySnapshot()),
    },
    null,
    2,
  );
}

export async function restoreLibraryBackup(raw: string): Promise<void> {
  try {
    const { cards, meanings, reviewEvents } = libraryBackupSchema.parse(
      JSON.parse(raw) as unknown,
    );
    const snapshot = {
      cards,
      meanings,
      reviewEvents,
    } satisfies CardRepositorySnapshot;

    await replaceCardRepositorySnapshot(snapshot);
  } catch (error) {
    throw new Error("지원하지 않는 백업 파일이에요.", { cause: error });
  }
}
