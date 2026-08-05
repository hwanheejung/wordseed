import { describe, expect, it } from "vitest";
import { answerSimilarity, blankTerm, normalizeAnswer, scoreAnswer } from "./scoring";

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
  });
});
