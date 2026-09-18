import { Pressable, StyleSheet } from "react-native";
import { Avatar } from "@/shared/ui";

interface UserAvatarButtonProps {
  user: { email?: string };
  accessibilityLabel: string;
  onPress: () => void;
}

export function UserAvatarButton({ user, accessibilityLabel, onPress }: UserAvatarButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Avatar label={user.email ?? "W"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
