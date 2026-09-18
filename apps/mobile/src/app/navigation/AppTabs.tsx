import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { AppTabsProps } from "./tab-definition";

const Tab = createBottomTabNavigator();

export function AppTabs({ tabs }: AppTabsProps) {
  return (
    <Tab.Navigator backBehavior="history" screenOptions={{ headerShown: false }}>
      {tabs.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} options={tab.options} />
      ))}
    </Tab.Navigator>
  );
}
