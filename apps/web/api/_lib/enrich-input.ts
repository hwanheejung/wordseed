const ENRICH_BATCH_SIZE = 4;
const KOREAN_TEXT_PATTERN = /[가-힣]/;

export interface EnrichmentBatch {
  entries: string[];
  text: string;
}

export function createEnrichmentBatches(text: string): EnrichmentBatch[] {
  const entries = text
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const batches: EnrichmentBatch[] = [];
  for (let index = 0; index < entries.length; index += ENRICH_BATCH_SIZE) {
    const batchEntries = entries.slice(index, index + ENRICH_BATCH_SIZE);
    batches.push({ entries: batchEntries, text: batchEntries.join("\n") });
  }

  return batches;
}

export function hasSuppliedKoreanText(entry: string): boolean {
  return KOREAN_TEXT_PATTERN.test(entry);
}
