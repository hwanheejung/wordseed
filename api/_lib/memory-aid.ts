export function normalizeGeneratedMemoryAid(value: string): string {
  return value
    .trim()
    .replace(/^```(?:markdown|md)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}
