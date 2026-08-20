import {
  IconArrow2ClockwiseCircularLine,
  IconChevronLeftLine,
  IconChevronRightLine,
  IconTriangleRightLine,
} from "@karrotmarket/react-monochrome-icon";
import { Badge, Icon, TextField } from "@seed-design/react";
import { useEffect, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { AppHeader } from "@/shared/ui/app-header";
import { TOEFL_SPEAKING_DOMAINS } from "../constants/toefl-speaking-domains";
import { TOEFL_SPEAKING_QUESTION_SETS } from "../constants/toefl-speaking-question-sets";
import { selectRandomQuestionSet } from "../utils/select-random-question-set";

const QUESTION_TIME_LIMIT_SECONDS = 45;

type TimerState =
  | { status: "idle" }
  | { status: "running"; secondsRemaining: number }
  | { status: "expired" };

type PracticeScreen =
  | { name: "list" }
  | {
      name: "session";
      questionSetId: string;
      questionIndex: number;
    }
  | {
      name: "complete";
      questionSetId: string;
    };

interface ToeflSpeakingPracticeProps {
  onExit: () => void;
}

export function ToeflSpeakingPractice({ onExit }: ToeflSpeakingPracticeProps) {
  const [screen, setScreen] = useState<PracticeScreen>({ name: "list" });
  const [timerState, setTimerState] = useState<TimerState>({ status: "idle" });
  const [memo, setMemo] = useState("");
  const [previousQuestionSetId, setPreviousQuestionSetId] = useState<string>();
  const activeQuestionId =
    screen.name === "session"
      ? `${screen.questionSetId}:${screen.questionIndex}`
      : undefined;

  // Synchronize the active question's running countdown with the browser timer.
  useEffect(() => {
    if (screen.name !== "session" || timerState.status !== "running") return;

    const intervalId = window.setInterval(() => {
      setTimerState((current) => {
        if (current.status !== "running") return current;
        if (current.secondsRemaining <= 1) return { status: "expired" };

        return {
          status: "running",
          secondsRemaining: current.secondsRemaining - 1,
        };
      });
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [activeQuestionId, screen.name, timerState.status]);

  function startQuestionSet(questionSetId: string) {
    setPreviousQuestionSetId(questionSetId);
    setTimerState({ status: "idle" });
    setMemo("");
    setScreen({
      name: "session",
      questionSetId,
      questionIndex: 0,
    });
  }

  function startRandomQuestionSet() {
    const questionSet = selectRandomQuestionSet(
      TOEFL_SPEAKING_QUESTION_SETS,
      previousQuestionSetId,
    );

    if (questionSet) startQuestionSet(questionSet.id);
  }

  function startTimer() {
    setTimerState({
      status: "running",
      secondsRemaining: QUESTION_TIME_LIMIT_SECONDS,
    });
  }

  function returnToQuestionList() {
    setTimerState({ status: "idle" });
    setMemo("");
    setScreen({ name: "list" });
  }

  function handleNextQuestion() {
    if (screen.name !== "session") return;

    const questionSet = TOEFL_SPEAKING_QUESTION_SETS.find(
      ({ id }) => id === screen.questionSetId,
    );
    if (!questionSet) return;

    const nextQuestionIndex = screen.questionIndex + 1;
    if (nextQuestionIndex >= questionSet.questions.length) {
      setScreen({
        name: "complete",
        questionSetId: screen.questionSetId,
      });

      return;
    }

    setTimerState({ status: "idle" });
    setScreen({ ...screen, questionIndex: nextQuestionIndex });
  }

  function handlePreviousQuestion() {
    if (screen.name !== "session" || screen.questionIndex === 0) return;

    setTimerState({ status: "idle" });
    setScreen({ ...screen, questionIndex: screen.questionIndex - 1 });
  }

  if (screen.name === "list") {
    return (
      <>
        <AppHeader
          title="Speaking Task 2"
          subtitle="Take an Interview"
          onBack={onExit}
        />
        <QuestionSetList
          onRandom={startRandomQuestionSet}
          onSelect={startQuestionSet}
        />
      </>
    );
  }

  if (screen.name === "session") {
    const questionSet = TOEFL_SPEAKING_QUESTION_SETS.find(
      ({ id }) => id === screen.questionSetId,
    );

    if (!questionSet) return null;

    return (
      <>
        <AppHeader
          title="Speaking Task 2"
          subtitle="Take an Interview"
          onBack={returnToQuestionList}
        />
        <PracticeSession
          questionSet={questionSet}
          questionIndex={screen.questionIndex}
          timerState={timerState}
          memo={memo}
          onStartTimer={startTimer}
          onMemoChange={setMemo}
          onPrevious={handlePreviousQuestion}
          onNext={handleNextQuestion}
        />
      </>
    );
  }

  if (screen.name === "complete") {
    const questionSet = TOEFL_SPEAKING_QUESTION_SETS.find(
      ({ id }) => id === screen.questionSetId,
    );

    if (!questionSet) return null;

    return (
      <>
        <AppHeader
          title="Speaking Task 2"
          subtitle="Take an Interview"
          onBack={returnToQuestionList}
        />
        <CompletionView
          title={questionSet.title}
          onRandom={startRandomQuestionSet}
          onOpenList={returnToQuestionList}
        />
      </>
    );
  }

  return null;
}

interface TimerControlProps {
  timerState: TimerState;
  onStart: () => void;
}

function TimerControl({ timerState, onStart }: TimerControlProps) {
  if (timerState.status === "running") {
    return (
      <div className="relative">
        <div
          className="grid size-24 place-items-center rounded-full border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] text-[length:var(--seed-font-size-t7)] font-semibold tabular-nums text-[var(--seed-color-fg-neutral)] shadow-[0_8px_24px_rgba(0,0,0,.06)]"
          role="timer"
          aria-label={`${timerState.secondsRemaining}초 남음`}
        >
          0:{String(timerState.secondsRemaining).padStart(2, "0")}
        </div>
        <RestartTimerButton onClick={onStart} />
      </div>
    );
  }

  if (timerState.status === "expired") {
    return (
      <div className="relative">
        <div
          className="grid size-24 place-items-center rounded-full border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] text-[length:var(--seed-font-size-t7)] font-semibold tabular-nums text-[var(--seed-color-fg-critical)] shadow-[0_8px_24px_rgba(0,0,0,.06)]"
          role="timer"
          aria-label="시간 종료"
        >
          0:00
        </div>
        <RestartTimerButton onClick={onStart} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="grid size-24 place-items-center rounded-full border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] text-[length:var(--seed-font-size-t5)] font-semibold text-[var(--seed-color-fg-neutral)] shadow-[0_8px_24px_rgba(0,0,0,.06)] transition-[transform,background-color] duration-100 active:scale-[.97] active:bg-[var(--seed-color-bg-neutral-weak)] motion-reduce:transition-none"
      onClick={onStart}
      aria-label="45초 타이머 시작"
    >
      Start
    </button>
  );
}

interface RestartTimerButtonProps {
  onClick: () => void;
}

function RestartTimerButton({ onClick }: RestartTimerButtonProps) {
  return (
    <button
      type="button"
      className="absolute right-[-8px] bottom-[-8px] grid size-11 place-items-center rounded-full border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] text-[var(--seed-color-fg-neutral-subtle)] shadow-[0_4px_12px_rgba(0,0,0,.1)] transition-[transform,background-color] duration-100 active:scale-[.94] active:bg-[var(--seed-color-bg-neutral-weak)] motion-reduce:transition-none"
      onClick={onClick}
      aria-label="타이머 다시 시작"
    >
      <Icon svg={<IconArrow2ClockwiseCircularLine />} size="18px" />
    </button>
  );
}

interface QuestionSetListProps {
  onRandom: () => void;
  onSelect: (questionSetId: string) => void;
}

function QuestionSetList({ onRandom, onSelect }: QuestionSetListProps) {
  return (
    <main className="p-5 pb-10">
      <ActionButton className="w-full" size="large" onClick={onRandom}>
        <Icon svg={<IconArrow2ClockwiseCircularLine />} />
        랜덤으로 시작
      </ActionButton>
      <div className="mt-8 mb-6">
        <h2 className="m-0 text-[length:var(--seed-font-size-t7)] font-semibold tracking-[-.025em]">
          질문 목록
        </h2>
        <p className="mt-2 mb-0 text-[length:var(--seed-font-size-t3)] text-[var(--seed-color-fg-neutral-subtle)]">
          {TOEFL_SPEAKING_QUESTION_SETS.length}개 인터뷰 · 각 4문항
        </p>
      </div>

      <div className="grid gap-8">
        {TOEFL_SPEAKING_DOMAINS.map((domain, domainIndex) => (
          <section
            key={domain}
            aria-labelledby={`speaking-domain-${domainIndex}`}
          >
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <h3
                id={`speaking-domain-${domainIndex}`}
                className="m-0 text-[length:var(--seed-font-size-t3)] font-semibold tracking-[.005em] text-[var(--seed-color-fg-neutral-subtle)]"
              >
                {domain}
              </h3>
            </div>
            <div className="overflow-hidden rounded-[20px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] shadow-[0_4px_16px_rgba(0,0,0,.035)]">
              {TOEFL_SPEAKING_QUESTION_SETS.filter(
                ({ category }) => category === domain,
              ).map((questionSet) => (
                <button
                  key={questionSet.id}
                  type="button"
                  className="flex min-h-13 w-full items-center gap-3 border-0 border-b border-solid border-[var(--seed-color-stroke-neutral-subtle)] bg-transparent px-4 py-3 text-left text-[var(--seed-color-fg-neutral)] transition-colors duration-100 last:border-b-0 active:bg-[var(--seed-color-bg-neutral-weak)] motion-reduce:transition-none"
                  onClick={() => onSelect(questionSet.id)}
                  aria-label={`${questionSet.title} 인터뷰 시작`}
                >
                  <span className="min-w-0 flex-1 text-[length:var(--seed-font-size-t4)] font-normal leading-[1.4] tracking-[-.005em]">
                    {questionSet.title}
                  </span>
                  <span className="text-[var(--seed-color-fg-neutral-muted)]">
                    <Icon svg={<IconChevronRightLine />} size="12px" />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

interface PracticeSessionProps {
  questionSet: (typeof TOEFL_SPEAKING_QUESTION_SETS)[number];
  questionIndex: number;
  timerState: TimerState;
  memo: string;
  onStartTimer: () => void;
  onMemoChange: (memo: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

function PracticeSession({
  questionSet,
  questionIndex,
  timerState,
  memo,
  onStartTimer,
  onMemoChange,
  onPrevious,
  onNext,
}: PracticeSessionProps) {
  const question = questionSet.questions[questionIndex];
  const isLastQuestion = questionIndex === questionSet.questions.length - 1;

  return (
    <main className="flex min-h-full flex-col p-5 pb-[calc(100px+var(--seed-safe-area-bottom))]">
      <div className="flex justify-end">
        <span className="text-[length:var(--seed-font-size-t3)] font-semibold text-[var(--seed-color-fg-neutral-muted)]">
          {questionIndex + 1} / {questionSet.questions.length}
        </span>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--seed-color-bg-neutral-weak)]"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-[var(--seed-color-bg-brand-solid)] transition-[width]"
          style={{
            width: `${((questionIndex + 1) / questionSet.questions.length) * 100}%`,
          }}
        />
      </div>

      <section className="mt-7">
        <Badge className="max-w-none!" tone="brand" variant="weak">
          {questionSet.category}
        </Badge>
        <h2 className="mt-3 mb-0 text-[length:var(--seed-font-size-t7)] tracking-[-.03em]">
          {questionSet.title}
        </h2>
        {questionIndex === 0 && (
          <p className="mt-3 mb-0 rounded-2xl bg-[var(--seed-color-bg-neutral-weak)] p-4 text-[length:var(--seed-font-size-t3)] leading-[1.55] text-[var(--seed-color-fg-neutral-subtle)]">
            {questionSet.scenario}
          </p>
        )}
      </section>

      <section
        className="my-auto py-8 text-center"
        aria-labelledby="speaking-question"
      >
        <p className="mb-3 text-[length:var(--seed-font-size-t2)] font-bold tracking-[.08em] text-[var(--seed-color-fg-brand)] uppercase">
          Question {questionIndex + 1}
        </p>
        <h3
          id="speaking-question"
          className="mx-auto my-0 max-w-[440px] text-[length:var(--seed-font-size-t8)] leading-[1.35] tracking-[-.025em]"
        >
          {question.prompt}
        </h3>

        <div className="mt-7 flex min-h-28 items-center justify-center">
          <TimerControl timerState={timerState} onStart={onStartTimer} />
        </div>
      </section>

      <section className="[&_textarea]:min-h-[88px]">
        <label
          className="mb-2 block text-[length:var(--seed-font-size-t2)] font-semibold text-[var(--seed-color-fg-neutral-subtle)]"
          htmlFor="speaking-memo"
        >
          메모
        </label>
        <TextField.Root>
          <TextField.Textarea
            id="speaking-memo"
            aria-label="메모"
            value={memo}
            onChange={(event) => onMemoChange(event.target.value)}
            placeholder="4개 질문 동안 유지되고, 연습 후 사라져요"
          />
        </TextField.Root>
      </section>

      <div className="sticky-cta">
        <div className={questionIndex === 0 ? "grid" : "grid grid-cols-2 gap-2.5"}>
          {questionIndex > 0 && (
            <ActionButton
              size="large"
              variant="neutralWeak"
              onClick={onPrevious}
            >
              <Icon svg={<IconChevronLeftLine />} />
              이전 질문
            </ActionButton>
          )}
          <ActionButton size="large" onClick={onNext}>
            <Icon svg={<IconTriangleRightLine />} />
            {isLastQuestion ? "연습 마치기" : "다음 질문"}
          </ActionButton>
        </div>
      </div>
    </main>
  );
}

interface CompletionViewProps {
  title: string;
  onRandom: () => void;
  onOpenList: () => void;
}

function CompletionView({ title, onRandom, onOpenList }: CompletionViewProps) {
  return (
    <main className="grid min-h-full place-items-center p-5 pb-10 text-center">
      <section className="w-full max-w-[420px]">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--seed-color-bg-brand-weak)] text-3xl">
          ✓
        </span>
        <p className="mt-5 mb-1 text-[length:var(--seed-font-size-t3)] text-[var(--seed-color-fg-neutral-subtle)]">
          {title}
        </p>
        <h2 className="mt-0 mb-3 text-[length:var(--seed-font-size-t8)] tracking-[-.035em]">
          네 질문을 모두 마쳤어요
        </h2>
        <p className="m-0 text-[length:var(--seed-font-size-t3)] leading-[1.55] text-[var(--seed-color-fg-neutral-subtle)]">
          같은 주제를 다시 말하기보다 새 주제로 이어가면 순발력을 기르기 좋아요.
        </p>
        <div className="mt-7 grid gap-2.5">
          <ActionButton size="large" onClick={onRandom}>
            새 주제 랜덤 연습
          </ActionButton>
          <ActionButton size="large" variant="neutralWeak" onClick={onOpenList}>
            질문 목록 보기
          </ActionButton>
        </div>
      </section>
    </main>
  );
}
