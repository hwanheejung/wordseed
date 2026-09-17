import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useUITheme } from "@/shared/ui";
import { AppTabs } from "./navigation/AppTabs";

export function App() {
  const scheme = useColorScheme();
  const { colors } = useUITheme();
  const baseTheme = scheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={{ ...baseTheme, colors: {
        ...baseTheme.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.separator,
      } }}>
        <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} />
        <AppTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
