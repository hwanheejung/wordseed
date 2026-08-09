import { isSpecificFillInBlankContext } from "@/entities/card";
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
    for (const [meaningIndex, meaning] of item.meanings.entries()) {
      const missingTranslationIndex = (
        meaning.fillInBlankExamples ?? []
      ).findIndex((example) => !example.ko?.trim());
      if (missingTranslationIndex >= 0)
        return {
          cardIndex,
          message: `${cardLabel}: 뜻 ${meaningIndex + 1}의 빈칸 문맥 ${missingTranslationIndex + 1}에 한국어 해석을 입력해 주세요.`,
        };
      const completeFillInBlankExamples = (
        meaning.fillInBlankExamples ?? []
      ).filter(
        (example) =>
          example.en.trim() && example.ko?.trim() && example.answer?.trim(),
      );
      if (completeFillInBlankExamples.length < 2)
        return {
          cardIndex,
          message: `${cardLabel}: 뜻 ${meaningIndex + 1}의 빈칸 문맥이 ${completeFillInBlankExamples.length}개예요. 두 개 이상 준비해 주세요.`,
        };
      const invalidFillInBlankIndex = (
        meaning.fillInBlankExamples ?? []
      ).findIndex(
        (example) =>
          !isSpecificFillInBlankContext(example.en, example.answer ?? ""),
      );
      if (invalidFillInBlankIndex >= 0)
        return {
          cardIndex,
          message: `${cardLabel}: 뜻 ${meaningIndex + 1}의 빈칸 문맥 ${invalidFillInBlankIndex + 1}에 정답 구간이 그대로 포함되어야 해요.`,
        };
    }
  }
}
