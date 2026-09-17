import { Text as NativeText, StyleSheet, type TextProps as NativeTextProps } from "react-native";
import { useUITheme } from "./theme";

const styles = StyleSheet.create({
  title: { fontSize: 34, lineHeight: 41, fontWeight: "700" },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: "600" },
  body: { fontSize: 17, lineHeight: 24 },
  caption: { fontSize: 13, lineHeight: 18 },
});

export interface TextProps extends NativeTextProps {
  variant?: keyof typeof styles;
  tone?: "primary" | "secondary";
}

export function Text({ variant = "body", tone = "primary", style, ...props }: TextProps) {
  const { colors } = useUITheme();
  return (
    <NativeText
      {...props}
      style={[styles[variant], { color: tone === "primary" ? colors.text : colors.secondaryText }, style]}
    />
  );
}
