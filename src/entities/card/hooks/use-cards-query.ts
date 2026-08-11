import { useLiveQuery } from "dexie-react-hooks";
import { getAllCards, normalizeTags } from "../api/local-card-repository";
import type { ReviewResult } from "../types/card";

export interface CardsQueryInput {
  search?: string;
  status?: ReviewResult;
  statuses?: ReviewResult[];
  tags?: string[];
  sort?: "newest" | "oldest";
  ids?: string[];
}

export function useCardsQuery(input: CardsQueryInput = {}) {
  const result = useLiveQuery(async () => {
    const cards = await getAllCards();
    const normalizedSearch = input.search?.trim().toLocaleLowerCase() ?? "";
    const idPositions = new Map(input.ids?.map((id, index) => [id, index]));
    const filtered = cards
      .filter(
        (card) =>
          (!input.ids || idPositions.has(card.id)) &&
          (!input.status ||
            card.meanings.some((meaning) => meaning.status === input.status)) &&
          (!input.statuses?.length ||
            card.meanings.some((meaning) =>
              input.statuses?.includes(meaning.status),
            )) &&
          (!input.tags?.length ||
            input.tags.some((tag) => card.tags.includes(tag))) &&
          (!normalizedSearch ||
            `${card.term} ${card.meanings.map((meaning) => `${meaning.expression} ${meaning.definitionKo}`).join(" ")} ${card.tags.join(" ")}`
              .toLocaleLowerCase()
              .includes(normalizedSearch)),
      )
      .sort((left, right) => {
        if (input.ids?.length)
          return idPositions.get(left.id)! - idPositions.get(right.id)!;

        return input.sort === "oldest"
          ? left.createdAt.localeCompare(right.createdAt)
          : right.createdAt.localeCompare(left.createdAt);
      });

    return {
      cards: filtered,
      totalCount: cards.length,
      availableTags: normalizeTags(cards.flatMap((card) => card.tags)).sort(
        (left, right) => left.localeCompare(right, "ko"),
      ),
    };
  }, [
    input.search,
    input.status,
    input.statuses?.join("\u0000"),
    input.sort,
    input.tags?.join("\u0000"),
    input.ids?.join("\u0000"),
  ]);

  return {
    cards: result?.cards ?? [],
    totalCount: result?.totalCount ?? 0,
    availableTags: result?.availableTags ?? [],
    isLoading: result === undefined,
  };
}
