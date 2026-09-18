import type { OAuthBrowser } from "@/features/sign-in";

// Supplied by the native entrypoint; application/auth/Relay code has no Expo dependency.
export interface MobileConfiguration {
  apiUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  oauthBrowser: OAuthBrowser;
}
