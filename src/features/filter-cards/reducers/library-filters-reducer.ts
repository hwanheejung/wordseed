import type { ReviewResult } from "@/entities/card";

export interface LibraryFilters {
  search: string;
  status:
    | "all"
    | ReviewResult
    | "needs-review"
    | "recently-repeated-unknown";
  tags: string[];
  sort: "newest" | "oldest";
}

export type LibraryFiltersAction =
  | { type: "searchChanged"; search: string }
  | { type: "statusChanged"; status: LibraryFilters["status"] }
  | { type: "tagsChanged"; tags: string[] }
  | { type: "sortChanged"; sort: LibraryFilters["sort"] }
  | { type: "filtersReset" };

export const libraryStudyFilterOptions = [
  { value: "needs-review", label: "다시 볼 단어" },
  {
    value: "recently-repeated-unknown",
    label: "최근 3일 다시 몰랐어요",
  },
  { value: "unknown", label: "몰랐어요" },
  { value: "confusing", label: "헷갈려요" },
  { value: "correct", label: "알고 있어요" },
] satisfies Array<{
  value: Exclude<LibraryFilters["status"], "all">;
  label: string;
}>;

export function readLibraryFilters(): LibraryFilters {
  return parseLibraryFilters(window.location.search);
}

export function parseLibraryFilters(search: string): LibraryFilters {
  const params = new URLSearchParams(search);
  const status = params.get("status");

  return {
    search: params.get("q") ?? "",
    status:
      status === "unknown" ||
      status === "confusing" ||
      status === "correct" ||
      status === "needs-review" ||
      status === "recently-repeated-unknown"
        ? status
        : "all",
    tags: params.getAll("tag"),
    sort: params.get("sort") === "oldest" ? "oldest" : "newest",
  };
}

export function libraryFiltersReducer(
  state: LibraryFilters,
  action: LibraryFiltersAction,
): LibraryFilters {
  switch (action.type) {
    case "searchChanged":
      return { ...state, search: action.search };
    case "statusChanged":
      return { ...state, status: action.status };
    case "tagsChanged":
      return { ...state, tags: action.tags };
    case "sortChanged":
      return { ...state, sort: action.sort };
    case "filtersReset":
      return { ...state, status: "all", tags: [] };
  }
}
