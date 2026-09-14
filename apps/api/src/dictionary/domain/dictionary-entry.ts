import type {
  DictionaryExample,
  DictionaryForm,
  DictionarySenseNarrative,
} from "./dictionary-content";

export const DictionaryEntryKind = {
  WORD: "WORD",
  EXPRESSION: "EXPRESSION",
} as const;

export type DictionaryEntryKind =
  (typeof DictionaryEntryKind)[keyof typeof DictionaryEntryKind];

export const DictionaryPartOfSpeech = {
  NOUN: "NOUN",
  VERB: "VERB",
  ADJECTIVE: "ADJECTIVE",
  ADVERB: "ADVERB",
  PRONOUN: "PRONOUN",
  PREPOSITION: "PREPOSITION",
  CONJUNCTION: "CONJUNCTION",
  INTERJECTION: "INTERJECTION",
  DETERMINER: "DETERMINER",
  AUXILIARY: "AUXILIARY",
  PARTICLE: "PARTICLE",
} as const;

export type DictionaryPartOfSpeech =
  (typeof DictionaryPartOfSpeech)[keyof typeof DictionaryPartOfSpeech];

export interface DictionarySynsetDefinition {
  id: string;
  languageTag: string;
  text: string;
}

export interface DictionarySynset {
  id: string;
  partOfSpeech: DictionaryPartOfSpeech | null;
  definitions: readonly DictionarySynsetDefinition[];
  examples: readonly DictionaryExample[];
}

export interface DictionarySense {
  id: string;
  commonnessScore: number | null;
  synset: DictionarySynset;
  narratives: readonly DictionarySenseNarrative[];
  examples: readonly DictionaryExample[];
  forms: readonly DictionaryForm[];
}

export interface DictionaryEntry {
  id: string;
  headword: string;
  languageTag: string;
  kind: DictionaryEntryKind;
  senses: readonly DictionarySense[];
}

export const DictionarySenseRecommendationReason = {
  SAME_SYNSET: "SAME_SYNSET",
  DERIVED_FROM: "DERIVED_FROM",
  DERIVATIVE: "DERIVATIVE",
  CONFUSABLE: "CONFUSABLE",
  ANTONYM: "ANTONYM",
  RELATED: "RELATED",
  HYPERNYM: "HYPERNYM",
  HYPONYM: "HYPONYM",
} as const;

export type DictionarySenseRecommendationReason =
  (typeof DictionarySenseRecommendationReason)[keyof typeof DictionarySenseRecommendationReason];

export interface DictionarySenseRecommendation {
  reason: DictionarySenseRecommendationReason;
  targetEntry: DictionaryEntry;
  targetSense: DictionarySense;
}

export function normalizeDictionaryLanguageTag(languageTag: string): string {
  const normalizedLanguageTag = Intl.getCanonicalLocales(languageTag.trim())[0];

  if (!normalizedLanguageTag) {
    throw new RangeError("A dictionary language tag is required.");
  }

  return normalizedLanguageTag;
}

export function canonicalizeDictionaryHeadword(headword: string): string {
  const canonicalHeadword = headword
    .normalize("NFKC")
    .trim()
    .replace(/[‘’‛]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ");

  if (!canonicalHeadword) {
    throw new RangeError("A dictionary headword is required.");
  }

  return canonicalHeadword;
}

export function normalizeDictionarySearchQuery(
  headword: string,
  languageTag: string = "en",
): string {
  return canonicalizeDictionaryHeadword(headword).toLocaleLowerCase(languageTag);
}
