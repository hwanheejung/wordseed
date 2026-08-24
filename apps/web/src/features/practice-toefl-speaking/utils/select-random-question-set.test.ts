import { describe, expect, it } from "vitest";
import type { ToeflSpeakingQuestionSet } from "../types/toefl-speaking-question";
import { selectRandomQuestionSet } from "./select-random-question-set";

const QUESTION_SETS: ToeflSpeakingQuestionSet[] = [
  {
    id: "first",
    title: "First",
    category: "Campus and education",
    scenario: "First scenario",
    questions: [
      { id: "first-1", prompt: "Question 1" },
      { id: "first-2", prompt: "Question 2" },
      { id: "first-3", prompt: "Question 3" },
      { id: "first-4", prompt: "Question 4" },
    ],
  },
  {
    id: "second",
    title: "Second",
    category: "Campus and education",
    scenario: "Second scenario",
    questions: [
      { id: "second-1", prompt: "Question 1" },
      { id: "second-2", prompt: "Question 2" },
      { id: "second-3", prompt: "Question 3" },
      { id: "second-4", prompt: "Question 4" },
    ],
  },
];

describe("selectRandomQuestionSet", () => {
  it("avoids immediately repeating the previous set", () => {
    expect(selectRandomQuestionSet(QUESTION_SETS, "first", () => 0)?.id).toBe(
      "second",
    );
  });
});
