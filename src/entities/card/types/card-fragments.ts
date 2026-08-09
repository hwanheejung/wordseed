import type { Meaning, VocabularyCard } from "./card";

export type CardMeaningFragment = Pick<
  Meaning,
  | "id"
  | "expression"
  | "definitionKo"
  | "definitionEn"
  | "partOfSpeech"
  | "pronunciation"
  | "synonyms"
  | "antonyms"
  | "examples"
>;

export type CardDetailFragment = Pick<VocabularyCard, "id" | "term" | "tags"> & {
  meanings: CardMeaningFragment[];
};
