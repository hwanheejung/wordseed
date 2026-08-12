// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Meaning, VocabularyCard } from "@/entities/card";
import { generateMemoryAid } from "../actions/generate-memory-aid";
import type { StudyQueueItem } from "../types/study-queue-item";
import { MemoryAidSection } from "./memory-aid-section";

vi.mock("../actions/generate-memory-aid", () => ({
  generateMemoryAid: vi.fn(),
}));

const meaning: Meaning = {
  id: "meaning-1",
  cardId: "card-1",
  position: 0,
  expression: "preposterous",
  definitionKo: "터무니없는",
  definitionEn: "contrary to reason or common sense",
  searchTokens: ["preposterous", "터무니없는"],
  acceptedVariants: ["preposterous"],
  synonyms: ["absurd", "ridiculous"],
  antonyms: [],
  examples: [],
  fillInBlankExamples: [],
  status: "unknown",
};
const card: VocabularyCard = {
  id: "card-1",
  term: "preposterous",
  normalizedTerm: "preposterous",
  tags: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  meanings: [meaning],
};
const item: StudyQueueItem = { card, meaning };

describe("MemoryAidSection", () => {
  beforeEach(() => {
    vi.mocked(generateMemoryAid).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders an existing memory aid as Markdown instead of a request button", () => {
    render(
      <MemoryAidSection
        item={{
          ...item,
          meaning: {
            ...meaning,
            memoryAid: "### 장면\n\n**앞과 뒤**가 뒤집힌 셔츠를 떠올립니다.",
          },
        }}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "장면" })).toBeInTheDocument();
    expect(screen.getByText("앞과 뒤").tagName).toBe("STRONG");
    expect(
      screen.queryByRole("button", { name: "Help me remember" }),
    ).not.toBeInTheDocument();
  });

  it("requests and returns a generated memory aid", async () => {
    const generated = {
      ...meaning,
      memoryAid: "앞과 뒤가 뒤집힌 셔츠를 떠올립니다.",
    };
    const onSaved = vi.fn();
    vi.mocked(generateMemoryAid).mockResolvedValue(generated);
    render(<MemoryAidSection item={item} onSaved={onSaved} />);

    fireEvent.click(screen.getByRole("button", { name: "Help me remember" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(generated));
  });

  it("offers a retry when generation fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(generateMemoryAid).mockRejectedValue(new Error("Unavailable"));
    render(<MemoryAidSection item={item} onSaved={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Help me remember" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "기억 장치를 만들지 못했어요",
    );
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeEnabled();
  });
});
