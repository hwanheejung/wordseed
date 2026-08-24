import { useLiveQuery } from "dexie-react-hooks";
import { getReviewHistoryStats } from "../api/local-card-repository";
import type { ReviewHistoryStats } from "../types/card";

export function useReviewStatsQuery() {
  return useLiveQuery<
    Record<string, ReviewHistoryStats>,
    Record<string, ReviewHistoryStats>
  >(getReviewHistoryStats, [], {});
}
