import { describe, expect, it } from "vitest";
import type {
  CardDraft,
  ExtractedCandidate,
} from "@/features/manage-cards";
import { addCardReducer } from "./AddCardPage";

const draft: CardDraft = {
  term: "account",
  meanings: [
    {
      expression: "account",
      definitionKo: "계좌",
      examples: [{ en: "She opened an account.", type: "sentence" }],
    },
  ],
};

const candidate: ExtractedCandidate = {
  ...draft,
  selected: true,
  confidence: 0.98,
};

describe("Add Card state", () => {
  it("moves a text extraction directly into review", () => {
    expect(
      addCardReducer(
        { step: "input", input: { text: "account 계좌" } },
        { type: "draftsCreated", drafts: [draft] },
      ),
    ).toEqual({
      step: "reviewing",
      input: { text: "account 계좌" },
      drafts: [draft],
      active: 0,
    });
  });

  it("restores reviewed photo candidates when review is cancelled", () => {
    const selecting = addCardReducer(
      { step: "input", input: { text: "" } },
      { type: "candidatesExtracted", candidates: [candidate] },
    );
    const reviewing = addCardReducer(selecting, {
      type: "reviewRequested",
      drafts: [{ ...draft, term: "bank account" }],
    });

    expect(
      addCardReducer(reviewing, { type: "reviewCancelled" }),
    ).toMatchObject({
      step: "selecting",
      candidates: [{ term: "bank account", selected: true }],
    });
  });

  it("preserves capture input when candidate selection is cancelled", () => {
    expect(
      addCardReducer(
        {
          step: "selecting",
          input: { text: "source note" },
          candidates: [candidate],
        },
        { type: "candidateSelectionCancelled" },
      ),
    ).toEqual({ step: "input", input: { text: "source note" } });
  });
});
