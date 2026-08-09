import { persistReviewResult, type ReviewResult } from "@/entities/card";
import type { FillInBlankQuestion } from "../types/fill-in-blank-question";

export async function submitFillInBlankAnswer(
  question: FillInBlankQuestion,
  result: ReviewResult,
): Promise<FillInBlankQuestion> {
  return {
    ...question,
    meaning: await persistReviewResult(
      question.card.id,
      question.meaning,
      result,
    ),
  };
}
