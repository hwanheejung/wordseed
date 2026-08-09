import { describe, expect, it } from "vitest";
import { answerSimilarity, answerWordPlaceholder, blankTerm, getTestAnswer, isSpecificTestContext, normalizeAnswer, scoreAnswer, splitAroundAnswer } from "./scoring";

describe("test answer scoring", () => {
  it("normalizes case, punctuation, and whitespace", () => {
    expect(normalizeAnswer("  Induce!  ")).toBe("induce");
    expect(scoreAnswer(" INDUCE. ", ["induce"])).toBe("correct");
  });

  it("marks a minor typo as confusing", () => {
    expect(answerSimilarity("pervasve", "pervasive")).toBeGreaterThanOrEqual(0.85);
    expect(scoreAnswer("pervasve", ["pervasive"])).toBe("confusing");
  });

  it("marks blank and unrelated answers unknown", () => {
    expect(scoreAnswer("", ["thrall"])).toBe("unknown");
    expect(scoreAnswer("freedom", ["thrall"])).toBe("unknown");
  });

  it("blanks the target term without changing its context", () => {
    expect(blankTerm("The policy may induce change.", "induce")).toBe("The policy may _____ change.");
    expect(blankTerm("No target is present.", "induce")).toBe("No target is present.");
  });

  it("builds word-level blank and first-letter hint placeholders", () => {
    expect("swing by".split(" ").map((word) => answerWordPlaceholder(word))).toEqual(["_____", "__"]);
    expect("swing by".split(" ").map((word) => answerWordPlaceholder(word, true))).toEqual(["s____", "b_"]);
  });

  it("splits a sentence around its inline answer", () => {
    expect(splitAroundAnswer("Can you swing by after work?", "swing by")).toEqual({
      before: "Can you ",
      after: " after work?",
    });
  });

  it("uses a concrete answer span for an abstract grammar pattern", () => {
    const example = {
      en: "The manager had an assistant reschedule the meeting.",
      answer: "had an assistant reschedule",
      type: "sentence" as const,
      provenance: "ai" as const,
    };
    expect(getTestAnswer(example, "have A do B")).toBe("had an assistant reschedule");
    expect(blankTerm(example.en, getTestAnswer(example, "have A do B"))).toBe("The manager _____ the meeting.");
  });

  it("rejects generic metalinguistic fallback prompts", () => {
    expect(isSpecificTestContext("The professor used the term induce to clarify the central idea.", "induce")).toBe(false);
    expect(isSpecificTestContext("A sudden temperature drop may induce dormancy in seeds.", "induce")).toBe(true);
  });
});
