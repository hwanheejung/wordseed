import { describe, expect, it } from "vitest";
import { ENRICH_SYSTEM_PROMPT, EXTRACT_SYSTEM_PROMPT } from "./prompts.js";

describe("AI prompts", () => {
  it("uses the response schema for structure without TOEFL-only framing", () => {
    for (const prompt of [ENRICH_SYSTEM_PROMPT, EXTRACT_SYSTEM_PROMPT]) {
      expect(prompt).toContain("provided response schema");
      expect(prompt).toContain("everyday, academic, or professional");
      expect(prompt).toContain("have A do B");
      expect(prompt).toContain("Never copy those placeholders literally into an example");
      expect(prompt).toContain("testExample.answer");
      expect(prompt).toContain("Preserve the user's complete supplied sentence verbatim");
      expect(prompt).toContain("the passage uses");
      expect(prompt).not.toMatch(/TOEFL/i);
    }
  });
});
