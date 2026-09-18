import { describe, expect, it, vi } from "vitest";
import { AuthError } from "@supabase/supabase-js";
import type { AuthClient, AuthSession } from "@/shared/auth";
import { AUTH_REDIRECT_URL, createSocialSignIn, type OAuthBrowser } from "./social-sign-in";

const session: AuthSession = {
  access_token: "access", refresh_token: "refresh", expires_in: 3600, token_type: "bearer",
  user: { id: "user", aud: "authenticated", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01" },
};

function setup() {
  const auth = {
    signInWithOAuth: vi.fn<AuthClient["signInWithOAuth"]>().mockResolvedValue({ data: { provider: "google", url: "https://auth.example/authorize" }, error: null }),
    exchangeCodeForSession: vi.fn<AuthClient["exchangeCodeForSession"]>().mockResolvedValue({ data: { session, user: session.user }, error: null }),
  };
  const browser = { open: vi.fn<OAuthBrowser["open"]>().mockResolvedValue({ status: "success", url: `${AUTH_REDIRECT_URL}?code=once` }) };
  return { auth, browser, social: createSocialSignIn(auth, browser) };
}

describe("social sign-in", () => {
  it.each(["apple", "google"] as const)("exchanges the %s browser callback for a Supabase session", async (provider) => {
    const { auth, browser, social } = setup();
    await expect(social.signIn(provider)).resolves.toEqual({ status: "success" });
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({ provider, options: { redirectTo: AUTH_REDIRECT_URL, skipBrowserRedirect: true } });
    expect(browser.open).toHaveBeenCalledWith("https://auth.example/authorize", AUTH_REDIRECT_URL);
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("once");
  });

  it("does not treat browser cancellation as failure or exchange credentials", async () => {
    const { auth, browser, social } = setup();
    browser.open.mockResolvedValue({ status: "cancelled" });
    await expect(social.signIn("google")).resolves.toEqual({ status: "cancelled" });
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it.each([
    "https://auth/callback?code=bad", "wordseed://evil/callback?code=bad",
    "wordseed://auth/callback/extra?code=bad", "wordseed://user@auth/callback?code=bad",
    "wordseed://auth:42/callback?code=bad", "not a url",
  ])("ignores unrelated or forged callback destinations: %s", async (url) => {
    const { auth, social } = setup();
    await expect(social.consumeCallback(url)).resolves.toEqual({ status: "ignored" });
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it.each(["", "?code=", "?code=a&code=b", "?error=access_denied", "?error_code=denied&code=a", "#access_token=secret"])("rejects malformed callback credentials: %s", async (suffix) => {
    const { auth, social } = setup();
    await expect(social.consumeCallback(`${AUTH_REDIRECT_URL}${suffix}`)).resolves.toEqual({ status: "error", reason: "callback" });
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("consumes a cold callback once even when delivered concurrently and again later", async () => {
    const { auth, social } = setup();
    const url = `${AUTH_REDIRECT_URL}?code=once`;
    expect(await Promise.all([social.consumeCallback(url), social.consumeCallback(url)])).toEqual([{ status: "success" }, { status: "success" }]);
    await social.consumeCallback(url);
    expect(auth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
  });

  it("shares an active login instead of replacing the PKCE verifier on double clicks", async () => {
    const { auth, browser, social } = setup();
    await Promise.all([social.signIn("google"), social.signIn("apple")]);
    expect(auth.signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(browser.open).toHaveBeenCalledTimes(1);
    await social.signIn("apple");
    expect(auth.signInWithOAuth).toHaveBeenCalledTimes(2);
  });

  it("sanitizes exchange failures", async () => {
    const { auth, social } = setup();
    auth.exchangeCodeForSession.mockRejectedValue(new Error("sensitive callback contents"));
    await expect(social.signIn("google")).resolves.toEqual({ status: "error", reason: "exchange" });
  });

  it("rejects returned provider errors before opening the browser", async () => {
    const { auth, browser, social } = setup();
    auth.signInWithOAuth.mockResolvedValue({ data: { provider: "google", url: null }, error: new AuthError("disabled provider") });
    await expect(social.signIn("google")).resolves.toEqual({ status: "error", reason: "provider" });
    expect(browser.open).not.toHaveBeenCalled();
  });

  it("requires a session from the code exchange", async () => {
    const { auth, social } = setup();
    auth.exchangeCodeForSession.mockResolvedValue({ data: { session: null, user: null }, error: new AuthError("invalid code") });
    await expect(social.signIn("google")).resolves.toEqual({ status: "error", reason: "exchange" });
  });

  it("sanitizes provider and browser exceptions", async () => {
    const { auth, browser, social } = setup();
    auth.signInWithOAuth.mockRejectedValueOnce(new Error("provider secrets"));
    await expect(social.signIn("apple")).resolves.toEqual({ status: "error", reason: "provider" });
    browser.open.mockRejectedValueOnce(new Error("browser secrets"));
    await expect(social.signIn("apple")).resolves.toEqual({ status: "error", reason: "browser" });
  });

  it("rejects an unrelated URL returned by the browser", async () => {
    const { auth, browser, social } = setup();
    browser.open.mockResolvedValue({ status: "success", url: "wordseed://other?code=bad" });
    await expect(social.signIn("google")).resolves.toEqual({ status: "error", reason: "callback" });
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });
});
