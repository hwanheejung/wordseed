export {
  getAllCards,
  getReviewHistoryStats,
  normalizeTags,
  persistReviewResult,
  readCardRepositorySnapshot,
  removeCard,
  replaceCardRepositorySnapshot,
  saveCard,
} from "./api/local-card-repository";
export { useCardsQuery, type CardsQueryInput } from "./hooks/use-cards-query";
export { useReviewStatsQuery } from "./hooks/use-review-stats-query";
export type {
  CardRepositorySnapshot,
  CardWriteInput,
  ConcealableCardField,
  Meaning,
  ReviewHistoryStats,
  ReviewResult,
  VocabularyCard,
} from "./types/card";
export { VocabularyCard as VocabularyCardView } from "./ui/vocabulary-card";
export { getCardStatus, reviewResultMeta } from "./utils/card-status";
export { isSpecificFillInBlankContext } from "./utils/fill-in-blank-context";
