import { z } from "zod";

const ExampleSchema = z.object({
  en: z.string(),
  ko: z.string().nullable(),
  type: z.enum(["sentence", "dialogue"]),
  provenance: z.enum(["source", "ai", "user"]),
});

const TestExampleSchema = ExampleSchema.extend({
  answer: z.string().min(1),
});

const MeaningSchema = z.object({
  definitionKo: z.string().min(1),
  definitionEn: z.string().nullable(),
  context: z.string().nullable(),
  partOfSpeech: z.string().nullable(),
  pronunciation: z.string().nullable(),
  provenance: z.enum(["source", "ai", "user"]),
  examples: z.array(ExampleSchema).min(1).max(3),
});

export const CardSchema = z.object({
  term: z.string(),
  acceptedVariants: z.array(z.string()),
  partOfSpeech: z.string().nullable(),
  pronunciation: z.string().nullable(),
  meanings: z.array(MeaningSchema).min(1),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
  testExamples: z.array(TestExampleSchema).min(2).max(4),
  sourceText: z.string().nullable(),
  sourceLabel: z.string().nullable(),
});

export const CardsResponseSchema = z.object({ cards: z.array(CardSchema).min(1).max(20) });
export const CandidateSchema = CardSchema.extend({ confidence: z.number().min(0).max(1) });
export const CandidatesResponseSchema = z.object({ candidates: z.array(CandidateSchema).min(1).max(30) });

function normalizeExample(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("en-US").trim().replace(/\s+/g, " ");
}

export function hasValidTestContexts(card: z.infer<typeof CardSchema>) {
  const genericPattern = /(used? (?:the )?(?:term|word|expression)|meaning of|which (?:term|word|expression)|fits? (?:the|this|a) (?:new )?context|clarify the central idea)/i;
  const studyExamples = new Set(card.meanings.flatMap((meaning) => meaning.examples.map((example) => normalizeExample(example.en))));
  return card.testExamples.length >= 2 && card.testExamples.every((example) => {
    const escapedAnswer = example.answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escapedAnswer, "i").test(example.en)
      && !genericPattern.test(example.en)
      && !studyExamples.has(normalizeExample(example.en));
  });
}

export function stripNulls<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null)) as T;
}

export function toClientCard<T extends z.infer<typeof CardSchema>>(card: T) {
  return {
    ...stripNulls(card),
    meanings: card.meanings.map((meaning) => ({
      ...stripNulls(meaning),
      examples: meaning.examples.map(stripNulls),
    })),
    testExamples: card.testExamples.map(stripNulls),
  };
}
