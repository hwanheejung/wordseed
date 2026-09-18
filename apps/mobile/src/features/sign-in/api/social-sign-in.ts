import type { AuthClient } from "@/shared/auth";

export const AUTH_REDIRECT_URL = "wordseed://auth/callback";
export type SocialProvider = "apple" | "google";
export type SocialSignInResult =
  | { status: "success" }
  | { status: "cancelled" }
  | { status: "ignored" }
  | { status: "error"; reason: "provider" | "callback" | "exchange" | "browser" };

export interface OAuthBrowser {
  open(url: string, redirectUrl: string): Promise<
    | { status: "success"; url: string }
    | { status: "cancelled" }
  >;
}

export interface SocialSignIn {
  signIn(provider: SocialProvider): Promise<SocialSignInResult>;
  consumeCallback(url: string): Promise<SocialSignInResult>;
}

/** Owns one PKCE login attempt and deduplicates browser/Linking callback delivery. */
export function createSocialSignIn(
  authClient: Pick<AuthClient, "signInWithOAuth" | "exchangeCodeForSession">,
  browser: OAuthBrowser,
): SocialSignIn {
  let pendingSignIn: Promise<SocialSignInResult> | null = null;
  const exchanges = new Map<string, Promise<SocialSignInResult>>();

  async function exchange(code: string): Promise<SocialSignInResult> {
    try {
      const { data, error } = await authClient.exchangeCodeForSession(code);
      if (error) reportFailure("exchange", error);
      return error || !data.session ? { status: "error", reason: "exchange" } : { status: "success" };
    } catch (error: unknown) {
      reportFailure("exchange", error);
      return { status: "error", reason: "exchange" };
    }
  }

  async function consumeCallback(rawUrl: string): Promise<SocialSignInResult> {
    let url: URL;
    try { url = new URL(rawUrl); } catch { return { status: "ignored" }; }
    if (url.protocol !== "wordseed:" || url.hostname !== "auth" || url.pathname !== "/callback" || url.port || url.username || url.password) {
      return { status: "ignored" };
    }
    if (url.hash || url.searchParams.has("error") || url.searchParams.has("error_code")) {
      console.warn("Social sign-in callback rejected", {
        hasFragment: Boolean(url.hash),
        queryKeys: [...url.searchParams.keys()],
        errorCode: safeIdentifier(url.searchParams.get("error_code")),
      });
      return { status: "error", reason: "callback" };
    }
    const codes = url.searchParams.getAll("code");
    const code = codes[0];
    if (codes.length !== 1 || !code?.trim()) return { status: "error", reason: "callback" };
    const existing = exchanges.get(code);
    if (existing) return existing;
    const pending = exchange(code);
    exchanges.set(code, pending);
    // Retain recent duplicate delivery results without growing for the app lifetime.
    if (exchanges.size > 8) {
      const oldest = exchanges.keys().next().value;
      if (oldest !== undefined) exchanges.delete(oldest);
    }
    return pending;
  }

  async function start(provider: SocialProvider): Promise<SocialSignInResult> {
    let authorizationUrl: string;
    try {
      const { data, error } = await authClient.signInWithOAuth({
        provider,
        options: { redirectTo: AUTH_REDIRECT_URL, skipBrowserRedirect: true },
      });
      if (error || !data.url) return { status: "error", reason: "provider" };
      authorizationUrl = data.url;
    } catch { return { status: "error", reason: "provider" }; }
    try {
      const result = await browser.open(authorizationUrl, AUTH_REDIRECT_URL);
      if (result.status === "cancelled") return result;
      const callback = await consumeCallback(result.url);
      return callback.status === "ignored" ? { status: "error", reason: "callback" } : callback;
    } catch { return { status: "error", reason: "browser" }; }
  }

  return {
    consumeCallback,
    signIn(provider) {
      if (pendingSignIn) return pendingSignIn;
      pendingSignIn = start(provider).finally(() => { pendingSignIn = null; });
      return pendingSignIn;
    },
  };
}

function safeIdentifier(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-zA-Z_][a-zA-Z_0-9]{0,79}$/.test(value) ? value : undefined;
}

function reportFailure(stage: string, error: unknown) {
  // Never log callback URLs, authorization codes, sessions or provider responses.
  console.warn("Social sign-in failed", {
    stage,
    name: error instanceof Error ? safeIdentifier(error.name) : undefined,
    code: typeof error === "object" && error !== null && "code" in error ? safeIdentifier(error.code) : undefined,
  });
}
