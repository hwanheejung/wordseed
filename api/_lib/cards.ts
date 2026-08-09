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
  partOfSpeech: z.string().nullable(),
  pronunciation: z.string().nullable(),
  acceptedVariants: z.array(z.string()),
  provenance: z.enum(["source", "ai", "user"]),
  examples: z.array(ExampleSchema).min(1).max(3),
  testExamples: z.array(TestExampleSchema).min(2).max(4),
});

export const CardSchema = z.object({
  term: z.string(),
  meanings: z.array(MeaningSchema).min(1),
});

export const CardsResponseSchema = z.object({ cards: z.array(CardSchema).min(1).max(20) });
export const CandidateSchema = CardSchema.extend({ confidence: z.number().min(0).max(1) });
export const CandidatesResponseSchema = z.object({ candidates: z.array(CandidateSchema).min(1).max(30) });

export function hasValidTestContexts(card: z.infer<typeof CardSchema>) {
  const genericPattern = /(used? (?:the )?(?:term|word|expression)|meaning of|which (?:term|word|expression)|fits? (?:the|this|a) (?:new )?context|clarify the central idea)/i;
  return card.meanings.every(
    (meaning) =>
      meaning.testExamples.length >= 2 &&
      meaning.testExamples.every((example) => {
        const escapedAnswer = example.answer.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        return (
          new RegExp(escapedAnswer, "i").test(example.en) &&
          !genericPattern.test(example.en)
        );
      }),
  );
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
      testExamples: meaning.testExamples.map(stripNulls),
    })),
  };
}
