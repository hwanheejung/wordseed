import { describe, expect, it } from "vitest";
import type { ReviewEvent } from "../types/card";
import { getRecentlyRepeatedUnknownCardIds } from "./repeated-unknown-reviews";

const since = "2026-08-17T00:00:00.000Z";

function reviewEvent(
  cardId: string,
  meaningId: string,
  toStatus: ReviewEvent["toStatus"],
  timestamp: string,
): ReviewEvent {
  return {
    cardId,
    meaningId,
    fromStatus: "unknown",
    toStatus,
    timestamp,
  };
}

describe("recently repeated unknown reviews", () => {
  it("includes the first explicit unknown review after the implicit default state", () => {
    expect(
      getRecentlyRepeatedUnknownCardIds(
        [reviewEvent("card-1", "meaning-1", "unknown", "2026-08-19T00:00:00.000Z")],
        since,
      ),
    ).toEqual(["card-1"]);
  });

  it("includes a card when a later review was unknown within the window", () => {
    expect(
      getRecentlyRepeatedUnknownCardIds(
        [
          reviewEvent("card-1", "meaning-1", "correct", "2026-08-16T00:00:00.000Z"),
          reviewEvent("card-1", "meaning-1", "unknown", "2026-08-19T00:00:00.000Z"),
        ],
        since,
      ),
    ).toEqual(["card-1"]);
  });

  it("excludes explicit unknown reviews before the window", () => {
    expect(
      getRecentlyRepeatedUnknownCardIds(
        [
          reviewEvent("too-old", "meaning-2", "correct", "2026-08-10T00:00:00.000Z"),
          reviewEvent("too-old", "meaning-2", "unknown", "2026-08-16T23:59:59.999Z"),
        ],
        since,
      ),
    ).toEqual([]);
  });

  it("deduplicates cards and orders them by their latest qualifying review", () => {
    expect(
      getRecentlyRepeatedUnknownCardIds(
        [
          reviewEvent("older", "older-meaning", "correct", "2026-08-15T00:00:00.000Z"),
          reviewEvent("newer", "newer-meaning", "confusing", "2026-08-15T00:00:00.000Z"),
          reviewEvent("newer", "newer-meaning", "unknown", "2026-08-20T00:00:00.000Z"),
          reviewEvent("older", "older-meaning", "unknown", "2026-08-18T00:00:00.000Z"),
          reviewEvent("newer", "newer-meaning-2", "correct", "2026-08-16T00:00:00.000Z"),
          reviewEvent("newer", "newer-meaning-2", "unknown", "2026-08-19T00:00:00.000Z"),
        ],
        since,
      ),
    ).toEqual(["newer", "older"]);
  });
});
