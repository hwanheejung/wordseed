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
  AppStackParams,
  HomeStackParams,
  LibraryStackParams,
  SearchStackParams,
} from "@/shared/navigation";

const screens = {
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

export const AppNavigator = createNativeStackNavigator<AppStackParams>({
  screens: {
    Tabs: {
      screen: Tabs,
      options: { headerShown: false },
    },
    Account: screens.Account,
  },
}).getComponent();
