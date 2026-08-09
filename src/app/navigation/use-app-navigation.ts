import { useEffect, useState } from "react";
import { navigationEntryFromWindow, PRIMARY_PAGE_PATHS } from "./routes";
import type { NavigationEntry } from "./types";

export function useAppNavigation() {
  const [entry, setEntry] = useState<NavigationEntry>(
    navigationEntryFromWindow,
  );

  const navigate = (next: NavigationEntry) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.pushState(
      { entry: next },
      "",
      PRIMARY_PAGE_PATHS[next.page] ?? window.location.pathname,
    );
    setEntry(next);
  };

  // Synchronize application navigation with browser history changes.
  useEffect(() => {
    const handlePopState = () => setEntry(navigationEntryFromWindow());

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return { entry, navigate };
}
