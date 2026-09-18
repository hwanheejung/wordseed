import { useRef, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Surface, Text } from "@/shared/ui";
import type { SocialProvider } from "../api/social-sign-in";

interface SignInFormProps {
  error: string | null;
  onSignIn: (provider: SocialProvider) => Promise<void>;
}

export function SignInForm({ error, onSignIn }: SignInFormProps) {
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const submitting = useRef(false);

  async function handleSignIn(selected: SocialProvider) {
    if (submitting.current) return;
    submitting.current = true;
    setProvider(selected);
    try {
      await onSignIn(selected);
    } finally {
      submitting.current = false;
      setProvider(null);
    }
  }

  return (
    <Surface tone="background" style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="title">Wordseed</Text>
        <Text>Sign in to save expressions.</Text>
        <Button label="Continue with Apple" loading={provider === "apple"} disabled={provider !== null} onPress={() => void handleSignIn("apple")} />
        <Button label="Continue with Google" loading={provider === "google"} disabled={provider !== null} onPress={() => void handleSignIn("google")} />
        {error && <Text accessibilityRole="alert">{error}</Text>}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 20 },
});
