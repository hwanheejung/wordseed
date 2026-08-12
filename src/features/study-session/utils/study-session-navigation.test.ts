import { describe, expect, it } from "vitest";
import type { ReviewResult, VocabularyCard } from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";
import {
  createStudySession,
  getCurrentStudyItem,
  navigateStudySession,
  reviewStudySession,
  saveMemoryAidInStudySession,
} from "./study-session-navigation";

function makeItem(id: string, status: ReviewResult = "unknown") {
  const meaning = {
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
  };
  const card: VocabularyCard = {
    id,
    term: id,
    normalizedTerm: id,
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    meanings: [meaning],
  };
  const item: StudyQueueItem = {
    card,
    meaning,
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

  it("updates a saved memory aid everywhere the meaning appears", () => {
    const first = makeItem("first");
    const state = {
      ...createStudySession([first]),
      history: [first],
    };
    const next = saveMemoryAidInStudySession(state, {
      ...first.meaning,
      memoryAid: "앞과 뒤가 뒤집힌 셔츠를 떠올린다.",
    });

    expect(next.queue[0].meaning.memoryAid).toBe(
      "앞과 뒤가 뒤집힌 셔츠를 떠올린다.",
    );
    expect(next.history[0].card.meanings[0].memoryAid).toBe(
      "앞과 뒤가 뒤집힌 셔츠를 떠올린다.",
    );
    expect(next.revision).toBe(state.revision);
  });
});
