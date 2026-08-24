// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { navigationEntryFromWindow } from "./routes";

describe("navigationEntryFromWindow", () => {
  it("opens the TOEFL practice page from its URL", () => {
    window.history.replaceState(null, "", "/toefl");

    expect(navigationEntryFromWindow()).toEqual({ page: "toefl" });
  });

  it("opens the TOEFL Speaking practice page from its URL", () => {
    window.history.replaceState(null, "", "/toefl/speaking");

    expect(navigationEntryFromWindow()).toEqual({ page: "toefl-speaking" });
  });

  it("opens the Magic Expression page from its URL", () => {
    window.history.replaceState(
      null,
      "",
      "/toefl/speaking/magic-expressions",
    );

    expect(navigationEntryFromWindow()).toEqual({
      page: "toefl-magic-expressions",
    });
  });

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
