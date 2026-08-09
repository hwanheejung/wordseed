import { describe, expect, it } from "vitest";
import type { ReviewResult, VocabularyCard } from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";
import {
  createStudySession,
  getCurrentStudyItem,
  navigateStudySession,
  reviewStudySession,
} from "./study-session-navigation";

function makeItem(id: string, status: ReviewResult = "unknown") {
  const card: VocabularyCard = {
    id,
    term: id,
    normalizedTerm: id,
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    meanings: [],
  };
  const item: StudyQueueItem = {
    card,
    meaning: {
      id: `${id}-meaning`,
      cardId: id,
      position: 0,
      expression: id,
      definitionKo: id,
      searchTokens: [id],
      acceptedVariants: [id],
      synonyms: [],
      antonyms: [],
      examples: [],
      fillInBlankExamples: [],
      status,
    },
  };

  return item;
}

function withStatus(item: StudyQueueItem, status: ReviewResult) {
  return { ...item, meaning: { ...item.meaning, status } };
}

describe("study session navigation", () => {
  it("keeps every reviewed card in session history", () => {
    const [first, second, third] = [makeItem("first"), makeItem("second"), makeItem("third")];
    let state = createStudySession([first, second, third]);

    state = reviewStudySession(state, withStatus(first, "correct"), false);
    state = reviewStudySession(state, withStatus(second, "confusing"), false);
    state = reviewStudySession(state, withStatus(third, "unknown"), false);
    state = navigateStudySession(state, "previous");
    expect(getCurrentStudyItem(state).card.id).toBe("third");
    state = navigateStudySession(state, "previous");
    expect(getCurrentStudyItem(state).card.id).toBe("second");
    state = navigateStudySession(state, "previous");
    expect(getCurrentStudyItem(state).card.id).toBe("first");
  });

  it("keeps correct focus cards in history after removing them from the queue", () => {
    const [first, second] = [makeItem("first"), makeItem("second")];
    let state = createStudySession([first, second]);

    state = reviewStudySession(state, withStatus(first, "correct"), true);
    expect(state.queue.map(({ card }) => card.id)).toEqual(["second"]);
    expect(getCurrentStudyItem(state).card.id).toBe("second");

    state = navigateStudySession(state, "previous");
    expect(getCurrentStudyItem(state).card.id).toBe("first");
  });

  it("returns from history to the current learning queue", () => {
    const [first, second] = [makeItem("first"), makeItem("second")];
    let state = createStudySession([first, second]);

    state = reviewStudySession(state, withStatus(first, "correct"), true);
    state = navigateStudySession(state, "previous");
    state = navigateStudySession(state, "next");

    expect(getCurrentStudyItem(state).card.id).toBe("second");
    expect(state.historyIndex).toBeUndefined();
  });
});
