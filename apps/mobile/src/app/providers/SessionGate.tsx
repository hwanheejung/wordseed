import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, AppState, Linking, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RelayEnvironmentProvider } from "react-relay";
import { SessionContext } from "@/entities/session";
import { SignInForm, completeSignIn, createSocialSignIn, createSignInSession, type SignInSessionState } from "@/features/sign-in";
import { isKeychainAvailable, createKeychainSessionStorage, createSupabaseAuthClient, getSessionAccessToken } from "@/shared/auth";
import { createRelayEnvironment } from "@/shared/relay";
import { Surface, Text } from "@/shared/ui";
import type { MobileConfiguration } from "../mobile-configuration";

interface SessionGateProps {
  configuration: MobileConfiguration;
  children: ReactNode;
}

export function SessionGate({ configuration, children }: SessionGateProps) {
  if (!isKeychainAvailable()) {
    return (
      <Surface tone="background" style={styles.center}>
        <Text accessibilityRole="alert">Secure storage is unavailable in this app version.</Text>
        <Text>{__DEV__ ? "Rebuild the native app with Keychain support, then open it instead of Expo Go." : "Install the latest version of the app."}</Text>
      </Surface>
    );
  }
  if (!configuration.supabaseUrl || !configuration.supabasePublishableKey) {
    return <Surface tone="background" style={styles.center}><Text>Sign-in is unavailable. Check the app configuration.</Text></Surface>;
  }
  return <ConfiguredSessionGate configuration={configuration}>{children}</ConfiguredSessionGate>;
}

function ConfiguredSessionGate({ configuration, children }: SessionGateProps) {
  const [auth] = useState(() => createSupabaseAuthClient({
    url: configuration.supabaseUrl,
    publishableKey: configuration.supabasePublishableKey,
    storage: createKeychainSessionStorage(),
  }));
  const [state, setState] = useState<SignInSessionState>({ status: "loading" });
  const [session] = useState(() => createSignInSession({
    auth,
    socialSignIn: createSocialSignIn(auth, configuration.oauthBrowser),
    getInitialURL: () => Linking.getInitialURL(),
    async connect(authSession) {
      const environment = createRelayEnvironment({
        apiUrl: configuration.apiUrl,
        getAccessToken: () => getSessionAccessToken(auth, authSession.user.id),
      });
      await completeSignIn(environment);
      return environment;
    },
  }));

  // Subscribe to Supabase/cold-launch URLs and synchronize native foreground refresh.
  useEffect(() => {
    let active = true;
    const stop = session.start(setState);
    function synchronizeRefresh(appState: string | null) {
      const operation = appState === "active" ? auth.startAutoRefresh() : auth.stopAutoRefresh();
      void operation.catch(() => { if (active) session.fail(); });
    }
    synchronizeRefresh(AppState.currentState);
    const subscription = AppState.addEventListener("change", synchronizeRefresh);
    return () => {
      active = false;
      stop();
      subscription.remove();
      void auth.stopAutoRefresh().catch(() => undefined);
    };
  }, [auth, session]);

  if (state.status === "loading" || state.status === "connecting") {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }
  if (state.status === "signed-out") {
    return <SafeAreaView style={styles.page}><SignInForm error={state.error} onSignIn={session.signIn} /></SafeAreaView>;
  }
  return (
    <SessionContext.Provider value={{ user: state.session.user, signOut: session.signOut }}>
      <RelayEnvironmentProvider key={state.session.user.id} environment={state.environment}>
        {children}
      </RelayEnvironmentProvider>
    </SessionContext.Provider>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 },
});
