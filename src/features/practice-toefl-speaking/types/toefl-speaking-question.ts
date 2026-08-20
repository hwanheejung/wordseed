import { z } from "zod";
import { TOEFL_SPEAKING_DOMAINS } from "../constants/toefl-speaking-domains";

export const toeflSpeakingQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
});

export const toeflSpeakingQuestionSetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(TOEFL_SPEAKING_DOMAINS),
  scenario: z.string().min(1),
  questions: z.array(toeflSpeakingQuestionSchema).length(4),
});

export const toeflSpeakingQuestionSetsSchema = z
  .array(toeflSpeakingQuestionSetSchema)
  .min(1);

export type ToeflSpeakingQuestionSet = z.infer<
  typeof toeflSpeakingQuestionSetSchema
>;
