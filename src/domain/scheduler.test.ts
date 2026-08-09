import { describe, expect, it } from "vitest";
import { seedCards } from "../data/seed";
import {
  buildFocusQueue,
  buildStudyQueue,
  buildTestQueue,
  moveReviewedCardToBack,
  startQueueAt,
  updateFocusQueue,
} from "./scheduler";

describe("meaning-level review scheduling", () => {
  it("keeps every meaning with a valid test context available", () => {
    expect(buildTestQueue(seedCards, () => 0.5)).toHaveLength(8);
  });

  it("excludes meanings that only have generic fallback prompts", () => {
    const card = seedCards[0];
    const invalid = {
      ...card,
      meanings: [
        {
          ...card.meanings[0],
          testExamples: [
            {
              en: "The professor used the term thrall to clarify the central idea.",
              answer: "thrall",
              type: "sentence" as const,
            },
          ],
        },
      ],
    };
    expect(buildTestQueue([invalid], () => 0.5)).toHaveLength(0);
  });

  it("sorts meanings by unknown, confusing, then known", () => {
    const cards = seedCards.slice(1, 4).map((card, index) => ({
      ...card,
      meanings: [
        {
          ...card.meanings[0],
          status: (["correct", "confusing", "unknown"] as const)[index],
        },
      ],
    }));
    expect(
      buildStudyQueue(cards).map(({ meaning }) => meaning.status),
    ).toEqual(["unknown", "confusing", "correct"]);
    expect(
      buildFocusQueue(cards).map(({ meaning }) => meaning.status),
    ).toEqual(["confusing", "unknown"]);
  });

  it("keeps meanings from the same card adjacent and in position order", () => {
    const queue = buildStudyQueue([seedCards[0], seedCards[1]]);
    expect(queue.slice(0, 3).map(({ card }) => card.id)).toEqual([
      "seed-account",
      "seed-account",
      "seed-account",
    ]);
    expect(queue.slice(0, 3).map(({ meaning }) => meaning.position)).toEqual([
      0, 1, 2,
    ]);
  });

  it("preserves order cyclically and moves a reviewed meaning to the back", () => {
    const items = buildStudyQueue(seedCards);
    const started = startQueueAt(items, 1);
    expect(started[0].meaning.id).toBe(items[1].meaning.id);
    expect(started.at(-1)?.meaning.id).toBe(items[0].meaning.id);
    expect(
      moveReviewedCardToBack(started, started[0]).map(
        ({ meaning }) => meaning.id,
      ),
    ).toEqual([
      ...started.slice(1).map(({ meaning }) => meaning.id),
      started[0].meaning.id,
    ]);
  });

  it("keeps difficult meanings focused until they become correct", () => {
    const focusItems = buildFocusQueue(seedCards);
    const current = focusItems[0];
    expect(
      updateFocusQueue(focusItems, {
        ...current,
        meaning: { ...current.meaning, status: "unknown" },
      }).at(-1)?.meaning.status,
    ).toBe("unknown");
    expect(
      updateFocusQueue(focusItems, {
        ...current,
        meaning: { ...current.meaning, status: "confusing" },
      }).at(-1)?.meaning.status,
    ).toBe("confusing");
    expect(
      updateFocusQueue(focusItems, {
        ...current,
        meaning: { ...current.meaning, status: "correct" },
      }),
    ).toHaveLength(focusItems.length - 1);
  });
});
