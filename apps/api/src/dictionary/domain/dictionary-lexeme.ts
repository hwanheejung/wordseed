export const DictionarySenseNarrativeKind = {
  STORY: "STORY",
  ORIGIN: "ORIGIN",
  USAGE_GUIDE: "USAGE_GUIDE",
} as const;
export type DictionarySenseNarrativeKind =
  (typeof DictionarySenseNarrativeKind)[keyof typeof DictionarySenseNarrativeKind];

export interface DictionaryLanguage { id: string; code: string; name: string; defaultScriptCode: string | null }
export interface DictionaryLexicalCategory { id: string; code: string; displayName: string }
export interface DictionaryLemma { id: string; languageTag: string; value: string; isPrimary: boolean }
export interface DictionaryGrammaticalFeature { id: string; key: string; label: string }
export interface DictionaryFormRepresentation { id: string; languageTag: string; value: string }
export interface DictionaryPronunciation { id: string; ipa: string | null; audioUrl: string | null; dialectTag: string | null; syllabification: string | null }
export interface DictionaryForm { id: string; representations: readonly DictionaryFormRepresentation[]; features: readonly DictionaryGrammaticalFeature[]; pronunciations: readonly DictionaryPronunciation[] }
export interface DictionarySenseGloss { id: string; languageTag: string; text: string }
export interface DictionarySenseUsage { id: string; score: number | null; rank: number | null; regionTag: string | null; register: string | null; corpus: string | null }
export interface DictionarySenseNarrative { id: string; kind: DictionarySenseNarrativeKind; languageTag: string; markdown: string; generatedBy: string | null; promptVersion: string | null }
export interface DictionaryExampleTranslation { id: string; languageTag: string; text: string; generatedBy: string | null }
export interface DictionaryExample { id: string; languageTag: string; text: string; translations: readonly DictionaryExampleTranslation[] }
export interface DictionarySynsetDefinition { id: string; languageTag: string; text: string }
export interface DictionarySynset { id: string; definitions: readonly DictionarySynsetDefinition[] }
export interface DictionarySense { id: string; order: number; glosses: readonly DictionarySenseGloss[]; usages: readonly DictionarySenseUsage[]; synset: DictionarySynset | null; narratives: readonly DictionarySenseNarrative[]; examples: readonly DictionaryExample[] }
export interface DictionaryLexeme { id: string; canonicalLemma: string; language: DictionaryLanguage; lexicalCategory: DictionaryLexicalCategory; lemmas: readonly DictionaryLemma[]; forms: readonly DictionaryForm[]; senses: readonly DictionarySense[] }

export const DictionarySenseRecommendationReason = {
  SAME_SYNSET: "SAME_SYNSET", DERIVED_FROM: "DERIVED_FROM", DERIVATIVE: "DERIVATIVE",
  CONFUSABLE: "CONFUSABLE", ANTONYM: "ANTONYM", SYNONYM: "SYNONYM",
  TRANSLATION: "TRANSLATION", RELATED: "RELATED", HYPERNYM: "HYPERNYM",
  HYPONYM: "HYPONYM", MERONYM: "MERONYM", HOLONYM: "HOLONYM",
} as const;
export type DictionarySenseRecommendationReason = (typeof DictionarySenseRecommendationReason)[keyof typeof DictionarySenseRecommendationReason];
export interface DictionarySenseRecommendation { reason: DictionarySenseRecommendationReason; targetLexeme: DictionaryLexeme; targetSense: DictionarySense }

export function normalizeDictionaryLanguageTag(languageTag: string): string {
  const normalized = Intl.getCanonicalLocales(languageTag.trim())[0];
  if (!normalized) throw new RangeError("A dictionary language tag is required.");
  return normalized;
}
export function canonicalizeDictionaryLemma(lemma: string): string {
  const normalized = lemma.normalize("NFKC").trim().replace(/[‘’‛]/g, "'").replace(/[‐‑‒–—―]/g, "-").replace(/\s+/g, " ");
  if (!normalized) throw new RangeError("A dictionary lemma is required.");
  return normalized;
}
export function normalizeDictionarySearchQuery(query: string, languageTag = "en"): string {
  return canonicalizeDictionaryLemma(query).toLocaleLowerCase(languageTag);
}
