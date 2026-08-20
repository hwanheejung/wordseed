export type NavigationEntry =
  | { page: "home" }
  | { page: "add" }
  | { page: "library"; search?: string; scrollTop?: number }
  | { page: "all-tags" }
  | { page: "study"; tag?: string; meaningId?: string }
  | { page: "focus-study" }
  | { page: "fill-in-the-blank-test"; tag?: string }
  | { page: "card"; cardIds: string[]; startIndex: number };

export type Page = NavigationEntry["page"];
