import { describe, expect, it } from "vitest";
import { TOEFL_SPEAKING_DOMAINS } from "./toefl-speaking-domains";
import { TOEFL_SPEAKING_QUESTION_SETS } from "./toefl-speaking-question-sets";

function countWords(text: string) {
  return text.trim().split(/\s+/).length;
}

describe("TOEFL_SPEAKING_QUESTION_SETS", () => {
  it("contains six interview sets for every production topic domain", () => {
    expect(TOEFL_SPEAKING_QUESTION_SETS).toHaveLength(72);

    TOEFL_SPEAKING_DOMAINS.forEach((domain) => {
      expect(
        TOEFL_SPEAKING_QUESTION_SETS.filter(
          ({ category }) => category === domain,
        ),
      ).toHaveLength(6);
    });
  });

  it("uses unique identifiers and prompts throughout the bank", () => {
    const questionSetIds = TOEFL_SPEAKING_QUESTION_SETS.map(({ id }) => id);
    const questions = TOEFL_SPEAKING_QUESTION_SETS.flatMap(
      ({ questions }) => questions,
    );

    expect(new Set(questionSetIds).size).toBe(questionSetIds.length);
    expect(new Set(questions.map(({ id }) => id)).size).toBe(questions.length);
    expect(new Set(questions.map(({ prompt }) => prompt)).size).toBe(
      questions.length,
    );
  });

  it("keeps later questions long enough for a setup and tradeoff", () => {
    TOEFL_SPEAKING_QUESTION_SETS.forEach(({ questions }) => {
      questions.slice(2).forEach(({ prompt }) => {
        expect(countWords(prompt)).toBeGreaterThanOrEqual(25);
        expect(countWords(prompt)).toBeLessThanOrEqual(50);
      });
    });
  });
});
