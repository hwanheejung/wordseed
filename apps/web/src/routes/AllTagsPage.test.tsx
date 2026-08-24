// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReviewResult, VocabularyCard } from "@/entities/card";
import { AllTagsPage } from "./AllTagsPage";

const timestamp = "2026-01-01T00:00:00.000Z";

function makeCard(
  id: string,
  tag: string,
  status: ReviewResult,
): VocabularyCard {
  return {
    id,
    term: id,
    normalizedTerm: id,
    tags: [tag],
    createdAt: timestamp,
    updatedAt: timestamp,
    meanings: [
      {
        id: `${id}-meaning`,
        cardId: id,
        position: 0,
        expression: id,
        definitionKo: id,
        searchTokens: [id],
        acceptedVariants: [id],
        synonyms: [],
        antonyms: [],
        examples: [],
        fillInBlankExamples: [],
        status,
      },
    ],
  };
}

vi.mock("@/entities/card", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/card")>();

  return {
    ...actual,
    useCardsQuery: () => ({
      cards: [
        makeCard("known-beta", "beta", "correct"),
        makeCard("unknown-alpha", "alpha", "unknown"),
      ],
    }),
    useReviewStatsQuery: () => ({}),
  };
});

vi.mock("@/shared/hooks/use-app-snackbar", () => ({
  useAppSnackbar: () => vi.fn(),
}));

describe("AllTagsPage sorting", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to name order and restores the saved sort", () => {
    const firstRender = render(<AllTagsPage />);
    expect(screen.getByRole("button", { name: "태그 정렬" })).toHaveTextContent(
      "이름순",
    );

    fireEvent.click(screen.getByRole("button", { name: "태그 정렬" }));
    expect(
      screen.getByRole("menuitem", { name: "최근 학습한 순" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "오래전에 학습한 순" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "최근 학습한 순" }));

    expect(window.localStorage.getItem("wordseed:all-tags-sort")).toBe(
      "recentlyReviewed",
    );

    firstRender.unmount();
    render(<AllTagsPage />);
    expect(screen.getByRole("button", { name: "태그 정렬" })).toHaveTextContent(
      "최근 학습한 순",
    );
  });
});
