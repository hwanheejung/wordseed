import { describe, expect, it } from "vitest";
import { parseLibraryFilters } from "./library-filters-reducer";

describe("parseLibraryFilters", () => {
  it("restores the recently repeated unknown filter from the URL", () => {
    expect(
      parseLibraryFilters("?status=recently-repeated-unknown").status,
    ).toBe("recently-repeated-unknown");
  });

  it("restores the needs-review filter from the URL", () => {
    expect(parseLibraryFilters("?status=needs-review").status).toBe(
      "needs-review",
    );
  });
});
