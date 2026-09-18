import { StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { useUITheme } from "./theme";

interface AvatarProps {
  label: string;
  size?: number;
}

export function Avatar({ label, size = 34 }: AvatarProps) {
  const { colors } = useUITheme();

  return (
    <View accessible={false} style={[styles.circle, {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.accent,
    }]}>
      <Text accessible={false} allowFontScaling={false} style={{
        color: colors.onAccent,
        fontSize: size * 0.44,
        lineHeight: size * 0.6,
        fontWeight: "600",
      }}>{Array.from(label.trim())[0]?.toLocaleUpperCase() ?? "W"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
});
