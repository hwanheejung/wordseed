import { z } from "zod";
import type { NavigationEntry, Page } from "./types";

export const PRIMARY_PAGE_PATHS: Partial<Record<Page, string>> = {
  home: "/",
  add: "/add",
  toefl: "/toefl",
  library: "/library",
  "all-tags": "/tags",
};

const navigationEntrySchema = z.discriminatedUnion("page", [
  z.object({ page: z.literal("home") }),
  z.object({ page: z.literal("add") }),
  z.object({ page: z.literal("toefl") }),
  z.object({
    page: z.literal("library"),
    search: z.string().optional(),
    scrollTop: z.number().finite().nonnegative().optional(),
  }),
  z.object({ page: z.literal("all-tags") }),
  z.object({
    page: z.literal("study"),
    tag: z.string().optional(),
    meaningId: z.string().optional(),
  }),
  z.object({ page: z.literal("focus-study") }),
  z.object({
    page: z.literal("fill-in-the-blank-test"),
    tag: z.string().optional(),
  }),
  z.object({
    page: z.literal("card"),
    cardIds: z.array(z.string()),
    startIndex: z.number().int().nonnegative(),
  }),
]);

export function navigationEntryFromWindow(): NavigationEntry {
  const historyEntry = navigationEntrySchema.safeParse(
    window.history.state?.entry,
  );
  if (historyEntry.success) return historyEntry.data;
  if (window.location.pathname === "/library") return { page: "library" };
  if (window.location.pathname === "/add") return { page: "add" };
  if (window.location.pathname === "/toefl") return { page: "toefl" };
  if (window.location.pathname === "/tags") return { page: "all-tags" };

  return { page: "home" };
}
