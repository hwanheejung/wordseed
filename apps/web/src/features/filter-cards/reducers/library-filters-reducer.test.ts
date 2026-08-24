import { describe, expect, it } from "vitest";
import {
  createLibrarySearch,
  parseLibraryFilters,
} from "./library-filters-reducer";

describe("library filter URL", () => {
  it("restores multiple statuses, review period, tags, and sorting", () => {
    expect(
      parseLibraryFilters(
        "?status=unknown&status=confusing&reviewedWithin=3d&tag=TOEFL&sort=reviewed-desc",
      ),
    ).toEqual({
      search: "",
      statuses: ["unknown", "confusing"],
      reviewPeriod: "3d",
      tags: ["TOEFL"],
      sort: "reviewed-desc",
    });
  });

  it("maps the previous recent-unknown URL to reusable filters", () => {
    expect(
      parseLibraryFilters("?status=recently-repeated-unknown"),
    ).toMatchObject({
      statuses: ["unknown"],
      reviewPeriod: "3d",
      sort: "reviewed-desc",
    });
  });

  it("serializes a reusable card query for View all navigation", () => {
    expect(
      createLibrarySearch({
        statuses: ["unknown", "confusing"],
        reviewPeriod: "3d",
        sort: "reviewed-desc",
      }),
    ).toBe(
      "sort=reviewed-desc&status=unknown&status=confusing&reviewedWithin=3d",
    );
  });
});
