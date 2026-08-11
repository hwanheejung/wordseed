import type { CardDraft } from "../types/card-draft";

export type DraftValidationIssue = { cardIndex: number; message: string };

export function validateDrafts(
  drafts: CardDraft[],
): DraftValidationIssue | undefined {
  for (const [cardIndex, item] of drafts.entries()) {
    const cardLabel = `${cardIndex + 1}번째 카드 ‘${item.term.trim() || "이름 없음"}’`;
    if (!item.term.trim())
      return {
        cardIndex,
        message: `${cardLabel}: 단어 또는 표현이 비어 있어요.`,
      };
    if (!item.meanings.length)
      return {
        cardIndex,
        message: `${cardLabel}: 뜻을 하나 이상 추가해 주세요.`,
      };
    const emptyMeaningIndex = item.meanings.findIndex(
      (meaning) => !meaning.definitionKo.trim(),
    );
    if (emptyMeaningIndex >= 0)
      return {
        cardIndex,
        message: `${cardLabel}: 뜻 ${emptyMeaningIndex + 1}의 내용이 비어 있어요.`,
      };
    const emptyExpressionIndex = item.meanings.findIndex(
      (meaning) => !meaning.expression.trim(),
    );
    if (emptyExpressionIndex >= 0)
      return {
        cardIndex,
        message: `${cardLabel}: 뜻 ${emptyExpressionIndex + 1}의 학습 표현이 비어 있어요.`,
      };
    const missingExampleIndex = item.meanings.findIndex(
      (meaning) => !meaning.examples.some((example) => example.en.trim()),
    );
    if (missingExampleIndex >= 0)
      return {
        cardIndex,
        message: `${cardLabel}: 뜻 ${missingExampleIndex + 1}에 예문을 하나 이상 입력해 주세요.`,
      };
  }
}
