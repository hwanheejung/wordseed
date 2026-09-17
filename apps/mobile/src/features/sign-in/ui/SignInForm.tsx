import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import type { AuthClient } from "@/shared/auth";
import { Button, Surface, Text, useUITheme } from "@/shared/ui";

interface SignInFormProps { authClient: AuthClient }

export function SignInForm({ authClient }: SignInFormProps) {
  const { colors } = useUITheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSignIn() {
    if (status === "submitting" || !email.trim() || !password) return;
    setStatus("submitting");
    try {
      const { data, error } = await authClient.signInWithPassword({ email: email.trim(), password });
      if (error || !data.session) {
        setStatus("error");
        return;
      }
      setPassword("");
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return <Surface tone="background" style={styles.page}>
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text variant="title">Wordseed</Text>
        <Text>로그인하고 표현을 모아 보세요.</Text>
        <View style={styles.field}>
          <Text nativeID="sign-in-email">이메일</Text>
          <TextInput accessibilityLabel="이메일" accessibilityLabelledBy="sign-in-email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" textContentType="emailAddress" editable={status !== "submitting"} style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]} />
        </View>
        <View style={styles.field}>
          <Text nativeID="sign-in-password">비밀번호</Text>
          <TextInput accessibilityLabel="비밀번호" accessibilityLabelledBy="sign-in-password" value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password" secureTextEntry editable={status !== "submitting"} returnKeyType="go" onSubmitEditing={() => void handleSignIn()} style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]} />
        </View>
        {status === "error" && <Text accessibilityRole="alert">로그인하지 못했어요. 이메일과 비밀번호, 연결 상태를 확인해 주세요.</Text>}
        <Button label="로그인" loading={status === "submitting"} disabled={!email.trim() || !password} onPress={() => void handleSignIn()} />
      </ScrollView>
    </KeyboardAvoidingView>
  </Surface>;
}

const styles = StyleSheet.create({ page: { flex: 1 }, content: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 20 }, field: { gap: 8 }, input: { minHeight: 52, padding: 14, borderRadius: 12, fontSize: 17 } });
