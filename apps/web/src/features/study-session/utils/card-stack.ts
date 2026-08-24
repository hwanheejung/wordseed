import type { StudyQueueItem } from "../types/study-queue-item";

export function getRemainingCardLayerCount(item: StudyQueueItem) {
  const currentMeaningIndex = item.card.meanings.findIndex(
    (meaning) => meaning.id === item.meaning.id,
  );

  return currentMeaningIndex === -1
    ? 1
    : item.card.meanings.length - currentMeaningIndex;
}
