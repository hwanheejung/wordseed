import { describe, expect, it } from "vitest";
import { normalizeGeneratedMemoryAid } from "./memory-aid.js";

describe("generated memory aid normalization", () => {
  it("removes an accidental Markdown fence without changing the content", () => {
    expect(
      normalizeGeneratedMemoryAid("```markdown\n### 장면\n\n동전을 찍어낸다.\n```"),
    ).toBe("### 장면\n\n동전을 찍어낸다.");
  });
});
