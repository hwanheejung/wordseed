import { useEffect, useState } from "react";
import {
  normalizeTags,
} from "@/entities/card";
import type {
  ReviewResult,
  VocabularyCard,
} from "@/entities/card";

export function useCardFilters(cards: VocabularyCard[]) {
  const initialParams = new URLSearchParams(window.location.search);
  const initialStatus = initialParams.get("status");
  const [search, setSearch] = useState(() => initialParams.get("q") ?? "");
  const [filter, setFilter] = useState<"all" | ReviewResult>(() =>
    initialStatus === "unknown" ||
    initialStatus === "confusing" ||
    initialStatus === "correct"
      ? initialStatus
      : "all",
  );
  const [tagFilter, setTagFilter] = useState<string[]>(() =>
    normalizeTags(initialParams.getAll("tag")),
  );
  const [sort, setSort] = useState<"newest" | "oldest">(() =>
    initialParams.get("sort") === "oldest" ? "oldest" : "newest",
  );

  const availableTags = normalizeTags(cards.flatMap((card) => card.tags)).sort(
    (a, b) => a.localeCompare(b, "ko"),
  );
  const filtered = cards
    .filter(
      (card) =>
        (filter === "all" ||
          card.meanings.some((meaning) => meaning.status === filter)) &&
        (tagFilter.length === 0 ||
          tagFilter.some((tag) => card.tags.includes(tag))) &&
        `${card.term} ${card.meanings.map((item) => `${item.expression} ${item.definitionKo}`).join(" ")} ${card.tags.join(" ")}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
    )
    .sort((left, right) =>
      sort === "newest"
        ? right.createdAt.localeCompare(left.createdAt)
        : left.createdAt.localeCompare(right.createdAt),
    );

  // Synchronize the active library filters with the browser URL.
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
    if (filter !== "all") params.set("status", filter);
    tagFilter.forEach((tag) => params.append("tag", tag));
    if (search.trim()) params.set("q", search.trim());
    window.history.replaceState(
      { entry: { page: "library" } },
      "",
      `/library?${params.toString()}`,
    );
  }, [filter, search, sort, tagFilter]);

  return {
    availableTags,
    filter,
    filtered,
    hasFilters: filter !== "all" || tagFilter.length > 0,
    resetFilters: () => {
      setFilter("all");
      setTagFilter([]);
    },
    search,
    setFilter,
    setSearch,
    setSort,
    setTagFilter,
    sort,
    tagFilter,
  };
}
