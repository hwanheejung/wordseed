import { CryptoDigestAlgorithm, digest, getRandomValues } from "expo-crypto";
import { Platform } from "react-native";

// Supabase PKCE needs secure randomness and SHA-256 in Hermes. Keep the native
// bridge at the entrypoint; never allow the SDK's Math.random/plain fallback.
if (Platform.OS !== "web") {
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, "crypto", { value: {}, configurable: true });
  }
  if (!globalThis.crypto.getRandomValues) {
    Object.defineProperty(globalThis.crypto, "getRandomValues", { value: getRandomValues });
  }
  if (!globalThis.crypto.subtle) {
    Object.defineProperty(globalThis.crypto, "subtle", {
      value: {
        digest(algorithm: string, data: BufferSource) {
          if (algorithm !== "SHA-256") throw new Error("Only SHA-256 is supported by the PKCE crypto bridge.");
          return digest(CryptoDigestAlgorithm.SHA256, data);
        },
      },
    });
  }
}
