import type {
  CardWriteInput,
  VocabularyCard,
} from "@/entities/card";
import type { CardDraft, DraftExample } from "../types/card-draft";

export function cardToDraft(card: VocabularyCard): CardDraft {
  return {
    id: card.id,
    term: card.term,
    meanings: card.meanings.map((meaning) => ({
      id: meaning.id,
      expression: meaning.expression,
      definitionKo: meaning.definitionKo,
      definitionEn: meaning.definitionEn,
      partOfSpeech: meaning.partOfSpeech,
      pronunciation: meaning.pronunciation,
      acceptedVariants: meaning.acceptedVariants,
      synonyms: meaning.synonyms,
      antonyms: meaning.antonyms,
      examples: meaning.examples.map((example) => ({
        ...example,
        provenance: "user",
      })),
      fillInBlankExamples: meaning.fillInBlankExamples.map((example) => ({
        ...example,
        provenance: "user",
      })),
      provenance: "user",
    })),
    tags: card.tags,
  };
}

export function draftToCardWriteInput(draft: CardDraft): CardWriteInput {
  return {
    id: draft.id,
    term: draft.term,
    tags: draft.tags,
    meanings: draft.meanings.map((meaning) => ({
      id: meaning.id,
      expression: meaning.expression,
      definitionKo: meaning.definitionKo,
      definitionEn: meaning.definitionEn,
      partOfSpeech: meaning.partOfSpeech,
      pronunciation: meaning.pronunciation,
      acceptedVariants: meaning.acceptedVariants,
      synonyms: meaning.synonyms,
      antonyms: meaning.antonyms,
      examples: meaning.examples
        .filter((example) => example.en.trim())
        .map(({ en, ko, type }) => ({ en, ko, type })),
      fillInBlankExamples: (meaning.fillInBlankExamples ?? [])
        .filter(isCompleteFillInBlankExample)
        .map(({ en, ko, answer, type }) => ({ en, ko, answer, type })),
    })),
  };
}

function isCompleteFillInBlankExample(
  example: DraftExample,
): example is DraftExample & { ko: string; answer: string } {
  return Boolean(example.en.trim() && example.ko?.trim() && example.answer?.trim());
}
