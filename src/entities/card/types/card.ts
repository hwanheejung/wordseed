export type ReviewResult = "unknown" | "confusing" | "correct";

export type ConcealableCardField =
  | "expression"
  | "partOfSpeech"
  | "pronunciation"
  | "definitionKo"
  | "definitionEn"
  | "synonyms"
  | "antonyms"
  | "exampleEn"
  | "exampleKo";

export interface Example {
  en: string;
  ko?: string;
  type: "sentence" | "dialogue";
}

export interface FillInBlankExample extends Example {
  ko: string;
  answer: string;
}

export interface Meaning {
  id: string;
  cardId: string;
  position: number;
  expression: string;
  definitionKo: string;
  definitionEn?: string;
  searchTokens: string[];
  partOfSpeech?: string;
  pronunciation?: string;
  acceptedVariants: string[];
  synonyms: string[];
  antonyms: string[];
  examples: Example[];
  fillInBlankExamples: FillInBlankExample[];
  status: ReviewResult;
}

export interface CardRecord {
  id: string;
  term: string;
  normalizedTerm: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyCard extends CardRecord {
  meanings: Meaning[];
}

export interface ReviewEvent {
  id?: number;
  cardId: string;
  meaningId: string;
  fromStatus: ReviewResult;
  toStatus: ReviewResult;
  timestamp: string;
}

export interface ReviewHistoryStats {
  reviewCount: number;
  difficultCount: number;
  lastReviewedAt: string;
}

export interface CardMeaningWriteInput {
  id?: string;
  expression: string;
  definitionKo: string;
  definitionEn?: string;
  partOfSpeech?: string;
  pronunciation?: string;
  acceptedVariants?: string[];
  synonyms?: string[];
  antonyms?: string[];
  examples: Example[];
  fillInBlankExamples?: FillInBlankExample[];
}

export interface CardWriteInput {
  id?: string;
  term: string;
  meanings: CardMeaningWriteInput[];
  tags?: string[];
}

export interface CardRepositorySnapshot {
  cards: CardRecord[];
  meanings: Meaning[];
  reviewEvents: ReviewEvent[];
}
