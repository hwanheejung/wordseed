import { Badge } from "@seed-design/react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  type VocabularyCard,
  useCardsQuery,
  useReviewStatsQuery,
} from "@/entities/card";
import {
  getCardStatus,
  reviewResultMeta,
} from "@/entities/card";
import { shouldRecheckMeaning } from "@/features/study-session";
import { buildFillInTheBlankQueue } from "@/features/fill-in-the-blank-test";
import { navigate } from "@/shared/navigation";
import { AppHeader } from "../shared/ui/app-header";
import { EmptyState } from "../shared/ui/empty-state";

export function HomePage() {
  const { cards } = useCardsQuery();
  const reviewStats = useReviewStatsQuery();

  if (!cards.length) {
    return (
      <>
        <AppHeader title="Wordseed" subtitle="오늘도 문맥으로 기억해요" />
        <main className="min-h-[calc(100vh-84px)] p-5">
          <EmptyState
            title="아직 추가된 단어가 없어요"
            description="추가해볼까요?"
            action={
              <ActionButton
                size="small"
                variant="neutralWeak"
                onClick={() => navigate({ page: "add" })}
              >
                단어 추가하기
              </ActionButton>
            }
          />
        </main>
      </>
    );
  }

  const statusCounts = {
    unknown: cards
      .flatMap((card) => card.meanings)
      .filter((meaning) => meaning.status === "unknown").length,
    confusing: cards
      .flatMap((card) => card.meanings)
      .filter((meaning) => meaning.status === "confusing").length,
    correct: cards
      .flatMap((card) => card.meanings)
      .filter((meaning) => meaning.status === "correct").length,
  };
  const focusCount = statusCounts.unknown + statusCounts.confusing;
  const fillInBlankCount = buildFillInTheBlankQueue(cards, () => 0.5).length;
  const recent = cards
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);
  const reviewCandidates = cards
    .flatMap((card) =>
      card.meanings.map((meaning) => ({
        meaning,
        stats: reviewStats[meaning.id],
      })),
    )
    .filter(({ meaning, stats }) => shouldRecheckMeaning(meaning.status, stats))
    .sort((left, right) =>
      right.stats.lastReviewedAt.localeCompare(left.stats.lastReviewedAt),
    )
    .slice(0, 10);
  const tagGroups = Array.from(
    cards.reduce((groups, card) => {
      card.tags.forEach((tag) => {
        const group = groups.get(tag) ?? [];
        group.push(card);
        groups.set(tag, group);
      });

      return groups;
    }, new Map<string, VocabularyCard[]>()),
  )
    .sort(
      ([leftTag, leftCards], [rightTag, rightCards]) =>
        rightCards.length - leftCards.length ||
        leftTag.localeCompare(rightTag, "ko"),
    )
    .slice(0, 10);

  return (
    <>
      <AppHeader title="Wordseed" subtitle="오늘도 문맥으로 기억해요" />
      <main className="min-h-[calc(100vh-84px)] p-5">
        <section className="relative flex justify-between gap-[18px] overflow-hidden rounded-[28px] border border-[var(--seed-color-stroke-brand-weak)] bg-[linear-gradient(135deg,var(--seed-color-bg-brand-weak),#fff8ef)] p-6 after:absolute after:right-[-70px] after:bottom-[-75px] after:size-[150px] after:rounded-full after:border-[28px] after:border-[color-mix(in_srgb,var(--seed-color-bg-brand-solid)_12%,transparent)] after:content-[''] [&_h2]:mt-[18px] [&_h2]:mb-2 [&_h2]:text-[length:var(--seed-font-size-t7)] [&_h2]:leading-[1.28] [&_h2]:tracking-[-.035em] [&_h2_strong]:text-[var(--seed-color-fg-brand)] [&_p]:m-0 [&_p]:text-[length:var(--seed-font-size-t3)] [&_p]:text-[var(--seed-color-fg-neutral-subtle)]">
          <div>
            <Badge tone="brand" variant="weak">
              반복 학습
            </Badge>
            <h2>
              <strong>{cards.length}개</strong>의 단어를
              <br />
              계속 순환해요
            </h2>
            <p>
              몰랐어요 {statusCounts.unknown} · 헷갈려요{" "}
              {statusCounts.confusing} · 알고있어요 {statusCounts.correct}
            </p>
          </div>
        </section>

        <div className="my-4 grid gap-3">
          <button
            className="grid min-h-[86px] w-full cursor-pointer grid-cols-[48px_1fr_auto] items-center gap-3.5 rounded-[22px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 text-left text-[var(--seed-color-fg-neutral)] transition-[transform,background] duration-150 active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] [&_b]:mb-1 [&_b]:block [&_b]:text-[length:var(--seed-font-size-t5)] [&_small]:block [&_small]:text-[var(--seed-color-fg-neutral-subtle)] [&>span:last-child]:text-[28px] [&>span:last-child]:text-[var(--seed-color-fg-neutral-subtle)]"
            onClick={() => navigate({ page: "study" })}
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-[var(--seed-color-bg-positive-weak)] text-[23px] text-[var(--seed-color-fg-positive)]">
              ▤
            </span>
            <span>
              <b>학습 모드</b>
              <small>전체 카드를 보며 익혀요</small>
            </span>
            <span>›</span>
          </button>
          <button
            className="grid min-h-[86px] w-full cursor-pointer grid-cols-[48px_1fr_auto] items-center gap-3.5 rounded-[22px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 text-left text-[var(--seed-color-fg-neutral)] transition-[transform,background] duration-150 active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] disabled:cursor-default disabled:opacity-50 [&_b]:mb-1 [&_b]:block [&_b]:text-[length:var(--seed-font-size-t5)] [&_small]:block [&_small]:text-[var(--seed-color-fg-neutral-subtle)] [&>span:last-child]:text-[28px] [&>span:last-child]:text-[var(--seed-color-fg-neutral-subtle)]"
            disabled={!focusCount}
            onClick={() => navigate({ page: "focus-study" })}
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-[var(--seed-color-bg-critical-weak)] text-[23px] font-black text-[var(--seed-color-fg-critical)]">
              !
            </span>
            <span>
              <b>몰랐어요 · 헷갈려요 학습</b>
              <small>{focusCount}개를 집중해서 반복해요</small>
            </span>
            <span>›</span>
          </button>
          <button
            className="grid min-h-[86px] w-full cursor-pointer grid-cols-[48px_1fr_auto] items-center gap-3.5 rounded-[22px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 text-left text-[var(--seed-color-fg-neutral)] transition-[transform,background] duration-150 active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] [&_b]:mb-1 [&_b]:block [&_b]:text-[length:var(--seed-font-size-t5)] [&_small]:block [&_small]:text-[var(--seed-color-fg-neutral-subtle)] [&>span:last-child]:text-[28px] [&>span:last-child]:text-[var(--seed-color-fg-neutral-subtle)]"
            onClick={() => navigate({ page: "fill-in-the-blank-test" })}
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-[var(--seed-color-bg-informative-weak)] text-[23px] text-[var(--seed-color-fg-informative)]">
              ✎
            </span>
            <span>
              <b>빈칸 채우기</b>
              <small>문제 {fillInBlankCount}개 · 문맥에 맞게 직접 입력해요</small>
            </span>
            <span>›</span>
          </button>
        </div>

        <ActionButton
          size="large"
          onClick={() => navigate({ page: "add" })}
          className="w-full justify-center"
        >
          ＋ 새 단어 추가
        </ActionButton>

        <section className="mt-7">
          <div className="mb-2.5 flex items-center justify-between [&_h2]:m-0 [&_h2]:text-[length:var(--seed-font-size-t5)] [&_button]:min-h-11 [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:font-bold [&_button]:text-[var(--seed-color-fg-brand)]">
            <h2>최근 단어</h2>
            <button onClick={() => navigate({ page: "library" })}>
              전체 보기
            </button>
          </div>
          <div
            className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pt-1 pb-3 [scroll-padding-inline:20px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="최근 단어"
          >
            {recent.map((card) => (
              <button
                key={card.id}
                onClick={() =>
                  navigate({
                    page: "card",
                    cardIds: cards.map((item) => item.id),
                    startIndex: Math.max(
                      0,
                      cards.findIndex((item) => item.id === card.id),
                    ),
                  })
                }
                className="flex min-h-[142px] w-[184px] shrink-0 snap-start cursor-pointer flex-col items-start justify-between rounded-[20px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 text-left text-inherit shadow-[0_5px_18px_rgba(0,0,0,.045)] active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] [&_b]:block [&_b]:text-[length:var(--seed-font-size-t6)] [&_span]:block [&_div>span]:mt-1.5 [&_div>span]:line-clamp-2 [&_div>span]:leading-[1.4] [&_div>span]:text-[var(--seed-color-fg-neutral-subtle)]"
              >
                <div>
                  <b>{card.term}</b>
                  <span>{card.meanings[0]?.definitionKo || "뜻 미입력"}</span>
                </div>
                <Badge
                  tone={reviewResultMeta[getCardStatus(card)].tone}
                  variant="weak"
                >
                  {reviewResultMeta[getCardStatus(card)].label}
                </Badge>
              </button>
            ))}
          </div>
        </section>

        {reviewCandidates.length > 0 && (
          <section className="mt-7">
            <div className="mb-2.5 flex items-center justify-between [&_h2]:m-0 [&_h2]:text-[length:var(--seed-font-size-t5)]">
              <h2>다시 볼 단어</h2>
            </div>
            <div
              className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pt-1 pb-3 [scroll-padding-inline:20px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="다시 볼 단어"
            >
              {reviewCandidates.map(({ meaning, stats }) => (
                <button
                  key={meaning.id}
                  onClick={() =>
                    navigate({ page: "study", meaningId: meaning.id })
                  }
                  className="flex min-h-[142px] w-[184px] shrink-0 snap-start cursor-pointer flex-col items-start justify-between rounded-[20px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 text-left text-inherit shadow-[0_5px_18px_rgba(0,0,0,.045)] active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] [&_b]:block [&_b]:text-[length:var(--seed-font-size-t6)] [&_span]:block [&_div>span]:mt-1.5 [&_div>span]:line-clamp-2 [&_div>span]:leading-[1.4] [&_div>span]:text-[var(--seed-color-fg-neutral-subtle)]"
                >
                  <div>
                    <b>{meaning.expression}</b>
                    <span>{meaning.definitionKo}</span>
                  </div>
                  <Badge tone="warning" variant="weak">
                    어려움 {stats.difficultCount}/{stats.reviewCount}
                  </Badge>
                </button>
              ))}
            </div>
          </section>
        )}

        {tagGroups.length > 0 && (
          <section className="mt-7">
            <div className="mb-2.5 flex items-center justify-between [&_h2]:m-0 [&_h2]:text-[length:var(--seed-font-size-t5)]">
              <h2>태그별 학습</h2>
            </div>
            <div
              className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pt-1 pb-3 [scroll-padding-inline:20px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="태그별 학습"
            >
              {tagGroups.map(([tag, taggedCards]) => (
                <button
                  key={tag}
                  className="flex min-h-[150px] w-[228px] shrink-0 snap-start cursor-pointer flex-col items-start rounded-[20px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-[18px] text-left text-inherit shadow-[0_5px_18px_rgba(0,0,0,.045)] active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] [&_b]:text-[length:var(--seed-font-size-t6)] [&_b]:leading-[1.4] [&>span:last-child]:mt-auto [&>span:last-child]:pt-2.5 [&>span:last-child]:text-[length:var(--seed-font-size-t3)] [&>span:last-child]:text-[var(--seed-color-fg-neutral-subtle)]"
                  onClick={() => navigate({ page: "study", tag })}
                >
                  <b>{tag}</b>
                  <span>{taggedCards.length}개 단어</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
