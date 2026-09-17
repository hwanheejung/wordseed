import { describe, expect, it } from "vitest";
import {
  canonicalizeDictionaryLemma,
  normalizeDictionarySearchQuery,
} from "./dictionary-lexeme";

describe("canonicalizeDictionaryLemma", () => {
  it("stores one display-safe canonical form", () => {
    expect(canonicalizeDictionaryLemma("  I’M   DOWN  ")).toBe("I'M DOWN");
    expect(canonicalizeDictionaryLemma("up–to–speed")).toBe("up-to-speed");
  });

  it("rejects an empty headword", () => {
    expect(() => canonicalizeDictionaryLemma("   ")).toThrow(RangeError);
  });
});

describe("normalizeDictionarySearchQuery", () => {
  it("applies the same canonicalization before case folding", () => {
    expect(normalizeDictionarySearchQuery("  I’M   DOWN  ", "en")).toBe(
      "i'm down",
    );
  });
});
