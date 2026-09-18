import { useState, useSyncExternalStore, type ReactNode } from "react";
import { AppState, Linking } from "react-native";
import { SessionContext, type SessionContextValue } from "@/entities/session";
import { completeSignIn, createSocialSignIn, createSignInSession, type SignInSessionState } from "@/features/sign-in";
import { isKeychainAvailable, createKeychainSessionStorage, createSupabaseAuthClient, getSessionAccessToken, type AuthClient } from "@/shared/auth";
import { createRelayEnvironment } from "@/shared/relay";
import type { MobileConfiguration } from "../mobile-configuration";

interface SessionProviderProps {
  configuration: MobileConfiguration;
  children: ReactNode;
}

export function SessionProvider({ configuration, children }: SessionProviderProps) {
  if (!isKeychainAvailable()) {
    return <SessionContext.Provider value={{ status: "unavailable", reason: "secure-storage" }}>{children}</SessionContext.Provider>;
  }
  if (!configuration.supabaseUrl || !configuration.supabasePublishableKey) {
    return <SessionContext.Provider value={{ status: "unavailable", reason: "configuration" }}>{children}</SessionContext.Provider>;
  }
  return <ConfiguredSessionProvider configuration={configuration}>{children}</ConfiguredSessionProvider>;
}

function ConfiguredSessionProvider({ configuration, children }: SessionProviderProps) {
  const [auth] = useState(() => createSupabaseAuthClient({
    url: configuration.supabaseUrl,
    publishableKey: configuration.supabasePublishableKey,
    storage: createKeychainSessionStorage(),
  }));
  const [session] = useState(() => createSignInSession({
    auth,
    socialSignIn: createSocialSignIn(auth, configuration.oauthBrowser),
    getInitialURL: () => Linking.getInitialURL(),
    subscribeToRefresh: (onError) => subscribeToNativeRefresh(auth, onError),
    async connect(authSession) {
      const environment = createRelayEnvironment({
        apiUrl: configuration.apiUrl,
        getAccessToken: () => getSessionAccessToken(auth, authSession.user.id),
      });
      await completeSignIn(environment);
      return environment;
    },
  }));

  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);

  const value = getSessionContextValue(state, session);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

function getSessionContextValue(
  state: SignInSessionState,
  session: ReturnType<typeof createSignInSession>,
): SessionContextValue {
  switch (state.status) {
    case "loading":
    case "connecting":
      return state;
    case "signed-out":
      return { ...state, signIn: session.signIn };
    case "ready":
      return { status: "ready", user: state.session.user, environment: state.environment, signOut: session.signOut };
    default: {
      const unhandled: never = state;
      return unhandled;
    }
  }
}

function subscribeToNativeRefresh(auth: AuthClient, onError: () => void) {
  const lifetime = new AbortController();
  function synchronizeRefresh(appState: string | null) {
    const operation = appState === "active" ? auth.startAutoRefresh() : auth.stopAutoRefresh();
    void operation.catch(() => {
      if (!lifetime.signal.aborted) onError();
    });
  }
  synchronizeRefresh(AppState.currentState);
  const subscription = AppState.addEventListener("change", synchronizeRefresh);
  return () => {
    lifetime.abort();
    subscription.remove();
    void auth.stopAutoRefresh().catch(() => undefined);
  };
}
