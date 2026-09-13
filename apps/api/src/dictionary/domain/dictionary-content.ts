export const DictionarySenseNarrativeKind = {
  STORY: "STORY",
  ORIGIN: "ORIGIN",
  USAGE_GUIDE: "USAGE_GUIDE",
} as const;

export type DictionarySenseNarrativeKind =
  (typeof DictionarySenseNarrativeKind)[keyof typeof DictionarySenseNarrativeKind];

export const DictionaryFormKind = {
  THIRD_PERSON_SINGULAR: "THIRD_PERSON_SINGULAR",
  PAST: "PAST",
  PAST_PARTICIPLE: "PAST_PARTICIPLE",
  PRESENT_PARTICIPLE: "PRESENT_PARTICIPLE",
  PLURAL: "PLURAL",
  COMPARATIVE: "COMPARATIVE",
  SUPERLATIVE: "SUPERLATIVE",
  OTHER: "OTHER",
} as const;

export type DictionaryFormKind =
  (typeof DictionaryFormKind)[keyof typeof DictionaryFormKind];

export interface DictionarySenseNarrative {
  id: string;
  kind: DictionarySenseNarrativeKind;
  languageTag: string;
  markdown: string;
  generatedBy: string | null;
  promptVersion: string | null;
}

export interface DictionaryExampleTranslation {
  id: string;
  languageTag: string;
  text: string;
  generatedBy: string | null;
}

export interface DictionaryExample {
  id: string;
  sourceLanguageTag: string;
  sourceText: string;
  translations: readonly DictionaryExampleTranslation[];
}

export interface DictionaryForm {
  id: string;
  surface: string;
  kind: DictionaryFormKind;
}
