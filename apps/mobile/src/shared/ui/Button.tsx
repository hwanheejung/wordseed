import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";
import { useUITheme } from "./theme";

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  label: { fontSize: 17, lineHeight: 24, fontWeight: "600", flexShrink: 1, textAlign: "center" },
});

export interface ButtonProps extends Omit<PressableProps, "children" | "accessibilityRole" | "role"> {
  label: string;
  variant?: "filled" | "plain";
  loading?: boolean;
}

export function Button({
  label,
  variant = "filled",
  loading = false,
  disabled = false,
  accessibilityState,
  accessibilityLabel,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useUITheme();
  const foreground = variant === "filled" ? colors.onAccent : colors.accent;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ ...accessibilityState, disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      style={(state) => [
        styles.button,
        { backgroundColor: variant === "filled" ? colors.accent : "transparent" },
        typeof style === "function" ? style(state) : style,
        { opacity: disabled ? 0.4 : state.pressed ? 0.65 : 1 },
      ]}
    >
      {loading && <ActivityIndicator accessible={false} color={foreground} />}
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}
