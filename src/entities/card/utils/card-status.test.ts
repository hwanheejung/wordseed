import { describe, expect, it } from "vitest";
import { shouldRecheckMeaning } from "./card-status";

describe("review candidates", () => {
  it("rechecks known meanings with at least three mostly difficult reviews", () => {
    const stats = {
      reviewCount: 3,
      difficultCount: 2,
      lastReviewedAt: "2026-01-01T00:00:00.000Z",
    };

    expect(shouldRecheckMeaning("correct", stats)).toBe(true);
    expect(shouldRecheckMeaning("unknown", stats)).toBe(false);
    expect(
      shouldRecheckMeaning("correct", { ...stats, reviewCount: 2 }),
    ).toBe(false);
    expect(
      shouldRecheckMeaning("correct", { ...stats, difficultCount: 1 }),
    ).toBe(false);
  });
});
