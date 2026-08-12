import { describe, expect, it } from "vitest";
import {
  createEnrichmentBatches,
  hasSuppliedKoreanText,
} from "./enrich-input.js";

describe("enrichment input", () => {
  it("keeps large newline-separated input ordered in small batches", () => {
    const entries = Array.from({ length: 21 }, (_, index) => `word-${index + 1}`);

    const batches = createEnrichmentBatches(entries.join("\n"));

    expect(batches.map((batch) => batch.entries.length)).toEqual([
      4, 4, 4, 4, 4, 1,
    ]);
    expect(batches.flatMap((batch) => batch.entries)).toEqual(entries);
  });

  it("detects supplied Korean context without prescribing its format", () => {
    expect(hasSuppliedKoreanText("account 계좌 설명하다")).toBe(true);
    expect(hasSuppliedKoreanText("account (계좌 / 설명하다)")).toBe(true);
    expect(hasSuppliedKoreanText("account")).toBe(false);
  });
});
