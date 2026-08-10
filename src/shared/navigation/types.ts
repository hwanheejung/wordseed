export type NavigationEntry =
  | { page: "home" }
  | { page: "add" }
  | { page: "library" }
  | { page: "all-tags" }
  | { page: "study"; tag?: string; meaningId?: string }
  | { page: "focus-study" }
  | { page: "fill-in-the-blank-test" }
  | { page: "card"; cardIds: string[]; startIndex: number };

export type Page = NavigationEntry["page"];
