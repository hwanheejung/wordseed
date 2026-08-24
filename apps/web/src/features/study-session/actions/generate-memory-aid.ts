import { persistMemoryAid, type Meaning } from "@/entities/card";
import { requestMemoryAid } from "../api/memory-aid-api";
import type { StudyQueueItem } from "../types/study-queue-item";

export async function generateMemoryAid(
  item: StudyQueueItem,
): Promise<Meaning> {
  if (item.meaning.memoryAid) return item.meaning;

  const memoryAid = await requestMemoryAid({
    term: item.card.term,
    meaning: {
      expression: item.meaning.expression,
      definitionKo: item.meaning.definitionKo,
      definitionEn: item.meaning.definitionEn,
      partOfSpeech: item.meaning.partOfSpeech,
      synonyms: item.meaning.synonyms,
      antonyms: item.meaning.antonyms,
      examples: item.meaning.examples.map(({ en, ko }) => ({ en, ko })),
    },
  });

  return persistMemoryAid(item.meaning, memoryAid);
}
