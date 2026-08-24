import type {
  CardLearningStatus,
  CardReviewPeriod,
  CardsQueryInput,
  CardSort,
} from "@/entities/card";

export interface LibraryFilters {
  search: string;
  statuses: CardLearningStatus[];
  reviewPeriod?: CardReviewPeriod;
  tags: string[];
  sort: CardSort;
}

export type LibraryFiltersAction =
  | { type: "searchChanged"; search: string }
  | { type: "statusesChanged"; statuses: CardLearningStatus[] }
  | { type: "reviewPeriodChanged"; reviewPeriod?: CardReviewPeriod }
  | { type: "tagsChanged"; tags: string[] }
  | { type: "sortChanged"; sort: CardSort }
  | { type: "filtersReset" };

export const libraryLearningStatusOptions = [
  { value: "unreviewed", label: "학습 전" },
  { value: "unknown", label: "몰랐어요" },
  { value: "confusing", label: "헷갈려요" },
  { value: "correct", label: "알고 있어요" },
] satisfies Array<{ value: CardLearningStatus; label: string }>;

export const libraryReviewPeriodOptions = [
  { value: "today", label: "오늘" },
  { value: "3d", label: "최근 3일" },
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "older-than-30d", label: "한 달 넘음" },
] satisfies Array<{ value: CardReviewPeriod; label: string }>;

export const librarySortOptions = [
  { value: "added-desc", label: "최근 추가한 순" },
  { value: "added-asc", label: "오래전에 추가한 순" },
  { value: "reviewed-desc", label: "최근 학습한 순" },
  { value: "reviewed-asc", label: "학습한 지 오래된 순" },
  { value: "alphabetical", label: "알파벳순" },
] satisfies Array<{ value: CardSort; label: string }>;

export function readLibraryFilters(): LibraryFilters {
  return parseLibraryFilters(window.location.search);
}

export function parseLibraryFilters(search: string): LibraryFilters {
  const params = new URLSearchParams(search);
  const legacyStatus = params.get("status");
  const statuses = params
    .getAll("status")
    .filter(isCardLearningStatus)
    .filter((status, index, values) => values.indexOf(status) === index);
  const reviewPeriod = params.get("reviewedWithin");
  const sort = params.get("sort");

  if (legacyStatus === "recently-repeated-unknown") {
    return {
      search: params.get("q") ?? "",
      statuses: ["unknown"],
      reviewPeriod: "3d",
      tags: params.getAll("tag"),
      sort: "reviewed-desc",
    };
  }
  if (legacyStatus === "needs-review") {
    return {
      search: params.get("q") ?? "",
      statuses: ["unknown", "confusing"],
      tags: params.getAll("tag"),
      sort: "reviewed-asc",
    };
  }

  return {
    search: params.get("q") ?? "",
    statuses,
    reviewPeriod: isCardReviewPeriod(reviewPeriod) ? reviewPeriod : undefined,
    tags: params.getAll("tag"),
    sort: parseCardSort(sort),
  };
}

export function createLibrarySearch(input: CardsQueryInput): string {
  const params = new URLSearchParams();
  params.set("sort", input.sort ?? "added-desc");
  input.statuses?.forEach((status) => params.append("status", status));
  if (input.reviewPeriod)
    params.set("reviewedWithin", input.reviewPeriod);
  input.tags?.forEach((tag) => params.append("tag", tag));
  if (input.search?.trim()) params.set("q", input.search.trim());

  return params.toString();
}

export function libraryFiltersReducer(
  state: LibraryFilters,
  action: LibraryFiltersAction,
): LibraryFilters {
  switch (action.type) {
    case "searchChanged":
      return { ...state, search: action.search };
    case "statusesChanged":
      return { ...state, statuses: action.statuses };
    case "reviewPeriodChanged":
      return { ...state, reviewPeriod: action.reviewPeriod };
    case "tagsChanged":
      return { ...state, tags: action.tags };
    case "sortChanged":
      return { ...state, sort: action.sort };
    case "filtersReset":
      return { ...state, statuses: [], reviewPeriod: undefined, tags: [] };
  }
}

function isCardLearningStatus(value: string): value is CardLearningStatus {
  return (
    value === "unreviewed" ||
    value === "unknown" ||
    value === "confusing" ||
    value === "correct"
  );
}

function isCardReviewPeriod(
  value: string | null,
): value is CardReviewPeriod {
  return (
    value === "today" ||
    value === "3d" ||
    value === "7d" ||
    value === "30d" ||
    value === "older-than-30d"
  );
}

function parseCardSort(value: string | null): CardSort {
  if (value === "oldest") return "added-asc";
  if (value === "newest") return "added-desc";
  if (
    value === "added-asc" ||
    value === "reviewed-desc" ||
    value === "reviewed-asc" ||
    value === "alphabetical"
  )
    return value;

  return "added-desc";
}
