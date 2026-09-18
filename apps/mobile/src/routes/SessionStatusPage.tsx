import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useSession } from "@/entities/session";
import { Surface, Text } from "@/shared/ui";

export const sessionStatusPageOptions = {
  headerShown: false,
} satisfies NativeStackNavigationOptions;

export function SessionStatusPage() {
  const session = useSession();

  if (session.status === "loading" || session.status === "connecting") {
    return <Surface tone="background" style={styles.center}><ActivityIndicator accessibilityLabel="Loading" /></Surface>;
  }
  if (session.status !== "unavailable") return null;

  return (
    <Surface tone="background" style={styles.center}>
      {session.reason === "secure-storage" ? <>
        <Text accessibilityRole="alert">Secure storage is unavailable in this app version.</Text>
        <Text>{__DEV__ ? "Rebuild the native app with Keychain support, then open it instead of Expo Go." : "Install the latest version of the app."}</Text>
      </> : <Text accessibilityRole="alert">Sign-in is unavailable. Check the app configuration.</Text>}
    </Surface>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 },
});
