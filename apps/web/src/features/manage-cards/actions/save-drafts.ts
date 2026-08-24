import { saveCard } from "@/entities/card";
import { draftToCardWriteInput } from "../helpers/card-draft-mappers";
import type { CardDraft } from "../types/card-draft";

export async function saveDrafts(
  drafts: CardDraft[],
  confirmOverwrite: (term: string) => boolean | Promise<boolean>,
) {
  const savedCards = [];

  for (const item of drafts) {
    const input = draftToCardWriteInput(item);
    const result = await saveCard(input);
    if (result.duplicate && !result.saved) {
      if (await confirmOverwrite(item.term)) {
        const overwriteResult = await saveCard(input, true);
        if (overwriteResult.saved) savedCards.push(overwriteResult.saved);
      }
    } else if (result.saved) {
      savedCards.push(result.saved);
    }
  }

  return savedCards;
}
