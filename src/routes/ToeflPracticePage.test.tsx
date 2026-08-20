// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToeflPracticePage } from "./ToeflPracticePage";

describe("ToeflPracticePage", () => {
  it("shows the four planned exercises without enabling unfinished flows", () => {
    render(<ToeflPracticePage />);

    expect(
      screen.getByRole("heading", { name: "TOEFL 연습" }),
    ).toBeInTheDocument();

    [
      "인터뷰 연습 준비 중",
      "이메일 쓰기 연습 준비 중",
      "토론 글쓰기 연습 준비 중",
      "단어 완성 연습 준비 중",
    ].forEach((name) => {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    });
  });
});
