import { useLiveQuery } from "dexie-react-hooks";
import { getRecentlyRepeatedUnknownCardIds } from "../api/local-card-repository";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;

export function useRecentlyRepeatedUnknownCardIds(days: number): string[] {
  return useLiveQuery(
    () =>
      getRecentlyRepeatedUnknownCardIds(
        new Date(Date.now() - days * MILLISECONDS_PER_DAY).toISOString(),
      ),
    [days],
    [],
  );
}
