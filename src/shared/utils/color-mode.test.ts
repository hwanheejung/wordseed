// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { applyColorMode, readColorMode } from "./color-mode";

describe("color mode", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-seed-color-mode");
  });

  it("uses light mode by default", () => {
    expect(readColorMode()).toBe("light");
  });

  it("applies and remembers the selected mode", () => {
    applyColorMode("dark");

    expect(document.documentElement.dataset.seedColorMode).toBe("dark-only");
    expect(readColorMode()).toBe("dark");
  });
});
