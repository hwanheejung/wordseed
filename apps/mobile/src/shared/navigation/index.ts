export type AppStackParams = {
  SignIn: undefined;
  SessionStatus: undefined;
  Tabs: undefined;
  Account: undefined;
};

export type HomeStackParams = {
  HomeOverview: undefined;
  Detail: { title: string };
};

export type DictionaryStackParams = {
  DictionaryDetail: { lexemeId: string; senseId?: string };
};

export type LibraryStackParams = DictionaryStackParams & {
  LibraryOverview: undefined;
};

export type SearchStackParams = DictionaryStackParams & {
  SearchOverview: undefined;
};
