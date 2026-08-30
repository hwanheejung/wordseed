import { describe, expect, it } from "vitest";
import {
  canonicalizeDictionaryHeadword,
  normalizeDictionarySearchQuery,
} from "./dictionary-entry";

describe("canonicalizeDictionaryHeadword", () => {
  it("stores one display-safe canonical form", () => {
    expect(canonicalizeDictionaryHeadword("  I’M   DOWN  ")).toBe("I'M DOWN");
    expect(canonicalizeDictionaryHeadword("up–to–speed")).toBe("up-to-speed");
  });

  it("rejects an empty headword", () => {
    expect(() => canonicalizeDictionaryHeadword("   ")).toThrow(RangeError);
  });
});

describe("normalizeDictionarySearchQuery", () => {
  it("applies the same canonicalization before case folding", () => {
    expect(normalizeDictionarySearchQuery("  I’M   DOWN  ", "en")).toBe(
      "i'm down",
    );
  });
});
