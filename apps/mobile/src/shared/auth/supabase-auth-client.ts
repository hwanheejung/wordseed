import { createClient, type Session, type SupabaseClient, type SupportedStorage } from "@supabase/supabase-js";

export type AuthClient = SupabaseClient["auth"];
export type AuthSession = Session;
export type AuthSessionStorage = SupportedStorage;

interface SupabaseAuthClientOptions {
  url: string;
  publishableKey: string;
  storage: AuthSessionStorage;
}

/** The app owns configuration, storage, and foreground refresh lifecycle. */
export function createSupabaseAuthClient({ url, publishableKey, storage }: SupabaseAuthClientOptions): AuthClient {
  return createClient(url, publishableKey, {
    auth: {
      storage,
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }).auth;
}
