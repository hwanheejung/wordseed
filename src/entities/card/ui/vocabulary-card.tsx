import { IconSpeakerWave2Line } from "@karrotmarket/react-monochrome-icon";
import { Badge, Icon } from "@seed-design/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import type { ConcealableCardField } from "../types/card";
import type { CardDetailFragment } from "../types/card-fragments";

export function VocabularyCard({
  fragment,
  meaningId,
  onPronounce,
  concealedFields = [],
}: {
  fragment: CardDetailFragment;
  meaningId?: string;
  onPronounce?: (expression: string) => void;
  concealedFields?: ConcealableCardField[];
}) {
  const visibleMeanings = meaningId
    ? fragment.meanings.filter((meaning) => meaning.id === meaningId)
    : fragment.meanings;
  const displayExpression = meaningId
    ? visibleMeanings[0]?.expression || fragment.term
    : fragment.term;

  return (
    <article className="max-h-full overflow-y-auto overscroll-contain rounded-[28px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-6 shadow-[0_8px_30px_rgba(0,0,0,.07)]">
      <div className="flex items-start justify-between pb-5 [&_h2]:mt-2.5 [&_h2]:mb-0.5 [&_h2]:text-[38px] [&_h2]:leading-none [&_h2]:tracking-[-.04em] [&_p]:mt-2 [&_p]:mb-0 [&_p]:text-[var(--seed-color-fg-neutral-subtle)]">
        <div>
          <ConcealedField
            concealed={concealedFields.includes("expression")}
            label="단어·표현"
          >
            <h2>{displayExpression}</h2>
          </ConcealedField>
          {fragment.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {fragment.tags.map((tag) => (
                <Badge key={tag} tone="neutral" variant="weak">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {onPronounce && (
          <button
            className="grid size-12 cursor-pointer place-items-center rounded-full border-0 bg-[var(--seed-color-bg-neutral-inverted)] text-[var(--seed-color-fg-neutral-inverted)]"
            onClick={() => onPronounce(displayExpression)}
            aria-label={`${displayExpression} 발음 듣기`}
          >
            <Icon svg={<IconSpeakerWave2Line />} />
          </button>
        )}
      </div>
      <div className="sense-list">
        {visibleMeanings.map((meaning) => (
          <section className="sense-block" key={meaning.id}>
            <div className="border-t border-[var(--seed-color-stroke-neutral-subtle)] py-5 [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-[length:var(--seed-font-size-t6)] [&_h3]:leading-[1.45] [&>p]:m-0 [&>p]:text-[var(--seed-color-fg-neutral-subtle)] [&_small]:font-extrabold [&_small]:tracking-[.04em] [&_small]:text-[var(--seed-color-fg-brand)]">
              <div className="flex items-center justify-end gap-3 [&_span]:text-[length:var(--seed-font-size-t2)] [&_span]:text-[var(--seed-color-fg-neutral-subtle)]">
                <span className="flex flex-wrap justify-end gap-1">
                  <ConcealedField
                    concealed={concealedFields.includes("partOfSpeech")}
                    label="품사"
                    inline
                  >
                    {meaning.partOfSpeech || "word"}
                  </ConcealedField>
                  {meaning.pronunciation && (
                    <>
                      <span aria-hidden="true">·</span>
                      <ConcealedField
                        concealed={concealedFields.includes("pronunciation")}
                        label="발음"
                        inline
                      >
                        {meaning.pronunciation}
                      </ConcealedField>
                    </>
                  )}
                </span>
              </div>
              <ConcealedField
                concealed={concealedFields.includes("definitionKo")}
                label="한국어 뜻"
              >
                <h3>{meaning.definitionKo || "뜻 미입력"}</h3>
              </ConcealedField>
              {meaning.definitionEn && (
                <ConcealedField
                  concealed={concealedFields.includes("definitionEn")}
                  label="영어 뜻"
                >
                  <p>{meaning.definitionEn}</p>
                </ConcealedField>
              )}
              {((meaning.synonyms?.length ?? 0) > 0 ||
                (meaning.antonyms?.length ?? 0) > 0) && (
                <div className="mt-3 grid gap-2 text-[length:var(--seed-font-size-t2)]">
                  {(meaning.synonyms?.length ?? 0) > 0 && (
                    <ConcealedField
                      concealed={concealedFields.includes("synonyms")}
                      label="동의어"
                    >
                      <p>
                        <strong>SYN</strong> · {meaning.synonyms.join(" · ")}
                      </p>
                    </ConcealedField>
                  )}
                  {(meaning.antonyms?.length ?? 0) > 0 && (
                    <ConcealedField
                      concealed={concealedFields.includes("antonyms")}
                      label="반의어"
                    >
                      <p>
                        <strong>ANT</strong> · {meaning.antonyms.join(" · ")}
                      </p>
                    </ConcealedField>
                  )}
                </div>
              )}
            </div>
            {meaning.examples.map((example, exampleIndex) => (
              <div
                className="border-t border-[var(--seed-color-stroke-neutral-subtle)] py-5 [&_small]:font-extrabold [&_small]:tracking-[.04em] [&_small]:text-[var(--seed-color-fg-brand)] [&>p]:mt-3 [&>p]:mb-2 [&>p]:text-[length:var(--seed-font-size-t5)] [&>p]:leading-[1.55] [&>span]:leading-[1.5] [&>span]:text-[var(--seed-color-fg-neutral-subtle)]"
                key={exampleIndex}
              >
                <div className="flex items-center justify-between gap-3">
                  <small>예문</small>
                  {onPronounce && (
                    <ActionButton
                      size="small"
                      variant="neutralWeak"
                      layout="iconOnly"
                      onClick={() => onPronounce(example.en)}
                      aria-label={`예문 ${exampleIndex + 1} 발음 듣기`}
                    >
                      <Icon svg={<IconSpeakerWave2Line />} />
                    </ActionButton>
                  )}
                </div>
                <ConcealedField
                  concealed={concealedFields.includes("exampleEn")}
                  label={`영어 예문 ${exampleIndex + 1}`}
                >
                  <p>{example.en}</p>
                </ConcealedField>
                {example.ko && (
                  <ConcealedField
                    concealed={concealedFields.includes("exampleKo")}
                    label={`예문 해석 ${exampleIndex + 1}`}
                  >
                    <span>{example.ko}</span>
                  </ConcealedField>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

interface ConcealedFieldProps {
  concealed: boolean;
  label: string;
  inline?: boolean;
  children: ReactNode;
}

type ConcealedFieldState = "concealed" | "revealed" | "splashing";

const TAP_REVEAL_DURATION = 1_500;
const LONG_PRESS_THRESHOLD = 450;
const INK_SPLASH_DURATION = 380;

function ConcealedField({
  concealed,
  label,
  inline = false,
  children,
}: ConcealedFieldProps) {
  const [state, setState] = useState<ConcealedFieldState>("concealed");
  const pressStartedAt = useRef(0);
  const concealTimer = useRef<number | undefined>(undefined);

  const clearConcealTimer = () => {
    if (concealTimer.current !== undefined)
      window.clearTimeout(concealTimer.current);
  };

  const concealWithSplash = () => {
    clearConcealTimer();
    setState("splashing");
    concealTimer.current = window.setTimeout(
      () => setState("concealed"),
      INK_SPLASH_DURATION,
    );
  };

  const reveal = () => {
    clearConcealTimer();
    setState("revealed");
  };

  const scheduleTapConceal = () => {
    clearConcealTimer();
    concealTimer.current = window.setTimeout(
      concealWithSplash,
      TAP_REVEAL_DURATION,
    );
  };

  // Clear the pending concealment timer when this field leaves the DOM.
  useEffect(
    () => () => {
      if (concealTimer.current !== undefined)
        window.clearTimeout(concealTimer.current);
    },
    [],
  );

  if (!concealed) return children;

  const Component = inline ? "span" : "div";
  const Content = inline ? "span" : "div";

  return (
    <Component
      className={`${inline ? "inline-grid align-middle" : "my-1 grid"} relative w-fit max-w-full cursor-pointer touch-manipulation select-none transition-transform duration-150 before:absolute before:-inset-y-2 before:content-[''] active:scale-[.99]`}
      role="button"
      tabIndex={0}
      aria-label={`${label}, 탭하여 잠깐 보기`}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (!event.isPrimary) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        pressStartedAt.current = performance.now();
        reveal();
      }}
      onPointerUp={() => {
        if (performance.now() - pressStartedAt.current < LONG_PRESS_THRESHOLD)
          scheduleTapConceal();
        else concealWithSplash();
      }}
      onPointerCancel={() => {
        clearConcealTimer();
        setState("concealed");
      }}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") reveal();
      }}
      onKeyUp={(event) => {
        if (event.key !== " " && event.key !== "Enter") return;

        clearConcealTimer();
        concealTimer.current = window.setTimeout(
          () => setState("concealed"),
          TAP_REVEAL_DURATION,
        );
      }}
    >
      <Content className={state === "revealed" ? undefined : "invisible"}>
        {children}
      </Content>
      {state !== "revealed" && (
        <span
          aria-hidden="true"
          className={`absolute inset-0 block opacity-90 ${state === "splashing" ? "ink-splat-landing" : ""}`}
        >
          <span className="absolute top-[18%] left-[2%] h-[58%] w-[94%] -rotate-[1.5deg] rounded-[48%_52%_44%_56%/58%_44%_56%_42%] bg-[var(--seed-color-fg-neutral)]" />
          <span className="absolute top-[8%] left-[9%] h-[44%] w-[79%] rotate-[1deg] rounded-[57%_43%_51%_49%/47%_62%_38%_53%] bg-[var(--seed-color-fg-neutral)]" />
          <span className="absolute bottom-[6%] left-[14%] h-[38%] w-[71%] -rotate-[.5deg] rounded-[42%_58%_46%_54%/55%_45%_61%_39%] bg-[var(--seed-color-fg-neutral)]" />
          <span className="absolute top-[6%] left-[3%] size-[18%] rounded-[45%_55%_62%_38%] bg-[var(--seed-color-fg-neutral)]" />
          <span className="absolute right-[1%] bottom-[8%] size-[14%] rounded-[61%_39%_47%_53%] bg-[var(--seed-color-fg-neutral)]" />
          {state === "splashing" && (
            <>
              <span className="ink-splash-drop ink-splash-drop-north-west" />
              <span className="ink-splash-drop ink-splash-drop-north-east" />
              <span className="ink-splash-drop ink-splash-drop-south" />
              <span className="ink-splash-drop ink-splash-drop-oops" />
            </>
          )}
        </span>
      )}
    </Component>
  );
}
