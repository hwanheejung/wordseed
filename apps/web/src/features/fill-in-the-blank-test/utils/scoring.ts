import type { ReviewResult } from "@/entities/card";
import { normalizeAnswer } from "@/shared/utils/normalize-answer";
import { phraseExpression } from "@/shared/utils/text-pattern";

function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const columns = b.length + 1;
  const matrix = Array.from({ length: rows }, () =>
    Array<number>(columns).fill(0),
  );
  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let column = 0; column < columns; column += 1)
    matrix[0][column] = column;
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

export function scoreAnswer(
  answer: string,
  acceptedAnswers: string[],
): ReviewResult {
  const normalized = normalizeAnswer(answer);
  if (!normalized) return "unknown";
  const candidates = acceptedAnswers.map(normalizeAnswer).filter(Boolean);
  if (candidates.includes(normalized)) return "correct";

  return candidates.some(
    (candidate) => answerSimilarity(normalized, candidate) >= 0.85,
  )
    ? "confusing"
    : "unknown";
}

export function answerWordPlaceholder(word: string, hint = false) {
  let revealed = false;

  return Array.from(word, (character) => {
    if (!/[\p{L}\p{N}]/u.test(character)) return character;
    if (hint && !revealed) {
      revealed = true;

      return character;
    }

    return "_";
  }).join("");
}

export function splitAroundAnswer(text: string, answer: string) {
  const match = phraseExpression(answer).exec(text);
  if (!match) return { before: text, after: "" };

  return {
    before: text.slice(0, match.index),
    after: text.slice(match.index + match[0].length),
  };
}
