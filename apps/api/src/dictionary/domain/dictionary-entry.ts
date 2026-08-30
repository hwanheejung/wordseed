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

export interface DictionarySenseDefinition {
  id: string;
  languageTag: string;
  text: string;
}

export interface DictionarySense {
  id: string;
  partOfSpeech: DictionaryPartOfSpeech | null;
  commonnessScore: number | null;
  definitions: readonly DictionarySenseDefinition[];
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
