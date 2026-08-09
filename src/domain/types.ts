export type ReviewResult = "unknown" | "confusing" | "correct";
export type Provenance = "source" | "ai" | "user" | "fallback";

export interface Example {
  en: string;
  ko?: string;
  type: "sentence" | "dialogue";
  provenance?: Provenance;
}

export interface TestExample extends Example {
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
  testExamples: TestExample[];
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

export interface DraftExample {
  en: string;
  ko?: string;
  answer?: string;
  type: "sentence" | "dialogue";
  provenance?: Provenance;
}

export interface DraftMeaning {
  id?: string;
  expression: string;
  definitionKo: string;
  definitionEn?: string;
  partOfSpeech?: string;
  pronunciation?: string;
  acceptedVariants?: string[];
  synonyms?: string[];
  antonyms?: string[];
  provenance?: Provenance;
  examples: DraftExample[];
  testExamples?: DraftExample[];
}

export interface CardDraft {
  id?: string;
  term: string;
  meanings: DraftMeaning[];
  tags?: string[];
}

export interface ExtractedCandidate extends CardDraft {
  selected: boolean;
  confidence: number;
}

export interface StudyItem {
  card: VocabularyCard;
  meaning: Meaning;
}
