import { persistReviewResult, type ReviewResult } from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";

export async function submitStudyReview(
  item: StudyQueueItem,
  result: ReviewResult,
): Promise<StudyQueueItem> {
  return {
    ...item,
    meaning: await persistReviewResult(item.card.id, item.meaning, result),
  };
}
