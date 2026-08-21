// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToeflSpeakingPractice } from "./toefl-speaking-practice";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function renderPractice(onExit = vi.fn()) {
  return render(<ToeflSpeakingPractice onExit={onExit} />);
}

describe("ToeflSpeakingPractice", () => {
  it("starts a four-question interview in random mode", () => {
    renderPractice();

    fireEvent.click(screen.getByRole("button", { name: /랜덤으로 시작/ }));

    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("1 / 4")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "45초 타이머 시작" }),
    ).toHaveTextContent("Start");
  });

  it("starts the timer from the circular Start button", () => {
    renderPractice();

    expect(
      screen.queryByRole("button", { name: "45초 타이머 시작" }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Study environments 인터뷰 시작",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "45초 타이머 시작" }),
    );

    expect(screen.getByText("Study environments")).toBeInTheDocument();
    expect(screen.getByRole("timer", { name: "45초 남음" })).toHaveTextContent(
      "0:45",
    );
  });

  it("moves through all four questions and shows completion", () => {
    renderPractice();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Study environments 인터뷰 시작",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "다음 질문" }));
    fireEvent.click(screen.getByRole("button", { name: "다음 질문" }));
    fireEvent.click(screen.getByRole("button", { name: "다음 질문" }));
    fireEvent.click(screen.getByRole("button", { name: "연습 마치기" }));

    expect(screen.getByText("네 질문을 모두 마쳤어요")).toBeInTheDocument();
  });

  it("stops the countdown at zero", () => {
    vi.useFakeTimers();
    renderPractice();

    fireEvent.click(screen.getByRole("button", { name: /랜덤으로 시작/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "45초 타이머 시작" }),
    );
    act(() => vi.advanceTimersByTime(45_000));

    expect(screen.getByText("0:00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "타이머 다시 시작" }),
    ).toBeInTheDocument();
  });

  it("restarts a running timer from 45 seconds", () => {
    vi.useFakeTimers();
    renderPractice();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Study environments 인터뷰 시작",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "45초 타이머 시작" }),
    );
    act(() => vi.advanceTimersByTime(5_000));

    expect(screen.getByRole("timer", { name: "40초 남음" })).toHaveTextContent(
      "0:40",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "타이머 다시 시작" }),
    );

    expect(screen.getByRole("timer", { name: "45초 남음" })).toHaveTextContent(
      "0:45",
    );
  });

  it("gives a restarted timer a full 45 seconds", () => {
    vi.useFakeTimers();
    renderPractice();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Study environments 인터뷰 시작",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "45초 타이머 시작" }),
    );
    act(() => vi.advanceTimersByTime(500));
    fireEvent.click(
      screen.getByRole("button", { name: "타이머 다시 시작" }),
    );
    act(() => vi.advanceTimersByTime(500));

    expect(screen.getByRole("timer", { name: "45초 남음" })).toHaveTextContent(
      "0:45",
    );
  });

  it("uses elapsed time when browser timers are delayed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-21T00:00:00Z"));
    renderPractice();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Study environments 인터뷰 시작",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "45초 타이머 시작" }),
    );
    vi.setSystemTime(new Date("2026-08-21T00:00:30Z"));
    act(() => vi.advanceTimersByTime(1_000));

    expect(screen.getByRole("timer", { name: "14초 남음" })).toHaveTextContent(
      "0:14",
    );
  });

  it("uses the header back button to return from a question to the list", () => {
    const onExit = vi.fn();
    renderPractice(onExit);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Study environments 인터뷰 시작",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(onExit).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "질문 목록" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "연습 나가기" }),
    ).not.toBeInTheDocument();
  });

  it("uses the header back button to exit from the question list", () => {
    const onExit = vi.fn();
    renderPractice(onExit);

    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(onExit).toHaveBeenCalledOnce();
  });

  it("resets the timer to Start for each new question", () => {
    renderPractice();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Study environments 인터뷰 시작",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "45초 타이머 시작" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "다음 질문" }));

    expect(
      screen.getByRole("button", { name: "45초 타이머 시작" }),
    ).toHaveTextContent("Start");
  });

  it("moves to the previous question while keeping the memo", () => {
    renderPractice();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Study environments 인터뷰 시작",
      }),
    );

    expect(
      screen.queryByRole("button", { name: "이전 질문" }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "메모" }), {
      target: { value: "quiet, library" },
    });
    fireEvent.click(screen.getByRole("button", { name: "다음 질문" }));
    fireEvent.click(
      screen.getByRole("button", { name: "45초 타이머 시작" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "이전 질문" }));

    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("1 / 4")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "메모" })).toHaveValue(
      "quiet, library",
    );
    expect(
      screen.getByRole("button", { name: "45초 타이머 시작" }),
    ).toHaveTextContent("Start");
  });

  it("keeps the memo across four questions and clears it for a new interview", () => {
    renderPractice();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Study environments 인터뷰 시작",
      }),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "메모" }), {
      target: { value: "campus, flexible schedule" },
    });
    fireEvent.click(screen.getByRole("button", { name: "다음 질문" }));

    expect(screen.getByRole("textbox", { name: "메모" })).toHaveValue(
      "campus, flexible schedule",
    );

    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Study environments 인터뷰 시작",
      }),
    );

    expect(screen.getByRole("textbox", { name: "메모" })).toHaveValue("");
  });
});
