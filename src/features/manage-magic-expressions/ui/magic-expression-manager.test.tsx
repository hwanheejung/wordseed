// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { useState } from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { MagicExpressionManager } from "./magic-expression-manager";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);
afterAll(() => vi.unstubAllGlobals());

describe("MagicExpressionManager", () => {
  it("shows the seeded expressions", () => {
    render(<TestManager />);

    expect(screen.getByRole("heading", { name: "Fun" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Learn or Education/Past Experience",
      }),
    ).toBeInTheDocument();
  });

  it("adds and renders a Markdown expression", () => {
    render(<TestManager initialAddOpen />);

    fireEvent.change(screen.getByRole("textbox", { name: "제목" }), {
      target: { value: "Opinion opener" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "내용" }), {
      target: { value: "**Personally**, I prefer this option." },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(
      screen.getByRole("heading", { name: "Opinion opener" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Personally").tagName).toBe("STRONG");
  });

  it("deletes an expression after confirmation", () => {
    render(<TestManager />);

    fireEvent.click(screen.getByRole("button", { name: "Fun 더보기" }));
    fireEvent.click(
      within(screen.getByRole("menu", { name: "Fun 더보기" })).getByRole(
        "menuitem",
        { name: "삭제하기" },
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "표현 삭제" }));

    expect(
      screen.queryByRole("heading", { name: "Fun" }),
    ).not.toBeInTheDocument();
  });
});

function TestManager({ initialAddOpen = false }: { initialAddOpen?: boolean }) {
  const [addOpen, setAddOpen] = useState(initialAddOpen);

  return (
    <MagicExpressionManager
      addOpen={addOpen}
      onAddOpenChange={setAddOpen}
    />
  );
}
