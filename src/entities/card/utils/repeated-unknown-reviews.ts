import type { ReviewEvent } from "../types/card";

export function getRecentlyRepeatedUnknownCardIds(
  reviewEvents: ReviewEvent[],
  since: string,
): string[] {
  const latestRepeatedUnknownByCard = new Map<string, string>();
  reviewEvents.forEach((event) => {
    if (event.toStatus !== "unknown" || event.timestamp < since) return;

    const latestTimestamp = latestRepeatedUnknownByCard.get(event.cardId);
    if (!latestTimestamp || event.timestamp > latestTimestamp) {
      latestRepeatedUnknownByCard.set(event.cardId, event.timestamp);
    }
  });

  return Array.from(latestRepeatedUnknownByCard.entries())
    .sort(
      ([leftCardId, leftTimestamp], [rightCardId, rightTimestamp]) =>
        rightTimestamp.localeCompare(leftTimestamp) ||
        leftCardId.localeCompare(rightCardId),
    )
    .map(([cardId]) => cardId);
}
