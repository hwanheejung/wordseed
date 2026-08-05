import { describe, expect, it } from "vitest";
import { buildReviewQueue, calculateNextReview } from "./scheduler";
import { seedCards } from "../data/seed";

describe("review scheduling", () => {
  const now = new Date("2026-08-05T00:00:00.000Z");

  it("resets unknown cards for five minutes", () => {
    expect(calculateNextReview({ stage: 4 }, "unknown", now)).toEqual({ stage: 0, nextReviewAt: "2026-08-05T00:05:00.000Z" });
  });

  it("holds confusing cards for twelve hours", () => {
    expect(calculateNextReview({ stage: 3 }, "confusing", now)).toEqual({ stage: 3, nextReviewAt: "2026-08-05T12:00:00.000Z" });
  });

  it("advances correct cards through the intensive ladder", () => {
    expect(calculateNextReview({ stage: 0 }, "correct", now)).toEqual({ stage: 1, nextReviewAt: "2026-08-06T00:00:00.000Z" });
    expect(calculateNextReview({ stage: 6 }, "correct", now)).toEqual({ stage: 6, nextReviewAt: "2026-09-04T00:00:00.000Z" });
  });

  it("orders due cards before at most ten new cards", () => {
    const cards = Array.from({ length: 14 }, (_, index) => ({ ...seedCards[0], id: `new-${index}`, isNew: true, createdAt: new Date(index * 1000).toISOString() }));
    const due = { ...seedCards[2], id: "due", isNew: false, nextReviewAt: "2026-08-04T00:00:00.000Z" };
    const queue = buildReviewQueue([...cards, due], now);
    expect(queue[0].id).toBe("due");
    expect(queue).toHaveLength(11);
  });
});
