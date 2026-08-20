import { useSyncExternalStore } from "react";
import { navigationEntryFromWindow, PRIMARY_PAGE_PATHS } from "./routes";
import type { NavigationEntry } from "./types";

const NAVIGATION_EVENT = "wordseed:navigation";
let currentEntry: NavigationEntry | undefined;

function getNavigationEntry() {
  currentEntry ??= navigationEntryFromWindow();

  return currentEntry;
}

function subscribeToNavigation(onChange: () => void) {
  const handleNavigation = () => {
    currentEntry = navigationEntryFromWindow();
    onChange();
  };

  window.addEventListener("popstate", handleNavigation);
  window.addEventListener(NAVIGATION_EVENT, handleNavigation);

  return () => {
    window.removeEventListener("popstate", handleNavigation);
    window.removeEventListener(NAVIGATION_EVENT, handleNavigation);
  };
}

export function navigate(next: NavigationEntry) {
  window.scrollTo({ top: 0, behavior: "smooth" });
  const path = PRIMARY_PAGE_PATHS[next.page] ?? window.location.pathname;
  const destination =
    next.page === "library" && next.search ? `${path}?${next.search}` : path;
  window.history.pushState(
    { entry: next },
    "",
    destination,
  );
  currentEntry = next;
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

export function useNavigationEntry() {
  return useSyncExternalStore(
    subscribeToNavigation,
    getNavigationEntry,
    getNavigationEntry,
  );
}
