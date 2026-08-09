import { Badge, Chip, Flex, Icon, Menu, TextField } from "@seed-design/react";
import {
  IconArrowLeftLine,
  IconArrowClockwiseCircularLine,
  IconChevronDownSmallLine,
  IconDot3HorizontalLine,
} from "@karrotmarket/react-monochrome-icon";
import { useLiveQuery } from "dexie-react-hooks";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { Checkbox } from "seed-design/ui/checkbox";
import {
  db,
  deleteCard,
  exportDatabase,
  getAllCards,
  importDatabase,
  normalizeTags,
  recordReview,
  saveDraft,
} from "./data/db";
import {
  buildFocusQueue,
  buildStudyQueue,
  buildTestQueue,
  moveReviewedCardToBack,
  startQueueAt,
  updateFocusQueue,
} from "./domain/scheduler";
import {
  answerWordPlaceholder,
  blankTerm,
  isSpecificTestContext,
  scoreAnswer,
  splitAroundAnswer,
} from "./domain/scoring";
import type {
  CardDraft,
  DraftExample,
  DraftMeaning,
  ExtractedCandidate,
  Provenance,
  ReviewResult,
  StudyItem,
  VocabularyCard,
} from "./domain/types";
import { enrichText, extractImage } from "./services/ai";

type Page =
  | "home"
  | "add"
  | "candidates"
  | "review"
  | "study"
  | "focus-study"
  | "test"
  | "library"
  | "card";

const PRIMARY_PAGE_PATHS: Partial<Record<Page, string>> = {
  home: "/",
  add: "/add",
  library: "/library",
};

function pageFromPathname(pathname: string): Page {
  if (pathname === "/library") return "library";
  if (pathname === "/add") return "add";
  return "home";
}

const resultMeta: Record<
  ReviewResult,
  { label: string; tone: "critical" | "warning" | "positive" }
> = {
  unknown: { label: "몰랐어요", tone: "critical" },
  confusing: { label: "헷갈려요", tone: "warning" },
  correct: { label: "알고있어요", tone: "positive" },
};

function getCardStatus(card: VocabularyCard): ReviewResult {
  if (card.meanings.some((meaning) => meaning.status === "unknown"))
    return "unknown";
  if (card.meanings.some((meaning) => meaning.status === "confusing"))
    return "confusing";
  return "correct";
}

function preferredEnglishVoice(voices: SpeechSynthesisVoice[]) {
  const englishVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en"),
  );
  return englishVoices.sort((left, right) => {
    const score = (voice: SpeechSynthesisVoice) => {
      const name = voice.name.toLowerCase();
      return (
        (voice.lang.toLowerCase() === "en-us" ? 100 : 0) +
        (/samantha|alex|google us english|aria|jenny|guy/.test(name) ? 20 : 0) +
        (voice.localService ? 2 : 0)
      );
    };
    return score(right) - score(left);
  })[0];
}

function speak(term: string) {
  if (!("speechSynthesis" in window)) return;
  const synthesis = window.speechSynthesis;
  let started = false;
  const start = () => {
    if (started) return;
    const voice = preferredEnglishVoice(synthesis.getVoices());
    if (!voice) {
      window.alert(
        "이 기기에 영어 음성이 설치되어 있지 않아요. 기기 설정에서 영어(미국) 음성을 추가해 주세요.",
      );
      return;
    }
    started = true;
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.82;
    synthesis.speak(utterance);
  };
  if (synthesis.getVoices().length) {
    start();
    return;
  }
  const handleVoicesChanged = () => {
    window.clearTimeout(fallbackTimer);
    start();
  };
  synthesis.addEventListener("voiceschanged", handleVoicesChanged, {
    once: true,
  });
  const fallbackTimer = window.setTimeout(() => {
    synthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    start();
  }, 500);
}

function AppHeader({
  title,
  subtitle,
  onBack,
  action,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--seed-color-stroke-neutral-subtle)] bg-[color-mix(in_srgb,var(--seed-color-bg-layer-default)_92%,transparent)] px-5 pt-[calc(14px+var(--seed-safe-area-top))] pb-3.5 backdrop-blur-[18px] min-[700px]:rounded-t-[30px] min-[700px]:pt-3.5">
      <div className="flex min-h-12 items-center gap-3">
        {onBack ? (
          <ActionButton
            variant="neutralWeak"
            size="medium"
            layout="iconOnly"
            onClick={onBack}
            aria-label="뒤로 가기"
          >
            <Icon svg={<IconArrowLeftLine />} />
          </ActionButton>
        ) : (
          <div className="grid size-10 place-items-center rounded-[14px] bg-[var(--seed-color-bg-brand-solid)] text-xl font-extrabold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--seed-color-bg-brand-solid)_28%,transparent)]">
            W
          </div>
        )}
        <div className="min-w-0">
          <h1 className="m-0 text-[length:var(--seed-font-size-t7)] leading-[var(--seed-line-height-t7)] tracking-[-.03em]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 mb-0 text-[length:var(--seed-font-size-t3)] text-[var(--seed-color-fg-neutral-subtle)]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </div>
    </header>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">🌱</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

function HomeScreen({
  cards,
  onNavigate,
  onStart,
  onOpenCard,
  onStartTag,
}: {
  cards: VocabularyCard[];
  onNavigate: (page: Page) => void;
  onStart: (mode: "study" | "focus-study" | "test") => void;
  onOpenCard: (card: VocabularyCard) => void;
  onStartTag: (tag: string) => void;
}) {
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
                onClick={() => onNavigate("add")}
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
  const testableCount = buildTestQueue(cards, () => 0.5).length;
  const recent = cards
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
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
            onClick={() => onStart("study")}
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
            onClick={() => onStart("focus-study")}
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
            onClick={() => onStart("test")}
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-[var(--seed-color-bg-informative-weak)] text-[23px] text-[var(--seed-color-fg-informative)]">
              ✎
            </span>
            <span>
              <b>시험 모드</b>
              <small>시험 가능 {testableCount}개 · 빈칸에 직접 입력해요</small>
            </span>
            <span>›</span>
          </button>
        </div>

        <ActionButton
          size="large"
          onClick={() => onNavigate("add")}
          className="w-full justify-center"
        >
          ＋ 새 단어 추가
        </ActionButton>

        <section className="mt-7">
          <div className="mb-2.5 flex items-center justify-between [&_h2]:m-0 [&_h2]:text-[length:var(--seed-font-size-t5)] [&_button]:min-h-11 [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:font-bold [&_button]:text-[var(--seed-color-fg-brand)]">
            <h2>최근 단어</h2>
            <button onClick={() => onNavigate("library")}>전체 보기</button>
          </div>
          <div
            className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pt-1 pb-3 [scroll-padding-inline:20px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="최근 단어"
          >
            {recent.map((card) => (
              <button
                key={card.id}
                onClick={() => onOpenCard(card)}
                className="flex min-h-[142px] w-[184px] shrink-0 snap-start cursor-pointer flex-col items-start justify-between rounded-[20px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 text-left text-inherit shadow-[0_5px_18px_rgba(0,0,0,.045)] active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)] [&_b]:block [&_b]:text-[length:var(--seed-font-size-t6)] [&_span]:block [&_div>span]:mt-1.5 [&_div>span]:line-clamp-2 [&_div>span]:leading-[1.4] [&_div>span]:text-[var(--seed-color-fg-neutral-subtle)]"
              >
                <div>
                  <b>{card.term}</b>
                  <span>{card.meanings[0]?.definitionKo || "뜻 미입력"}</span>
                </div>
                <Badge
                  tone={resultMeta[getCardStatus(card)].tone}
                  variant="weak"
                >
                  {resultMeta[getCardStatus(card)].label}
                </Badge>
              </button>
            ))}
          </div>
        </section>

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
                  onClick={() => onStartTag(tag)}
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

function AddScreen({
  onBack,
  onDrafts,
  onCandidates,
  notify,
}: {
  onBack: () => void;
  onDrafts: (drafts: CardDraft[]) => void;
  onCandidates: (candidates: ExtractedCandidate[]) => void;
  notify: (message: string) => void;
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const photoLibraryRef = useRef<HTMLInputElement>(null);

  const readImage = (file?: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024)
      return notify("8MB 이하의 이미지를 선택해 주세요.");
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const createCards = async () => {
    if (!text.trim() && !image)
      return notify("단어나 사진을 먼저 추가해 주세요.");
    setBusy(true);
    try {
      if (image) {
        try {
          onCandidates(await extractImage(image));
        } catch (error) {
          notify(
            error instanceof Error
              ? error.message
              : "사진 분석에 실패했어요. 다시 시도해 주세요.",
          );
        }
      } else {
        try {
          onDrafts(await enrichText(text));
        } catch (error) {
          notify(
            error instanceof Error
              ? error.message
              : "AI 카드 생성에 실패했어요. 다시 시도해 주세요.",
          );
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AppHeader
        title="단어 추가"
        subtitle="자료를 그대로 가져오고, 빈칸만 AI가 채워요"
        onBack={onBack}
      />
      <main className="min-h-[calc(100vh-84px)] p-5 pb-[172px]">
        <section className="[&_textarea]:min-h-[132px]">
          <label className="field-label" htmlFor="vocabulary-input">
            단어 또는 표현
          </label>
          <TextField.Root size="large">
            <TextField.Textarea
              id="vocabulary-input"
              aria-label="단어 또는 표현"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={"예: induce\nThe policy may induce companies..."}
            />
          </TextField.Root>
          <p className="field-help">
            문장을 함께 넣으면 그 문맥의 뜻을 가장 먼저 정리해요. 생성 후 바로
            저장하거나 내용을 검토할 수 있어요.
          </p>
        </section>

        <div className="my-[26px] flex items-center gap-3 text-[length:var(--seed-font-size-t2)] text-[var(--seed-color-fg-neutral-subtle)] before:h-px before:flex-1 before:bg-[var(--seed-color-stroke-neutral-subtle)] before:content-[''] after:h-px after:flex-1 after:bg-[var(--seed-color-stroke-neutral-subtle)] after:content-['']">
          <span>또는</span>
        </div>

        <section
          className={`overflow-hidden rounded-3xl border-[1.5px] p-[18px] text-center ${image ? "border-solid border-[var(--seed-color-stroke-neutral-weak)] bg-[var(--seed-color-bg-layer-default)]" : "border-dashed border-[var(--seed-color-stroke-neutral-weak)] bg-[var(--seed-color-bg-layer-fill)]"} [&>img]:block [&>img]:h-[230px] [&>img]:w-full [&>img]:rounded-2xl [&>img]:object-cover`}
        >
          {image ? (
            <img src={image} alt="선택한 학습 자료 미리보기" />
          ) : (
            <div className="px-2.5 pt-6 pb-[18px] [&_b]:block [&_b]:text-[length:var(--seed-font-size-t5)] [&_p]:mt-1.5 [&_p]:mb-0 [&_p]:text-[var(--seed-color-fg-neutral-subtle)]">
              <span className="mx-auto mb-3.5 grid size-14 place-items-center rounded-[18px] bg-[var(--seed-color-bg-brand-weak)] text-[28px] text-[var(--seed-color-fg-brand)]">
                ▧
              </span>
              <b>교재나 노트를 촬영해 보세요</b>
              <p>한 장에 여러 단어가 있어도 괜찮아요.</p>
            </div>
          )}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(event) => readImage(event.target.files?.[0])}
          />
          <input
            ref={photoLibraryRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => readImage(event.target.files?.[0])}
          />
          <div className="mt-3.5 flex justify-center gap-2">
            <ActionButton
              variant="neutralWeak"
              onClick={() => cameraRef.current?.click()}
            >
              {image ? "다시 촬영" : "사진 촬영"}
            </ActionButton>
            <ActionButton
              variant="neutralWeak"
              onClick={() => photoLibraryRef.current?.click()}
            >
              사진첩에서 선택
            </ActionButton>
            {image && (
              <ActionButton variant="ghost" onClick={() => setImage(undefined)}>
                삭제
              </ActionButton>
            )}
          </div>
        </section>
        <div className="sticky-cta !bottom-[calc(68px+var(--seed-safe-area-bottom))]">
          <ActionButton
            size="large"
            loading={busy}
            disabled={busy || (!text.trim() && !image)}
            onClick={createCards}
            className="w-full justify-center"
          >
            카드 초안 만들기
          </ActionButton>
        </div>
      </main>
    </>
  );
}

function CandidateScreen({
  items,
  onChange,
  onBack,
  onContinue,
  onSaveImmediately,
}: {
  items: ExtractedCandidate[];
  onChange: (items: ExtractedCandidate[]) => void;
  onBack: () => void;
  onContinue: (drafts: CardDraft[]) => void;
  onSaveImmediately: (drafts: CardDraft[]) => void | Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const selected = items.filter((item) => item.selected);
  const selectedDrafts = () =>
    selected.map((item) => ({
      id: item.id,
      term: item.term,
      meanings: item.meanings,
      tags: item.tags,
    }));
  const toggle = (index: number) =>
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, selected: !item.selected } : item,
      ),
    );
  return (
    <>
      <AppHeader
        title="추출한 단어"
        subtitle={`${items.length}개를 찾았어요. 저장할 단어를 골라 주세요.`}
        onBack={onBack}
      />
      <main className="min-h-[calc(100vh-84px)] p-5 pb-44">
        <div className="mb-2 flex items-center justify-between [&_button]:min-h-11 [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:font-bold [&_button]:text-[var(--seed-color-fg-brand)]">
          <b>{selected.length}개 선택</b>
          <button
            onClick={() =>
              onChange(items.map((item) => ({ ...item, selected: true })))
            }
          >
            전체 선택
          </button>
        </div>
        <div className="grid gap-2.5">
          {items.map((item, index) => (
            <article
              key={`${item.term}-${index}`}
              className={`grid cursor-pointer grid-cols-[28px_1fr] gap-3 rounded-[20px] border p-4 transition-[border-color,background] duration-150 ${item.selected ? "border-[var(--seed-color-stroke-brand-solid)] bg-[var(--seed-color-bg-brand-weak)]" : "border-[var(--seed-color-stroke-neutral-subtle)]"} [&_p]:my-[5px] [&_p]:text-[var(--seed-color-fg-neutral-muted)] [&_small]:text-[var(--seed-color-fg-neutral-subtle)]`}
              onClick={() => toggle(index)}
            >
              <span onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggle(index)}
                  label=""
                  inputProps={{ "aria-label": `${item.term} 선택` }}
                />
              </span>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="m-0 text-[length:var(--seed-font-size-t6)]">
                    {item.term}
                  </h2>
                  <Badge
                    tone={item.confidence > 0.9 ? "positive" : "warning"}
                    variant="weak"
                  >
                    {Math.round(item.confidence * 100)}%
                  </Badge>
                </div>
                <p>{item.meanings[0]?.definitionKo}</p>
                <small>
                  {item.meanings[0]?.provenance === "source"
                    ? "원문 정보"
                    : "AI가 보완"}
                </small>
              </div>
            </article>
          ))}
        </div>
        <div className="sticky-cta grid gap-2">
          <ActionButton
            size="large"
            disabled={!selected.length}
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSaveImmediately(selectedDrafts());
              } finally {
                setSaving(false);
              }
            }}
            className="w-full justify-center"
          >
            선택한 {selected.length}개 바로 저장
          </ActionButton>
          <ActionButton
            size="large"
            variant="neutralWeak"
            disabled={!selected.length || saving}
            onClick={() => onContinue(selectedDrafts())}
            className="w-full justify-center"
          >
            검토 후 저장
          </ActionButton>
        </div>
      </main>
    </>
  );
}

type DraftValidationIssue = { cardIndex: number; message: string };

function validateDrafts(drafts: CardDraft[]): DraftValidationIssue | undefined {
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
    const missingExampleIndex = item.meanings.findIndex(
      (meaning) => !meaning.examples.some((example) => example.en.trim()),
    );
    if (missingExampleIndex >= 0)
      return {
        cardIndex,
        message: `${cardLabel}: 뜻 ${missingExampleIndex + 1}에 예문을 하나 이상 입력해 주세요.`,
      };
    for (const [meaningIndex, meaning] of item.meanings.entries()) {
      const missingTranslationIndex = (meaning.testExamples ?? []).findIndex(
        (example) => !example.ko?.trim(),
      );
      if (missingTranslationIndex >= 0)
        return {
          cardIndex,
          message: `${cardLabel}: 뜻 ${meaningIndex + 1}의 시험용 문맥 ${missingTranslationIndex + 1}에 한국어 해석을 입력해 주세요.`,
        };
      const completeTestExamples = (meaning.testExamples ?? []).filter(
        (example) =>
          example.en.trim() && example.ko?.trim() && example.answer?.trim(),
      );
      if (completeTestExamples.length < 2)
        return {
          cardIndex,
          message: `${cardLabel}: 뜻 ${meaningIndex + 1}의 시험용 문맥이 ${completeTestExamples.length}개예요. 두 개 이상 준비해 주세요.`,
        };
      const invalidTestIndex = (meaning.testExamples ?? []).findIndex(
        (example) => !isSpecificTestContext(example.en, example.answer ?? ""),
      );
      if (invalidTestIndex >= 0)
        return {
          cardIndex,
          message: `${cardLabel}: 뜻 ${meaningIndex + 1}의 시험용 문맥 ${invalidTestIndex + 1}에 정답 구간이 그대로 포함되어야 해요.`,
        };
    }
  }
}

async function saveDrafts(drafts: CardDraft[]) {
  for (const item of drafts) {
    const result = await saveDraft(item);
    if (result.duplicate && !result.saved) {
      const overwrite = window.confirm(
        `‘${item.term}’ 카드가 이미 있어요. 기존 카드를 업데이트할까요?\n취소하면 이 카드는 건너뜁니다.`,
      );
      if (overwrite) await saveDraft(item, true);
    }
  }
}

function ProvenanceTag({ value }: { value: Provenance }) {
  return (
    <Badge
      tone={
        value === "source"
          ? "positive"
          : value === "ai"
            ? "informative"
            : "neutral"
      }
      variant="weak"
    >
      {value === "source"
        ? "원문"
        : value === "ai"
          ? "AI 보완"
          : value === "fallback"
            ? "앱 보완"
            : "직접 입력"}
    </Badge>
  );
}

function TagSelector({
  label,
  options,
  selected,
  onChange,
  onCreate,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
  onCreate: (tag: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [newTag, setNewTag] = useState("");
  const createTag = () => {
    const tag = normalizeTags([newTag])[0];
    if (!tag) return;
    onCreate(tag);
    onChange(normalizeTags([...selected, tag]));
    setNewTag("");
    setCreating(false);
  };
  const toggleTag = (tag: string) =>
    onChange(
      selected.includes(tag)
        ? selected.filter((item) => item !== tag)
        : [...selected, tag],
    );

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between gap-3 [&_.field-label]:m-0">
        <label className="field-label">{label}</label>
        <ActionButton
          size="small"
          variant="neutralWeak"
          onClick={() => setCreating((value) => !value)}
        >
          ＋ 추가
        </ActionButton>
      </div>
      {creating && (
        <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <TextField.Root>
            <TextField.Input
              autoFocus
              aria-label="새 태그 이름"
              value={newTag}
              onChange={(event) => setNewTag(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") createTag();
              }}
              placeholder="새 태그 이름"
            />
          </TextField.Root>
          <ActionButton
            variant="neutralSolid"
            disabled={!newTag.trim()}
            onClick={createTag}
          >
            생성
          </ActionButton>
        </div>
      )}
      <div
        className="my-2.5 mb-3 flex flex-wrap gap-2 [&_p]:my-1 [&_p]:w-full [&_p]:text-[length:var(--seed-font-size-t2)] [&_p]:text-[var(--seed-color-fg-neutral-subtle)]"
        aria-label={`${label} 선택`}
      >
        {options.length ? (
          options.map((tag) => (
            <Chip.Root
              key={tag}
              size="small"
              variant={selected.includes(tag) ? "solid" : "outlineStrong"}
              onClick={() => toggleTag(tag)}
            >
              <Chip.Label>#{tag}</Chip.Label>
            </Chip.Root>
          ))
        ) : (
          <p>아직 생성된 태그가 없어요.</p>
        )}
      </div>
    </section>
  );
}

function ReviewScreen({
  initial,
  initialActive,
  onBack,
  onSaved,
  onDeleted,
  notify,
}: {
  initial: CardDraft[];
  initialActive: number;
  onBack: () => void;
  onSaved: () => void | Promise<void>;
  onDeleted: () => void | Promise<void>;
  notify: (message: string) => void;
}) {
  const [drafts, setDrafts] = useState(initial);
  const [active, setActive] = useState(
    Math.min(Math.max(initialActive, 0), Math.max(initial.length - 1, 0)),
  );
  const [busy, setBusy] = useState(false);
  const [batchTags, setBatchTags] = useState<string[]>([]);
  const [createdTags, setCreatedTags] = useState<string[]>([]);
  const savedCards = useLiveQuery(() => db.cards.toArray(), [], []);
  const draft = drafts[active];
  const availableTags = normalizeTags([
    ...savedCards.flatMap((card) => card.tags),
    ...drafts.flatMap((item) => item.tags ?? []),
    ...createdTags,
  ]).sort((a, b) => a.localeCompare(b, "ko"));
  const registerTag = (tag: string) =>
    setCreatedTags((current) => normalizeTags([...current, tag]));
  const update = (patch: Partial<CardDraft>) =>
    setDrafts((current) =>
      current.map((item, index) =>
        index === active ? { ...item, ...patch } : item,
      ),
    );
  const updateMeaning = (meaningIndex: number, patch: Partial<DraftMeaning>) =>
    update({
      meanings: draft.meanings.map((meaning, index) =>
        index === meaningIndex ? { ...meaning, ...patch } : meaning,
      ),
    });
  const updateExample = (
    meaningIndex: number,
    exampleIndex: number,
    value: string,
  ) => {
    const meaning = draft.meanings[meaningIndex];
    updateMeaning(meaningIndex, {
      examples: meaning.examples.map((example, index) =>
        index === exampleIndex ? { ...example, en: value } : example,
      ),
    });
  };
  const addMeaning = () =>
    update({
      meanings: [
        ...draft.meanings,
        {
          definitionKo: "",
          provenance: "user",
          examples: [{ en: "", type: "sentence", provenance: "user" }],
          acceptedVariants: [draft.term],
          testExamples: [
            {
              en: "",
              ko: "",
              answer: "",
              type: "sentence",
              provenance: "user",
            },
            {
              en: "",
              ko: "",
              answer: "",
              type: "dialogue",
              provenance: "user",
            },
          ],
        },
      ],
    });
  const addExample = (meaningIndex: number) =>
    updateMeaning(meaningIndex, {
      examples: [
        ...draft.meanings[meaningIndex].examples,
        { en: "", type: "sentence", provenance: "user" },
      ],
    });
  const updateTestExample = (
    meaningIndex: number,
    exampleIndex: number,
    patch: Partial<DraftExample>,
  ) =>
    updateMeaning(meaningIndex, {
      testExamples: (draft.meanings[meaningIndex].testExamples ?? []).map(
        (example, index) =>
          index === exampleIndex
            ? { ...example, ...patch, provenance: "user" }
            : example,
      ),
    });
  const addTestExample = (meaningIndex: number) =>
    updateMeaning(meaningIndex, {
      testExamples: [
        ...(draft.meanings[meaningIndex].testExamples ?? []),
        { en: "", ko: "", answer: "", type: "sentence", provenance: "user" },
      ],
    });
  const applyTagsToAll = () => {
    if (!batchTags.length) return notify("적용할 태그를 선택해 주세요.");
    setDrafts((current) =>
      current.map((item) => ({
        ...item,
        tags: normalizeTags([...(item.tags ?? []), ...batchTags]),
      })),
    );
    notify(`${drafts.length}개 카드에 태그를 추가했어요.`);
  };

  const saveAll = async () => {
    const validationIssue = validateDrafts(drafts);
    if (validationIssue) {
      setActive(validationIssue.cardIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
      notify(validationIssue.message);
      return;
    }
    setBusy(true);
    try {
      await saveDrafts(drafts);
      notify(`${drafts.length}개의 카드를 저장했어요.`);
      await onSaved();
    } finally {
      setBusy(false);
    }
  };

  if (!draft) return null;
  return (
    <>
      <AppHeader
        title="카드 검토"
        subtitle={`${active + 1} / ${drafts.length} · 저장 전에 수정할 수 있어요`}
        onBack={onBack}
        action={
          drafts.length > 1 ? (
            <ActionButton
              size="small"
              variant="neutralWeak"
              loading={busy}
              onClick={saveAll}
            >
              모두 저장
            </ActionButton>
          ) : undefined
        }
      />
      <main className="min-h-[calc(100vh-84px)] p-5 pb-[116px]">
        {drafts.length > 1 && (
          <section className="mb-3.5 rounded-[18px] border border-[var(--seed-color-stroke-brand-weak)] bg-[var(--seed-color-bg-brand-weak)] p-4 [&>section]:mt-0">
            <TagSelector
              label="모든 카드에 추가할 태그"
              options={availableTags}
              selected={batchTags}
              onChange={setBatchTags}
              onCreate={registerTag}
            />
            <ActionButton
              className="w-full justify-center"
              variant="neutralSolid"
              disabled={!batchTags.length}
              onClick={applyTagsToAll}
            >
              선택한 태그 전체 적용
            </ActionButton>
          </section>
        )}
        {drafts.length > 1 && (
          <Flex
            className="!gap-2 overflow-x-auto !pt-0.5 !pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0"
            align="center"
          >
            {drafts.map((item, index) => (
              <Chip.Root
                key={`${item.term}-${index}`}
                size="small"
                variant={active === index ? "solid" : "outlineStrong"}
                onClick={() => setActive(index)}
              >
                <Chip.Label>{item.term || index + 1}</Chip.Label>
              </Chip.Root>
            ))}
          </Flex>
        )}
        <section className="rounded-3xl border border-[var(--seed-color-stroke-neutral-subtle)] p-[18px] [&_textarea]:min-h-[76px]">
          {draft.meanings.some(
            (meaning) =>
              meaning.provenance === "source" ||
              meaning.provenance === "ai" ||
              meaning.examples.some(
                (example) =>
                  example.provenance === "source" ||
                  example.provenance === "ai",
              ) ||
              meaning.testExamples?.some(
                (example) =>
                  example.provenance === "source" ||
                  example.provenance === "ai",
              ),
          ) && (
            <div className="flex gap-3 rounded-2xl bg-[var(--seed-color-bg-positive-weak)] p-3.5 text-[var(--seed-color-fg-positive-contrast)] [&_b]:m-0 [&_b]:block [&_p]:mt-[3px] [&_p]:mb-0 [&_p]:text-[length:var(--seed-font-size-t2)]">
              <span className="font-black">✓</span>
              <div>
                <b>원문 정보를 우선했어요</b>
                <p>AI가 보완한 항목은 파란색으로 표시돼요.</p>
              </div>
            </div>
          )}
          <label className="field-label">단어 · 표현</label>
          <TextField.Root>
            <TextField.Input
              aria-label="단어 또는 표현"
              value={draft.term}
              onChange={(event) => update({ term: event.target.value })}
            />
          </TextField.Root>
          <TagSelector
            label="태그"
            options={availableTags}
            selected={draft.tags ?? []}
            onChange={(tags) => update({ tags })}
            onCreate={registerTag}
          />
          <div className="mt-5 flex items-center justify-between gap-3 [&_.field-label]:m-0">
            <label className="field-label">뜻과 예문</label>
            <ActionButton
              size="small"
              variant="neutralWeak"
              onClick={addMeaning}
            >
              ＋ 뜻 추가
            </ActionButton>
          </div>
          <div className="mt-2.5 grid gap-3">
            {draft.meanings.map((meaning, meaningIndex) => (
              <section
                className="rounded-[18px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-fill)] p-4"
                key={meaningIndex}
              >
                <div className="label-with-tag !mt-0">
                  <b>뜻 {meaningIndex + 1}</b>
                  {meaning.provenance && (
                    <ProvenanceTag value={meaning.provenance} />
                  )}
                </div>
                <TextField.Root>
                  <TextField.Textarea
                    aria-label={`뜻 ${meaningIndex + 1}`}
                    value={meaning.definitionKo}
                    onChange={(event) =>
                      updateMeaning(meaningIndex, {
                        definitionKo: event.target.value,
                      })
                    }
                    placeholder="뜻을 입력해 주세요"
                  />
                </TextField.Root>
                <div className="grid grid-cols-2 gap-2.5 [&_.field-label]:mt-3.5">
                  <div>
                    <label className="field-label">이 뜻의 품사</label>
                    <TextField.Root>
                      <TextField.Input
                        aria-label={`뜻 ${meaningIndex + 1}의 품사`}
                        value={meaning.partOfSpeech ?? ""}
                        onChange={(event) =>
                          updateMeaning(meaningIndex, {
                            partOfSpeech: event.target.value,
                          })
                        }
                        placeholder="verb"
                      />
                    </TextField.Root>
                  </div>
                  <div>
                    <label className="field-label">이 뜻의 발음</label>
                    <TextField.Root>
                      <TextField.Input
                        aria-label={`뜻 ${meaningIndex + 1}의 발음`}
                        value={meaning.pronunciation ?? ""}
                        onChange={(event) =>
                          updateMeaning(meaningIndex, {
                            pronunciation: event.target.value,
                          })
                        }
                        placeholder="/tʃɑːrdʒ/"
                      />
                    </TextField.Root>
                  </div>
                </div>
                {meaning.examples.map((example, exampleIndex) => (
                  <div className="mt-4" key={exampleIndex}>
                    <div className="label-with-tag">
                      <small>이 뜻의 예문 {exampleIndex + 1}</small>
                      {example.provenance && (
                        <ProvenanceTag value={example.provenance} />
                      )}
                    </div>
                    <TextField.Root>
                      <TextField.Textarea
                        aria-label={`뜻 ${meaningIndex + 1}의 예문 ${exampleIndex + 1}`}
                        value={example.en}
                        onChange={(event) =>
                          updateExample(
                            meaningIndex,
                            exampleIndex,
                            event.target.value,
                          )
                        }
                        placeholder="이 뜻이 드러나는 예문을 입력해 주세요"
                      />
                    </TextField.Root>
                  </div>
                ))}
                <div className="mt-2 flex justify-between gap-2">
                  <ActionButton
                    size="small"
                    variant="ghost"
                    onClick={() => addExample(meaningIndex)}
                  >
                    ＋ 예문 추가
                  </ActionButton>
                  {draft.meanings.length > 1 && (
                    <ActionButton
                      size="small"
                      variant="ghost"
                      className="!text-[var(--seed-color-fg-critical)]"
                      onClick={() =>
                        update({
                          meanings: draft.meanings.filter(
                            (_, index) => index !== meaningIndex,
                          ),
                        })
                      }
                    >
                      뜻 삭제
                    </ActionButton>
                  )}
                </div>
              </section>
            ))}
          </div>
          <section className="mt-[18px] border-t border-[var(--seed-color-stroke-neutral-subtle)] pt-[18px]">
            <div className="flex items-start justify-between gap-3 [&_.field-label]:m-0 [&_p]:mt-[5px] [&_p]:mb-0 [&_p]:text-[length:var(--seed-font-size-t2)] [&_p]:leading-[1.45] [&_p]:text-[var(--seed-color-fg-neutral-subtle)]">
              <div>
                <label className="field-label">뜻별 시험 문맥</label>
                <p>각 뜻을 독립적으로 테스트할 새 문맥을 준비해요.</p>
              </div>
            </div>
            {draft.meanings.map((meaning, meaningIndex) => (
              <section className="" key={meaning.id ?? meaningIndex}>
                <div className="mt-5 flex items-center justify-between gap-3 [&_.field-label]:m-0">
                  <b>
                    뜻 {meaningIndex + 1} ·{" "}
                    {meaning.definitionKo || "뜻 미입력"}
                  </b>
                  <ActionButton
                    size="small"
                    variant="neutralWeak"
                    onClick={() => addTestExample(meaningIndex)}
                  >
                    ＋ 문맥 추가
                  </ActionButton>
                </div>
                <div className="grid gap-3.5 [&_textarea]:min-h-[92px]">
                  {(meaning.testExamples ?? []).map((example, exampleIndex) => (
                    <div className="mt-4" key={exampleIndex}>
                      <div className="label-with-tag">
                        <small>
                          {example.type === "dialogue" ? "대화" : "예문"}{" "}
                          {exampleIndex + 1}
                        </small>
                        {example.en && example.provenance && (
                          <ProvenanceTag value={example.provenance} />
                        )}
                      </div>
                      <TextField.Root>
                        <TextField.Textarea
                          aria-label={`시험용 문맥 ${exampleIndex + 1}`}
                          value={example.en}
                          onChange={(event) =>
                            updateTestExample(meaningIndex, exampleIndex, {
                              en: event.target.value,
                            })
                          }
                          placeholder={`${draft.term || "정답 표현"}을 자연스럽게 활용한 새로운 문맥`}
                        />
                      </TextField.Root>
                      <label className="field-label">한국어 해석</label>
                      <TextField.Root>
                        <TextField.Input
                          aria-label={`시험용 문맥 ${exampleIndex + 1}의 한국어 해석`}
                          value={example.ko ?? ""}
                          onChange={(event) =>
                            updateTestExample(meaningIndex, exampleIndex, {
                              ko: event.target.value,
                            })
                          }
                          placeholder="문맥의 자연스러운 한국어 해석"
                        />
                      </TextField.Root>
                      <label className="field-label">
                        빈칸 처리할 정답 구간
                      </label>
                      <TextField.Root>
                        <TextField.Input
                          aria-label={`시험용 문맥 ${exampleIndex + 1}의 정답 구간`}
                          value={example.answer ?? ""}
                          onChange={(event) =>
                            updateTestExample(meaningIndex, exampleIndex, {
                              answer: event.target.value,
                            })
                          }
                          placeholder="예: had a technician repair"
                        />
                      </TextField.Root>
                      {(meaning.testExamples ?? []).length > 2 && (
                        <ActionButton
                          size="small"
                          variant="ghost"
                          className="!text-[var(--seed-color-fg-critical)]"
                          onClick={() =>
                            updateMeaning(meaningIndex, {
                              testExamples: (meaning.testExamples ?? []).filter(
                                (_, index) => index !== exampleIndex,
                              ),
                            })
                          }
                        >
                          문맥 삭제
                        </ActionButton>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </section>
        </section>
        {draft.id && (
          <section className="mt-5 flex items-center justify-between gap-4 rounded-[18px] border border-[var(--seed-color-stroke-critical-weak)] bg-[var(--seed-color-bg-critical-weak)] p-4 [&_b]:m-0 [&_b]:block [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-[length:var(--seed-font-size-t2)] [&_p]:leading-[1.4] [&_p]:text-[var(--seed-color-fg-neutral-subtle)]">
            <div>
              <b>카드 삭제</b>
              <p>이 단어와 학습 기록을 단어장에서 삭제해요.</p>
            </div>
            <ActionButton
              variant="ghost"
              className="!text-[var(--seed-color-fg-critical)]"
              aria-label={`${draft.term} 카드 삭제`}
              onClick={async () => {
                if (!window.confirm(`‘${draft.term}’ 카드를 삭제할까요?`))
                  return;
                await deleteCard(draft.id!);
                notify(`‘${draft.term}’ 카드를 삭제했어요.`);
                await onDeleted();
              }}
            >
              삭제
            </ActionButton>
          </section>
        )}
        <div className="fixed bottom-0 left-1/2 z-12 grid w-[min(520px,100%)] -translate-x-1/2 grid-cols-[auto_minmax(82px,.35fr)_1fr] items-center gap-2.5 border-t border-[var(--seed-color-stroke-neutral-subtle)] bg-[color-mix(in_srgb,var(--seed-color-bg-layer-default)_94%,transparent)] px-5 pt-3 pb-[calc(12px+var(--seed-safe-area-bottom))] backdrop-blur-[18px]">
          <span
            className="min-w-[42px] text-center text-[length:var(--seed-font-size-t2)] font-bold text-[var(--seed-color-fg-neutral-subtle)]"
            aria-live="polite"
          >
            {active + 1} / {drafts.length}
          </span>
          <ActionButton
            variant="neutralWeak"
            disabled={active === 0}
            onClick={() => setActive((value) => value - 1)}
          >
            이전
          </ActionButton>
          {active < drafts.length - 1 ? (
            <ActionButton
              variant="neutralSolid"
              onClick={() => setActive((value) => value + 1)}
            >
              다음 카드
            </ActionButton>
          ) : (
            <ActionButton loading={busy} onClick={saveAll}>
              모두 저장
            </ActionButton>
          )}
        </div>
      </main>
    </>
  );
}

function VocabularyCardView({
  card,
  meaningId,
}: {
  card: VocabularyCard;
  meaningId?: string;
}) {
  const visibleMeanings = meaningId
    ? card.meanings.filter((meaning) => meaning.id === meaningId)
    : card.meanings;
  return (
    <article className="rounded-[28px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-6 shadow-[0_8px_30px_rgba(0,0,0,.07)]">
      <div className="flex items-start justify-between pb-5 [&_h2]:mt-2.5 [&_h2]:mb-0.5 [&_h2]:text-[38px] [&_h2]:leading-none [&_h2]:tracking-[-.04em] [&_p]:mt-2 [&_p]:mb-0 [&_p]:text-[var(--seed-color-fg-neutral-subtle)]">
        <div>
          <h2>{card.term}</h2>
          {card.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <Badge key={tag} tone="neutral" variant="weak">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <button
          className="grid size-12 cursor-pointer place-items-center rounded-full border-0 bg-[var(--seed-color-bg-neutral-inverted)] text-[var(--seed-color-fg-neutral-inverted)]"
          onClick={() => speak(card.term)}
          aria-label={`${card.term} 발음 듣기`}
        >
          ◖)))
        </button>
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
            </div>
            {meaning.examples.map((example, exampleIndex) => (
              <div
                className="border-t border-[var(--seed-color-stroke-neutral-subtle)] py-5 [&_small]:font-extrabold [&_small]:tracking-[.04em] [&_small]:text-[var(--seed-color-fg-brand)] [&>p]:mt-3 [&>p]:mb-2 [&>p]:text-[length:var(--seed-font-size-t5)] [&>p]:leading-[1.55] [&>span]:leading-[1.5] [&>span]:text-[var(--seed-color-fg-neutral-subtle)]"
                key={exampleIndex}
              >
                <div className="label-with-tag">
                  <small>예문</small>
                  {example.provenance && (
                    <ProvenanceTag value={example.provenance} />
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

function SwipeableCardStack({
  item,
  items,
  showAllMeanings = false,
  onNavigate,
}: {
  item: StudyItem;
  items: StudyItem[];
  showAllMeanings?: boolean;
  onNavigate: (direction: "next" | "previous") => void;
}) {
  const navigationPending = useRef(false);
  const [viewportRef, emblaApi] = useEmblaCarousel({
    active: items.length > 1,
    align: "center",
    containScroll: false,
    dragFree: false,
    duration: 24,
    skipSnaps: false,
    startIndex: 1,
    watchDrag: (_api, event) =>
      !(event.target as HTMLElement).closest("button"),
  });
  const sameCardCount = items.findIndex(
    (candidate) => candidate.card.id !== item.card.id,
  );
  const layerCount = Math.min(
    3,
    sameCardCount === -1 ? items.length : sameCardCount,
  );
  const stackOffset = 16;
  const slides = [items.at(-1) ?? item, item, items[1] ?? item];

  useEffect(() => {
    if (!emblaApi) return;
    const handleSelect = () => {
      const selectedIndex = emblaApi.selectedScrollSnap();
      if (selectedIndex === 1 || navigationPending.current) return;
      navigationPending.current = true;
      onNavigate(selectedIndex === 2 ? "next" : "previous");
    };
    emblaApi.on("select", handleSelect);
    return () => {
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi, onNavigate]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({ startIndex: 1 });
    emblaApi.scrollTo(1, true);
    navigationPending.current = false;
  }, [emblaApi, item.meaning.id]);

  return (
    <div
      className="relative -mx-5 isolate px-5 pb-12"
      aria-label={`${item.card.term} 카드, 좌우로 밀어 이전 또는 다음 뜻 보기`}
    >
      {Array.from({ length: Math.max(0, layerCount - 1) }, (_, index) => (
        <div
          className="absolute inset-x-5 top-0 bottom-12 origin-bottom rounded-[28px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] shadow-[0_10px_28px_rgba(0,0,0,.07)]"
          key={index}
          style={{
            transform: `translateY(${(index + 1) * stackOffset}px) scale(${1 - (index + 1) * 0.03})`,
            zIndex: layerCount - index,
          }}
          aria-hidden="true"
        />
      ))}
      <div
        ref={viewportRef}
        className="relative z-5 overflow-hidden touch-pan-y"
      >
        <div className="-ml-5 flex cursor-grab select-none active:cursor-grabbing">
          {slides.map((slide, index) => (
            <div
              className="min-w-0 flex-[0_0_100%] pl-5"
              key={`${index}-${slide.meaning.id}`}
              aria-hidden={index !== 1}
            >
              <VocabularyCardView
                card={slide.card}
                meaningId={showAllMeanings ? undefined : slide.meaning.id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type SessionMode = "study" | "focus-study" | "test" | "card";

function InlineTestPrompt({
  text,
  expectedAnswer,
  answer,
  revealStage,
  disabled,
  onAnswerChange,
  onSubmit,
}: {
  text: string;
  expectedAnswer: string;
  answer: string;
  revealStage: 0 | 1 | 2;
  disabled: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
}) {
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

function SessionScreen({
  mode,
  items,
  onBack,
  onEdit,
  notify,
}: {
  mode: SessionMode;
  items: StudyItem[];
  onBack: () => void;
  onEdit?: (card: VocabularyCard) => void;
  notify: (message: string) => void;
}) {
  const [sessionItems, setSessionItems] = useState(items);
  const [answer, setAnswer] = useState("");
  const [revealStage, setRevealStage] = useState<0 | 1 | 2>(0);
  const [graded, setGraded] = useState<ReviewResult>();
  const [testTurns, setTestTurns] = useState<Record<string, number>>({});
  const item = sessionItems[0];
  const card = item?.card;
  const meaning = item?.meaning;
  const title =
    mode === "test"
      ? "시험 모드"
      : mode === "card"
        ? "단어 카드"
        : mode === "focus-study"
          ? "몰랐어요 · 헷갈려요 학습"
          : "학습 모드";

  if (!item || !card || !meaning)
    return (
      <>
        <AppHeader title={title} onBack={onBack} />
        <main className="min-h-[calc(100vh-84px)] p-5">
          <EmptyState
            title={
              mode === "test"
                ? "시험 가능한 카드가 없어요"
                : mode === "focus-study"
                  ? "집중 학습할 단어가 없어요"
                  : "학습할 단어가 없어요"
            }
            description={
              mode === "test"
                ? "저장된 카드에 구체적인 시험용 새 문맥이 없어요. 단어장에서 카드를 열고 수정해 문맥을 두 개 이상 추가해 주세요."
                : mode === "focus-study"
                  ? "몰랐어요 또는 헷갈려요로 표시한 카드가 생기면 여기서 집중 학습할 수 있어요."
                  : "단어를 추가한 뒤 다시 시작해 주세요."
            }
            action={<ActionButton onClick={onBack}>돌아가기</ActionButton>}
          />
        </main>
      </>
    );

  const validTestExamples = meaning.testExamples.filter(
    (example) =>
      example.ko.trim() && isSpecificTestContext(example.en, example.answer),
  );
  const testTurn = testTurns[meaning.id] ?? 0;
  const testExample =
    mode === "test"
      ? validTestExamples[testTurn % validTestExamples.length]
      : undefined;
  const testAnswer = testExample?.answer ?? "";
  const prompt = testExample ? blankTerm(testExample.en, testAnswer) : "";
  const rotate = (updated: StudyItem) => {
    setAnswer("");
    setRevealStage(0);
    setGraded(undefined);
    setSessionItems((items) => moveReviewedCardToBack(items, updated));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const navigateWithoutRating = (direction: "next" | "previous") => {
    setAnswer("");
    setRevealStage(0);
    setGraded(undefined);
    setSessionItems((current) =>
      direction === "next"
        ? [...current.slice(1), current[0]]
        : [current.at(-1)!, ...current.slice(0, -1)],
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submitStudy = async (result: ReviewResult) => {
    const updated = await recordReview(item, "study", result);
    if (mode === "focus-study") {
      setAnswer("");
      setGraded(undefined);
      setSessionItems((items) => updateFocusQueue(items, updated));
      notify(
        result === "correct"
          ? "알고있어요 · 집중 목록에서 제외"
          : `${resultMeta[result].label}`,
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      notify(`${resultMeta[result].label}`);
      rotate(updated);
    }
  };
  const gradeTest = () =>
    setGraded(scoreAnswer(answer, [testAnswer, ...meaning.acceptedVariants]));
  const commitTest = async () => {
    if (!graded) return;
    const updated = await recordReview(item, "test", graded, {
      prompt,
      submittedAnswer: answer,
    });
    setTestTurns((turns) => ({ ...turns, [meaning.id]: testTurn + 1 }));
    rotate(updated);
  };

  return (
    <>
      <AppHeader
        title={title}
        subtitle={
          mode === "card"
            ? `${card.meanings.length}개 뜻`
            : `${sessionItems.length}개 뜻`
        }
        onBack={onBack}
        action={
          mode === "card" && onEdit ? (
            <ActionButton
              size="small"
              variant="neutralWeak"
              onClick={() => onEdit(card)}
              aria-label={`${card.term} 카드 수정`}
            >
              ✎ 수정
            </ActionButton>
          ) : undefined
        }
      />
      <main
        className={`min-h-[calc(100vh-84px)] bg-[var(--seed-color-bg-layer-basement)] p-5 pb-[130px] ${mode}`}
      >
        {mode !== "test" ? (
          <SwipeableCardStack
            item={item}
            items={sessionItems}
            onNavigate={navigateWithoutRating}
          />
        ) : testExample ? (
          <article className="flex min-h-[440px] flex-col overflow-hidden rounded-[28px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] shadow-[0_8px_30px_rgba(0,0,0,.07)]">
            <div className="flex flex-1 flex-col justify-center p-6">
              <InlineTestPrompt
                text={testExample.en}
                expectedAnswer={testAnswer}
                answer={answer}
                revealStage={revealStage}
                disabled={Boolean(graded)}
                onAnswerChange={setAnswer}
                onSubmit={gradeTest}
              />
              <p className="m-0 text-[length:var(--seed-font-size-t5)] leading-[1.55] font-light mb-5">
                {testExample.ko}
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
                  <Badge tone={resultMeta[graded].tone}>
                    {resultMeta[graded].label}
                  </Badge>
                  <p>
                    문맥의 정답은 <strong>{testAnswer}</strong>예요.
                  </p>
                  <span>
                    학습 표현: {card.term} · {meaning.definitionKo}
                  </span>
                </div>
              )}
            </div>
          </article>
        ) : (
          <EmptyState
            title="시험 문제를 준비하지 못했어요"
            description="카드 수정에서 구체적인 시험 문맥을 두 개 이상 추가해 주세요."
          />
        )}
      </main>
      {mode !== "test" ? (
        <div className="fixed bottom-0 left-1/2 z-12 grid w-[min(520px,100%)] -translate-x-1/2 grid-cols-3 gap-2 border-t border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] px-3.5 pt-3 pb-[calc(12px+var(--seed-safe-area-bottom))] [&_button]:min-h-[68px] [&_button]:cursor-pointer [&_button]:rounded-[18px] [&_button]:border-0 [&_b]:block [&_b]:text-[length:var(--seed-font-size-t4)] [&_span]:mt-1 [&_span]:block [&_span]:text-[length:var(--seed-font-size-t2)]">
          {(["unknown", "confusing", "correct"] as ReviewResult[]).map(
            (result) => (
              <button
                key={result}
                aria-pressed={meaning.status === result}
                className={`${
                  result === "unknown"
                    ? "bg-[var(--seed-color-bg-critical-weak)] text-[var(--seed-color-fg-critical-contrast)]"
                    : result === "confusing"
                      ? "bg-[var(--seed-color-bg-warning-weak)] text-[var(--seed-color-fg-warning-contrast)]"
                      : "bg-[var(--seed-color-bg-positive-weak)] text-[var(--seed-color-fg-positive-contrast)]"
                } ${meaning.status === result ? "ring-2 ring-inset ring-current" : "opacity-70"}`}
                onClick={() => void submitStudy(result)}
              >
                <b>{resultMeta[result].label}</b>
                <span>
                  {mode === "focus-study" && result === "correct"
                    ? "목록에서 제외"
                    : ""}
                </span>
              </button>
            ),
          )}
        </div>
      ) : mode === "test" ? (
        testExample && (
          <div className="sticky-cta">
            {graded ? (
              <ActionButton
                size="large"
                onClick={() => void commitTest()}
                className="w-full justify-center"
              >
                다음 문제
              </ActionButton>
            ) : (
              <ActionButton
                size="large"
                disabled={!answer.trim()}
                onClick={gradeTest}
                className="w-full justify-center"
              >
                정답 확인
              </ActionButton>
            )}
          </div>
        )
      ) : null}
    </>
  );
}

function cardToDraft(card: VocabularyCard): CardDraft {
  return {
    id: card.id,
    term: card.term,
    meanings: card.meanings.map((meaning) => ({
      id: meaning.id,
      definitionKo: meaning.definitionKo,
      definitionEn: meaning.definitionEn,
      partOfSpeech: meaning.partOfSpeech,
      pronunciation: meaning.pronunciation,
      acceptedVariants: meaning.acceptedVariants,
      examples: meaning.examples.map((example) => ({
        ...example,
        provenance: "user",
      })),
      testExamples: meaning.testExamples.map((example) => ({
        ...example,
        provenance: "user",
      })),
      provenance: "user",
    })),
    tags: card.tags,
  };
}

function LibraryScreen({
  cards,
  onBack,
  onOpen,
  notify,
}: {
  cards: VocabularyCard[];
  onBack: () => void;
  onOpen: (orderedCards: VocabularyCard[], index: number) => void;
  notify: (message: string) => void;
}) {
  const initialParams = new URLSearchParams(window.location.search);
  const initialStatus = initialParams.get("status");
  const [search, setSearch] = useState(() => initialParams.get("q") ?? "");
  const [filter, setFilter] = useState<"all" | ReviewResult>(() =>
    initialStatus === "unknown" ||
    initialStatus === "confusing" ||
    initialStatus === "correct"
      ? initialStatus
      : "all",
  );
  const [tagFilter, setTagFilter] = useState(
    () => initialParams.get("tag") ?? "all",
  );
  const [sort, setSort] = useState<"newest" | "oldest">(() =>
    initialParams.get("sort") === "oldest" ? "oldest" : "newest",
  );
  const importRef = useRef<HTMLInputElement>(null);
  const filtered = cards
    .filter(
      (card) =>
        (filter === "all" ||
          card.meanings.some((meaning) => meaning.status === filter)) &&
        (tagFilter === "all" || card.tags.includes(tagFilter)) &&
        `${card.term} ${card.meanings.map((item) => item.definitionKo).join(" ")} ${card.tags.join(" ")}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
    )
    .sort((left, right) =>
      sort === "newest"
        ? right.createdAt.localeCompare(left.createdAt)
        : left.createdAt.localeCompare(right.createdAt),
    );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
    if (filter !== "all") params.set("status", filter);
    if (tagFilter !== "all") params.set("tag", tagFilter);
    if (search.trim()) params.set("q", search.trim());
    window.history.replaceState(
      { page: "library" },
      "",
      `/library?${params.toString()}`,
    );
  }, [filter, search, sort, tagFilter]);

  const download = async () => {
    const blob = new Blob([await exportDatabase()], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wordseed-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const restore = async (file?: File) => {
    if (!file) return;
    try {
      await importDatabase(await file.text());
      notify("백업을 복원했어요.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "복원하지 못했어요.");
    }
  };

  return (
    <>
      <AppHeader
        title="내 단어"
        subtitle={`전체 ${cards.length}개`}
        onBack={onBack}
        action={
          <Menu.Root size="medium" placement="bottom-end" gutter={6}>
            <Menu.Trigger asChild>
              <ActionButton
                variant="ghost"
                size="medium"
                layout="iconOnly"
                aria-label="단어장 더보기"
              >
                <Icon svg={<IconDot3HorizontalLine />} />
              </ActionButton>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item onClick={() => void download()}>
                  <Menu.ItemLabel>JSON 내보내기</Menu.ItemLabel>
                </Menu.Item>
                <Menu.Item onClick={() => importRef.current?.click()}>
                  <Menu.ItemLabel>가져오기</Menu.ItemLabel>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        }
      />
      <main className="min-h-[calc(100vh-84px)] p-5 pb-[100px]">
        <TextField.Root>
          <TextField.Input
            aria-label="단어 또는 뜻 검색"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="단어 또는 뜻 검색"
          />
        </TextField.Root>
        <Flex
          className="-mx-5 !gap-3 overflow-x-auto !py-3 !pb-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0"
          align="center"
          aria-label="정렬과 필터"
        >
          {(filter !== "all" || tagFilter !== "all") && (
            <Chip.Root
              size="large"
              layout="iconOnly"
              variant="outlineStrong"
              aria-label="필터 초기화"
              onClick={() => {
                setFilter("all");
                setTagFilter("all");
              }}
            >
              <Icon svg={<IconArrowClockwiseCircularLine />} />
            </Chip.Root>
          )}
          <Menu.Root size="medium" placement="bottom-start" gutter={6}>
            <Menu.Trigger asChild>
              <Chip.Root size="large" variant="solid" aria-label="단어 정렬">
                <Chip.Label>
                  {sort === "newest" ? "최신순" : "오래된순"}
                </Chip.Label>
                <Chip.SuffixIcon>
                  <IconChevronDownSmallLine />
                </Chip.SuffixIcon>
              </Chip.Root>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item onClick={() => setSort("newest")}>
                  <Menu.ItemLabel>최신순</Menu.ItemLabel>
                </Menu.Item>
                <Menu.Item onClick={() => setSort("oldest")}>
                  <Menu.ItemLabel>오래된순</Menu.ItemLabel>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
          <Menu.Root size="medium" placement="bottom-start" gutter={6}>
            <Menu.Trigger asChild>
              <Chip.Root
                size="large"
                variant={filter === "all" ? "outlineStrong" : "solid"}
                aria-label="학습 상태"
              >
                <Chip.Label>
                  {filter === "all" ? "학습 상태" : resultMeta[filter].label}
                </Chip.Label>
                <Chip.SuffixIcon>
                  <IconChevronDownSmallLine />
                </Chip.SuffixIcon>
              </Chip.Root>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                {(["unknown", "confusing", "correct"] as const).map((value) => (
                  <Menu.Item key={value} onClick={() => setFilter(value)}>
                    <Menu.ItemLabel>{resultMeta[value].label}</Menu.ItemLabel>
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
          {(["다의어", "비즈니스"] as const).map((tag) => (
            <Chip.Root
              key={tag}
              size="large"
              variant={tagFilter === tag ? "solid" : "outlineStrong"}
              onClick={() => setTagFilter(tagFilter === tag ? "all" : tag)}
            >
              <Chip.Label>#{tag}</Chip.Label>
            </Chip.Root>
          ))}
        </Flex>
        <input
          ref={importRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(event) => void restore(event.target.files?.[0])}
        />
        <div className="grid gap-2.5">
          {filtered.map((card, index) => (
            <article
              key={card.id}
              className="overflow-hidden rounded-[20px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)]"
            >
              <button
                className="grid min-h-[100px] w-full cursor-pointer grid-cols-[1fr_auto] gap-3 border-0 bg-transparent p-4 text-left text-inherit [&>span]:self-center [&>span]:text-2xl [&>span]:text-[var(--seed-color-fg-neutral-subtle)] [&_p]:mt-[7px] [&_p]:mb-1 [&_p]:text-[var(--seed-color-fg-neutral-muted)] [&_small]:text-[var(--seed-color-fg-neutral-subtle)]"
                onClick={() => onOpen(filtered, index)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="m-0 text-[length:var(--seed-font-size-t6)]">
                      {card.term}
                    </h2>
                    <Badge
                      tone={resultMeta[getCardStatus(card)].tone}
                      variant="weak"
                    >
                      {resultMeta[getCardStatus(card)].label}
                    </Badge>
                  </div>
                  <p>
                    {card.meanings
                      .map((meaning) => meaning.definitionKo)
                      .join(" · ")}
                  </p>
                  {card.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 [&_small]:rounded-full [&_small]:bg-[var(--seed-color-bg-neutral-weak)] [&_small]:px-[7px] [&_small]:py-1">
                      {card.tags.map((tag) => (
                        <small key={tag}>#{tag}</small>
                      ))}
                    </div>
                  )}
                </div>
                <span>›</span>
              </button>
            </article>
          ))}
          {!filtered.length && (
            <EmptyState
              title="일치하는 단어가 없어요"
              description="검색어나 필터를 바꿔 보세요."
            />
          )}
        </div>
      </main>
    </>
  );
}

function BottomNav({
  page,
  onNavigate,
}: {
  page: Page;
  onNavigate: (page: Page) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      <button
        className={page === "home" ? "active" : ""}
        onClick={() => onNavigate("home")}
      >
        <span>⌂</span>홈
      </button>
      <button
        className={page === "add" ? "active" : ""}
        onClick={() => onNavigate("add")}
      >
        <span>＋</span>추가
      </button>
      <button
        className={page === "library" ? "active" : ""}
        onClick={() => onNavigate("library")}
      >
        <span>▤</span>단어장
      </button>
    </nav>
  );
}

export default function App() {
  const cards = useLiveQuery(getAllCards, [], []);
  const [page, setPage] = useState<Page>(() =>
    pageFromPathname(window.location.pathname),
  );
  const [drafts, setDrafts] = useState<CardDraft[]>([]);
  const [candidates, setCandidates] = useState<ExtractedCandidate[]>([]);
  const [reviewStartIndex, setReviewStartIndex] = useState(0);
  const [reviewOrigin, setReviewOrigin] = useState<
    "add" | "candidates" | "card"
  >("add");
  const [sessionItems, setSessionItems] = useState<StudyItem[]>([]);
  const [toast, setToast] = useState<string>();
  const toastTimer = useRef<number | undefined>(undefined);
  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(undefined), 8000);
  };

  useEffect(() => {
    const handlePopState = () =>
      setPage(pageFromPathname(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (next: Page) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const path = PRIMARY_PAGE_PATHS[next];
    if (path && window.location.pathname !== path)
      window.history.pushState({ page: next }, "", path);
    setPage(next);
  };
  const start = (mode: "study" | "focus-study" | "test") => {
    const queue =
      mode === "test"
        ? buildTestQueue(cards)
        : mode === "focus-study"
          ? buildFocusQueue(cards)
          : buildStudyQueue(cards);
    setSessionItems(queue);
    navigate(mode);
  };
  const startTag = (tag: string) => {
    setSessionItems(
      buildStudyQueue(cards.filter((card) => card.tags.includes(tag))),
    );
    navigate("study");
  };
  const openOrderedCards = (
    orderedCards: VocabularyCard[],
    startIndex: number,
  ) => {
    const ordered = startQueueAt(orderedCards, startIndex);
    setSessionItems(
      ordered
        .filter((card) => card.meanings.length > 0)
        .flatMap((card) => card.meanings.map((meaning) => ({ card, meaning }))),
    );
    navigate("card");
  };
  const openCard = (card: VocabularyCard) =>
    openOrderedCards(
      cards,
      Math.max(
        0,
        cards.findIndex((item) => item.id === card.id),
      ),
    );
  const editCard = (card: VocabularyCard) => {
    setDrafts([cardToDraft(card)]);
    setReviewStartIndex(0);
    setReviewOrigin("card");
    navigate("review");
  };
  const refreshEditedDeck = async () => {
    const freshCards = await getAllCards();
    const freshById = new Map(freshCards.map((card) => [card.id, card]));
    setSessionItems((current) =>
      current
        .map((item) => {
          const card = freshById.get(item.card.id);
          const meaning = card?.meanings.find(
            (candidate) => candidate.id === item.meaning.id,
          );
          return card && meaning ? { card, meaning } : undefined;
        })
        .filter((item): item is StudyItem => Boolean(item)),
    );
    navigate("card");
  };
  const showNav = ["home", "add", "library"].includes(page);
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[520px] bg-[var(--seed-color-bg-layer-default)] pb-[calc(76px+var(--seed-safe-area-bottom))] shadow-[0_0_40px_rgba(0,0,0,.06)] min-[700px]:min-h-[calc(100vh-48px)] min-[700px]:rounded-[30px]">
      {page === "home" && (
        <HomeScreen
          cards={cards}
          onNavigate={navigate}
          onStart={start}
          onOpenCard={openCard}
          onStartTag={startTag}
        />
      )}
      {page === "add" && (
        <AddScreen
          onBack={() => navigate("home")}
          notify={notify}
          onDrafts={(value) => {
            setDrafts(value);
            setReviewStartIndex(0);
            setReviewOrigin("add");
            navigate("review");
          }}
          onCandidates={(value) => {
            setCandidates(value);
            navigate("candidates");
          }}
        />
      )}
      {page === "candidates" && (
        <CandidateScreen
          items={candidates}
          onChange={setCandidates}
          onBack={() => {
            if (
              candidates.length &&
              !window.confirm(
                "추출한 단어 선택을 종료할까요? 돌아가면 현재 추출 결과가 모두 사라지고 다시 추출해야 해요.",
              )
            )
              return;
            setCandidates([]);
            setDrafts([]);
            navigate("add");
          }}
          onContinue={(value) => {
            setDrafts(value);
            setReviewStartIndex(0);
            setReviewOrigin("candidates");
            navigate("review");
          }}
          onSaveImmediately={async (value) => {
            const validationIssue = validateDrafts(value);
            if (validationIssue) {
              notify(`${validationIssue.message} 검토 화면에서 확인해 주세요.`);
              setDrafts(value);
              setReviewStartIndex(validationIssue.cardIndex);
              setReviewOrigin("candidates");
              navigate("review");
              return;
            }
            await saveDrafts(value);
            notify(`${value.length}개의 카드를 저장했어요.`);
            navigate("home");
          }}
        />
      )}
      {page === "review" && (
        <ReviewScreen
          initial={drafts}
          initialActive={reviewStartIndex}
          onBack={() => {
            if (reviewOrigin === "candidates") {
              let draftIndex = 0;
              setCandidates((current) =>
                current.map((candidate) => {
                  if (!candidate.selected) return candidate;
                  const reviewedDraft = drafts[draftIndex++];
                  return reviewedDraft
                    ? { ...candidate, ...reviewedDraft, selected: true }
                    : candidate;
                }),
              );
              navigate("candidates");
              return;
            }
            navigate(reviewOrigin === "card" ? "card" : "add");
          }}
          onSaved={() =>
            drafts.some((item) => item.id)
              ? refreshEditedDeck()
              : navigate("home")
          }
          onDeleted={() => navigate("library")}
          notify={notify}
        />
      )}
      {(page === "study" ||
        page === "focus-study" ||
        page === "test" ||
        page === "card") && (
        <SessionScreen
          mode={page}
          items={sessionItems}
          onBack={() => navigate(page === "card" ? "library" : "home")}
          onEdit={page === "card" ? editCard : undefined}
          notify={notify}
        />
      )}
      {page === "library" && (
        <LibraryScreen
          cards={cards}
          onBack={() => navigate("home")}
          notify={notify}
          onOpen={openOrderedCards}
        />
      )}
      {showNav && <BottomNav page={page} onNavigate={navigate} />}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
