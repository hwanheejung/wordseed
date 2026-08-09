import { useEffect, useReducer } from "react";
import { match } from "ts-pattern";
import { z } from "zod";
import { normalizeTags, useCardCollection } from "@/entities/card";
import {
  CardReview,
  type CardDraft,
  CandidateSelection,
  CaptureCards,
  type ExtractedCandidate,
  saveDrafts,
  validateDrafts,
} from "@/features/manage-cards";
import { useAppSnackbar } from "../shared/hooks/use-app-snackbar";

const ADD_CARD_SESSION_KEY = "wordseed:add-card-session:v1";

interface CaptureInput {
  text: string;
  image?: string;
}

type AddCardState =
  | { step: "input"; input: CaptureInput }
  | {
      step: "selecting";
      input: CaptureInput;
      candidates: ExtractedCandidate[];
    }
  | {
      step: "reviewing";
      input: CaptureInput;
      drafts: CardDraft[];
      active: number;
      candidates?: ExtractedCandidate[];
    };

type AddCardAction =
  | { type: "captureChanged"; input: CaptureInput }
  | { type: "draftsCreated"; drafts: CardDraft[] }
  | { type: "candidatesExtracted"; candidates: ExtractedCandidate[] }
  | { type: "candidateSelectionChanged"; candidates: ExtractedCandidate[] }
  | { type: "candidateSelectionCancelled" }
  | { type: "reviewRequested"; drafts: CardDraft[]; active?: number }
  | { type: "draftsChanged"; drafts: CardDraft[] }
  | { type: "activeCardChanged"; active: number }
  | { type: "reviewCancelled" };

interface AddCardPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export function AddCardPage({
  onBack,
  onComplete,
}: AddCardPageProps) {
  const { cards } = useCardCollection();
  const notify = useAppSnackbar();
  const [state, dispatch] = useReducer(
    addCardReducer,
    undefined,
    readAddCardSession,
  );

  const handleInputChange = (input: CaptureInput) =>
    dispatch({ type: "captureChanged", input });

  const handleDrafts = (drafts: CardDraft[]) =>
    dispatch({ type: "draftsCreated", drafts });

  const handleCandidates = (candidates: ExtractedCandidate[]) =>
    dispatch({ type: "candidatesExtracted", candidates });

  const handleCandidateChange = (candidates: ExtractedCandidate[]) =>
    dispatch({ type: "candidateSelectionChanged", candidates });

  const handleCandidateBack = () =>
    dispatch({ type: "candidateSelectionCancelled" });

  const handleReview = (drafts: CardDraft[]) =>
    dispatch({ type: "reviewRequested", drafts });

  const handleSaveImmediately = async (drafts: CardDraft[]) => {
    const validationIssue = validateDrafts(drafts);
    if (validationIssue) {
      notify(
        `${validationIssue.message} 검토 화면에서 확인해 주세요.`,
        "critical",
      );
      dispatch({
        type: "reviewRequested",
        drafts,
        active: validationIssue.cardIndex,
      });

      return;
    }
    await saveDrafts(drafts, confirmOverwrite);
    notify(`${drafts.length}개의 카드를 저장했어요.`, "positive");
    clearAddCardSession();
    onComplete();
  };

  const handleDraftChange = (drafts: CardDraft[]) =>
    dispatch({ type: "draftsChanged", drafts });

  const handleActiveChange = (active: number) =>
    dispatch({ type: "activeCardChanged", active });

  const handleReviewBack = () =>
    dispatch({ type: "reviewCancelled" });

  const handleComplete = () => {
    clearAddCardSession();
    onComplete();
  };

  // Synchronize the in-progress Add Card flow with sessionStorage.
  useEffect(() => {
    writeAddCardSession(state);
  }, [state]);

  return match(state)
    .with({ step: "input" }, ({ input }) => (
      <CaptureCards
        text={input.text}
        image={input.image}
        onTextChange={(text) => handleInputChange({ ...input, text })}
        onImageChange={(image) => handleInputChange({ ...input, image })}
        onBack={onBack}
        onDrafts={handleDrafts}
        onCandidates={handleCandidates}
      />
    ))
    .with({ step: "selecting" }, ({ candidates }) => (
      <CandidateSelection
        items={candidates}
        onChange={handleCandidateChange}
        onBack={handleCandidateBack}
        onContinue={handleReview}
        onSaveImmediately={handleSaveImmediately}
      />
    ))
    .with({ step: "reviewing" }, ({ drafts, active }) => (
      <CardReview
        drafts={drafts}
        availableTags={normalizeTags(cards.flatMap((card) => card.tags))}
        active={active}
        onDraftsChange={handleDraftChange}
        onActiveChange={handleActiveChange}
        onBack={handleReviewBack}
        onSaved={handleComplete}
        onDeleted={handleComplete}
      />
    ))
    .exhaustive();
}

const provenanceSchema = z.enum(["source", "ai", "user", "fallback"]);
const draftExampleSchema = z.object({
  en: z.string(),
  ko: z.string().optional(),
  answer: z.string().optional(),
  type: z.enum(["sentence", "dialogue"]),
  provenance: provenanceSchema.optional(),
});
const draftMeaningSchema = z.object({
  id: z.string().optional(),
  expression: z.string(),
  definitionKo: z.string(),
  definitionEn: z.string().optional(),
  partOfSpeech: z.string().optional(),
  pronunciation: z.string().optional(),
  acceptedVariants: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  provenance: provenanceSchema.optional(),
  examples: z.array(draftExampleSchema),
  fillInBlankExamples: z.array(draftExampleSchema).optional(),
});
const cardDraftSchema = z.object({
  id: z.string().optional(),
  term: z.string(),
  meanings: z.array(draftMeaningSchema),
  tags: z.array(z.string()).optional(),
});
const extractedCandidateSchema = cardDraftSchema.extend({
  selected: z.boolean(),
  confidence: z.number(),
});
const captureInputSchema = z.object({
  text: z.string(),
  image: z.string().optional(),
});
const addCardStateSchema = z.discriminatedUnion("step", [
  z.object({ step: z.literal("input"), input: captureInputSchema }),
  z.object({
    step: z.literal("selecting"),
    input: captureInputSchema,
    candidates: z.array(extractedCandidateSchema),
  }),
  z.object({
    step: z.literal("reviewing"),
    input: captureInputSchema,
    drafts: z.array(cardDraftSchema),
    active: z.number().int().nonnegative(),
    candidates: z.array(extractedCandidateSchema).optional(),
  }),
]);

function readAddCardSession(): AddCardState {
  try {
    const raw = window.sessionStorage.getItem(ADD_CARD_SESSION_KEY);
    if (!raw) return { step: "input", input: { text: "" } };
    const result = addCardStateSchema.safeParse(JSON.parse(raw));
    if (result.success) return result.data;
  } catch {
    // Invalid or unavailable session storage falls back to an empty draft.
  }
  clearAddCardSession();

  return { step: "input", input: { text: "" } };
}

function writeAddCardSession(state: AddCardState) {
  try {
    window.sessionStorage.setItem(ADD_CARD_SESSION_KEY, JSON.stringify(state));
  } catch {
    const stateWithoutImage = {
      ...state,
      input: { text: state.input.text },
    } satisfies AddCardState;
    try {
      window.sessionStorage.setItem(
        ADD_CARD_SESSION_KEY,
        JSON.stringify(stateWithoutImage),
      );
    } catch {
      window.sessionStorage.removeItem(ADD_CARD_SESSION_KEY);
    }
  }
}

function clearAddCardSession() {
  window.sessionStorage.removeItem(ADD_CARD_SESSION_KEY);
}

function confirmOverwrite(term: string) {
  return window.confirm(
    `‘${term}’ 카드가 이미 있어요. 기존 카드를 업데이트할까요?\n취소하면 이 카드는 건너뜁니다.`,
  );
}

function mergeReviewedCandidates(
  candidates: ExtractedCandidate[],
  drafts: CardDraft[],
): ExtractedCandidate[] {
  let draftIndex = 0;

  return candidates.map((candidate) => {
    if (!candidate.selected) return candidate;
    const draft = drafts[draftIndex++];

    return draft ? { ...candidate, ...draft, selected: true } : candidate;
  });
}

export function addCardReducer(
  state: AddCardState,
  action: AddCardAction,
): AddCardState {
  return match(action)
    .with({ type: "captureChanged" }, ({ input }) => ({
      step: "input" as const,
      input,
    }))
    .with({ type: "draftsCreated" }, ({ drafts }) => ({
      step: "reviewing" as const,
      input: state.input,
      drafts,
      active: 0,
    }))
    .with({ type: "candidatesExtracted" }, ({ candidates }) => ({
      step: "selecting" as const,
      input: state.input,
      candidates,
    }))
    .with({ type: "candidateSelectionChanged" }, ({ candidates }) =>
      state.step === "selecting" ? { ...state, candidates } : state,
    )
    .with({ type: "candidateSelectionCancelled" }, () => ({
      step: "input" as const,
      input: state.input,
    }))
    .with({ type: "reviewRequested" }, ({ drafts, active = 0 }) => ({
      step: "reviewing" as const,
      input: state.input,
      drafts,
      active,
      candidates: state.step === "selecting" ? state.candidates : undefined,
    }))
    .with({ type: "draftsChanged" }, ({ drafts }) =>
      state.step === "reviewing" ? { ...state, drafts } : state,
    )
    .with({ type: "activeCardChanged" }, ({ active }) =>
      state.step === "reviewing" ? { ...state, active } : state,
    )
    .with({ type: "reviewCancelled" }, () => {
      if (state.step !== "reviewing") return state;
      if (!state.candidates)
        return { step: "input" as const, input: state.input };

      return {
        step: "selecting" as const,
        input: state.input,
        candidates: mergeReviewedCandidates(state.candidates, state.drafts),
      };
    })
    .exhaustive();
}
