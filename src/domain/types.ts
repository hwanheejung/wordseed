export type ReviewResult = "unknown" | "confusing" | "correct";
export type Provenance = "source" | "ai" | "user" | "fallback";

export interface Meaning {
  definitionKo: string;
  definitionEn?: string;
  context?: string;
  partOfSpeech?: string;
  pronunciation?: string;
  provenance: Provenance;
  examples: Example[];
}

export interface Example {
  en: string;
  ko?: string;
  answer?: string;
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
  testExamples: Example[];
  sourceText?: string;
  sourceLabel?: string;
  status: ReviewResult;
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
  testExamples: Example[];
  sourceText?: string;
  sourceLabel?: string;
}

export interface ExtractedCandidate extends CardDraft {
  selected: boolean;
  confidence: number;
}
