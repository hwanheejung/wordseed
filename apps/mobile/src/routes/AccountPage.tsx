import { useRef, useState } from "react";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSession } from "@/entities/session";
import { Avatar, Surface, Text, useUITheme } from "@/shared/ui";

export const accountPageOptions = {
  title: "Account",
  headerBackButtonDisplayMode: "minimal",
} satisfies NativeStackNavigationOptions;

export function AccountPage() {
  const { user, signOut } = useSession();
  const { colors } = useUITheme();
  const [status, setStatus] = useState<"idle" | "signingOut" | "failed">("idle");
  const signingOut = useRef(false);

  async function handleSignOut() {
    if (signingOut.current) return;
    signingOut.current = true;
    setStatus("signingOut");
    const result = await signOut();
    if (result.status === "error") setStatus("failed");
    // Successful logout unmounts the authenticated navigator, including this page.
    signingOut.current = false;
  }

  return (
    <Surface tone="background" style={styles.page}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Surface style={styles.identity}>
          <Avatar label={user.email ?? "W"} size={72} />
          <Text selectable style={styles.email}>{user.email ?? "Signed in"}</Text>
        </Surface>
        <Surface style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: status === "signingOut", busy: status === "signingOut" }}
            disabled={status === "signingOut"}
            onPress={() => void handleSignOut()}
            style={({ pressed }) => [styles.signOut, { opacity: pressed ? 0.6 : 1 }]}
          >
            {status === "signingOut" && <ActivityIndicator accessible={false} color={colors.accent} />}
            <Text style={{ color: colors.accent }}>{status === "signingOut" ? "Signing out…" : "Sign out"}</Text>
          </Pressable>
        </Surface>
        {status === "failed" && (
          <Text accessibilityRole="alert" style={styles.error}>
            Couldn't sign out. Please try again.
          </Text>
        )}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 24 },
  identity: { padding: 28, borderRadius: 16, alignItems: "center", gap: 16 },
  email: { textAlign: "center" },
  actions: { borderRadius: 12, overflow: "hidden" },
  signOut: { minHeight: 52, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  error: { paddingHorizontal: 16 },
});
