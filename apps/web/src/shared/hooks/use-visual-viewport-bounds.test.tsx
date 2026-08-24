// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useVisualViewportBounds } from "./use-visual-viewport-bounds";

afterEach(() => vi.unstubAllGlobals());

describe("useVisualViewportBounds", () => {
  it("tracks visual viewport resize events while active", () => {
    const listeners = new Map<string, EventListener>();
    const visualViewport = {
      height: 720,
      offsetTop: 0,
      addEventListener: vi.fn((name: string, listener: EventListener) => {
        listeners.set(name, listener);
      }),
      removeEventListener: vi.fn((name: string) => {
        listeners.delete(name);
      }),
    };
    vi.stubGlobal("visualViewport", visualViewport);

    const { result, unmount } = renderHook(() => useVisualViewportBounds());
    expect(result.current).toEqual({ height: 720, offsetTop: 0 });

    visualViewport.height = 420;
    visualViewport.offsetTop = 120;
    act(() => listeners.get("resize")?.(new Event("resize")));

    expect(result.current).toEqual({ height: 420, offsetTop: 120 });
    unmount();
    expect(visualViewport.removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("does not subscribe while inactive", () => {
    const visualViewport = {
      height: 720,
      offsetTop: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("visualViewport", visualViewport);

    renderHook(() => useVisualViewportBounds(false));

    expect(visualViewport.addEventListener).not.toHaveBeenCalled();
  });
});
