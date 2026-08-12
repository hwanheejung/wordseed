import { IconSpeakerWave2Line } from "@karrotmarket/react-monochrome-icon";
import { Badge, Icon } from "@seed-design/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import type { ConcealableCardField } from "../types/card";
import type { CardDetailFragment } from "../types/card-fragments";

interface VocabularyCardProps {
  fragment: CardDetailFragment;
  meaningId?: string;
  onPronounce?: (expression: string) => void;
  concealedFields?: ConcealableCardField[];
  footer?: ReactNode;
}

export function VocabularyCard({
  fragment,
  meaningId,
  onPronounce,
  concealedFields = [],
  footer,
}: VocabularyCardProps) {
  const visibleMeanings = meaningId
    ? fragment.meanings.filter((meaning) => meaning.id === meaningId)
    : fragment.meanings;
  const displayExpression = meaningId
    ? visibleMeanings[0]?.expression || fragment.term
    : fragment.term;

  return (
    <article className="max-h-full overflow-y-auto overscroll-contain rounded-[32px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] shadow-[0_18px_55px_rgba(0,0,0,.10),0_2px_8px_rgba(0,0,0,.04)]">
      <header className="relative overflow-hidden px-6 pt-6 pb-7 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-32 before:bg-[radial-gradient(circle_at_18%_0%,color-mix(in_srgb,var(--seed-color-bg-brand-weak)_80%,transparent),transparent_72%)] before:content-['']">
        <div className="relative pr-14">
          {fragment.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {fragment.tags.map((tag) => (
                <Badge key={tag} tone="neutral" variant="weak">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          <ConcealedField
            concealed={concealedFields.includes("expression")}
            label="단어·표현"
          >
            <h2 className="m-0 text-[clamp(2.5rem,10vw,3.25rem)] leading-[.98] font-extrabold tracking-[-.045em] text-[var(--seed-color-fg-neutral)] [font-optical-sizing:auto]">
              {displayExpression}
            </h2>
          </ConcealedField>
        </div>
        {onPronounce && (
          <ActionButton
            className="!absolute !top-6 !right-6 transition-transform duration-100 ease-out active:scale-[.92] motion-reduce:transition-none"
            size="large"
            variant="neutralSolid"
            layout="iconOnly"
            onClick={() => onPronounce(displayExpression)}
            aria-label={`${displayExpression} 발음 듣기`}
          >
            <Icon svg={<IconSpeakerWave2Line />} />
          </ActionButton>
        )}
      </header>
      <div className="px-6 pb-6">
        {visibleMeanings.map((meaning, meaningIndex) => (
          <section
            className={meaningIndex > 0 ? "border-t border-[var(--seed-color-stroke-neutral-subtle)] pt-6" : undefined}
            key={meaning.id}
          >
            <div className="pb-5">
              <div className="mb-3 flex min-h-6 flex-wrap items-center gap-2 text-[length:var(--seed-font-size-t2)] font-semibold text-[var(--seed-color-fg-neutral-subtle)]">
                <span className="rounded-full bg-[var(--seed-color-bg-layer-fill)] px-2.5 py-1">
                  <ConcealedField
                    concealed={concealedFields.includes("partOfSpeech")}
                    label="품사"
                    inline
                  >
                    {meaning.partOfSpeech || "word"}
                  </ConcealedField>
                </span>
                {meaning.pronunciation && (
                  <ConcealedField
                    concealed={concealedFields.includes("pronunciation")}
                    label="발음"
                    inline
                  >
                    {meaning.pronunciation}
                  </ConcealedField>
                )}
              </div>
              <ConcealedField
                concealed={concealedFields.includes("definitionKo")}
                label="한국어 뜻"
              >
                <h3 className="m-0 text-[clamp(1.4rem,5.4vw,1.8rem)] leading-[1.3] font-bold tracking-[-.025em] text-[var(--seed-color-fg-neutral)]">
                  {meaning.definitionKo || "뜻 미입력"}
                </h3>
              </ConcealedField>
              {meaning.definitionEn && (
                <ConcealedField
                  concealed={concealedFields.includes("definitionEn")}
                  label="영어 뜻"
                >
                  <p className="mt-2 mb-0 text-[length:var(--seed-font-size-t4)] leading-[1.55] text-[var(--seed-color-fg-neutral-subtle)]">
                    {meaning.definitionEn}
                  </p>
                </ConcealedField>
              )}
              {((meaning.synonyms?.length ?? 0) > 0 ||
                (meaning.antonyms?.length ?? 0) > 0) && (
                <div className="mt-4 flex flex-wrap gap-2 text-[length:var(--seed-font-size-t2)]">
                  {(meaning.synonyms?.length ?? 0) > 0 && (
                    <ConcealedField
                      concealed={concealedFields.includes("synonyms")}
                      label="동의어"
                    >
                      <p className="m-0 rounded-xl bg-[var(--seed-color-bg-positive-weak)] px-3 py-2 leading-[1.45] text-[var(--seed-color-fg-positive-contrast)]">
                        <strong className="mr-1.5">SYN</strong>
                        {meaning.synonyms.join(" · ")}
                      </p>
                    </ConcealedField>
                  )}
                  {(meaning.antonyms?.length ?? 0) > 0 && (
                    <ConcealedField
                      concealed={concealedFields.includes("antonyms")}
                      label="반의어"
                    >
                      <p className="m-0 rounded-xl bg-[var(--seed-color-bg-critical-weak)] px-3 py-2 leading-[1.45] text-[var(--seed-color-fg-critical-contrast)]">
                        <strong className="mr-1.5">ANT</strong>
                        {meaning.antonyms.join(" · ")}
                      </p>
                    </ConcealedField>
                  )}
                </div>
              )}
            </div>
            {meaning.examples.length > 0 && (
              <div className="mb-6 rounded-[22px] bg-[var(--seed-color-bg-layer-fill)] px-4.5 py-1">
                {meaning.examples.map((example, exampleIndex) => (
                  <div
                    className="py-4.5 not-first:border-t not-first:border-[var(--seed-color-stroke-neutral-subtle)]"
                    key={exampleIndex}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <small className="font-extrabold tracking-[.04em] text-[var(--seed-color-fg-brand)]">
                        예문 {exampleIndex + 1}
                      </small>
                      {onPronounce && (
                        <ActionButton
                          className="transition-transform duration-100 ease-out active:scale-[.9] motion-reduce:transition-none"
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
                      <p className="mt-3 mb-2 text-[length:var(--seed-font-size-t5)] leading-[1.55] font-semibold tracking-[-.01em]">
                        {example.en}
                      </p>
                    </ConcealedField>
                    {example.ko && (
                      <ConcealedField
                        concealed={concealedFields.includes("exampleKo")}
                        label={`예문 해석 ${exampleIndex + 1}`}
                      >
                        <span className="text-[length:var(--seed-font-size-t3)] leading-[1.55] text-[var(--seed-color-fg-neutral-subtle)]">
                          {example.ko}
                        </span>
                      </ConcealedField>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
        {footer}
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
