import { createContext, useContext } from "react";
import type { Environment } from "relay-runtime";
import type { AuthSession } from "@/shared/auth";

export type SessionContextValue =
  | { status: "loading" }
  | { status: "connecting" }
  | { status: "unavailable"; reason: "secure-storage" | "configuration" }
  | { status: "signed-out"; error: string | null; signIn: (provider: "apple" | "google") => Promise<void> }
  | {
    status: "ready";
    user: AuthSession["user"];
    environment: Environment;
    signOut: () => Promise<{ status: "success" } | { status: "error" }>;
  };

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession requires SessionProvider.");
  return session;
}

export function useAuthenticatedSession(): Extract<SessionContextValue, { status: "ready" }> {
  const session = useSession();
  if (session.status !== "ready") throw new Error("useAuthenticatedSession requires an authenticated screen.");
  return session;
}
