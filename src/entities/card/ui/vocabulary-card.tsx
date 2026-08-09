import { IconSpeakerWave2Line } from "@karrotmarket/react-monochrome-icon";
import { Badge, Icon } from "@seed-design/react";
import { ActionButton } from "seed-design/ui/action-button";
import type { CardDetailFragment } from "../types/card-fragments";

export function VocabularyCard({
  fragment,
  meaningId,
  onPronounce,
}: {
  fragment: CardDetailFragment;
  meaningId?: string;
  onPronounce?: (expression: string) => void;
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
          <h2>{displayExpression}</h2>
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
                <span>
                  {meaning.partOfSpeech || "word"}
                  {meaning.pronunciation && ` · ${meaning.pronunciation}`}
                </span>
              </div>
              <h3>{meaning.definitionKo || "뜻 미입력"}</h3>
              {meaning.definitionEn && <p>{meaning.definitionEn}</p>}
              {((meaning.synonyms?.length ?? 0) > 0 ||
                (meaning.antonyms?.length ?? 0) > 0) && (
                <div className="mt-3 grid gap-2 text-[length:var(--seed-font-size-t2)]">
                  {(meaning.synonyms?.length ?? 0) > 0 && (
                    <p>
                      <strong>SYN</strong> · {meaning.synonyms.join(" · ")}
                    </p>
                  )}
                  {(meaning.antonyms?.length ?? 0) > 0 && (
                    <p>
                      <strong>ANT</strong> · {meaning.antonyms.join(" · ")}
                    </p>
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
                <p>{example.en}</p>
                {example.ko && <span>{example.ko}</span>}
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
