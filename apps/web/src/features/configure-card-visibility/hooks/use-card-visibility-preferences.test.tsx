// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useCardVisibilityPreferences } from "./use-card-visibility-preferences";

describe("useCardVisibilityPreferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("restores saved fields after the consumer remounts", () => {
    const first = renderHook(useCardVisibilityPreferences);

    act(() => {
      first.result.current.savePreferences(["expression", "definitionKo"]);
    });
    first.unmount();

    const second = renderHook(useCardVisibilityPreferences);

    expect(second.result.current.preferences.concealedFields).toEqual([
      "expression",
      "definitionKo",
    ]);
  });
});
