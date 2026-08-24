import { answerWordPlaceholder, splitAroundAnswer } from "../utils/scoring";

interface InlineFillInTheBlankPromptProps {
  text: string;
  expectedAnswer: string;
  answer: string;
  revealStage: 0 | 1 | 2;
  disabled: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
}

export function InlineFillInTheBlankPrompt({
  text,
  expectedAnswer,
  answer,
  revealStage,
  disabled,
  onAnswerChange,
  onSubmit,
}: InlineFillInTheBlankPromptProps) {
  const { before, after } = splitAroundAnswer(text, expectedAnswer);
  const expectedWords = expectedAnswer.trim().split(/\s+/);
  const enteredWords = answer.split(" ");

  const updateWord = (index: number, value: string) => {
    const next = expectedWords.map((_, wordIndex) =>
      wordIndex === index
        ? value.replace(/\s/g, "")
        : (enteredWords[wordIndex] ?? ""),
    );
    onAnswerChange(next.join(" "));
  };

  return (
    <p className="my-7 whitespace-pre-wrap text-[length:var(--seed-font-size-t7)] leading-[2.1] font-bold tracking-[-.02em]">
      {before}
      <span className="inline-flex flex-wrap gap-1.5 align-middle">
        {expectedWords.map((word, index) => (
          <input
            key={`${word}-${index}`}
            aria-label={`정답 ${index + 1}번째 단어`}
            className="h-12 rounded-xl border border-transparent bg-[var(--seed-color-bg-neutral-weak)] px-2 text-center text-[length:var(--seed-font-size-t6)] font-bold text-[var(--seed-color-fg-neutral)] outline-none transition-colors placeholder:text-[var(--seed-color-fg-neutral-muted)] focus:border-[var(--seed-color-stroke-brand)] focus:bg-[var(--seed-color-bg-brand-weak)] disabled:opacity-100"
            style={{ width: `${Math.max(3, word.length + 1)}ch` }}
            value={enteredWords[index] ?? ""}
            placeholder={
              revealStage === 2
                ? word
                : answerWordPlaceholder(word, revealStage === 1)
            }
            disabled={disabled}
            onChange={(event) => updateWord(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && answer.trim()) onSubmit();
            }}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
          />
        ))}
      </span>
      {after}
    </p>
  );
}
