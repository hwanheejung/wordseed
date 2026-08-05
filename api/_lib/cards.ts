import { z } from "zod";

const MeaningSchema = z.object({
  definitionKo: z.string(),
  definitionEn: z.string().nullable(),
  context: z.string().nullable(),
  provenance: z.enum(["source", "ai", "user"]),
});

const ExampleSchema = z.object({
  en: z.string(),
  ko: z.string().nullable(),
  type: z.enum(["sentence", "dialogue"]),
  provenance: z.enum(["source", "ai", "user"]),
});

export const CardSchema = z.object({
  term: z.string(),
  acceptedVariants: z.array(z.string()),
  partOfSpeech: z.string().nullable(),
  pronunciation: z.string().nullable(),
  meanings: z.array(MeaningSchema),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
  examples: z.array(ExampleSchema),
  sourceText: z.string().nullable(),
  sourceLabel: z.string().nullable(),
});

export const CardsResponseSchema = z.object({ cards: z.array(CardSchema).min(1).max(20) });
export const CandidateSchema = CardSchema.extend({ confidence: z.number().min(0).max(1) });
export const CandidatesResponseSchema = z.object({ candidates: z.array(CandidateSchema).min(1).max(30) });

export function stripNulls<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null)) as T;
}

export function toClientCard<T extends z.infer<typeof CardSchema>>(card: T) {
  return {
    ...stripNulls(card),
    meanings: card.meanings.map(stripNulls),
    examples: card.examples.map(stripNulls),
  };
}
