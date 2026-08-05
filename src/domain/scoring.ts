import type { ReviewResult } from "./types";

export function normalizeAnswer(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .trim()
    .replace(/^[\s.,!?;:'"()[\]{}]+|[\s.,!?;:'"()[\]{}]+$/g, "")
    .replace(/\s+/g, " ");
}

export function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const columns = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(columns).fill(0));
  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let column = 0; column < columns; column += 1) matrix[0][column] = column;
  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1),
      );
    }
  }
  return matrix[a.length][b.length];
}

export function answerSimilarity(a: string, b: string) {
  const left = normalizeAnswer(a);
  const right = normalizeAnswer(b);
  if (!left && !right) return 1;
  const length = Math.max(left.length, right.length);
  return length === 0 ? 0 : 1 - levenshtein(left, right) / length;
}

export function scoreAnswer(answer: string, acceptedAnswers: string[]): ReviewResult {
  const normalized = normalizeAnswer(answer);
  if (!normalized) return "unknown";
  const candidates = acceptedAnswers.map(normalizeAnswer).filter(Boolean);
  if (candidates.includes(normalized)) return "correct";
  return candidates.some((candidate) => answerSimilarity(normalized, candidate) >= 0.85)
    ? "confusing"
    : "unknown";
}

export function blankTerm(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(`\\b${escaped}\\b`, "gi");
  return expression.test(text) ? text.replace(expression, "_____" ) : `${text} (${term}: _____)`;
}
