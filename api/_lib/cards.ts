import { z } from "zod";

const ExampleSchema = z.object({
  en: z.string(),
  ko: z.string().nullable(),
  type: z.enum(["sentence", "dialogue"]),
  provenance: z.enum(["source", "ai", "user"]),
});

const FillInBlankExampleSchema = ExampleSchema.extend({
  answer: z.string().nullable(),
});

const MeaningSchema = z.object({
  expression: z.string().min(1),
  definitionKo: z.string().min(1),
  definitionEn: z.string().nullable(),
  partOfSpeech: z.string().nullable(),
  pronunciation: z.string().nullable(),
  acceptedVariants: z.array(z.string()),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
  provenance: z.enum(["source", "ai", "user"]),
  examples: z.array(ExampleSchema).min(1).max(3),
  fillInBlankExamples: z.array(FillInBlankExampleSchema).max(2),
});

export const CardSchema = z.object({
  term: z.string(),
  meanings: z.array(MeaningSchema).min(1),
});

export type GeneratedCard = z.infer<typeof CardSchema>;

export const CardsResponseSchema = z.object({ cards: z.array(CardSchema).min(1).max(20) });
const CandidateSchema = CardSchema.extend({ confidence: z.number().min(0).max(1) });
export const CandidatesResponseSchema = z.object({ candidates: z.array(CandidateSchema).min(1).max(30) });

function stripNulls<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null)) as T;
}

export function toClientCard<T extends z.infer<typeof CardSchema>>(card: T) {
  return {
    ...stripNulls(card),
    meanings: card.meanings.map((meaning) => ({
      ...stripNulls(meaning),
      examples: meaning.examples.map(stripNulls),
      fillInBlankExamples: meaning.fillInBlankExamples.map(stripNulls),
    })),
  };
}
