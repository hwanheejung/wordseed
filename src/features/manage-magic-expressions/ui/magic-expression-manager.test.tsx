// @vitest-environment jsdom

import {
  act,
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

const scrollIntoView = vi.fn();
const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);

beforeAll(() => {
  vi.stubGlobal(
    "PointerEvent",
    class PointerEvent extends MouseEvent {
      pointerId: number;
      pointerType: string;

      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
        this.pointerType = init.pointerType ?? "";
      }
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoView,
  });
});

beforeEach(() => {
  window.localStorage.clear();
  scrollIntoView.mockClear();
});

afterEach(cleanup);
afterAll(() => {
  vi.unstubAllGlobals();
  if (originalScrollIntoView) {
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollIntoView",
      originalScrollIntoView,
    );
  } else {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  }
});

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

  it("moves an expression and restores the saved order", () => {
    const { unmount } = render(<TestManager />);

    fireEvent.click(screen.getByRole("button", { name: "Fun 더보기" }));
    fireEvent.click(
      within(screen.getByRole("menu", { name: "Fun 더보기" })).getByRole(
        "menuitem",
        { name: "아래로 이동" },
      ),
    );

    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .slice(0, 2)
        .map(({ textContent }) => textContent),
    ).toEqual(["Meet People", "Fun"]);

    unmount();
    render(<TestManager />);

    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .slice(0, 2)
        .map(({ textContent }) => textContent),
    ).toEqual(["Meet People", "Fun"]);
  });

  it("moves an expression after a touch long press", () => {
    vi.useFakeTimers();
    render(<TestManager />);

    const items = screen
      .getAllByRole("article")
      .map((article) => article.closest("li"));
    items.forEach((item, index) => {
      if (!item) return;
      vi.spyOn(item, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: index * 100,
        width: 320,
        height: 80,
        top: index * 100,
        right: 320,
        bottom: index * 100 + 80,
        left: 0,
        toJSON: () => ({}),
      });
    });

    const handle = screen.getByRole("button", { name: "Fun 순서 변경" });
    fireEvent.pointerDown(handle, {
      button: 0,
      clientY: 40,
      pointerId: 1,
      pointerType: "touch",
    });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.pointerMove(handle, {
      clientY: 140,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerUp(handle, {
      clientY: 140,
      pointerId: 1,
      pointerType: "touch",
    });

    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .slice(0, 2)
        .map(({ textContent }) => textContent),
    ).toEqual(["Meet People", "Fun"]);
    vi.useRealTimers();
  });

  it("opens the editor without forcing the mobile keyboard", () => {
    render(<TestManager initialAddOpen />);

    expect(screen.getByRole("textbox", { name: "제목" })).not.toHaveFocus();
  });

  it("keeps the focused field visible when the editor viewport changes", () => {
    render(<TestManager initialAddOpen />);

    fireEvent.focus(screen.getByRole("textbox", { name: "내용" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  });

  it("does not dismiss the editor when the form is dragged to scroll", () => {
    render(<TestManager initialAddOpen />);

    const dialog = screen.getByRole("dialog");
    fireEvent.pointerDown(dialog, {
      button: 0,
      clientY: 100,
      pointerId: 2,
      pointerType: "touch",
    });
    fireEvent.pointerMove(dialog, {
      clientY: 320,
      pointerId: 2,
      pointerType: "touch",
    });
    fireEvent.pointerUp(dialog, {
      clientY: 320,
      pointerId: 2,
      pointerType: "touch",
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
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
