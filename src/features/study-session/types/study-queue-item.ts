import type { Meaning, VocabularyCard } from "@/entities/card";

export interface StudyQueueItem {
  card: VocabularyCard;
  meaning: Meaning;
}
