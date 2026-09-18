import type { AuthClient } from "./supabase-auth-client";

/** SDK serializes refreshes and persists rotated tokens. Never send an expired
 * token or let an old user's Relay environment use a new user's credentials. */
export async function getSessionAccessToken(auth: Pick<AuthClient, "getSession">, userId: string): Promise<string> {
  const { data, error } = await auth.getSession();
  if (error) throw error;
  const session = data.session;
  if (!session || session.user.id !== userId) throw new Error("Authentication session changed.");
  if (!session.expires_at || session.expires_at * 1000 <= Date.now()) {
    throw new Error("Authentication session could not be refreshed.");
  }
  return session.access_token;
}
