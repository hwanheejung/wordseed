// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useTagStudyGroupSortPreference } from "./use-tag-study-group-sort-preference";

describe("tag study group sort preference", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("uses name order by default", () => {
    const { result } = renderHook(useTagStudyGroupSortPreference);

    expect(result.current.sort).toBe("name");
  });

  it("saves and restores the selected order", () => {
    const first = renderHook(useTagStudyGroupSortPreference);

    act(() => first.result.current.saveSort("recentlyReviewed"));
    first.unmount();

    const second = renderHook(useTagStudyGroupSortPreference);
    expect(second.result.current.sort).toBe("recentlyReviewed");
  });

  it("falls back to name order for an unsupported stored value", () => {
    window.localStorage.setItem("wordseed:all-tags-sort", "unsupported");

    const { result } = renderHook(useTagStudyGroupSortPreference);
    expect(result.current.sort).toBe("name");
  });
});
