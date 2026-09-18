import { describe, expect, it, vi } from "vitest";
import type { AuthClient, AuthSession } from "../../shared/auth";
import { observeAuthSession } from "./session-lifecycle";

type SessionResult = Awaited<ReturnType<AuthClient["getSession"]>>;
type AuthCallback = Parameters<AuthClient["onAuthStateChange"]>[0];
const session: AuthSession = {
  access_token: "test-access-token", refresh_token: "test-refresh-token", expires_in: 3600, token_type: "bearer",
  user: { id: "user-id", app_metadata: { providers: ["google"] }, user_metadata: {}, aud: "authenticated", created_at: "2026-09-17T00:00:00Z" },
};

function setup() {
  let resolve!: (value: SessionResult) => void;
  let reject!: (reason: Error) => void;
  const pending = new Promise<SessionResult>((onResolve, onReject) => { resolve = onResolve; reject = onReject; });
  let callback: AuthCallback = () => Promise.resolve();
  const unsubscribe = vi.fn();
  const source = {
    getSession: vi.fn(() => pending),
    onAuthStateChange: vi.fn((onChange: AuthCallback) => {
      callback = onChange;
      return { data: { subscription: { id: "subscription", callback: onChange, unsubscribe } } };
    }),
  };
  const onChange = vi.fn();
  const stop = observeAuthSession(source, onChange);
  return { resolve, reject, pending, onChange, unsubscribe, stop, emitInitial: () => callback("INITIAL_SESSION", null), emit: (next: AuthSession | null) => callback(next ? "SIGNED_IN" : "SIGNED_OUT", next) };
}

async function flush(pending: Promise<SessionResult>) {
  await pending.catch(() => undefined);
  await Promise.resolve();
}

describe("session startup observation", () => {
  it("keeps offline restoration retryable when SDK emits an empty initial session", async () => {
    const test = setup();
    test.emitInitial();
    test.reject(new Error("offline refresh"));
    await flush(test.pending);
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "failed" });
    test.stop();
  });
  it("routes restored email-only test sessions back to social sign-in", async () => {
    const test = setup();
    test.resolve({ data: { session: { ...session, user: { ...session.user, app_metadata: { providers: ["email"] } } } }, error: null });
    await flush(test.pending);
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "resolved", session: null });
    test.stop();
  });
  it("uses the startup session when no live event supersedes it", async () => {
    const test = setup();
    test.resolve({ data: { session }, error: null });
    await flush(test.pending);
    expect(test.onChange.mock.calls).toEqual([[{ status: "loading" }], [{ status: "resolved", session }]]);
    test.stop();
  });

  it("keeps a newer sign-in when startup later rejects", async () => {
    const test = setup();
    test.emit(session);
    test.reject(new Error("startup failed"));
    await flush(test.pending);
    expect(test.onChange.mock.calls).toEqual([[{ status: "loading" }], [{ status: "resolved", session }]]);
    test.stop();
  });

  it("keeps a newer sign-out when startup later returns an old session", async () => {
    const test = setup();
    test.emit(null);
    test.resolve({ data: { session }, error: null });
    await flush(test.pending);
    expect(test.onChange.mock.calls).toEqual([[{ status: "loading" }], [{ status: "resolved", session: null }]]);
    test.stop();
  });

  it("reports an unsuperseded startup failure", async () => {
    const test = setup();
    test.reject(new Error("storage unavailable"));
    await flush(test.pending);
    expect(test.onChange).toHaveBeenLastCalledWith({ status: "failed" });
    test.stop();
  });

  it.each(["success", "failure"])("ignores late startup %s and events after unsubscribe", async (result) => {
    const test = setup();
    test.stop();
    test.emit(session);
    if (result === "success") test.resolve({ data: { session }, error: null });
    else test.reject(new Error("late failure"));
    await flush(test.pending);
    expect(test.onChange.mock.calls).toEqual([[{ status: "loading" }]]);
    expect(test.unsubscribe).toHaveBeenCalledOnce();
  });
});
