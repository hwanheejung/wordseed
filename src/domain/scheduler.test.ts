import { describe, expect, it } from "vitest";
import { buildFocusQueue, buildStudyQueue, buildTestQueue, moveReviewedCardToBack, startQueueAt, updateFocusQueue } from "./scheduler";
import { seedCards } from "../data/seed";

describe("review scheduling", () => {
  it("keeps every valid card available for a test regardless of review status", () => {
    expect(buildTestQueue(seedCards, () => 0.5)).toHaveLength(seedCards.length);
  });

  it("excludes cards that only have generic fallback prompts", () => {
    const invalid = {
      ...seedCards[0],
      testExamples: [{
        en: "The professor used the term thrall to clarify the central idea.",
        answer: "thrall",
        type: "sentence" as const,
        provenance: "fallback" as const,
      }],
    };
    expect(buildTestQueue([invalid], () => 0.5)).toHaveLength(0);
  });

  it("sorts a study session by unknown, confusing, then known", () => {
    const known = { ...seedCards[0], id: "known", status: "correct" as const };
    const unsure = { ...seedCards[1], id: "unsure", status: "confusing" as const };
    const unknown = { ...seedCards[2], id: "unknown", status: "unknown" as const };
    expect(buildStudyQueue([known, unsure, unknown]).map((card) => card.id)).toEqual(["unknown", "unsure", "known"]);
    expect(buildFocusQueue([known, unsure, unknown]).map((card) => card.id)).toEqual(["unsure", "unknown"]);
  });

  it("preserves list order cyclically and moves a reviewed card to the back", () => {
    const cards = seedCards.map((card, index) => ({ ...card, id: `card-${index}` }));
    const started = startQueueAt(cards, 1);
    expect(started.map((card) => card.id)).toEqual(["card-1", "card-2", "card-0"]);
    expect(moveReviewedCardToBack(started, { ...started[0], status: "correct" }).map((card) => card.id)).toEqual(["card-2", "card-0", "card-1"]);
  });

  it("keeps unknown and confusing cards focused until they become correct", () => {
    const focusCards = buildFocusQueue(seedCards);
    expect(updateFocusQueue(focusCards, { ...focusCards[0], status: "unknown" }).at(-1)?.status).toBe("unknown");
    expect(updateFocusQueue(focusCards, { ...focusCards[0], status: "confusing" }).at(-1)?.status).toBe("confusing");
    expect(updateFocusQueue(focusCards, { ...focusCards[0], status: "correct" })).toHaveLength(focusCards.length - 1);
  });
});
