import { Badge, Chip, TextField } from "@seed-design/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRef, useState, type ReactNode } from "react";
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
import { parseDialogue } from "./domain/dialogue";
import {
  buildFocusQueue,
  buildStudyQueue,
  buildTestQueue,
  moveReviewedCardToBack,
  startQueueAt,
  updateFocusQueue,
} from "./domain/scheduler";
import {
  blankTerm,
  isSpecificTestContext,
  scoreAnswer,
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
    <header className="app-header">
      <div className="header-row">
        {onBack ? (
          <button
            className="icon-button"
            onClick={onBack}
            aria-label="뒤로 가기"
          >
            ←
          </button>
        ) : (
          <div className="brand-mark">W</div>
        )}
        <div className="header-copy">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && <div className="header-action">{action}</div>}
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
}: {
  cards: VocabularyCard[];
  onNavigate: (page: Page) => void;
  onStart: (mode: "study" | "focus-study" | "test") => void;
  onOpenCard: (card: VocabularyCard) => void;
}) {
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
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  return (
    <>
      <AppHeader title="Wordseed" subtitle="오늘도 문맥으로 기억해요" />
      <main className="screen home-screen">
        <section className="hero-card">
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

        <div className="mode-grid">
          <button className="mode-card study" onClick={() => onStart("study")}>
            <span className="mode-icon">▤</span>
            <span>
              <b>학습 모드</b>
              <small>전체 카드를 보며 익혀요</small>
            </span>
            <span>›</span>
          </button>
          <button
            className="mode-card unknown"
            disabled={!focusCount}
            onClick={() => onStart("focus-study")}
          >
            <span className="mode-icon">!</span>
            <span>
              <b>몰랐어요 · 헷갈려요 학습</b>
              <small>{focusCount}개를 집중해서 반복해요</small>
            </span>
            <span>›</span>
          </button>
          <button className="mode-card test" onClick={() => onStart("test")}>
            <span className="mode-icon">✎</span>
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
          className="full-button"
        >
          ＋ 새 단어 추가
        </ActionButton>

        <section className="section-block">
          <div className="section-heading">
            <h2>최근 단어</h2>
            <button onClick={() => onNavigate("library")}>전체 보기</button>
          </div>
          <div className="compact-list">
            {recent.map((card) => (
              <button
                key={card.id}
                onClick={() => onOpenCard(card)}
                className="compact-row"
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
      <main className="screen add-screen">
        <section className="input-section">
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

        <div className="divider-label">
          <span>또는</span>
        </div>

        <section className={`photo-drop ${image ? "has-image" : ""}`}>
          {image ? (
            <img src={image} alt="선택한 학습 자료 미리보기" />
          ) : (
            <div className="photo-placeholder">
              <span>▧</span>
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
          <div className="photo-actions">
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
        <div className="sticky-cta">
          <ActionButton
            size="large"
            loading={busy}
            disabled={busy || (!text.trim() && !image)}
            onClick={createCards}
            className="full-button"
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
      <main className="screen candidate-screen">
        <div className="candidate-toolbar">
          <b>{selected.length}개 선택</b>
          <button
            onClick={() =>
              onChange(items.map((item) => ({ ...item, selected: true })))
            }
          >
            전체 선택
          </button>
        </div>
        <div className="candidate-list">
          {items.map((item, index) => (
            <article
              key={`${item.term}-${index}`}
              className={`candidate-card ${item.selected ? "selected" : ""}`}
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
                <div className="candidate-title">
                  <h2>{item.term}</h2>
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
        <div className="sticky-cta candidate-actions">
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
            className="full-button"
          >
            선택한 {selected.length}개 바로 저장
          </ActionButton>
          <ActionButton
            size="large"
            variant="neutralWeak"
            disabled={!selected.length || saving}
            onClick={() => onContinue(selectedDrafts())}
            className="full-button"
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
      const completeTestExamples = (meaning.testExamples ?? []).filter(
        (example) => example.en.trim() && example.answer?.trim(),
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
    <section className="tag-selector">
      <div className="tag-selector-heading">
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
        <div className="tag-create-row">
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
      <div className="tag-options" aria-label={`${label} 선택`}>
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
            { en: "", answer: "", type: "sentence", provenance: "user" },
            { en: "", answer: "", type: "dialogue", provenance: "user" },
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
        { en: "", answer: "", type: "sentence", provenance: "user" },
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
      <main className="screen review-screen">
        {drafts.length > 1 && (
          <section className="batch-tag-editor">
            <TagSelector
              label="모든 카드에 추가할 태그"
              options={availableTags}
              selected={batchTags}
              onChange={setBatchTags}
              onCreate={registerTag}
            />
            <ActionButton
              className="full-button"
              variant="neutralSolid"
              disabled={!batchTags.length}
              onClick={applyTagsToAll}
            >
              선택한 태그 전체 적용
            </ActionButton>
          </section>
        )}
        {drafts.length > 1 && (
          <div className="draft-tabs">
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
          </div>
        )}
        <section className="edit-card">
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
            <div className="source-note">
              <span>✓</span>
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
          <div className="sense-editor-heading">
            <label className="field-label">뜻과 예문</label>
            <ActionButton
              size="small"
              variant="neutralWeak"
              onClick={addMeaning}
            >
              ＋ 뜻 추가
            </ActionButton>
          </div>
          <div className="sense-editor-list">
            {draft.meanings.map((meaning, meaningIndex) => (
              <section className="sense-editor" key={meaningIndex}>
                <div className="label-with-tag">
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
                <div className="field-grid sense-meta-fields">
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
                  <div className="mapped-example-editor" key={exampleIndex}>
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
                <div className="sense-editor-actions">
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
                      className="critical-action"
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
          <section className="test-context-editor">
            <div className="sense-editor-heading">
              <div>
                <label className="field-label">뜻별 시험 문맥</label>
                <p>각 뜻을 독립적으로 테스트할 새 문맥을 준비해요.</p>
              </div>
            </div>
            {draft.meanings.map((meaning, meaningIndex) => (
              <section
                className="test-meaning-editor"
                key={meaning.id ?? meaningIndex}
              >
                <div className="sense-editor-heading">
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
                <div className="test-context-list">
                  {(meaning.testExamples ?? []).map((example, exampleIndex) => (
                    <div className="mapped-example-editor" key={exampleIndex}>
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
                          className="critical-action"
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
          <section className="danger-zone">
            <div>
              <b>카드 삭제</b>
              <p>이 단어와 학습 기록을 단어장에서 삭제해요.</p>
            </div>
            <ActionButton
              variant="ghost"
              className="critical-action"
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
        <div className="review-nav">
          <span className="review-progress" aria-live="polite">
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
    <article className="vocabulary-card">
      <div className="word-topline">
        <div>
          <Badge variant="weak">
            {meaningId ? "이 뜻을 학습 중" : `${card.meanings.length}개 뜻`}
          </Badge>
          <h2>{card.term}</h2>
          {card.tags.length > 0 && (
            <div className="card-tags">
              {card.tags.map((tag) => (
                <Badge key={tag} tone="neutral" variant="weak">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <button
          className="sound-button"
          onClick={() => speak(card.term)}
          aria-label={`${card.term} 발음 듣기`}
        >
          ◖)))
        </button>
      </div>
      <div className="sense-list">
        {visibleMeanings.map((meaning) => (
          <section className="sense-block" key={meaning.id}>
            <div className="meaning-block">
              <div className="sense-meta">
                <small>{resultMeta[meaning.status].label}</small>
                <span>
                  {meaning.partOfSpeech || "word"}
                  {meaning.pronunciation && ` · ${meaning.pronunciation}`}
                </span>
              </div>
              <h3>{meaning.definitionKo || "뜻 미입력"}</h3>
              {meaning.definitionEn && <p>{meaning.definitionEn}</p>}
            </div>
            {meaning.examples.map((example, exampleIndex) => (
              <div className="example-block" key={exampleIndex}>
                <div className="label-with-tag">
                  <small>이 뜻의 예문</small>
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
  const cardRef = useRef<HTMLDivElement>(null);
  const gesture = useRef({ startX: 0, startY: 0, x: 0, startedAt: 0 });
  const [dragX, setDragX] = useState(0);
  const [settling, setSettling] = useState(false);
  const sameCardCount = items.findIndex(
    (candidate) => candidate.card.id !== item.card.id,
  );
  const layerCount = Math.min(
    3,
    sameCardCount === -1 ? items.length : sameCardCount,
  );
  const nextItem = items[1];
  const previousItem = items.at(-1);
  const nextCardStarts = nextItem && nextItem.card.id !== item.card.id;
  const nextMeaningInCard = nextItem && nextItem.card.id === item.card.id;
  const revealProgress = Math.min(1, Math.max(0, -dragX) / 180);
  const stackOffset = 16;

  const reset = () => {
    setSettling(true);
    setDragX(0);
    window.setTimeout(() => setSettling(false), 220);
  };
  const complete = (direction: "next" | "previous") => {
    setSettling(true);
    setDragX(
      (direction === "next" ? -1 : 1) * Math.max(window.innerWidth, 520),
    );
    window.setTimeout(() => {
      onNavigate(direction);
    }, 220);
  };

  return (
    <div
      className="swipe-stack"
      aria-label={`${item.card.term} 카드, 좌우로 밀어 이전 또는 다음 뜻 보기`}
    >
      {Array.from(
        { length: Math.max(0, layerCount - (nextMeaningInCard ? 2 : 1)) },
        (_, index) => (
        <div
          className="swipe-stack-layer"
          key={index}
          style={{
            transform: `translateY(${(index + 2) * stackOffset}px) scale(${1 - (index + 2) * 0.03})`,
            zIndex: layerCount - index,
          }}
          aria-hidden="true"
        />
        ),
      )}
      {nextMeaningInCard && (
        <div
          className="incoming-card next-meaning"
          style={{
            transform: `translate3d(0, ${stackOffset * (1 - revealProgress)}px, 0) scale(${0.97 + revealProgress * 0.03})`,
          }}
          aria-hidden="true"
        >
          <VocabularyCardView
            card={nextItem.card}
            meaningId={nextItem.meaning.id}
          />
        </div>
      )}
      {nextCardStarts && (
        <div
          className="incoming-card"
          style={{
            transform: `translate3d(calc(100% + ${Math.min(0, dragX)}px), 0, 0)`,
          }}
          aria-hidden="true"
        >
          <VocabularyCardView
            card={nextItem.card}
            meaningId={nextItem.meaning.id}
          />
        </div>
      )}
      {previousItem && items.length > 1 && (
        <div
          className="incoming-card previous"
          style={{
            transform: `translate3d(calc(-100% + ${Math.max(0, dragX)}px), 0, 0)`,
          }}
          aria-hidden="true"
        >
          <VocabularyCardView
            card={previousItem.card}
            meaningId={previousItem.meaning.id}
          />
        </div>
      )}
      <div
        ref={cardRef}
        className={`swipe-card${settling ? " settling" : ""}`}
        style={{
          transform: `translate3d(${dragX}px, 0, 0) rotate(${dragX / 28}deg)`,
          opacity: Math.max(0.45, 1 - Math.abs(dragX) / 700),
        }}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          cardRef.current?.setPointerCapture(event.pointerId);
          gesture.current = {
            startX: event.clientX,
            startY: event.clientY,
            x: event.clientX,
            startedAt: performance.now(),
          };
          setSettling(false);
        }}
        onPointerMove={(event) => {
          if (!cardRef.current?.hasPointerCapture(event.pointerId)) return;
          const deltaX = event.clientX - gesture.current.startX;
          const deltaY = event.clientY - gesture.current.startY;
          if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10)
            return;
          gesture.current.x = event.clientX;
          setDragX(deltaX);
        }}
        onPointerUp={(event) => {
          if (!cardRef.current?.hasPointerCapture(event.pointerId)) return;
          cardRef.current.releasePointerCapture(event.pointerId);
          const elapsed = Math.max(
            1,
            performance.now() - gesture.current.startedAt,
          );
          const velocity =
            (gesture.current.x - gesture.current.startX) / elapsed;
          if (dragX < -90 || velocity < -0.55) complete("next");
          else if (dragX > 90 || velocity > 0.55) complete("previous");
          else reset();
        }}
        onPointerCancel={reset}
      >
        <VocabularyCardView
          card={item.card}
          meaningId={showAllMeanings ? undefined : item.meaning.id}
        />
      </div>
    </div>
  );
}

type SessionMode = "study" | "focus-study" | "test" | "card";

function DialoguePrompt({ prompt }: { prompt: string }) {
  const turns = parseDialogue(prompt);
  if (turns.length < 2) return <p className="test-prompt">{prompt}</p>;
  return (
    <div className="chat-thread" aria-label="두 화자의 대화">
      {turns.map((turn, index) => (
        <div
          className={`chat-turn ${index % 2 ? "speaker-two" : "speaker-one"}`}
          key={`${turn.speaker}-${index}`}
        >
          <small>{turn.speaker}</small>
          <p>{turn.message}</p>
        </div>
      ))}
    </div>
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
        <main className="screen">
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

  const validTestExamples = meaning.testExamples.filter((example) =>
    isSpecificTestContext(example.en, example.answer),
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
    setGraded(undefined);
    setSessionItems((items) => moveReviewedCardToBack(items, updated));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const navigateWithoutRating = (direction: "next" | "previous") => {
    setAnswer("");
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
      <main className={`screen session-screen ${mode}`}>
        {mode !== "test" ? (
          <SwipeableCardStack
            key={meaning.id}
            item={item}
            items={sessionItems}
            onNavigate={navigateWithoutRating}
          />
        ) : testExample ? (
          <article className="test-card">
            <Badge tone="informative" variant="weak">
              {testExample.type === "dialogue" ? "대화 빈칸" : "새 문맥 빈칸"}
            </Badge>
            {testExample.type === "dialogue" ? (
              <DialoguePrompt prompt={prompt} />
            ) : (
              <p className="test-prompt">{prompt}</p>
            )}
            {testExample.ko && (
              <p className="test-translation">{testExample.ko}</p>
            )}
            <label className="field-label" htmlFor="test-answer">
              빈칸에 들어갈 단어
            </label>
            <TextField.Root size="large">
              <TextField.Input
                id="test-answer"
                aria-label="빈칸에 들어갈 단어"
                value={answer}
                disabled={Boolean(graded)}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && answer.trim() && !graded)
                    gradeTest();
                }}
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                placeholder="정답 입력"
              />
            </TextField.Root>
            {graded && (
              <div className={`answer-result ${graded}`}>
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
          </article>
        ) : (
          <EmptyState
            title="시험 문제를 준비하지 못했어요"
            description="카드 수정에서 구체적인 시험 문맥을 두 개 이상 추가해 주세요."
          />
        )}
      </main>
      {mode !== "test" ? (
        <div className="rating-bar">
          {(["unknown", "confusing", "correct"] as ReviewResult[]).map(
            (result) => (
              <button
                key={result}
                className={result}
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
          <div className="sticky-cta test-cta">
            {graded ? (
              <ActionButton
                size="large"
                onClick={() => void commitTest()}
                className="full-button"
              >
                다음 문제
              </ActionButton>
            ) : (
              <ActionButton
                size="large"
                disabled={!answer.trim()}
                onClick={gradeTest}
                className="full-button"
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ReviewResult>("all");
  const [tagFilter, setTagFilter] = useState("all");
  const importRef = useRef<HTMLInputElement>(null);
  const tags = Array.from(new Set(cards.flatMap((card) => card.tags))).sort(
    (a, b) => a.localeCompare(b, "ko"),
  );
  const filtered = cards.filter(
    (card) =>
      (filter === "all" ||
        card.meanings.some((meaning) => meaning.status === filter)) &&
      (tagFilter === "all" || card.tags.includes(tagFilter)) &&
      `${card.term} ${card.meanings.map((item) => item.definitionKo).join(" ")} ${card.tags.join(" ")}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );

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
      />
      <main className="screen library-screen">
        <TextField.Root>
          <TextField.Input
            aria-label="단어 또는 뜻 검색"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="단어 또는 뜻 검색"
          />
        </TextField.Root>
        <div className="filter-chips">
          {(["all", "unknown", "confusing", "correct"] as const).map(
            (value) => (
              <Chip.Root
                key={value}
                size="small"
                variant={filter === value ? "solid" : "outlineStrong"}
                onClick={() => setFilter(value)}
              >
                <Chip.Label>
                  {value === "all" ? "전체" : resultMeta[value].label}
                </Chip.Label>
              </Chip.Root>
            ),
          )}
        </div>
        {tags.length > 0 && (
          <section className="tag-filter">
            <b>태그</b>
            <div className="filter-chips">
              <Chip.Root
                size="small"
                variant={tagFilter === "all" ? "solid" : "outlineStrong"}
                onClick={() => setTagFilter("all")}
              >
                <Chip.Label>전체 태그</Chip.Label>
              </Chip.Root>
              {tags.map((tag) => (
                <Chip.Root
                  key={tag}
                  size="small"
                  variant={tagFilter === tag ? "solid" : "outlineStrong"}
                  onClick={() => setTagFilter(tag)}
                >
                  <Chip.Label>#{tag}</Chip.Label>
                </Chip.Root>
              ))}
            </div>
          </section>
        )}
        <div className="library-actions">
          <ActionButton
            variant="neutralWeak"
            size="small"
            onClick={() => void download()}
          >
            JSON 내보내기
          </ActionButton>
          <ActionButton
            variant="neutralWeak"
            size="small"
            onClick={() => importRef.current?.click()}
          >
            가져오기
          </ActionButton>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(event) => void restore(event.target.files?.[0])}
          />
        </div>
        <div className="word-list">
          {filtered.map((card, index) => (
            <article key={card.id} className="word-row">
              <button
                className="word-row-main"
                onClick={() => onOpen(filtered, index)}
              >
                <div>
                  <div className="word-row-title">
                    <h2>{card.term}</h2>
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
                    <div className="word-row-tags">
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
  const [page, setPage] = useState<Page>("home");
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

  const navigate = (next: Page) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="app-shell">
      {page === "home" && (
        <HomeScreen
          cards={cards}
          onNavigate={navigate}
          onStart={start}
          onOpenCard={openCard}
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
