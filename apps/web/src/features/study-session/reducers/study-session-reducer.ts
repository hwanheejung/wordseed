import type { Meaning, VocabularyCard } from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";
import {
  navigateStudySession,
  removeCardFromStudySession,
  replaceCardInStudySession,
  saveMemoryAidInStudySession,
  reviewStudySession,
  type StudySessionState,
} from "../utils/study-session-navigation";

export type StudySessionAction =
  | { type: "navigated"; direction: "next" | "previous" }
  | {
      type: "reviewRecorded";
      item: StudyQueueItem;
      removeCorrectFromQueue: boolean;
    }
  | { type: "cardReplaced"; card: VocabularyCard }
  | { type: "memoryAidSaved"; meaning: Meaning }
  | { type: "cardRemoved"; cardId: string };

export function studySessionReducer(
  state: StudySessionState,
  action: StudySessionAction,
) {
  switch (action.type) {
    case "navigated":
      return navigateStudySession(state, action.direction);
    case "reviewRecorded":
      return reviewStudySession(
        state,
        action.item,
        action.removeCorrectFromQueue,
      );
    case "cardReplaced":
      return replaceCardInStudySession(state, action.card);
    case "memoryAidSaved":
      return saveMemoryAidInStudySession(state, action.meaning);
    case "cardRemoved":
      return removeCardFromStudySession(state, action.cardId);
  }
}
