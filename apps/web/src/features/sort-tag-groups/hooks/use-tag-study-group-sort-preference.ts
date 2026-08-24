import { useState } from "react";
import { z } from "zod";
import type { TagStudyGroupSort } from "@/entities/card";

const TAG_SORT_STORAGE_KEY = "wordseed:all-tags-sort";
const tagStudyGroupSortSchema = z.enum([
  "name",
  "recentlyReviewed",
  "leastRecentlyReviewed",
  "learningPriority",
]);

export function useTagStudyGroupSortPreference() {
  const [sort, setSort] = useState<TagStudyGroupSort>(readTagSort);

  const saveSort = (nextSort: TagStudyGroupSort) => {
    setSort(nextSort);
    writeTagSort(nextSort);
  };

  return { sort, saveSort };
}

function readTagSort(): TagStudyGroupSort {
  try {
    const result = tagStudyGroupSortSchema.safeParse(
      window.localStorage.getItem(TAG_SORT_STORAGE_KEY),
    );

    return result.success ? result.data : "name";
  } catch {
    return "name";
  }
}

function writeTagSort(sort: TagStudyGroupSort) {
  try {
    window.localStorage.setItem(TAG_SORT_STORAGE_KEY, sort);
  } catch {
    // Keep the selected sort for this session when browser storage is unavailable.
  }
}
