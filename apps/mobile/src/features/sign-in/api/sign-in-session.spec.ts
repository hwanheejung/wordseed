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
  const stopRefresh = vi.fn();
  const subscribeToRefresh = vi.fn((_onError: () => void) => stopRefresh);
  const lifecycle = createSignInSession({ auth, socialSignIn, getInitialURL, connect, subscribeToRefresh });
  return { subscribeToRefresh, stopRefresh, auth, socialSignIn, getInitialURL, connect, onChange, lifecycle, environment,
    emit: (event: Parameters<AuthCallback>[0], value: AuthSession | null) => callback(event, value),
    start: () => lifecycle.subscribe(() => onChange(lifecycle.getSnapshot())),
  };
}
async function flush() { await vi.runAllTimersAsync(); }
afterEach(() => vi.useRealTimers());

describe("sign-in session", () => {
  it("caches immutable snapshots and starts external work only when observed", async () => {
    const test = setup();
    const initial = test.lifecycle.getSnapshot();
    expect(test.lifecycle.getSnapshot()).toBe(initial);
    expect(test.auth.onAuthStateChange).not.toHaveBeenCalled();
    expect(test.getInitialURL).not.toHaveBeenCalled();
    expect(test.subscribeToRefresh).not.toHaveBeenCalled();

    test.start(); await flush();
    const ready = test.lifecycle.getSnapshot();
    expect(ready.status).toBe("ready");
    expect(test.lifecycle.getSnapshot()).toBe(ready);
    test.emit("SIGNED_OUT", null);
    expect(test.lifecycle.getSnapshot()).toEqual({ status: "signed-out", error: null });
    expect(test.lifecycle.getSnapshot()).not.toBe(ready);
    expect(ready.status).toBe("ready");
    expect(initial).toEqual({ status: "loading" });
  });
  it("shares one lifecycle until the last observer leaves, with idempotent cleanup", async () => {
    const test = setup();
    const stopFirst = test.start(); await flush();
    const second = vi.fn();
    const stopSecond = test.lifecycle.subscribe(second);
    expect(test.auth.onAuthStateChange).toHaveBeenCalledOnce();
    expect(test.subscribeToRefresh).toHaveBeenCalledOnce();
    expect(test.auth.getSession).toHaveBeenCalledOnce();
    const unsubscribeAuth = test.auth.onAuthStateChange.mock.results[0].value.data.subscription.unsubscribe;

    stopFirst(); stopFirst();
    expect(unsubscribeAuth).not.toHaveBeenCalled();
    expect(test.stopRefresh).not.toHaveBeenCalled();
    test.emit("SIGNED_OUT", null);
    expect(second).toHaveBeenCalledOnce();
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "ready", session, environment: test.environment });
    stopSecond(); stopSecond();
    expect(unsubscribeAuth).toHaveBeenCalledOnce();
    expect(test.stopRefresh).toHaveBeenCalledOnce();
  });
  it("tracks separate subscriptions using the same listener", () => {
    const test = setup();
    const listener = vi.fn();
    const stopFirst = test.lifecycle.subscribe(listener);
    const stopSecond = test.lifecycle.subscribe(listener);
    stopFirst();
    expect(test.stopRefresh).not.toHaveBeenCalled();
    stopSecond();
    expect(test.stopRefresh).toHaveBeenCalledOnce();
  });
  it("ignores old auth and refresh callbacks after a StrictMode resubscription", async () => {
    const test = setup();
    const stop = test.start(); await flush();
    const oldAuthCallback = test.auth.onAuthStateChange.mock.calls[0][0];
    const oldRefreshFailure = test.subscribeToRefresh.mock.calls[0][0];
    stop();
    test.start(); await flush();
    const current = test.lifecycle.getSnapshot();
    const calls = test.onChange.mock.calls.length;
    oldAuthCallback("SIGNED_OUT", null);
    oldAuthCallback("SIGNED_IN", otherSession);
    oldRefreshFailure();
    await flush();
    expect(test.lifecycle.getSnapshot()).toBe(current);
    expect(test.onChange).toHaveBeenCalledTimes(calls);
    expect(test.auth.onAuthStateChange).toHaveBeenCalledTimes(2);
    expect(test.subscribeToRefresh).toHaveBeenCalledTimes(2);

    test.subscribeToRefresh.mock.calls[1][0]();
    expect(test.lifecycle.getSnapshot()).toEqual({ status: "signed-out", error: expect.any(String) });
  });
  it("ignores a connection from an earlier subscription after resubscribing", async () => {
    const test = setup();
    const oldConnection = deferred<Environment>();
    test.connect.mockReturnValueOnce(oldConnection.promise);
    const stop = test.start(); await flush(); stop();
    test.auth.getSession.mockResolvedValue(restored(otherSession));
    test.start(); await flush();
    const current = test.lifecycle.getSnapshot();
    oldConnection.resolve(test.environment); await flush();
    expect(test.lifecycle.getSnapshot()).toBe(current);
    expect(current).toEqual({ status: "ready", session: otherSession, environment: test.environment });
  });
  it("ignores restoration from an earlier subscription after resubscribing", async () => {
    const test = setup();
    const oldRestore = deferred<SessionResult>();
    test.auth.getSession.mockReturnValueOnce(oldRestore.promise);
    const stop = test.start(); await flush(); stop();
    test.auth.getSession.mockResolvedValue(restored(otherSession));
    test.start(); await flush();
    const current = test.lifecycle.getSnapshot();
    oldRestore.resolve(restored(session)); await flush();
    expect(test.lifecycle.getSnapshot()).toBe(current);
    expect(test.connect).toHaveBeenCalledExactlyOnceWith(otherSession);
  });
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
  it("retains an in-flight logout across a store resubscription", async () => {
    const test = setup();
    const stop = test.start(); await flush();
    const logout = deferred<{ error: null }>(); test.auth.signOut.mockReturnValue(logout.promise);
    const first = test.lifecycle.signOut();
    stop(); test.start(); await flush();
    const second = test.lifecycle.signOut();
    expect(second).toBe(first);
    expect(test.auth.signOut).toHaveBeenCalledOnce();
    logout.resolve({ error: null });
    expect(await second).toEqual({ status: "success" });
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
