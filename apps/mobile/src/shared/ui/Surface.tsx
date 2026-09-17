import { View, type ViewProps } from "react-native";
import { useUITheme } from "./theme";

export interface SurfaceProps extends ViewProps {
  tone?: "background" | "surface";
}

export function Surface({ tone = "surface", style, ...props }: SurfaceProps) {
  const { colors } = useUITheme();
  return <View {...props} style={[{ backgroundColor: colors[tone] }, style]} />;
}
