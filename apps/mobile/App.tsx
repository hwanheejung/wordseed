import "react-native-url-polyfill/auto";
import { App } from "./src/app";

// This is the only Expo environment adapter. A Bare RN entrypoint supplies the same props.
export default function ExpoApp() {
  return <App configuration={{
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/graphql",
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    enableEmailTestLogin: __DEV__ && process.env.EXPO_PUBLIC_ENABLE_EMAIL_TEST_LOGIN === "true",
  }} />;
}
