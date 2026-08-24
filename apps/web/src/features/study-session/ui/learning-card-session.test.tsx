// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type Meaning,
  useReviewStatsQuery,
  type VocabularyCard,
} from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";
import { LearningCardSession } from "./learning-card-session";

vi.mock("@/entities/card", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/card")>();

  return { ...actual, useReviewStatsQuery: vi.fn() };
});

vi.mock("./swipeable-card-stack", () => ({
  SwipeableCardStack: () => <div />,
}));

const meaning: Meaning = {
  id: "meaning-1",
  cardId: "card-1",
  position: 0,
  expression: "coinage",
  definitionKo: "신조어",
  searchTokens: ["coinage", "신조어"],
  acceptedVariants: ["coinage"],
  synonyms: [],
  antonyms: [],
  examples: [],
  fillInBlankExamples: [],
  status: "unknown",
};
const card: VocabularyCard = {
  id: "card-1",
  term: "coinage",
  normalizedTerm: "coinage",
  tags: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  meanings: [meaning],
};
const item: StudyQueueItem = { card, meaning };

describe("LearningCardSession review controls", () => {
  afterEach(() => cleanup());

  it("does not select the default unknown status without review history", () => {
    vi.mocked(useReviewStatsQuery).mockReturnValue({});

    renderSession();

    expect(screen.getByRole("button", { name: "몰랐어요" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "헷갈려요" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.getByRole("button", { name: "알고 있어요" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("selects the stored status when review history exists", () => {
    vi.mocked(useReviewStatsQuery).mockReturnValue({
      "meaning-1": {
        reviewCount: 1,
        difficultCount: 1,
        lastReviewedAt: "2026-01-02T00:00:00.000Z",
      },
    });

    renderSession();

    expect(screen.getByRole("button", { name: "몰랐어요" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

function renderSession() {
  render(
    <LearningCardSession
      item={item}
      navigationRevision={0}
      onNavigate={vi.fn()}
      onReview={vi.fn()}
      onMemoryAidSaved={vi.fn()}
    />,
  );
}
