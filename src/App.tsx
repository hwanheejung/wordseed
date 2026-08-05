import { Badge, Chip, TextField } from "@seed-design/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRef, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { Checkbox } from "seed-design/ui/checkbox";
import { ProgressCircle } from "seed-design/ui/progress-circle";
import { buildReviewQueue } from "./domain/scheduler";
import { blankTerm, scoreAnswer } from "./domain/scoring";
import type { CardDraft, ExtractedCandidate, ReviewResult, VocabularyCard } from "./domain/types";
import { db, exportDatabase, importDatabase, recordReview, saveDraft } from "./data/db";
import { demoPhotoCandidates, enrichText, extractImage, manualDraft } from "./services/ai";

type Page = "home" | "add" | "candidates" | "review" | "study" | "test" | "library";

const resultMeta: Record<ReviewResult, { label: string; next: string; tone: "critical" | "warning" | "positive" }> = {
  unknown: { label: "몰랐어요", next: "5분 후", tone: "critical" },
  confusing: { label: "헷갈려요", next: "12시간 후", tone: "warning" },
  correct: { label: "맞혔어요", next: "다음 단계", tone: "positive" },
};

const INITIAL_NOW = Date.now();
const INITIAL_TODAY = new Date(INITIAL_NOW).toISOString().slice(0, 10);

function formatDue(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return "복습할 시간이에요";
  if (diff < 86_400_000) return `${Math.max(1, Math.ceil(diff / 3_600_000))}시간 후`;
  return `${Math.ceil(diff / 86_400_000)}일 후`;
}

function speak(term: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(term);
  utterance.lang = "en-US";
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

function AppHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <header className="app-header">
      <div className="header-row">
        {onBack ? <button className="icon-button" onClick={onBack} aria-label="뒤로 가기">←</button> : <div className="brand-mark">W</div>}
        <div className="header-copy">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">🌱</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

function HomeScreen({ cards, onNavigate, onStart }: { cards: VocabularyCard[]; onNavigate: (page: Page) => void; onStart: (mode: "study" | "test") => void }) {
  const dueCount = cards.filter((card) => !card.isNew && new Date(card.nextReviewAt).getTime() <= INITIAL_NOW).length;
  const newCount = cards.filter((card) => card.isNew).length;
  const reviewedToday = cards.filter((card) => card.lastReviewedAt?.slice(0, 10) === INITIAL_TODAY).length;
  const recent = cards.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

  return (
    <>
      <AppHeader title="Wordseed" subtitle="오늘도 문맥으로 기억해요" />
      <main className="screen home-screen">
        <section className="hero-card">
          <div>
            <Badge tone="brand" variant="weak">오늘의 학습</Badge>
            <h2><strong>{dueCount + Math.min(newCount, 10)}개</strong>의 단어가<br />기다리고 있어요</h2>
            <p>복습 {dueCount} · 새 단어 {Math.min(newCount, 10)}</p>
          </div>
          <div className="hero-progress" aria-label={`오늘 ${reviewedToday}개 학습`}>
            <ProgressCircle value={Math.min(100, reviewedToday * 10)} size="40" />
            <span>{reviewedToday}</span>
          </div>
        </section>

        <div className="mode-grid">
          <button className="mode-card study" onClick={() => onStart("study")}>
            <span className="mode-icon">▤</span><span><b>학습 모드</b><small>전체 카드를 보며 익혀요</small></span><span>›</span>
          </button>
          <button className="mode-card test" onClick={() => onStart("test")}>
            <span className="mode-icon">✎</span><span><b>시험 모드</b><small>빈칸에 직접 입력해요</small></span><span>›</span>
          </button>
        </div>

        <ActionButton size="large" onClick={() => onNavigate("add")} className="full-button">＋ 새 단어 추가</ActionButton>

        <section className="section-block">
          <div className="section-heading"><h2>최근 단어</h2><button onClick={() => onNavigate("library")}>전체 보기</button></div>
          <div className="compact-list">
            {recent.map((card) => (
              <button key={card.id} onClick={() => onNavigate("library")} className="compact-row">
                <div><b>{card.term}</b><span>{card.meanings[0]?.definitionKo || "뜻 미입력"}</span></div>
                <Badge tone={resultMeta[card.status].tone} variant="weak">{resultMeta[card.status].label}</Badge>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function AddScreen({ onBack, onDrafts, onCandidates, notify }: { onBack: () => void; onDrafts: (drafts: CardDraft[]) => void; onCandidates: (candidates: ExtractedCandidate[]) => void; notify: (message: string) => void }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readImage = (file?: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return notify("8MB 이하의 이미지를 선택해 주세요.");
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const createCards = async () => {
    if (!text.trim() && !image) return notify("단어나 사진을 먼저 추가해 주세요.");
    setBusy(true);
    try {
      if (image) {
        try {
          onCandidates(await extractImage(image));
        } catch {
          notify("AI 연결 전이라 데모 추출 결과를 보여드려요.");
          onCandidates(demoPhotoCandidates);
        }
      } else {
        try {
          onDrafts(await enrichText(text));
        } catch {
          notify("AI 연결 없이 직접 편집할 수 있는 카드를 만들었어요.");
          onDrafts([manualDraft(text)]);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AppHeader title="단어 추가" subtitle="자료를 그대로 가져오고, 빈칸만 AI가 채워요" onBack={onBack} />
      <main className="screen add-screen">
        <section className="input-section">
          <label className="field-label" htmlFor="vocabulary-input">단어 또는 표현</label>
          <TextField.Root size="large">
            <TextField.Textarea id="vocabulary-input" aria-label="단어 또는 표현" value={text} onChange={(event) => setText(event.target.value)} placeholder={'예: induce\nThe policy may induce companies...'} />
          </TextField.Root>
          <p className="field-help">문장을 함께 넣으면 그 문맥의 뜻을 가장 먼저 정리해요.</p>
        </section>

        <div className="divider-label"><span>또는</span></div>

        <section className={`photo-drop ${image ? "has-image" : ""}`}>
          {image ? <img src={image} alt="선택한 학습 자료 미리보기" /> : <div className="photo-placeholder"><span>▧</span><b>교재나 노트를 촬영해 보세요</b><p>한 장에 여러 단어가 있어도 괜찮아요.</p></div>}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(event) => readImage(event.target.files?.[0])} />
          <div className="photo-actions">
            <ActionButton variant="neutralWeak" onClick={() => fileRef.current?.click()}>{image ? "사진 바꾸기" : "사진 촬영 · 선택"}</ActionButton>
            {image && <ActionButton variant="ghost" onClick={() => setImage(undefined)}>삭제</ActionButton>}
          </div>
        </section>
        <div className="sticky-cta"><ActionButton size="large" loading={busy} disabled={busy || (!text.trim() && !image)} onClick={createCards} className="full-button">카드 만들기</ActionButton></div>
      </main>
    </>
  );
}

function CandidateScreen({ initial, onBack, onContinue }: { initial: ExtractedCandidate[]; onBack: () => void; onContinue: (drafts: CardDraft[]) => void }) {
  const [items, setItems] = useState(initial);
  const selected = items.filter((item) => item.selected);
  const toggle = (index: number) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, selected: !item.selected } : item));
  return (
    <>
      <AppHeader title="추출한 단어" subtitle={`${items.length}개를 찾았어요. 저장할 단어를 골라 주세요.`} onBack={onBack} />
      <main className="screen candidate-screen">
        <div className="candidate-toolbar"><b>{selected.length}개 선택</b><button onClick={() => setItems((current) => current.map((item) => ({ ...item, selected: true })))}>전체 선택</button></div>
        <div className="candidate-list">
          {items.map((item, index) => (
            <article key={`${item.term}-${index}`} className={`candidate-card ${item.selected ? "selected" : ""}`} onClick={() => toggle(index)}>
              <span onClick={(event) => event.stopPropagation()}>
                <Checkbox checked={item.selected} onCheckedChange={() => toggle(index)} label="" inputProps={{ "aria-label": `${item.term} 선택` }} />
              </span>
              <div><div className="candidate-title"><h2>{item.term}</h2><Badge tone={item.confidence > 0.9 ? "positive" : "warning"} variant="weak">{Math.round(item.confidence * 100)}%</Badge></div><p>{item.meanings[0]?.definitionKo}</p><small>{item.meanings[0]?.provenance === "source" ? "원문 정보" : "AI가 보완"}</small></div>
            </article>
          ))}
        </div>
        <div className="sticky-cta"><ActionButton size="large" disabled={!selected.length} onClick={() => onContinue(selected.map((item) => ({ term: item.term, acceptedVariants: item.acceptedVariants, partOfSpeech: item.partOfSpeech, pronunciation: item.pronunciation, meanings: item.meanings, synonyms: item.synonyms, antonyms: item.antonyms, examples: item.examples, sourceText: item.sourceText, sourceLabel: item.sourceLabel })))} className="full-button">선택한 {selected.length}개 검토하기</ActionButton></div>
      </main>
    </>
  );
}

function ProvenanceTag({ value }: { value: "source" | "ai" | "user" }) {
  return <Badge tone={value === "source" ? "positive" : value === "ai" ? "informative" : "neutral"} variant="weak">{value === "source" ? "원문" : value === "ai" ? "AI 보완" : "직접 입력"}</Badge>;
}

function ReviewScreen({ initial, onBack, onSaved, notify }: { initial: CardDraft[]; onBack: () => void; onSaved: () => void; notify: (message: string) => void }) {
  const [drafts, setDrafts] = useState(initial);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const draft = drafts[active];
  const update = (patch: Partial<CardDraft>) => setDrafts((current) => current.map((item, index) => index === active ? { ...item, ...patch } : item));
  const updateMeaning = (value: string) => update({ meanings: [{ ...(draft.meanings[0] ?? { provenance: "user" as const }), definitionKo: value }] });
  const updateExample = (value: string) => update({ examples: value ? [{ ...(draft.examples[0] ?? { type: "sentence" as const, provenance: "user" as const }), en: value }] : [] });

  const saveAll = async () => {
    if (drafts.some((item) => !item.term.trim() || !item.meanings[0]?.definitionKo.trim())) return notify("모든 카드에 단어와 뜻을 입력해 주세요.");
    setBusy(true);
    try {
      for (const item of drafts) {
        const result = await saveDraft(item);
        if (result.duplicate && !result.saved) {
          const overwrite = window.confirm(`‘${item.term}’ 카드가 이미 있어요. 기존 카드를 업데이트할까요?\n취소하면 이 카드는 건너뜁니다.`);
          if (overwrite) await saveDraft(item, true);
        }
      }
      notify(`${drafts.length}개의 카드를 저장했어요.`);
      onSaved();
    } finally { setBusy(false); }
  };

  if (!draft) return null;
  return (
    <>
      <AppHeader title="카드 검토" subtitle={`${active + 1} / ${drafts.length} · 저장 전에 수정할 수 있어요`} onBack={onBack} />
      <main className="screen review-screen">
        {drafts.length > 1 && <div className="draft-tabs">{drafts.map((item, index) => <Chip.Root key={`${item.term}-${index}`} size="small" variant={active === index ? "solid" : "outlineStrong"} onClick={() => setActive(index)}><Chip.Label>{item.term || index + 1}</Chip.Label></Chip.Root>)}</div>}
        <section className="edit-card">
          <div className="source-note"><span>✓</span><div><b>원문 정보를 우선했어요</b><p>AI가 보완한 항목은 파란색으로 표시돼요.</p></div></div>
          <label className="field-label">단어 · 표현</label>
          <TextField.Root><TextField.Input aria-label="단어 또는 표현" value={draft.term} onChange={(event) => update({ term: event.target.value })} /></TextField.Root>
          <div className="field-grid">
            <div><label className="field-label">품사</label><TextField.Root><TextField.Input aria-label="품사" value={draft.partOfSpeech ?? ""} onChange={(event) => update({ partOfSpeech: event.target.value })} placeholder="verb" /></TextField.Root></div>
            <div><label className="field-label">발음</label><TextField.Root><TextField.Input aria-label="발음" value={draft.pronunciation ?? ""} onChange={(event) => update({ pronunciation: event.target.value })} placeholder="/ɪnˈduːs/" /></TextField.Root></div>
          </div>
          <div className="label-with-tag"><label className="field-label">주요 뜻</label><ProvenanceTag value={draft.meanings[0]?.provenance ?? "user"} /></div>
          <TextField.Root><TextField.Textarea aria-label="주요 뜻" value={draft.meanings[0]?.definitionKo ?? ""} onChange={(event) => updateMeaning(event.target.value)} placeholder="뜻을 입력해 주세요" /></TextField.Root>
          <div className="label-with-tag"><label className="field-label">예문</label>{draft.examples[0] && <ProvenanceTag value={draft.examples[0].provenance} />}</div>
          <TextField.Root><TextField.Textarea aria-label="예문" value={draft.examples[0]?.en ?? ""} onChange={(event) => updateExample(event.target.value)} placeholder="예문이 없으면 AI가 시험용 문장을 만들 수 있어요." /></TextField.Root>
          <label className="field-label">동의어 <span>쉼표로 구분</span></label>
          <TextField.Root><TextField.Input aria-label="동의어" value={draft.synonyms.join(", ")} onChange={(event) => update({ synonyms: event.target.value.split(",") })} /></TextField.Root>
          <label className="field-label">반의어 <span>쉼표로 구분</span></label>
          <TextField.Root><TextField.Input aria-label="반의어" value={draft.antonyms.join(", ")} onChange={(event) => update({ antonyms: event.target.value.split(",") })} /></TextField.Root>
        </section>
        <div className="review-nav"><ActionButton variant="neutralWeak" disabled={active === 0} onClick={() => setActive((value) => value - 1)}>이전</ActionButton>{active < drafts.length - 1 ? <ActionButton variant="neutralSolid" onClick={() => setActive((value) => value + 1)}>다음 카드</ActionButton> : <ActionButton loading={busy} onClick={saveAll}>모두 저장</ActionButton>}</div>
      </main>
    </>
  );
}

function VocabularyCardView({ card }: { card: VocabularyCard }) {
  return (
    <article className="vocabulary-card">
      <div className="word-topline"><div><Badge variant="weak">{card.partOfSpeech || "word"}</Badge><h2>{card.term}</h2><p>{card.pronunciation}</p></div><button className="sound-button" onClick={() => speak(card.term)} aria-label={`${card.term} 발음 듣기`}>◖)))</button></div>
      <div className="meaning-block"><small>주요 뜻</small><h3>{card.meanings[0]?.definitionKo || "뜻 미입력"}</h3>{card.meanings[0]?.definitionEn && <p>{card.meanings[0].definitionEn}</p>}</div>
      {card.examples[0] && <div className="example-block"><div className="label-with-tag"><small>문맥 예문</small><ProvenanceTag value={card.examples[0].provenance} /></div><p>{card.examples[0].en}</p>{card.examples[0].ko && <span>{card.examples[0].ko}</span>}</div>}
      {(card.synonyms.length > 0 || card.antonyms.length > 0) && <div className="relations"><div><small>SYNONYMS</small><p>{card.synonyms.join(" · ") || "—"}</p></div><div><small>ANTONYMS</small><p>{card.antonyms.join(" · ") || "—"}</p></div></div>}
    </article>
  );
}

function SessionScreen({ mode, cards, onBack, onDone, notify }: { mode: "study" | "test"; cards: VocabularyCard[]; onBack: () => void; onDone: () => void; notify: (message: string) => void }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [graded, setGraded] = useState<ReviewResult>();
  const card = cards[index];

  if (!card) return <><AppHeader title={mode === "study" ? "학습 모드" : "시험 모드"} onBack={onBack} /><main className="screen"><EmptyState title="오늘 학습을 마쳤어요" description="다음 복습 시간이 되면 다시 만나요." action={<ActionButton onClick={onDone}>홈으로</ActionButton>} /></main></>;

  const example = card.examples[0]?.en || `Use the word ${card.term} in an academic context.`;
  const prompt = blankTerm(example, card.term);
  const moveNext = () => { setAnswer(""); setGraded(undefined); setIndex((value) => value + 1); };
  const submitStudy = async (result: ReviewResult) => { await recordReview(card, "study", result); notify(`${resultMeta[result].label} · ${resultMeta[result].next}`); moveNext(); };
  const gradeTest = () => setGraded(scoreAnswer(answer, [card.term, ...card.acceptedVariants]));
  const commitTest = async () => { if (!graded) return; await recordReview(card, "test", graded, { prompt, submittedAnswer: answer }); moveNext(); };

  return (
    <>
      <AppHeader title={mode === "study" ? "학습 모드" : "시험 모드"} subtitle={`${index + 1} / ${cards.length}`} onBack={onBack} />
      <div className="linear-progress"><span style={{ width: `${((index + 1) / cards.length) * 100}%` }} /></div>
      <main className={`screen session-screen ${mode}`}>
        {mode === "study" ? <VocabularyCardView card={card} /> : (
          <article className="test-card">
            <Badge tone="informative" variant="weak">문맥 빈칸</Badge>
            <p className="test-prompt">{prompt}</p>
            {card.examples[0]?.ko && <p className="test-translation">{card.examples[0].ko}</p>}
            <label className="field-label" htmlFor="test-answer">빈칸에 들어갈 단어</label>
            <TextField.Root size="large">
              <TextField.Input id="test-answer" aria-label="빈칸에 들어갈 단어" value={answer} disabled={Boolean(graded)} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && answer.trim() && !graded) gradeTest(); }} autoCapitalize="none" autoComplete="off" spellCheck={false} placeholder="정답 입력" />
            </TextField.Root>
            {graded && <div className={`answer-result ${graded}`}><Badge tone={resultMeta[graded].tone}>{resultMeta[graded].label}</Badge><p>정답은 <strong>{card.term}</strong>이에요.</p><span>{card.meanings[0]?.definitionKo}</span></div>}
          </article>
        )}
      </main>
      {mode === "study" ? <div className="rating-bar">{(["unknown", "confusing", "correct"] as ReviewResult[]).map((result) => <button key={result} className={result} onClick={() => void submitStudy(result)}><b>{resultMeta[result].label}</b><span>{resultMeta[result].next}</span></button>)}</div> : <div className="sticky-cta test-cta">{graded ? <ActionButton size="large" onClick={() => void commitTest()} className="full-button">다음 문제</ActionButton> : <ActionButton size="large" disabled={!answer.trim()} onClick={gradeTest} className="full-button">정답 확인</ActionButton>}</div>}
    </>
  );
}

function LibraryScreen({ cards, onBack, onEdit, notify }: { cards: VocabularyCard[]; onBack: () => void; onEdit: (draft: CardDraft) => void; notify: (message: string) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ReviewResult>("all");
  const importRef = useRef<HTMLInputElement>(null);
  const filtered = cards.filter((card) => (filter === "all" || card.status === filter) && `${card.term} ${card.meanings.map((item) => item.definitionKo).join(" ")}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));

  const download = async () => {
    const blob = new Blob([await exportDatabase()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `wordseed-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  };
  const restore = async (file?: File) => { if (!file) return; try { await importDatabase(await file.text()); notify("백업을 복원했어요."); } catch (error) { notify(error instanceof Error ? error.message : "복원하지 못했어요."); } };

  return (
    <>
      <AppHeader title="내 단어" subtitle={`전체 ${cards.length}개`} onBack={onBack} />
      <main className="screen library-screen">
        <TextField.Root><TextField.Input aria-label="단어 또는 뜻 검색" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="단어 또는 뜻 검색" /></TextField.Root>
        <div className="filter-chips">{(["all", "unknown", "confusing", "correct"] as const).map((value) => <Chip.Root key={value} size="small" variant={filter === value ? "solid" : "outlineStrong"} onClick={() => setFilter(value)}><Chip.Label>{value === "all" ? "전체" : resultMeta[value].label}</Chip.Label></Chip.Root>)}</div>
        <div className="library-actions"><ActionButton variant="neutralWeak" size="small" onClick={() => void download()}>JSON 내보내기</ActionButton><ActionButton variant="neutralWeak" size="small" onClick={() => importRef.current?.click()}>가져오기</ActionButton><input ref={importRef} type="file" accept="application/json" hidden onChange={(event) => void restore(event.target.files?.[0])} /></div>
        <div className="word-list">
          {filtered.map((card) => <article key={card.id} className="word-row"><button className="word-row-main" onClick={() => onEdit(card)}><div><div className="word-row-title"><h2>{card.term}</h2><Badge tone={resultMeta[card.status].tone} variant="weak">{resultMeta[card.status].label}</Badge></div><p>{card.meanings[0]?.definitionKo}</p><small>{card.isNew ? "새 카드" : formatDue(card.nextReviewAt)}</small></div><span>›</span></button><button className="delete-button" onClick={() => { if (window.confirm(`‘${card.term}’ 카드를 삭제할까요?`)) void db.cards.delete(card.id); }} aria-label={`${card.term} 삭제`}>삭제</button></article>)}
          {!filtered.length && <EmptyState title="일치하는 단어가 없어요" description="검색어나 필터를 바꿔 보세요." />}
        </div>
      </main>
    </>
  );
}

function BottomNav({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  return <nav className="bottom-nav" aria-label="주요 메뉴"><button className={page === "home" ? "active" : ""} onClick={() => onNavigate("home")}><span>⌂</span>홈</button><button className={page === "add" ? "active" : ""} onClick={() => onNavigate("add")}><span>＋</span>추가</button><button className={page === "library" ? "active" : ""} onClick={() => onNavigate("library")}><span>▤</span>단어장</button></nav>;
}

export default function App() {
  const cards = useLiveQuery(() => db.cards.toArray(), [], []);
  const [page, setPage] = useState<Page>("home");
  const [drafts, setDrafts] = useState<CardDraft[]>([]);
  const [candidates, setCandidates] = useState<ExtractedCandidate[]>([]);
  const [sessionCards, setSessionCards] = useState<VocabularyCard[]>([]);
  const [toast, setToast] = useState<string>();
  const toastTimer = useRef<number | undefined>(undefined);
  const notify = (message: string) => { setToast(message); window.clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => setToast(undefined), 2800); };

  const navigate = (next: Page) => { window.scrollTo({ top: 0, behavior: "smooth" }); setPage(next); };
  const start = (mode: "study" | "test") => { setSessionCards(buildReviewQueue(cards)); navigate(mode); };
  const showNav = ["home", "add", "library"].includes(page);
  return (
    <div className="app-shell">
      {page === "home" && <HomeScreen cards={cards} onNavigate={navigate} onStart={start} />}
      {page === "add" && <AddScreen onBack={() => navigate("home")} notify={notify} onDrafts={(value) => { setDrafts(value); navigate("review"); }} onCandidates={(value) => { setCandidates(value); navigate("candidates"); }} />}
      {page === "candidates" && <CandidateScreen initial={candidates} onBack={() => navigate("add")} onContinue={(value) => { setDrafts(value); navigate("review"); }} />}
      {page === "review" && <ReviewScreen initial={drafts} onBack={() => navigate(drafts.some((item) => item.id) ? "library" : "add")} onSaved={() => navigate("home")} notify={notify} />}
      {(page === "study" || page === "test") && <SessionScreen mode={page} cards={sessionCards} onBack={() => navigate("home")} onDone={() => navigate("home")} notify={notify} />}
      {page === "library" && <LibraryScreen cards={cards} onBack={() => navigate("home")} notify={notify} onEdit={(card) => { setDrafts([{ id: card.id, term: card.term, acceptedVariants: card.acceptedVariants, partOfSpeech: card.partOfSpeech, pronunciation: card.pronunciation, meanings: card.meanings, synonyms: card.synonyms, antonyms: card.antonyms, examples: card.examples, sourceText: card.sourceText, sourceLabel: card.sourceLabel }]); navigate("review"); }} />}
      {showNav && <BottomNav page={page} onNavigate={navigate} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
