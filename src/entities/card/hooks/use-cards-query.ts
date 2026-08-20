import { useLiveQuery } from "dexie-react-hooks";
import {
  getAllCards,
  getReviewHistoryStats,
  normalizeTags,
} from "../api/local-card-repository";
import {
  queryCards,
  type CardsQueryInput,
} from "../utils/card-collection-query";

export type { CardsQueryInput } from "../utils/card-collection-query";

export function useCardsQuery(input: CardsQueryInput = {}) {
  const result = useLiveQuery(async () => {
    const [cards, reviewStats] = await Promise.all([
      getAllCards(),
      getReviewHistoryStats(),
    ]);

    return {
      cards: queryCards(cards, reviewStats, input),
      totalCount: cards.length,
      availableTags: normalizeTags(cards.flatMap((card) => card.tags)).sort(
        (left, right) => left.localeCompare(right, "ko"),
      ),
    };
  }, [
    input.search,
    input.statuses?.join("\u0000"),
    input.reviewPeriod,
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
