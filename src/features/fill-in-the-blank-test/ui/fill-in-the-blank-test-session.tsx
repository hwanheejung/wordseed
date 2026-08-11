import { Badge } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import type { ReviewResult } from "@/entities/card";
import {
  isSpecificFillInBlankContext,
  reviewResultMeta,
} from "@/entities/card";
import { AppHeader } from "@/shared/ui/app-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { submitFillInBlankAnswer } from "../actions/submit-fill-in-blank-answer";
import type { FillInBlankQuestion } from "../types/fill-in-blank-question";
import { scoreAnswer } from "../utils/scoring";
import { InlineFillInTheBlankPrompt } from "./inline-fill-in-the-blank-prompt";

interface FillInTheBlankTestSessionProps {
  items: FillInBlankQuestion[];
  onBack: () => void;
}

export function FillInTheBlankTestSession({
  items,
  onBack,
}: FillInTheBlankTestSessionProps) {
  const [sessionItems, setSessionItems] = useState(items);
  const [answer, setAnswer] = useState("");
  const [revealStage, setRevealStage] = useState<0 | 1 | 2>(0);
  const [graded, setGraded] = useState<ReviewResult>();
  const [turnsByMeaning, setTurnsByMeaning] = useState<Record<string, number>>(
    {},
  );
  const item = sessionItems[0];

  if (!item)
    return (
      <>
        <AppHeader title="빈칸 채우기" onBack={onBack} />
        <main className="min-h-[calc(100vh-84px)] p-5">
          <EmptyState
            title="빈칸 문제가 없어요"
            description="저장된 카드 중 빈칸 퀴즈에 사용할 수 있는 문맥이 없어요."
            action={<ActionButton onClick={onBack}>돌아가기</ActionButton>}
          />
        </main>
      </>
    );

  const { meaning } = item;
  const validExamples = meaning.fillInBlankExamples.filter(
    (example) =>
      example.ko.trim() &&
      isSpecificFillInBlankContext(example.en, example.answer),
  );
  const currentTurn = turnsByMeaning[meaning.id] ?? 0;
  const fillInBlankExample = validExamples[currentTurn % validExamples.length];
  const expectedAnswer = fillInBlankExample?.answer ?? "";

  const resetAndRotate = (updated: FillInBlankQuestion) => {
    setAnswer("");
    setRevealStage(0);
    setGraded(undefined);
    setSessionItems((current) => [...current.slice(1), updated]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const gradeAnswer = () =>
    setGraded(
      scoreAnswer(answer, [expectedAnswer, ...meaning.acceptedVariants]),
    );

  const commitAnswer = async () => {
    if (!graded) return;
    const updated = await submitFillInBlankAnswer(item, graded);
    setTurnsByMeaning((current) => ({
      ...current,
      [meaning.id]: currentTurn + 1,
    }));
    resetAndRotate(updated);
  };

  return (
    <>
      <AppHeader
        title="빈칸 채우기"
        subtitle={`${sessionItems.length}개 뜻`}
        onBack={onBack}
      />
      <main className="min-h-[calc(100vh-84px)] overflow-y-hidden! bg-[var(--seed-color-bg-layer-basement)] p-5 pb-[130px]">
        {fillInBlankExample ? (
          <article className="flex max-h-full min-h-0 flex-col overflow-y-auto overscroll-contain rounded-[28px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] shadow-[0_8px_30px_rgba(0,0,0,.07)]">
            <div className="flex flex-1 flex-col justify-center p-6">
              <InlineFillInTheBlankPrompt
                text={fillInBlankExample.en}
                expectedAnswer={expectedAnswer}
                answer={answer}
                revealStage={revealStage}
                disabled={Boolean(graded)}
                onAnswerChange={setAnswer}
                onSubmit={gradeAnswer}
              />
              <p className="m-0 mb-5 text-[length:var(--seed-font-size-t5)] leading-[1.55] font-light">
                {fillInBlankExample.ko}
              </p>
              {!graded && revealStage < 2 && (
                <div>
                  <ActionButton
                    size="small"
                    variant="ghost"
                    onClick={() =>
                      setRevealStage((stage) => (stage + 1) as 1 | 2)
                    }
                  >
                    {revealStage === 0 ? "힌트 보기" : "정답 보기"}
                  </ActionButton>
                </div>
              )}
              {graded && (
                <div
                  className={`mt-4 rounded-2xl p-4 ${graded === "correct" ? "bg-[var(--seed-color-bg-positive-weak)]" : graded === "confusing" ? "bg-[var(--seed-color-bg-warning-weak)]" : "bg-[var(--seed-color-bg-critical-weak)]"} [&_p]:mt-2.5 [&_p]:mb-1 [&_span]:text-[var(--seed-color-fg-neutral-subtle)]`}
                >
                  <Badge tone={reviewResultMeta[graded].tone}>
                    {reviewResultMeta[graded].label}
                  </Badge>
                  <p>
                    문맥의 정답은 <strong>{expectedAnswer}</strong>예요.
                  </p>
                  <span>
                    학습 표현: {meaning.expression} · {meaning.definitionKo}
                  </span>
                </div>
              )}
            </div>
          </article>
        ) : (
          <EmptyState
            title="빈칸 문제를 준비하지 못했어요"
            description="이 카드에는 빈칸 퀴즈에 사용할 수 있는 문맥이 없어요."
          />
        )}
      </main>
      {fillInBlankExample && (
        <div className="sticky-cta">
          {graded ? (
            <ActionButton
              size="large"
              onClick={() => void commitAnswer()}
              className="w-full justify-center"
            >
              다음 문제
            </ActionButton>
          ) : (
            <ActionButton
              size="large"
              disabled={!answer.trim()}
              onClick={gradeAnswer}
              className="w-full justify-center"
            >
              정답 확인
            </ActionButton>
          )}
        </div>
      )}
    </>
  );
}
