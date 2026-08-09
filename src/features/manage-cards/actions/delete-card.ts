import { removeCard } from "@/entities/card";

export async function deleteVocabularyCard(cardId: string): Promise<void> {
  await removeCard(cardId);
}
