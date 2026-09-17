import { NativeModules } from "react-native";
import { ACCESSIBLE, getGenericPassword, resetGenericPassword, setGenericPassword } from "react-native-keychain";
import type { AuthSessionStorage } from "./supabase-auth-client";

const SERVICE_PREFIX = "wordseed.supabase.";

/** Check the same native bridge used by the installed Keychain package before auth starts. */
export function isKeychainAvailable(): boolean {
  const nativeModule: unknown = NativeModules.RNKeychainManager;
  return typeof nativeModule === "object" && nativeModule !== null &&
    "getGenericPasswordForOptions" in nativeModule && typeof nativeModule.getGenericPasswordForOptions === "function" &&
    "setGenericPasswordForOptions" in nativeModule && typeof nativeModule.setGenericPasswordForOptions === "function" &&
    "resetGenericPasswordForOptions" in nativeModule && typeof nativeModule.resetGenericPasswordForOptions === "function";
}

/** SDK-owned session values stay in the native Keychain/Keystore, never app state storage. */
export function createKeychainSessionStorage(): AuthSessionStorage {
  if (!isKeychainAvailable()) throw new Error("Secure storage is missing from this native build. Rebuild the app with react-native-keychain.");
  return {
    async getItem(key) {
      const credentials = await getGenericPassword({ service: `${SERVICE_PREFIX}${key}` });
      return credentials ? credentials.password : null;
    },
    async setItem(key, value) {
      const result = await setGenericPassword("supabase-session", value, {
        service: `${SERVICE_PREFIX}${key}`,
        accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        cloudSync: false,
      });
      if (!result) throw new Error("Unable to persist the authentication session securely.");
    },
    async removeItem(key) {
      const options = { service: `${SERVICE_PREFIX}${key}` };
      const removed = await resetGenericPassword(options);
      if (!removed && await getGenericPassword(options)) {
        throw new Error("Unable to remove the persisted authentication session.");
      }
    },
  };
}
