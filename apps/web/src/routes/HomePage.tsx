import { IconMoonLine } from "@karrotmarket/react-monochrome-icon";
import { Badge, Icon } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  buildTagStudyGroups,
  type CardsQueryInput,
  getMeaningLearningStatus,
  getReviewedCardStatus,
  type ReviewHistoryStats,
  reviewResultMeta,
  type TagStudyGroup,
  TagStudyProgressCard,
  type VocabularyCard,
  useCardsQuery,
  useReviewStatsQuery,
} from "@/entities/card";
import { buildFillInTheBlankQueue } from "@/features/fill-in-the-blank-test";
import { createLibrarySearch } from "@/features/filter-cards";
import { useTagStudyGroupSortPreference } from "@/features/sort-tag-groups";
import { navigate } from "@/shared/navigation";
import {
  applyColorMode,
  readColorMode,
  type ColorMode,
} from "@/shared/utils/color-mode";
import { AppHeader } from "../shared/ui/app-header";
import { EmptyState } from "../shared/ui/empty-state";

const NEW_WORDS_QUERY = {
  statuses: ["unreviewed"],
  sort: "added-desc",
} satisfies CardsQueryInput;
const RECENT_DIFFICULT_WORDS_QUERY = {
  statuses: ["unknown", "confusing"],
  reviewPeriod: "3d",
  sort: "reviewed-desc",
} satisfies CardsQueryInput;
const REVIEW_NOW_QUERY = {
  statuses: ["unknown", "confusing"],
  sort: "reviewed-asc",
} satisfies CardsQueryInput;
const RECENTLY_LEARNED_QUERY = {
  statuses: ["correct"],
  reviewPeriod: "7d",
  sort: "reviewed-desc",
} satisfies CardsQueryInput;
const HOME_CURATION_LIMIT = 10;

export function HomePage() {
  const { cards } = useCardsQuery();
  const { cards: newWords } = useCardsQuery(NEW_WORDS_QUERY);
  const { cards: recentDifficultWords } = useCardsQuery(
    RECENT_DIFFICULT_WORDS_QUERY,
  );
  const { cards: reviewNowWords } = useCardsQuery(REVIEW_NOW_QUERY);
  const { cards: recentlyLearnedWords } = useCardsQuery(
    RECENTLY_LEARNED_QUERY,
  );
  const reviewStats = useReviewStatsQuery();
  const { sort: tagGroupSort } = useTagStudyGroupSortPreference();

  if (!cards.length) {
    return <EmptyHomePage onAdd={() => navigate({ page: "add" })} />;
  }

  const meanings = cards.flatMap((card) => card.meanings);
  const statusCounts = meanings.reduce<MeaningStatusCounts>(
    (counts, meaning) => {
      counts[getMeaningLearningStatus(meaning, reviewStats[meaning.id])] += 1;

      return counts;
    },
    { unreviewed: 0, unknown: 0, confusing: 0, correct: 0 },
  );
  const focusCount = statusCounts.unknown + statusCounts.confusing;
  const fillInBlankCount = buildFillInTheBlankQueue(cards, () => 0.5).length;
  const tagGroups = buildTagStudyGroups(
    cards,
    tagGroupSort,
    reviewStats,
  ).slice(0, 10);
  const cardIds = cards.map((card) => card.id);

  const handleCardSelect = (cardId: string) =>
    navigate({
      page: "card",
      cardIds,
      startIndex: Math.max(0, cardIds.indexOf(cardId)),
    });

  return (
    <>
      <AppHeader
        title="Wordseed"
        subtitle="오늘도 한 단어씩 익혀 봐요"
        action={<ColorModeButton />}
      />
      <main className="min-h-[calc(100vh-84px)] p-5">
        <LearningSummarySection
          cardCount={cards.length}
          statusCounts={statusCounts}
        />
        <StudyActionsSection
          focusCount={focusCount}
          fillInBlankCount={fillInBlankCount}
          onStudyAll={() => navigate({ page: "study" })}
          onStudyFocus={() => navigate({ page: "focus-study" })}
          onFillInBlank={() => navigate({ page: "fill-in-the-blank-test" })}
          onAdd={() => navigate({ page: "add" })}
        />
        <TagStudySection
          groups={tagGroups}
          onSelect={(tag) => navigate({ page: "study", tag })}
          onViewAll={() => navigate({ page: "all-tags" })}
        />
        <CuratedWordsSection
          title="최근 어려웠던 단어"
          cards={recentDifficultWords.slice(0, HOME_CURATION_LIMIT)}
          reviewStats={reviewStats}
          onSelect={handleCardSelect}
          onViewAll={() =>
            navigate({
              page: "library",
              search: createLibrarySearch(RECENT_DIFFICULT_WORDS_QUERY),
            })
          }
        />
        <CuratedWordsSection
          title="지금 복습할 단어"
          cards={reviewNowWords.slice(0, HOME_CURATION_LIMIT)}
          reviewStats={reviewStats}
          onSelect={handleCardSelect}
          onViewAll={() =>
            navigate({
              page: "library",
              search: createLibrarySearch(REVIEW_NOW_QUERY),
            })
          }
        />
        <CuratedWordsSection
          title="새로 추가한 단어"
          cards={newWords.slice(0, HOME_CURATION_LIMIT)}
          reviewStats={reviewStats}
          onSelect={handleCardSelect}
          onViewAll={() =>
            navigate({
              page: "library",
              search: createLibrarySearch(NEW_WORDS_QUERY),
            })
          }
        />
        <CuratedWordsSection
          title="최근 익힌 단어"
          cards={recentlyLearnedWords.slice(0, HOME_CURATION_LIMIT)}
          reviewStats={reviewStats}
          onSelect={handleCardSelect}
          onViewAll={() =>
            navigate({
              page: "library",
              search: createLibrarySearch(RECENTLY_LEARNED_QUERY),
            })
          }
        />
      </main>
    </>
  );
}

interface EmptyHomePageProps {
  onAdd: () => void;
}

function EmptyHomePage({ onAdd }: EmptyHomePageProps) {
  return (
    <>
      <AppHeader
        title="Wordseed"
        subtitle="오늘도 한 단어씩 익혀 봐요"
        action={<ColorModeButton />}
      />
      <main className="min-h-[calc(100vh-84px)] p-5">
        <EmptyState
          title="아직 단어가 없어요"
          description="첫 단어를 추가하고 바로 학습해 보세요."
          action={
            <ActionButton size="small" variant="neutralWeak" onClick={onAdd}>
              첫 단어 추가
            </ActionButton>
          }
        />
      </main>
    </>
  );
}

function ColorModeButton() {
  const [mode, setMode] = useState<ColorMode>(readColorMode);

  const handleToggle = () => {
    const nextMode = mode === "light" ? "dark" : "light";
    applyColorMode(nextMode);
    setMode(nextMode);
  };

  return (
    <ActionButton
      variant="ghost"
      size="medium"
      layout="iconOnly"
      aria-label={mode === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      aria-pressed={mode === "dark"}
      onClick={handleToggle}
    >
      <Icon svg={<IconMoonLine />} />
    </ActionButton>
  );
}

interface MeaningStatusCounts {
  unreviewed: number;
  unknown: number;
  confusing: number;
  correct: number;
}

interface LearningSummarySectionProps {
  cardCount: number;
  statusCounts: MeaningStatusCounts;
}

function LearningSummarySection({
  cardCount,
  statusCounts,
}: LearningSummarySectionProps) {
  return (
    <section className="relative flex justify-between gap-[18px] overflow-hidden rounded-[28px] border border-[var(--seed-color-stroke-brand-weak)] bg-[linear-gradient(135deg,var(--seed-color-bg-brand-weak),var(--seed-color-bg-layer-default))] p-6 after:absolute after:right-[-70px] after:bottom-[-75px] after:size-[150px] after:rounded-full after:border-[28px] after:border-[color-mix(in_srgb,var(--seed-color-bg-brand-solid)_12%,transparent)] after:content-[''] [&_h2]:mt-[18px] [&_h2]:mb-2 [&_h2]:text-[length:var(--seed-font-size-t7)] [&_h2]:leading-[1.28] [&_h2]:tracking-[-.035em] [&_h2_strong]:text-[var(--seed-color-fg-brand)] [&_p]:m-0 [&_p]:text-[length:var(--seed-font-size-t3)] [&_p]:text-[var(--seed-color-fg-neutral-subtle)]">
      <div>
        <Badge tone="brand" variant="weak">
          학습 현황
        </Badge>
        <h2>
          단어 <strong>{cardCount}개</strong>를
          <br />
          학습하고 있어요
        </h2>
        <p>
          학습 전 {statusCounts.unreviewed} · 몰랐어요 {statusCounts.unknown} ·
          헷갈려요 {statusCounts.confusing} · 알고 있어요 {statusCounts.correct}
        </p>
      </div>
    </section>
  );
}

interface StudyActionsSectionProps {
  focusCount: number;
  fillInBlankCount: number;
  onStudyAll: () => void;
  onStudyFocus: () => void;
  onFillInBlank: () => void;
  onAdd: () => void;
}

function StudyActionsSection({
  focusCount,
  fillInBlankCount,
  onStudyAll,
  onStudyFocus,
  onFillInBlank,
  onAdd,
}: StudyActionsSectionProps) {
  return (
    <section className="mt-4">
      <div className="grid gap-3">
        <button
          className="grid min-h-[86px] w-full cursor-pointer grid-cols-[48px_1fr_auto] items-center gap-3.5 rounded-[22px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 text-left text-[var(--seed-color-fg-neutral)] transition-[transform,background] duration-150 active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] [&_b]:mb-1 [&_b]:block [&_b]:text-[length:var(--seed-font-size-t5)] [&_small]:block [&_small]:text-[var(--seed-color-fg-neutral-subtle)] [&>span:last-child]:text-[28px] [&>span:last-child]:text-[var(--seed-color-fg-neutral-subtle)]"
          onClick={onStudyAll}
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-[var(--seed-color-bg-positive-weak)] text-[23px] text-[var(--seed-color-fg-positive)]">
            ▤
          </span>
          <span>
            <b>전체 단어 학습</b>
            <small>모든 뜻을 카드로 확인해요</small>
          </span>
          <span>›</span>
        </button>
        <button
          className="grid min-h-[86px] w-full cursor-pointer grid-cols-[48px_1fr_auto] items-center gap-3.5 rounded-[22px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 text-left text-[var(--seed-color-fg-neutral)] transition-[transform,background] duration-150 active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] disabled:cursor-default disabled:opacity-50 [&_b]:mb-1 [&_b]:block [&_b]:text-[length:var(--seed-font-size-t5)] [&_small]:block [&_small]:text-[var(--seed-color-fg-neutral-subtle)] [&>span:last-child]:text-[28px] [&>span:last-child]:text-[var(--seed-color-fg-neutral-subtle)]"
          disabled={!focusCount}
          onClick={onStudyFocus}
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-[var(--seed-color-bg-critical-weak)] text-[23px] font-black text-[var(--seed-color-fg-critical)]">
            !
          </span>
          <span>
            <b>헷갈리는 단어 복습</b>
            <small>다시 볼 단어 {focusCount}개</small>
          </span>
          <span>›</span>
        </button>
        <button
          className="grid min-h-[86px] w-full cursor-pointer grid-cols-[48px_1fr_auto] items-center gap-3.5 rounded-[22px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 text-left text-[var(--seed-color-fg-neutral)] transition-[transform,background] duration-150 active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] [&_b]:mb-1 [&_b]:block [&_b]:text-[length:var(--seed-font-size-t5)] [&_small]:block [&_small]:text-[var(--seed-color-fg-neutral-subtle)] [&>span:last-child]:text-[28px] [&>span:last-child]:text-[var(--seed-color-fg-neutral-subtle)]"
          onClick={onFillInBlank}
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-[var(--seed-color-bg-informative-weak)] text-[23px] text-[var(--seed-color-fg-informative)]">
            ✎
          </span>
          <span>
            <b>빈칸 채우기</b>
            <small>문제 {fillInBlankCount}개 · 문장에 맞는 표현을 입력해요</small>
          </span>
          <span>›</span>
        </button>
      </div>
      <div className="mt-5">
        <ActionButton
          size="large"
          onClick={onAdd}
          className="w-full justify-center"
        >
          ＋ 단어 추가
        </ActionButton>
      </div>
    </section>
  );
}

interface CuratedWordsSectionProps {
  title: string;
  cards: VocabularyCard[];
  reviewStats: Record<string, ReviewHistoryStats>;
  onSelect: (cardId: string) => void;
  onViewAll: () => void;
}

function CuratedWordsSection({
  title,
  cards,
  reviewStats,
  onSelect,
  onViewAll,
}: CuratedWordsSectionProps) {
  if (!cards.length) return null;

  return (
    <section className="mt-7">
      <div className="mb-2.5 flex items-center justify-between [&_h2]:m-0 [&_h2]:text-[length:var(--seed-font-size-t5)] [&_button]:min-h-11 [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:font-bold [&_button]:text-[var(--seed-color-fg-brand)]">
        <h2>{title}</h2>
        <button onClick={onViewAll}>전체 보기</button>
      </div>
      <div
        className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pt-1 pb-3 [scroll-padding-inline:20px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={title}
      >
        {cards.map((card) => {
          const reviewedStatus = getReviewedCardStatus(card, reviewStats);

          return (
            <button
              key={card.id}
              onClick={() => onSelect(card.id)}
              className="flex min-h-[142px] w-[184px] shrink-0 snap-start cursor-pointer flex-col items-start justify-between rounded-[20px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 text-left text-inherit shadow-[0_5px_18px_rgba(0,0,0,.045)] active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] [&_b]:block [&_b]:text-[length:var(--seed-font-size-t6)] [&_span]:block [&_div>span]:mt-1.5 [&_div>span]:line-clamp-2 [&_div>span]:leading-[1.4] [&_div>span]:text-[var(--seed-color-fg-neutral-subtle)]"
            >
              <div>
                <b>{card.term}</b>
                <span>{card.meanings[0]?.definitionKo || "뜻 미입력"}</span>
              </div>
              {reviewedStatus && (
                <Badge
                  tone={reviewResultMeta[reviewedStatus].tone}
                  variant="weak"
                >
                  {reviewResultMeta[reviewedStatus].label}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface TagStudySectionProps {
  groups: TagStudyGroup[];
  onSelect: (tag: string) => void;
  onViewAll: () => void;
}

function TagStudySection({
  groups,
  onSelect,
  onViewAll,
}: TagStudySectionProps) {
  if (!groups.length) return null;

  return (
    <section className="mt-7">
      <div className="mb-2.5 flex items-center justify-between [&_h2]:m-0 [&_h2]:text-[length:var(--seed-font-size-t5)] [&_button]:min-h-11 [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:font-bold [&_button]:text-[var(--seed-color-fg-brand)]">
        <h2>태그별 학습</h2>
        <button onClick={onViewAll}>전체 보기</button>
      </div>
      <div
        className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pt-1 pb-3 [scroll-padding-inline:20px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="태그별 학습"
      >
        {groups.map((group) => (
          <div key={group.tag} className="w-[184px] shrink-0 snap-start">
            <TagStudyProgressCard group={group} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </section>
  );
}
