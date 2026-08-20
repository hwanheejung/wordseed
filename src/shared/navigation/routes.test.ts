// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { navigationEntryFromWindow } from "./routes";

describe("navigationEntryFromWindow", () => {
  it("restores the Wordbook scroll position from browser history", () => {
    window.history.replaceState(
      { entry: { page: "library", scrollTop: 640 } },
      "",
      "/library?sort=newest&tag=TOEFL_sub5",
    );

    expect(navigationEntryFromWindow()).toEqual({
      page: "library",
      scrollTop: 640,
    });
  });

  it("ignores an invalid scroll position", () => {
    window.history.replaceState(
      { entry: { page: "library", scrollTop: -1 } },
      "",
      "/library?sort=newest",
    );

    expect(navigationEntryFromWindow()).toEqual({ page: "library" });
  });
});
