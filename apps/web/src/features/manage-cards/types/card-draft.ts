export type Provenance = "source" | "ai" | "user" | "fallback";

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
  fillInBlankExamples?: DraftExample[];
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
