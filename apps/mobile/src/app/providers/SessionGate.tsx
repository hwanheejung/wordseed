import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, AppState, Linking, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RelayEnvironmentProvider } from "react-relay";
import { SignInForm, completeSignIn, createSocialSignIn } from "@/features/sign-in";
import { isKeychainAvailable, createKeychainSessionStorage, createSupabaseAuthClient, getSessionAccessToken, type AuthClient, type AuthSession } from "@/shared/auth";
import { createRelayEnvironment } from "@/shared/relay";
import { Button, Surface, Text } from "@/shared/ui";
import type { MobileConfiguration } from "../mobile-configuration";

import { observeAuthSession, type SessionState } from "./session-lifecycle";
interface SessionGateProps { configuration: MobileConfiguration; children: ReactNode }

export function SessionGate({ configuration, children }: SessionGateProps) {
  if (!isKeychainAvailable()) {
    return <Surface tone="background" style={styles.center}>
      <Text accessibilityRole="alert">이 앱 버전에서는 보안 저장소를 사용할 수 없어요.</Text>
      <Text>{__DEV__ ? "Expo Go 또는 이전 빌드가 열려 있어요. Keychain이 포함된 네이티브 앱을 다시 빌드해 실행해 주세요." : "최신 버전의 앱을 설치해 주세요."}</Text>
    </Surface>;
  }
  if (!configuration.supabaseUrl || !configuration.supabasePublishableKey) {
    return <Surface tone="background" style={styles.center}><Text>로그인 설정이 필요해요. 앱 설정을 확인해 주세요.</Text></Surface>;
  }
  return <ConfiguredSessionGate configuration={configuration}>{children}</ConfiguredSessionGate>;
}

function ConfiguredSessionGate({ configuration, children }: SessionGateProps) {
  const [auth] = useState(() => createSupabaseAuthClient({
    url: configuration.supabaseUrl,
    publishableKey: configuration.supabasePublishableKey,
    storage: createKeychainSessionStorage(),
  }));
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [socialSignIn] = useState(() => createSocialSignIn(auth, configuration.oauthBrowser));
  const [callbackStatus, setCallbackStatus] = useState<"loading" | "ready" | "failed">("loading");

  // Consume a cold-launch OAuth callback once; warm callbacks belong to the browser session.
  useEffect(() => {
    let active = true;
    void Linking.getInitialURL().then(async (url) => {
      const result = url ? await socialSignIn.consumeCallback(url) : null;
      if (active) setCallbackStatus(result?.status === "error" ? "failed" : "ready");
    }).catch(() => { if (active) setCallbackStatus("failed"); });
    return () => { active = false; };
  }, [socialSignIn]);

  // Synchronize the native app with Supabase session changes and foreground token refresh.
  useEffect(() => {
    let active = true;
    const stopObserving = observeAuthSession(auth, setState);
    function synchronizeRefresh(appState: string | null) {
      const operation = appState === "active" ? auth.startAutoRefresh() : auth.stopAutoRefresh();
      void operation.catch(() => { if (active) setState({ status: "failed" }); });
    }
    synchronizeRefresh(AppState.currentState);
    const appStateSubscription = AppState.addEventListener("change", synchronizeRefresh);
    return () => {
      active = false;
      stopObserving();
      appStateSubscription.remove();
      void auth.stopAutoRefresh().catch(() => undefined);
    };
  }, [auth, attempt]);

  if (state.status === "loading" || callbackStatus === "loading") return <View style={styles.center}><ActivityIndicator /></View>;
  if (state.status === "failed") return <Surface tone="background" style={styles.center}>
    <Text accessibilityRole="alert">로그인을 준비하지 못했어요.</Text>
    <Button label="다시 시도" onPress={() => setAttempt((value) => value + 1)} />
  </Surface>;
  if (!state.session) return <SafeAreaView style={{ flex: 1 }}>
    {callbackStatus === "failed" && <Text accessibilityRole="alert">로그인을 완료하지 못했어요. 다시 로그인해 주세요.</Text>}
    <SignInForm socialSignIn={socialSignIn} />
  </SafeAreaView>;
  return <AuthenticatedSession key={state.session.user.id} auth={auth} session={state.session} apiUrl={configuration.apiUrl}>{children}</AuthenticatedSession>;
}

interface AuthenticatedSessionProps { auth: AuthClient; session: AuthSession; apiUrl: string; children: ReactNode }
function AuthenticatedSession({ auth, session, apiUrl, children }: AuthenticatedSessionProps) {
  const [environment] = useState(() => createRelayEnvironment({
    apiUrl,
    getAccessToken: () => getSessionAccessToken(auth, session.user.id),
  }));
  const [status, setStatus] = useState<"connecting" | "ready" | "failed">("connecting");
  const [attempt, setAttempt] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);

  // Synchronize the Wordseed user with this externally authenticated session before private queries mount.
  useEffect(() => {
    let active = true;
    setStatus("connecting");
    void completeSignIn(environment).then(() => {
      if (active) setStatus("ready");
    }).catch((error: unknown) => {
      console.error("Failed to connect the authenticated Wordseed account.", error);
      if (active) setStatus("failed");
    });
    return () => { active = false; };
  }, [environment, attempt]);

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutFailed(false);
    try {
      const { error } = await auth.signOut({ scope: "local" });
      if (error) setSignOutFailed(true);
    } catch { setSignOutFailed(true); }
    finally { setSigningOut(false); }
  }

  return <RelayEnvironmentProvider environment={environment}>
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <Surface style={styles.account}>
        <Text variant="caption" numberOfLines={1} style={{ flex: 1 }}>{session.user.email ?? "로그인됨"}</Text>
        <Button variant="plain" label="로그아웃" loading={signingOut} onPress={handleSignOut} />
      </Surface>
      {signOutFailed && <Text accessibilityRole="alert">로그아웃하지 못했어요. 다시 시도해 주세요.</Text>}
      {status === "ready" ? children : <Surface tone="background" style={styles.center}>
        {status === "connecting" ? <><ActivityIndicator /><Text>계정 연결 중…</Text></> : <>
          <Text accessibilityRole="alert">계정을 연결하지 못했어요. 연결 상태를 확인해 주세요.</Text>
          <Button label="다시 연결" onPress={() => setAttempt((value) => value + 1)} />
        </>}
      </Surface>}
    </SafeAreaView>
  </RelayEnvironmentProvider>;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 },
  account: { flexDirection: "row", alignItems: "center", paddingLeft: 20, paddingRight: 8 },
});
