import type { AuthClient, AuthSession } from "@/shared/auth";

export type SessionState = { status: "loading" } | { status: "failed" } | { status: "resolved"; session: AuthSession | null };
type SessionSource = Pick<AuthClient, "getSession" | "onAuthStateChange">;

/** A live auth event supersedes the startup snapshot, including a late startup failure. */
export function observeAuthSession(auth: SessionSource, onChange: (state: SessionState) => void): () => void {
  let active = true;
  let receivedEvent = false;
  onChange({ status: "loading" });
  const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
    if (!active) return;
    receivedEvent = true;
    onChange({ status: "resolved", session });
  });
  void auth.getSession().then(({ data, error }) => {
    if (!active || receivedEvent) return;
    onChange(error ? { status: "failed" } : { status: "resolved", session: data.session });
  }).catch(() => {
    if (active && !receivedEvent) onChange({ status: "failed" });
  });
  return () => {
    active = false;
    subscription.unsubscribe();
  };
}
