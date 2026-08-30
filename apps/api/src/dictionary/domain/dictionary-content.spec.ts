import { describe, expect, it } from "vitest";
import type { DictionarySenseNarrative } from "./dictionary-content";

describe("DictionarySenseNarrative", () => {
  it("stores one localized markdown document per narrative", () => {
    const story = {
      id: "story:1",
      kind: "STORY",
      languageTag: "ko",
      markdown: "**grind**의 마찰감을 떠올려 보세요.",
      generatedBy: null,
    } satisfies DictionarySenseNarrative;

    expect(story.languageTag).toBe("ko");
    expect(story.kind).toBe("STORY");
  });
});
