import type {
  VocabularyCard,
} from "@/entities/card";
import { isSpecificFillInBlankContext } from "@/entities/card";
import type { FillInBlankQuestion } from "../types/fill-in-blank-question";

export function buildFillInTheBlankQueue(
  cards: VocabularyCard[],
  random: () => number = Math.random,
) {
  const queue: FillInBlankQuestion[] = cards
    .flatMap((card) =>
      card.meanings.map((meaning) => ({ card, meaning })),
    )
    .filter(({ meaning }) =>
      meaning.fillInBlankExamples.some(
        (example) =>
          Boolean(example.ko.trim()) &&
          isSpecificFillInBlankContext(example.en, example.answer),
      ),
    );
  for (let index = queue.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [queue[index], queue[swapIndex]] = [queue[swapIndex], queue[index]];
  }

  return queue;
}
