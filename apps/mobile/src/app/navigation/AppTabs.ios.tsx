import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable";
import { HomeStack, LibraryStack, SearchStack } from "./ScreenStacks";

const Tab = createNativeBottomTabNavigator();

export function AppTabs() {
  return (
    <Tab.Navigator backBehavior="history" screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarIcon: { type: "sfSymbol", name: "house" } }} />
      <Tab.Screen name="Library" component={LibraryStack} options={{ tabBarIcon: { type: "sfSymbol", name: "books.vertical" } }} />
      <Tab.Screen name="Search" component={SearchStack} options={{ tabBarSystemItem: "search" }} />
    </Tab.Navigator>
  );
}
