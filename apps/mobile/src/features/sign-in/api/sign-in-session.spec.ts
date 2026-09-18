import { afterEach, describe, expect, it, vi } from "vitest";
import { Environment, Network, RecordSource, Store } from "relay-runtime";
import type { AuthClient, AuthSession } from "../../../shared/auth";
import { createSignInSession } from "./sign-in-session";
import type { SocialSignInResult } from "./social-sign-in";

type AuthCallback = Parameters<AuthClient["onAuthStateChange"]>[0];
type SessionResult = Awaited<ReturnType<AuthClient["getSession"]>>;
const session: AuthSession = {
  access_token: "test-token", refresh_token: "test-refresh", expires_in: 3600, token_type: "bearer",
  user: { id: "user-a", app_metadata: { providers: ["google"] }, user_metadata: {}, aud: "authenticated", created_at: "2026-09-17T00:00:00Z" },
};
const otherSession = { ...session, user: { ...session.user, id: "user-b" } };
const restored = (value: AuthSession | null): SessionResult => value ? { data: { session: value }, error: null } : { data: { session: null }, error: null };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function setup(initial: AuthSession | null = session) {
  vi.useFakeTimers();
  let callback: AuthCallback = async () => undefined;
  const environment = new Environment({ network: Network.create(async () => ({ data: {} })), store: new Store(new RecordSource()) });
  const auth = {
    getSession: vi.fn(async (): Promise<SessionResult> => restored(initial)),
    signOut: vi.fn(async () => ({ error: null })),
    onAuthStateChange: vi.fn((handler: AuthCallback) => {
      callback = handler;
      return { data: { subscription: { id: "test", callback: handler, unsubscribe: vi.fn() } } };
    }),
  };
  const socialSignIn = {
    signIn: vi.fn(async (): Promise<SocialSignInResult> => ({ status: "success" })),
    consumeCallback: vi.fn(async (): Promise<SocialSignInResult> => ({ status: "success" })),
  };
  const getInitialURL = vi.fn(async (): Promise<string | null> => null);
  const connect = vi.fn(async () => environment);
  const onChange = vi.fn();
  const lifecycle = createSignInSession({ auth, socialSignIn, getInitialURL, connect });
  return { auth, socialSignIn, getInitialURL, connect, onChange, lifecycle, environment,
    emit: (event: Parameters<AuthCallback>[0], value: AuthSession | null) => callback(event, value),
    start: () => lifecycle.start(onChange),
  };
}
async function flush() { await vi.runAllTimersAsync(); }
afterEach(() => vi.useRealTimers());

describe("sign-in session", () => {
  it("restores once and retains the Relay store across token refresh", async () => {
    const test = setup(); test.start(); await flush();
    test.emit("TOKEN_REFRESHED", { ...session, access_token: "rotated" }); await flush();
    expect(test.connect).toHaveBeenCalledOnce();
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "ready", session: { ...session, access_token: "rotated" }, environment: test.environment });
  });
  it("returns restoration failure to login without clearing credentials or accepting refresh", async () => {
    const test = setup(); test.auth.getSession.mockRejectedValue(new Error("offline"));
    test.start(); test.emit("INITIAL_SESSION", null); await flush();
    test.emit("TOKEN_REFRESHED", session); test.emit("SIGNED_IN", session); await flush();
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "signed-out", error: expect.any(String) });
    expect(test.auth.signOut).not.toHaveBeenCalled(); expect(test.connect).not.toHaveBeenCalled();
  });
  it("returns connection failure to login and allows an explicit same-user login", async () => {
    const test = setup(); test.connect.mockRejectedValueOnce(new Error("API offline"));
    test.start(); await flush();
    test.emit("TOKEN_REFRESHED", session); await flush();
    expect(test.connect).toHaveBeenCalledOnce();
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "signed-out", error: expect.any(String) });
    await test.lifecycle.signIn("google");
    expect(test.connect).toHaveBeenCalledTimes(2);
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "ready", session, environment: test.environment });
    expect(test.auth.signOut).not.toHaveBeenCalled();
  });
  it("does not connect an existing session when a cold callback fails", async () => {
    const test = setup(); test.getInitialURL.mockResolvedValue("wordseed://auth/callback?error=denied");
    test.socialSignIn.consumeCallback.mockResolvedValue({ status: "error", reason: "callback" });
    test.start(); test.emit("SIGNED_IN", session); await flush();
    expect(test.connect).not.toHaveBeenCalled();
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "signed-out", error: expect.any(String) });
  });
  it("holds restoration until a cold callback finishes", async () => {
    const test = setup(); const callback = deferred<SocialSignInResult>();
    test.getInitialURL.mockResolvedValue("wordseed://auth/callback?code=test");
    test.socialSignIn.consumeCallback.mockReturnValue(callback.promise);
    test.start(); await flush(); test.emit("SIGNED_IN", otherSession); await flush();
    expect(test.connect).not.toHaveBeenCalled();
    callback.resolve({ status: "success" }); await flush();
    expect(test.connect).toHaveBeenCalledWith(otherSession);
  });
  it("uses a live sign-out over a late startup snapshot", async () => {
    const test = setup(); const startup = deferred<SessionResult>(); test.auth.getSession.mockReturnValue(startup.promise);
    test.start(); await flush(); test.emit("SIGNED_OUT", null); startup.resolve(restored(session)); await flush();
    expect(test.connect).not.toHaveBeenCalled(); expect(test.onChange).toHaveBeenLastCalledWith({ status: "signed-out", error: null });
  });
  it("ignores account connection completion after logout", async () => {
    const test = setup(); const connection = deferred<Environment>(); test.connect.mockReturnValue(connection.promise);
    test.start(); await flush(); test.emit("SIGNED_OUT", null); connection.resolve(test.environment); await flush();
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "signed-out", error: null });
  });
  it("keeps a new account when the old connection completes late", async () => {
    const test = setup(); const old = deferred<Environment>(); test.connect.mockReturnValueOnce(old.promise);
    test.start(); await flush(); test.emit("SIGNED_IN", otherSession); await flush(); old.resolve(test.environment); await flush();
    expect(test.connect).toHaveBeenCalledTimes(2);
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "ready", session: otherSession, environment: test.environment });
  });
  it("ignores connection completion and queued events after cleanup", async () => {
    const test = setup(); const connection = deferred<Environment>(); test.connect.mockReturnValue(connection.promise);
    const stop = test.start(); await flush(); test.emit("SIGNED_IN", otherSession); stop();
    const count = test.onChange.mock.calls.length; connection.resolve(test.environment); await flush();
    expect(test.onChange).toHaveBeenCalledTimes(count);
  });
  it("keeps cancellation on login even when a stored session refreshes", async () => {
    const test = setup(null); test.start(); await flush();
    test.socialSignIn.signIn.mockResolvedValue({ status: "cancelled" }); await test.lifecycle.signIn("google");
    test.emit("TOKEN_REFRESHED", session); await flush();
    expect(test.connect).not.toHaveBeenCalled(); expect(test.onChange).toHaveBeenLastCalledWith({ status: "signed-out", error: null });
  });
  it("reports provider failures on login", async () => {
    const test = setup(null); test.start(); await flush();
    test.socialSignIn.signIn.mockResolvedValue({ status: "error", reason: "provider" }); await test.lifecycle.signIn("apple");
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "signed-out", error: expect.any(String) });
  });
  it("deduplicates local logout across account page mounts", async () => {
    const test = setup(); test.start(); await flush();
    const logout = deferred<{ error: null }>(); test.auth.signOut.mockReturnValue(logout.promise);
    const first = test.lifecycle.signOut(); const second = test.lifecycle.signOut();
    expect(first).toBe(second); expect(test.auth.signOut).toHaveBeenCalledExactlyOnceWith({ scope: "local" });
    logout.resolve({ error: null }); expect(await first).toEqual({ status: "success" });
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "signed-out", error: null });
  });
  it("preserves the authenticated page when logout fails", async () => {
    const test = setup(); test.start(); await flush(); test.auth.signOut.mockRejectedValue(new Error("storage"));
    expect(await test.lifecycle.signOut()).toEqual({ status: "error" });
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "ready", session, environment: test.environment });
  });
  it("observes logout after a bootstrap failure and explicit recovery", async () => {
    const test = setup(); const initialURL = deferred<string | null>();
    test.getInitialURL.mockReturnValue(initialURL.promise);
    test.start(); test.lifecycle.fail(); initialURL.resolve(null); await flush();
    await test.lifecycle.signIn("google");
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "ready", session, environment: test.environment });
    test.emit("SIGNED_OUT", null);
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "signed-out", error: null });
  });
  it("uses the latest account when A to B to A events arrive in one turn", async () => {
    const test = setup(); test.start(); await flush();
    test.emit("SIGNED_IN", otherSession); test.emit("SIGNED_IN", session); await flush();
    expect(test.connect).toHaveBeenLastCalledWith(session);
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "ready", session, environment: test.environment });
  });
  it.each(["failure", "sign-out"])("allows retry during an abandoned connection after %s without releasing the newer attempt", async (interruption) => {
    const test = setup(null); test.start(); await flush();
    test.auth.getSession.mockResolvedValue(restored(session));
    const oldConnection = deferred<Environment>();
    test.connect.mockReturnValueOnce(oldConnection.promise);
    const first = test.lifecycle.signIn("google"); await flush();
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "connecting" });
    if (interruption === "failure") test.lifecycle.fail();
    else test.emit("SIGNED_OUT", null);

    const newProvider = deferred<SocialSignInResult>();
    test.socialSignIn.signIn.mockReturnValueOnce(newProvider.promise);
    const second = test.lifecycle.signIn("apple");
    expect(test.socialSignIn.signIn).toHaveBeenCalledTimes(2);

    oldConnection.resolve(test.environment); await first;
    await test.lifecycle.signIn("google");
    expect(test.socialSignIn.signIn).toHaveBeenCalledTimes(2);
    newProvider.resolve({ status: "success" }); await second;
    expect(test.connect).toHaveBeenCalledTimes(2);
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "ready", session, environment: test.environment });
  });
  it("rejects email-only restored identities", async () => {
    const test = setup({ ...session, user: { ...session.user, app_metadata: { providers: ["email"] } } });
    test.start(); await flush(); expect(test.connect).not.toHaveBeenCalled();
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "signed-out", error: null });
  });
});
