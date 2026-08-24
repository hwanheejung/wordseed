// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardDetailFragment } from "../types/card-fragments";
import { VocabularyCard } from "./vocabulary-card";

const card: CardDetailFragment = {
  id: "card-1",
  term: "intrinsically",
  tags: [],
  meanings: [
    {
      id: "meaning-1",
      expression: "intrinsically",
      definitionKo: "본질적으로",
      definitionEn: "by its very nature",
      partOfSpeech: "adverb",
      pronunciation: "/ɪnˈtrɪn.zɪ.kəl.i/",
      synonyms: [],
      antonyms: [],
      examples: [],
    },
  ],
};

describe("VocabularyCard concealment", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    HTMLElement.prototype.setPointerCapture = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reveals a tapped field for 1.5 seconds before splashing ink back", () => {
    render(
      <VocabularyCard fragment={card} concealedFields={["expression"]} />,
    );

    const field = screen.getByRole("button", {
      name: "단어·표현, 탭하여 잠깐 보기",
    });

    fireEvent.pointerDown(field, { isPrimary: true, pointerId: 1 });
    fireEvent.pointerUp(field, { isPrimary: true, pointerId: 1 });

    expect(field.firstElementChild).not.toHaveClass("invisible");

    act(() => vi.advanceTimersByTime(1_499));
    expect(field.firstElementChild).not.toHaveClass("invisible");

    act(() => vi.advanceTimersByTime(1));
    expect(field.firstElementChild).toHaveClass("invisible");
    expect(field.querySelector(".ink-splat-landing")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(380));
    expect(field.querySelector(".ink-splat-landing")).not.toBeInTheDocument();
  });

  it("keeps pronunciation actions available when their text is concealed", () => {
    const onPronounce = vi.fn();

    render(
      <VocabularyCard
        fragment={card}
        concealedFields={["expression"]}
        onPronounce={onPronounce}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "intrinsically 발음 듣기" }),
    );

    expect(onPronounce).toHaveBeenCalledWith("intrinsically");
  });
});
