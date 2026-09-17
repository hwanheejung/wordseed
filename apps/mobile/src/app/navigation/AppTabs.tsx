import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { HomeStack, LibraryStack, SearchStack } from "./ScreenStacks";

const Tab = createBottomTabNavigator();

export function AppTabs() {
  return (
    <Tab.Navigator backBehavior="history" screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>⌂</Text> }} />
      <Tab.Screen name="Library" component={LibraryStack} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>▤</Text> }} />
      <Tab.Screen name="Search" component={SearchStack} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>⌕</Text> }} />
    </Tab.Navigator>
  );
}
