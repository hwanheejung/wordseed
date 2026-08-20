import { describe, expect, it } from "vitest";
import type {
  ReviewResult,
  VocabularyCard,
} from "@/entities/card";
import {
  buildFocusQueue,
  buildStudyQueue,
  moveReviewedCardToBack,
  startQueueAt,
  updateFocusQueue,
} from "./scheduler";

const timestamp = "2026-01-01T00:00:00.000Z";

function makeCard(
  id: string,
  statuses: ReviewResult[],
): VocabularyCard {
  return {
    id,
    term: id,
    normalizedTerm: id,
    tags: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    meanings: statuses.map((status, position) => ({
      id: `${id}-meaning-${position + 1}`,
      cardId: id,
      position,
      expression: id,
      definitionKo: `${id} 뜻 ${position + 1}`,
      searchTokens: [id],
      acceptedVariants: [id],
      synonyms: [],
      antonyms: [],
      examples: [],
      fillInBlankExamples: [
        {
          en: `The team used ${id} to solve the specific problem before noon.`,
          ko: `팀은 정오 전에 구체적인 문제를 해결하기 위해 ${id}를 사용했다.`,
          answer: id,
          type: "sentence",
        },
      ],
      status,
    })),
  };
}

const cards = [
  makeCard("account", ["unknown", "confusing", "correct"]),
  makeCard("induce", ["unknown"]),
  makeCard("pervasive", ["correct"]),
];

describe("meaning-level review scheduling", () => {
  it("sorts cards by their most difficult meaning", () => {
    const orderedCards = [
      makeCard("known", ["correct"]),
      makeCard("confusing", ["confusing"]),
      makeCard("unknown", ["unknown"]),
    ];
    expect(
      buildStudyQueue(orderedCards).map(({ meaning }) => meaning.status),
    ).toEqual(["unknown", "confusing", "correct"]);
    expect(
      buildFocusQueue(orderedCards).map(({ meaning }) => meaning.status),
    ).toEqual(["confusing", "unknown"]);
  });

  it("keeps meanings from the same card adjacent and in position order", () => {
    const queue = buildStudyQueue([cards[0], cards[1]]);
    expect(queue.slice(0, 3).map(({ card }) => card.id)).toEqual([
      "account",
      "account",
      "account",
    ]);
    expect(queue.slice(0, 3).map(({ meaning }) => meaning.position)).toEqual([
      0, 1, 2,
    ]);
  });

  it("preserves order cyclically and moves a reviewed meaning to the back", () => {
    const items = buildStudyQueue(cards);
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
    const focusItems = buildFocusQueue(cards);
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
