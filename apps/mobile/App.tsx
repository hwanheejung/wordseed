import "react-native-url-polyfill/auto";
import "./src/app/native-auth/install-pkce-crypto";
import { App } from "./src/app";
import { expoOAuthBrowser } from "./src/app/native-auth/expo-oauth-browser";

// This is the only Expo environment adapter. A Bare RN entrypoint supplies the same props.
export default function ExpoApp() {
  return <App configuration={{
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/graphql",
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    oauthBrowser: expoOAuthBrowser,
  }} />;
}
