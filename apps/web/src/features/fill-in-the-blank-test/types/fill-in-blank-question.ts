import type { Meaning, VocabularyCard } from "@/entities/card";

export interface FillInBlankQuestion {
  card: VocabularyCard;
  meaning: Meaning;
}
