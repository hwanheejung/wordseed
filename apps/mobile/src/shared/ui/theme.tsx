import { createContext, useContext, type ReactNode } from "react";
import { useColorScheme } from "react-native";

export interface UITheme {
  colors: {
    background: string;
    surface: string;
    text: string;
    secondaryText: string;
    accent: string;
    onAccent: string;
    separator: string;
  };
}

const lightTheme: UITheme = {
  colors: {
    background: "#F2F2F7",
    surface: "#FFFFFF",
    text: "#1C1C1E",
    secondaryText: "#636366",
    accent: "#005AC1",
    onAccent: "#FFFFFF",
    separator: "#C6C6C8",
  },
};

const darkTheme: UITheme = {
  colors: {
    background: "#000000",
    surface: "#1C1C1E",
    text: "#F2F2F7",
    secondaryText: "#AEAEB2",
    accent: "#8CC4FF",
    onAccent: "#001D36",
    separator: "#48484A",
  },
};

const UIThemeContext = createContext<UITheme | null>(null);

export interface UIThemeProviderProps {
  children: ReactNode;
  theme: UITheme;
}

export function UIThemeProvider({ children, theme }: UIThemeProviderProps) {
  return <UIThemeContext.Provider value={theme}>{children}</UIThemeContext.Provider>;
}

export function useUITheme(): UITheme {
  const theme = useContext(UIThemeContext);
  const colorScheme = useColorScheme();
  return theme ?? (colorScheme === "dark" ? darkTheme : lightTheme);
}
