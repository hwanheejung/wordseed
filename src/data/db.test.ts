import { describe, expect, it } from "vitest";
import { normalizeTags } from "./db";

describe("normalizeTags", () => {
  it("trims, de-duplicates, and removes hash prefixes", () => {
    expect(normalizeTags([" TOEFL ", "#TOEFL", "", 42])).toEqual([
      "TOEFL",
    ]);
  });
});
