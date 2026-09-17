import { StyleSheet, View, type ViewProps } from "react-native";
import { useUITheme } from "./theme";

const styles = StyleSheet.create({
  separator: { height: StyleSheet.hairlineWidth, alignSelf: "stretch" },
});

export interface SeparatorProps extends ViewProps {}

export function Separator({ style, ...props }: SeparatorProps) {
  const { colors } = useUITheme();
  return (
    <View
      accessible={false}
      {...props}
      style={[styles.separator, { backgroundColor: colors.separator }, style]}
    />
  );
}
