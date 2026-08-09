import { describe, expect, it } from "vitest";
import { isSpecificFillInBlankContext } from "@/entities/card";
import { normalizeAnswer } from "@/shared/utils/normalize-answer";
import {
  answerSimilarity,
  answerWordPlaceholder,
  scoreAnswer,
  splitAroundAnswer,
} from "./scoring";

describe("fill-in-the-blank answer scoring", () => {
  it("normalizes case, punctuation, and whitespace", () => {
    expect(normalizeAnswer("  Induce!  ")).toBe("induce");
    expect(scoreAnswer(" INDUCE. ", ["induce"])).toBe("correct");
  });

  it("marks a minor typo as confusing", () => {
    expect(answerSimilarity("pervasve", "pervasive")).toBeGreaterThanOrEqual(
      0.85,
    );
    expect(scoreAnswer("pervasve", ["pervasive"])).toBe("confusing");
  });

  it("marks blank and unrelated answers unknown", () => {
    expect(scoreAnswer("", ["thrall"])).toBe("unknown");
    expect(scoreAnswer("freedom", ["thrall"])).toBe("unknown");
  });

  it("builds word-level blank and first-letter hint placeholders", () => {
    expect(
      "swing by".split(" ").map((word) => answerWordPlaceholder(word)),
    ).toEqual(["_____", "__"]);
    expect(
      "swing by".split(" ").map((word) => answerWordPlaceholder(word, true)),
    ).toEqual(["s____", "b_"]);
  });

  it("splits a sentence around its inline answer", () => {
    expect(
      splitAroundAnswer("Can you swing by after work?", "swing by"),
    ).toEqual({
      before: "Can you ",
      after: " after work?",
    });
  });

  it("rejects generic metalinguistic fallback prompts", () => {
    expect(
      isSpecificFillInBlankContext(
        "The professor used the term induce to clarify the central idea.",
        "induce",
      ),
    ).toBe(false);
    expect(
      isSpecificFillInBlankContext(
        "A sudden temperature drop may induce dormancy in seeds.",
        "induce",
      ),
    ).toBe(true);
  });
});
