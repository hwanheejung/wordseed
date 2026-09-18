import { useRef, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Surface, Text } from "@/shared/ui";
import type { SocialProvider, SocialSignIn } from "../api/social-sign-in";

interface SignInFormProps { socialSignIn: SocialSignIn }

type SignInState = { status: "idle" } | { status: "submitting"; provider: SocialProvider } | { status: "error"; message: string };

export function SignInForm({ socialSignIn }: SignInFormProps) {
  const [state, setState] = useState<SignInState>({ status: "idle" });
  const submitting = useRef(false);

  async function handleSignIn(provider: SocialProvider) {
    if (submitting.current) return;
    submitting.current = true;
    setState({ status: "submitting", provider });
    try {
      const result = await socialSignIn.signIn(provider);
      if (result.status === "error") {
        const messages = {
          provider: "로그인을 시작하지 못했어요. 다시 시도해 주세요.",
          browser: "로그인 브라우저를 열지 못했어요. 다시 시도해 주세요.",
          callback: "로그인 응답을 확인하지 못했어요. 다시 시도해 주세요.",
          exchange: "로그인 세션을 연결하지 못했어요. 다시 시도해 주세요.",
        };
        setState({ status: "error", message: messages[result.reason] });
      } else setState({ status: "idle" });
    } catch {
      setState({ status: "error", message: "로그인하지 못했어요. 다시 시도해 주세요." });
    } finally {
      submitting.current = false;
    }
  }

  return <Surface tone="background" style={styles.page}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text variant="title">Wordseed</Text>
      <Text>로그인하고 표현을 모아 보세요.</Text>
      <Button label="Apple로 계속하기" loading={state.status === "submitting" && state.provider === "apple"} disabled={state.status === "submitting"} onPress={() => void handleSignIn("apple")} />
      <Button label="Google로 계속하기" loading={state.status === "submitting" && state.provider === "google"} disabled={state.status === "submitting"} onPress={() => void handleSignIn("google")} />
      {state.status === "error" && <Text accessibilityRole="alert">{state.message}</Text>}
    </ScrollView>
  </Surface>;
}

const styles = StyleSheet.create({ page: { flex: 1 }, content: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 20 } });
