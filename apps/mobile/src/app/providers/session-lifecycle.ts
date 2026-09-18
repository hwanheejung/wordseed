import type { AuthClient, AuthSession } from "@/shared/auth";

export type SessionState = { status: "loading" } | { status: "failed" } | { status: "resolved"; session: AuthSession | null };
type SessionSource = Pick<AuthClient, "getSession" | "onAuthStateChange">;

function socialSession(session: AuthSession | null): AuthSession | null {
  const providers: unknown = session?.user.app_metadata.providers;
  return Array.isArray(providers) && providers.some((provider) => provider === "apple" || provider === "google") ? session : null;
}

/** A live auth event supersedes the startup snapshot, including a late startup failure. */
export function observeAuthSession(auth: SessionSource, onChange: (state: SessionState) => void): () => void {
  let active = true;
  let receivedEvent = false;
  onChange({ status: "loading" });
  const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
    // INITIAL_SESSION can be null when restoration failed offline, not just on logout.
    // The explicit getSession result owns startup success/failure.
    if (!active || event === "INITIAL_SESSION") return;
    receivedEvent = true;
    onChange({ status: "resolved", session: socialSession(session) });
  });
  void auth.getSession().then(({ data, error }) => {
    if (!active || receivedEvent) return;
    onChange(error ? { status: "failed" } : { status: "resolved", session: socialSession(data.session) });
  }).catch(() => {
    if (active && !receivedEvent) onChange({ status: "failed" });
  });
  return () => {
    active = false;
    subscription.unsubscribe();
  };
}
