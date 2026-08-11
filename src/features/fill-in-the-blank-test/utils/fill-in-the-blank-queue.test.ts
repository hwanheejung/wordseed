import { describe, expect, it } from "vitest";
import type {
  ReviewResult,
  VocabularyCard,
} from "@/entities/card";
import { buildFillInTheBlankQueue } from "./fill-in-the-blank-queue";

const timestamp = "2026-01-01T00:00:00.000Z";

function makeCard(id: string, statuses: ReviewResult[]): VocabularyCard {
  return {
    id,
    term: id,
    normalizedTerm: id,
    tags: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    meanings: statuses.map((status, position) => ({
      id: `${id}-meaning-${position + 1}`,
      cardId: id,
      position,
      expression: id,
      definitionKo: `${id} 뜻 ${position + 1}`,
      searchTokens: [id],
      acceptedVariants: [id],
      synonyms: [],
      antonyms: [],
      examples: [],
      fillInBlankExamples: [
        {
          en: `The team used ${id} to solve the specific problem before noon.`,
          ko: `팀은 정오 전에 구체적인 문제를 해결하기 위해 ${id}를 사용했다.`,
          answer: id,
          type: "sentence",
        },
      ],
      status,
    })),
  };
}

describe("fill-in-the-blank queue", () => {
  it("keeps every meaning with a valid fill-in-the-blank context available", () => {
    const cards = [
      makeCard("account", ["unknown", "confusing", "correct"]),
      makeCard("induce", ["unknown"]),
      makeCard("pervasive", ["correct"]),
    ];
    expect(buildFillInTheBlankQueue(cards, () => 0.5)).toHaveLength(5);
  });

  it("excludes meanings that only have generic fallback prompts", () => {
    const card = makeCard("thrall", ["unknown"]);
    card.meanings[0].fillInBlankExamples = [
      {
        en: "The professor used the term thrall to clarify the central idea.",
        ko: "교수는 핵심 개념을 명확히 하기 위해 thrall이라는 용어를 사용했다.",
        answer: "thrall",
        type: "sentence",
      },
    ];
    expect(buildFillInTheBlankQueue([card], () => 0.5)).toHaveLength(0);
  });

  it("excludes meanings without fill-in-the-blank contexts", () => {
    const card = makeCard("optional", ["unknown"]);
    card.meanings[0].fillInBlankExamples = [];

    expect(buildFillInTheBlankQueue([card], () => 0.5)).toHaveLength(0);
  });
});
