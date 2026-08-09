import type { ReviewResult } from "@/entities/card";

export interface LibraryFilters {
  search: string;
  status: "all" | ReviewResult;
  tags: string[];
  sort: "newest" | "oldest";
}

export type LibraryFiltersAction =
  | { type: "searchChanged"; search: string }
  | { type: "statusChanged"; status: LibraryFilters["status"] }
  | { type: "tagsChanged"; tags: string[] }
  | { type: "sortChanged"; sort: LibraryFilters["sort"] }
  | { type: "filtersReset" };

export function readLibraryFilters(): LibraryFilters {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  return {
    search: params.get("q") ?? "",
    status:
      status === "unknown" || status === "confusing" || status === "correct"
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
