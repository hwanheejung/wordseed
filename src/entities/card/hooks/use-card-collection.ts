import { useLiveQuery } from "dexie-react-hooks";
import {
  getAllCards,
  getReviewHistoryStats,
} from "../api/local-card-repository";
import type { ReviewHistoryStats, VocabularyCard } from "../types/card";

export function useCardCollection() {
  const cards = useLiveQuery<VocabularyCard[]>(getAllCards, []);
  const reviewStats = useLiveQuery<
    Record<string, ReviewHistoryStats>,
    Record<string, ReviewHistoryStats>
  >(
    getReviewHistoryStats,
    [],
    {},
  );

  return {
    cards: cards ?? [],
    isLoading: cards === undefined,
    reviewStats,
  };
}
