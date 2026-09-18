import type { Environment } from "relay-runtime";
import type { AuthClient, AuthSession } from "@/shared/auth";
import type { SocialProvider, SocialSignIn } from "./social-sign-in";

export type SignInSessionState =
  | { status: "loading" }
  | { status: "signed-out"; error: string | null }
  | { status: "connecting" }
  | { status: "ready"; session: AuthSession; environment: Environment };

interface SignInSessionOptions {
  auth: Pick<AuthClient, "getSession" | "onAuthStateChange" | "signOut">;
  socialSignIn: SocialSignIn;
  getInitialURL: () => Promise<string | null>;
  connect: (session: AuthSession) => Promise<Environment>;
  subscribeToRefresh?: (onError: () => void) => () => void;
}

interface SignInSession {
  getSnapshot(): SignInSessionState;
  subscribe(listener: () => void): () => void;
  signIn(provider: SocialProvider): Promise<void>;
  signOut(): Promise<SignOutResult>;
  fail(): void;
}

type SignOutResult = { status: "success" } | { status: "error" };

interface SessionRuntimeModel {
  generation: number;
  phase: "booting" | "observing";
  blocked: boolean;
  signInAttempt?: number;
  pendingSignOut?: Promise<SignOutResult>;
  currentSession?: AuthSession;
  environment?: Environment;
  latestSession?: AuthSession | null;
}

interface SessionRuntime {
  observe(): () => void;
  signIn(provider: SocialProvider): Promise<void>;
  signOut(): Promise<SignOutResult>;
  fail(): void;
}

type Publish = (state: SignInSessionState) => void;
type Observed = () => boolean;

const loginError = "Couldn’t sign in. Please try again.";
const connectionError = "Couldn’t connect your account. Check your connection and sign in again.";

/** Exposes the authentication lifecycle as the external store consumed by React. */
export function createSignInSession(options: SignInSessionOptions): SignInSession {
  const listeners = new Set<() => void>();
  let snapshot: SignInSessionState = { status: "loading" };
  let stopObserving: (() => void) | undefined;
  const publish: Publish = (state) => {
    snapshot = state;
    listeners.forEach((listener) => listener());
  };
  const runtime = createSessionRuntime(options, publish, () => listeners.size > 0);

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      const subscription = () => listener();
      listeners.add(subscription);
      if (listeners.size === 1) stopObserving = runtime.observe();
      return () => {
        if (!listeners.delete(subscription) || listeners.size > 0) return;
        stopObserving?.();
        stopObserving = undefined;
        snapshot = { status: "loading" };
      };
    },
    signIn: runtime.signIn,
    signOut: runtime.signOut,
    fail: runtime.fail,
  };
}

function createSessionRuntime(
  { auth, socialSignIn, getInitialURL, connect, subscribeToRefresh }: SignInSessionOptions,
  publish: Publish,
  observed: Observed,
): SessionRuntime {
  let model = initialRuntimeModel();

  function showLogin(error: string | null) {
    model = {
      generation: model.generation + 1,
      phase: "observing",
      blocked: error !== null,
      pendingSignOut: model.pendingSignOut,
    };
    publish({ status: "signed-out", error });
  }

  async function acceptSession(session: AuthSession | null) {
    if (!observed()) return;
    if (!hasSocialIdentity(session)) {
      showLogin(null);
      return;
    }
    if (model.currentSession?.user.id === session.user.id) {
      model = { ...model, currentSession: session };
      if (model.environment) publish({ status: "ready", session, environment: model.environment });
      return;
    }

    const attempt = model.generation + 1;
    model = { ...model, generation: attempt, currentSession: session, environment: undefined };
    publish({ status: "connecting" });
    try {
      const environment = await connect(session);
      if (!observed() || model.generation !== attempt) return;
      const currentSession = model.currentSession ?? session;
      model = { ...model, currentSession, environment };
      publish({ status: "ready", session: currentSession, environment });
    } catch {
      if (model.generation === attempt) showLogin(connectionError);
    }
  }

  async function restoreStoredSession(start: number) {
    try {
      const result = await auth.getSession();
      if (!current(start)) return;
      model = { ...model, phase: "observing" };
      if ("latestSession" in model) await acceptSession(model.latestSession ?? null);
      else if (result.error) showLogin(loginError);
      else await acceptSession(result.data.session);
    } catch {
      if (!current(start)) return;
      model = { ...model, phase: "observing" };
      if ("latestSession" in model) await acceptSession(model.latestSession ?? null);
      else showLogin(loginError);
    }
  }

  async function restore(start: number) {
    try {
      const url = await getInitialURL();
      if (!current(start)) return;
      const callback = url ? await socialSignIn.consumeCallback(url) : undefined;
      if (!current(start)) return;
      if (callback?.status === "error") {
        showLogin(loginError);
        return;
      }
      await restoreStoredSession(start);
    } catch {
      if (current(start)) showLogin(loginError);
    }
  }

  function current(generation: number) {
    return observed() && model.generation === generation;
  }

  function handleAuthChange(event: string, session: AuthSession | null, lifetime: AbortSignal) {
    if (lifetime.aborted || event === "INITIAL_SESSION") return;
    if (model.phase === "booting") {
      model = { ...model, latestSession: session };
      return;
    }
    if (event === "SIGNED_OUT") {
      showLogin(null);
      return;
    }
    if (model.blocked || model.signInAttempt !== undefined) return;

    if (model.currentSession?.user.id !== session?.user.id) {
      model = {
        ...model,
        generation: model.generation + 1,
        currentSession: undefined,
        environment: undefined,
      };
      publish({ status: "connecting" });
    }
    const observedGeneration = model.generation;
    setTimeout(() => {
      if (!lifetime.aborted && current(observedGeneration) && model.signInAttempt === undefined) {
        void acceptSession(session);
      }
    }, 0);
  }

  function observe() {
    const lifetime = new AbortController();
    const start = model.generation + 1;
    model = {
      generation: start,
      phase: "booting",
      blocked: false,
      pendingSignOut: model.pendingSignOut,
    };
    publish({ status: "loading" });
    const { data: { subscription } } = auth.onAuthStateChange(
      (event, session) => handleAuthChange(event, session, lifetime.signal),
    );
    const stopRefresh = subscribeToRefresh?.(() => {
      if (!lifetime.signal.aborted) showLogin(loginError);
    });
    void restore(start);

    return () => {
      lifetime.abort();
      model = { ...model, generation: model.generation + 1 };
      subscription.unsubscribe();
      stopRefresh?.();
    };
  }

  async function signIn(provider: SocialProvider) {
    if (!observed() || model.signInAttempt !== undefined) return;
    const attempt = model.generation + 1;
    model = {
      generation: attempt,
      phase: "observing",
      blocked: true,
      signInAttempt: attempt,
      pendingSignOut: model.pendingSignOut,
    };
    publish({ status: "signed-out", error: null });
    try {
      const result = await socialSignIn.signIn(provider);
      if (!current(attempt)) return;
      if (result.status === "cancelled") {
        showLogin(null);
        model = { ...model, blocked: true };
        return;
      }
      if (result.status !== "success") {
        showLogin(loginError);
        return;
      }
      const restored = await auth.getSession();
      if (!current(attempt)) return;
      if (restored.error || !hasSocialIdentity(restored.data.session)) {
        showLogin(loginError);
        return;
      }
      model = { ...model, blocked: false };
      await acceptSession(restored.data.session);
    } catch {
      if (model.generation === attempt) showLogin(loginError);
    } finally {
      if (model.signInAttempt === attempt) model = { ...model, signInAttempt: undefined };
    }
  }

  function signOut(): Promise<SignOutResult> {
    if (model.pendingSignOut) return model.pendingSignOut;
    const attempt = model.generation;
    const operation = performSignOut(auth, () => {
      if (observed() && model.generation === attempt) showLogin(null);
    });
    model = { ...model, pendingSignOut: operation };
    void operation.finally(() => {
      if (model.pendingSignOut === operation) model = { ...model, pendingSignOut: undefined };
    });
    return operation;
  }

  function fail() {
    if (observed()) showLogin(loginError);
  }

  return { observe, signIn, signOut, fail };
}

function initialRuntimeModel(): SessionRuntimeModel {
  return { generation: 0, phase: "booting", blocked: false };
}

async function performSignOut(
  auth: Pick<AuthClient, "signOut">,
  onSuccess: () => void,
): Promise<SignOutResult> {
  try {
    const { error } = await auth.signOut({ scope: "local" });
    if (error) return { status: "error" };
    onSuccess();
    return { status: "success" };
  } catch {
    return { status: "error" };
  }
}

function hasSocialIdentity(session: AuthSession | null): session is AuthSession {
  const providers: unknown = session?.user.app_metadata.providers;
  return session !== null && Array.isArray(providers) && providers.some(
    (provider) => provider === "apple" || provider === "google",
  );
}
