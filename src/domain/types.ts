export type ReviewResult = "unknown" | "confusing" | "correct";
export type Provenance = "source" | "ai" | "user";

export interface Meaning {
  definitionKo: string;
  definitionEn?: string;
  context?: string;
  provenance: Provenance;
}

export interface Example {
  en: string;
  ko?: string;
  type: "sentence" | "dialogue";
  provenance: Provenance;
}

export interface VocabularyCard {
  id: string;
  term: string;
  normalizedTerm: string;
  acceptedVariants: string[];
  partOfSpeech?: string;
  pronunciation?: string;
  meanings: Meaning[];
  synonyms: string[];
  antonyms: string[];
  examples: Example[];
  sourceText?: string;
  sourceLabel?: string;
  status: ReviewResult;
  stage: number;
  isNew: boolean;
  nextReviewAt: string;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewEvent {
  id?: number;
  cardId: string;
  mode: "study" | "test";
  prompt?: string;
  submittedAnswer?: string;
  result: ReviewResult;
  previousStage: number;
  newStage: number;
  timestamp: string;
}

export interface CardDraft {
  id?: string;
  term: string;
  acceptedVariants?: string[];
  partOfSpeech?: string;
  pronunciation?: string;
  meanings: Meaning[];
  synonyms: string[];
  antonyms: string[];
  examples: Example[];
  sourceText?: string;
  sourceLabel?: string;
}

export interface ExtractedCandidate extends CardDraft {
  selected: boolean;
  confidence: number;
}
