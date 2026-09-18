import { createContext, useContext } from "react";
import type { AuthSession } from "@/shared/auth";

interface SessionContextValue {
  user: AuthSession["user"];
  signOut: () => Promise<{ status: "success" } | { status: "error" }>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession requires an authenticated session.");
  return session;
}
