import { RelayEnvironmentProvider } from "react-relay";
import { useSession } from "@/entities/session";
import { SignInPage, signInPageOptions } from "@/routes/SignInPage";
import { SessionStatusPage, sessionStatusPageOptions } from "@/routes/SessionStatusPage";
import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AccountPage, accountPageOptions } from "@/routes/AccountPage";
import { HomePage, homePageOptions } from "@/routes/HomePage";
import { LibraryPage, libraryPageOptions } from "@/routes/LibraryPage";
import { SearchPage, searchPageOptions } from "@/routes/SearchPage";
import {
  PreviewDetailPage,
  previewDetailPageOptions,
} from "@/routes/PreviewDetailPage";
import {
  DictionaryDetailPage,
  dictionaryDetailPageOptions,
} from "@/routes/DictionaryDetailPage";
import { AppTabs } from "./AppTabs";
import type { AppTabsProps, TabDefinition } from "./tab-definition";
import type {
  HomeStackParams,
  LibraryStackParams,
  SearchStackParams,
} from "@/shared/navigation";

const screens = {
  SignIn: { screen: SignInPage, options: signInPageOptions },
  SessionStatus: { screen: SessionStatusPage, options: sessionStatusPageOptions },
  Home: { screen: HomePage, options: homePageOptions },
  Library: { screen: LibraryPage, options: libraryPageOptions },
  Search: { screen: SearchPage, options: searchPageOptions },
  PreviewDetail: {
    screen: PreviewDetailPage,
    options: previewDetailPageOptions,
  },
  DictionaryDetail: {
    screen: DictionaryDetailPage,
    options: dictionaryDetailPageOptions,
  },
  Account: { screen: AccountPage, options: accountPageOptions },
};

const stackOptions = { headerBackButtonDisplayMode: "minimal" } as const;

const HomeStack = createNativeStackNavigator<HomeStackParams>({
  screenOptions: stackOptions,
  screens: { HomeOverview: screens.Home, Detail: screens.PreviewDetail },
}).getComponent();

const LibraryStack = createNativeStackNavigator<LibraryStackParams>({
  screenOptions: stackOptions,
  screens: {
    LibraryOverview: screens.Library,
    DictionaryDetail: screens.DictionaryDetail,
  },
}).getComponent();

const SearchStack = createNativeStackNavigator<SearchStackParams>({
  screenOptions: stackOptions,
  screens: {
    SearchOverview: screens.Search,
    DictionaryDetail: screens.DictionaryDetail,
  },
}).getComponent();

const tabDefinitions = {
  home: {
    name: "Home",
    component: HomeStack,
    options: {
      tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>⌂</Text>,
    },
    iosOptions: { tabBarIcon: { type: "sfSymbol", name: "house" } },
  },
  library: {
    name: "Library",
    component: LibraryStack,
    options: {
      tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>▤</Text>,
    },
    iosOptions: { tabBarIcon: { type: "sfSymbol", name: "books.vertical" } },
  },
  search: {
    name: "Search",
    component: SearchStack,
    options: {
      tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>⌕</Text>,
    },
    iosOptions: { tabBarSystemItem: "search" },
  },
} satisfies Record<string, TabDefinition>;

const defaultTabs = [
  tabDefinitions.home,
  tabDefinitions.library,
  tabDefinitions.search,
] satisfies AppTabsProps["tabs"];

function Tabs() {
  return <AppTabs tabs={defaultTabs} />;
}

const RootNavigator = createNativeStackNavigator({
  groups: {
    Pending: {
      if: useIsSessionPending,
      screens: { SessionStatus: screens.SessionStatus },
    },
    SignedOut: {
      if: useIsSignedOut,
      screens: { SignIn: screens.SignIn },
    },
    SignedIn: {
      if: useIsSignedIn,
      screens: {
        Tabs: { screen: Tabs, options: { headerShown: false } },
        Account: screens.Account,
      },
    },
  },
}).getComponent();

export function AppNavigator() {
  const session = useSession();

  if (session.status === "ready") {
    return (
      <RelayEnvironmentProvider key={session.user.id} environment={session.environment}>
        <RootNavigator />
      </RelayEnvironmentProvider>
    );
  }
  return <RootNavigator />;
}

function useIsSessionPending() {
  const session = useSession();
  return session.status === "loading" || session.status === "connecting" || session.status === "unavailable";
}

function useIsSignedOut() {
  return useSession().status === "signed-out";
}

function useIsSignedIn() {
  return useSession().status === "ready";
}
