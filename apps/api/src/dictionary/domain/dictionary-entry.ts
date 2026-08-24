export const DictionaryEntryKind = {
  WORD: "WORD",
  EXPRESSION: "EXPRESSION",
} as const;

export type DictionaryEntryKind =
  (typeof DictionaryEntryKind)[keyof typeof DictionaryEntryKind];

export interface DictionaryEntry {
  id: string;
  headword: string;
  kind: DictionaryEntryKind;
}

export function normalizeDictionaryHeadword(headword: string): string {
  return headword
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en-US");
}
