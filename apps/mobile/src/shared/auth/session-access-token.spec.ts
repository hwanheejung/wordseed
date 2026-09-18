import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "./supabase-auth-client";
import { getSessionAccessToken } from "./session-access-token";

function session(userId = "user-a", expiresAt = Date.now() / 1000 + 3600): AuthSession {
  return { access_token: "current-token", refresh_token: "refresh", expires_in: 3600, expires_at: expiresAt, token_type: "bearer",
    user: { id: userId, aud: "authenticated", created_at: "2026-09-18", app_metadata: {}, user_metadata: {} } };
}

describe("authenticated request token", () => {
  it("awaits SDK session restoration/refresh and uses the returned token", async () => {
    const auth = { getSession: vi.fn(async () => ({ data: { session: session() }, error: null })) };
    await expect(getSessionAccessToken(auth, "user-a")).resolves.toBe("current-token");
  });
  it.each([null, session("user-b"), session("user-a", 1)])("blocks absent, switched or expired credentials", async (value) => {
    await expect(getSessionAccessToken({ getSession: async () => value ? { data: { session: value }, error: null } : { data: { session: null }, error: null } }, "user-a")).rejects.toThrow();
  });
  it("propagates temporary failures without deleting storage or signing out", async () => {
    const failure = new Error("offline");
    const auth = { getSession: vi.fn().mockRejectedValue(failure) };
    await expect(getSessionAccessToken(auth, "user-a")).rejects.toBe(failure);
    auth.getSession.mockResolvedValue({ data: { session: session() }, error: null });
    await expect(getSessionAccessToken(auth, "user-a")).resolves.toBe("current-token");
  });
});
