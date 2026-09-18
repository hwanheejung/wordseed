import type { ComponentType } from "react";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import type { NativeBottomTabNavigationOptions } from "@react-navigation/bottom-tabs/unstable";

export interface TabDefinition {
  name: string;
  component: ComponentType;
  options?: BottomTabNavigationOptions;
  iosOptions?: NativeBottomTabNavigationOptions;
}

export interface AppTabsProps {
  tabs: readonly [TabDefinition, ...TabDefinition[]];
}
