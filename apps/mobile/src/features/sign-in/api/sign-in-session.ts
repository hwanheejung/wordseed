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
}

const loginError = "Couldn’t sign in. Please try again.";
const connectionError = "Couldn’t connect your account. Check your connection and sign in again.";

/** Coordinates external auth events and explicit login attempts before private data can mount. */
export function createSignInSession({ auth, socialSignIn, getInitialURL, connect }: SignInSessionOptions) {
  let publish: ((state: SignInSessionState) => void) | null = null;
  let generation = 0;
  let booting = true;
  let blocked = false;
  let signInAttempt: number | null = null;
  let pendingSignOut: Promise<{ status: "success" } | { status: "error" }> | null = null;
  let current: AuthSession | null = null;
  let environment: Environment | null = null;
  let latestEvent: { session: AuthSession | null } | null = null;

  function showLogin(error: string | null) {
    generation += 1;
    booting = false;
    signInAttempt = null;
    blocked = error !== null;
    current = null;
    environment = null;
    publish?.({ status: "signed-out", error });
  }

  async function acceptSession(session: AuthSession | null) {
    if (!publish) return;
    if (!hasSocialIdentity(session)) {
      showLogin(null);
      return;
    }
    if (current?.user.id === session.user.id) {
      current = session;
      if (environment) publish({ status: "ready", session, environment });
      return;
    }
    const attempt = ++generation;
    current = session;
    environment = null;
    publish({ status: "connecting" });
    try {
      const connected = await connect(session);
      if (!publish || generation !== attempt) return;
      environment = connected;
      publish({ status: "ready", session: current ?? session, environment });
    } catch {
      if (generation === attempt) showLogin(connectionError);
    }
  }

  async function restore(start: number) {
    let readingSession = false;
    try {
      const url = await getInitialURL();
      if (!publish || generation !== start) return;
      const callback = url ? await socialSignIn.consumeCallback(url) : null;
      if (!publish || generation !== start) return;
      if (callback?.status === "error") {
        booting = false;
        showLogin(loginError);
        return;
      }
      readingSession = true;
      const result = await auth.getSession();
      if (!publish || generation !== start) return;
      booting = false;
      if (latestEvent) await acceptSession(latestEvent.session);
      else if (result.error) showLogin(loginError);
      else await acceptSession(result.data.session);
    } catch {
      if (!publish || generation !== start) return;
      booting = false;
      if (readingSession && latestEvent) await acceptSession(latestEvent.session);
      else showLogin(loginError);
    }
  }

  return {
    start(onChange: (state: SignInSessionState) => void) {
      publish = onChange;
      booting = true;
      blocked = false;
      signInAttempt = null;
      current = null;
      environment = null;
      latestEvent = null;
      const start = ++generation;
      publish({ status: "loading" });
      const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
        if (!publish || event === "INITIAL_SESSION") return;
        if (booting) {
          latestEvent = { session };
          return;
        }
        if (event === "SIGNED_OUT") {
          showLogin(null);
          return;
        }
        if (blocked || signInAttempt !== null) return;
        // Supabase holds its auth lock during callbacks. Connect outside that callback.
        if (current?.user.id !== session?.user.id) {
          generation += 1;
          current = null;
          environment = null;
          publish({ status: "connecting" });
        }
        const observed = generation;
        setTimeout(() => {
          if (publish && generation === observed && !blocked && signInAttempt === null) void acceptSession(session);
        }, 0);
      });
      void restore(start);
      return () => {
        generation += 1;
        publish = null;
        subscription.unsubscribe();
      };
    },
    async signIn(provider: SocialProvider): Promise<void> {
      if (!publish || signInAttempt !== null) return;
      blocked = true;
      const attempt = ++generation;
      signInAttempt = attempt;
      current = null;
      environment = null;
      publish({ status: "signed-out", error: null });
      try {
        const result = await socialSignIn.signIn(provider);
        if (!publish || generation !== attempt) return;
        if (result.status === "cancelled") {
          showLogin(null);
          blocked = true;
          return;
        }
        if (result.status !== "success") {
          showLogin(loginError);
          return;
        }
        const restored = await auth.getSession();
        if (!publish || generation !== attempt) return;
        if (restored.error || !hasSocialIdentity(restored.data.session)) {
          showLogin(loginError);
          return;
        }
        blocked = false;
        await acceptSession(restored.data.session);
      } catch {
        if (generation === attempt) showLogin(loginError);
      } finally {
        if (signInAttempt === attempt) signInAttempt = null;
      }
    },
    signOut(): Promise<{ status: "success" } | { status: "error" }> {
      if (pendingSignOut) return pendingSignOut;
      const attempt = generation;
      pendingSignOut = (async (): Promise<{ status: "success" } | { status: "error" }> => {
        try {
          const { error } = await auth.signOut({ scope: "local" });
          if (error) return { status: "error" };
          if (publish && generation === attempt) showLogin(null);
          return { status: "success" };
        } catch {
          return { status: "error" };
        }
      })().finally(() => { pendingSignOut = null; });
      return pendingSignOut;
    },
    fail() {
      if (publish) showLogin(loginError);
    },
  };
}

function hasSocialIdentity(session: AuthSession | null): session is AuthSession {
  const providers: unknown = session?.user.app_metadata.providers;
  return session !== null && Array.isArray(providers) && providers.some((provider) => provider === "apple" || provider === "google");
}
