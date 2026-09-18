import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable";
import type { AppTabsProps } from "./tab-definition";

const Tab = createNativeBottomTabNavigator();

export function AppTabs({ tabs }: AppTabsProps) {
  return (
    <Tab.Navigator backBehavior="history" screenOptions={{ headerShown: false }}>
      {tabs.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} options={tab.iosOptions} />
      ))}
    </Tab.Navigator>
  );
}
