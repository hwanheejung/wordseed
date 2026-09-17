import { NativeModules } from "react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESSIBLE, STORAGE_TYPE, getGenericPassword, resetGenericPassword, setGenericPassword } from "react-native-keychain";
import { createKeychainSessionStorage, isKeychainAvailable } from "./keychain-session-storage";

vi.mock("react-native", () => ({ NativeModules: { RNKeychainManager: null } }));

vi.mock("react-native-keychain", () => ({
  STORAGE_TYPE: { AES_GCM_NO_AUTH: "KeystoreAESGCM_NoAuth" },
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: "AccessibleWhenUnlockedThisDeviceOnly" },
  getGenericPassword: vi.fn(), resetGenericPassword: vi.fn(), setGenericPassword: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  NativeModules.RNKeychainManager = {
    getGenericPasswordForOptions: vi.fn(),
    setGenericPasswordForOptions: vi.fn(),
    resetGenericPasswordForOptions: vi.fn(),
  };
});

describe("keychain session storage", () => {
  it.each([null, undefined, {}])("blocks auth storage creation when the native bridge is unavailable: %s", (bridge) => {
    NativeModules.RNKeychainManager = bridge;
    expect(isKeychainAvailable()).toBe(false);
    expect(() => createKeychainSessionStorage()).toThrow("Rebuild the app");
    expect(getGenericPassword).not.toHaveBeenCalled();
  });

  it("recognizes a native build with the required secure storage methods", () => {
    expect(isKeychainAvailable()).toBe(true);
  });

  it("returns a stored SDK value and treats a missing key as no session", async () => {
    const storage = createKeychainSessionStorage();
    vi.mocked(getGenericPassword).mockResolvedValueOnce({ username: "supabase-session", password: "session-json", service: "wordseed.supabase.session", storage: STORAGE_TYPE.AES_GCM_NO_AUTH }).mockResolvedValueOnce(false);
    expect(await storage.getItem("session")).toBe("session-json");
    expect(await storage.getItem("other-project-session")).toBeNull();
    expect(getGenericPassword).toHaveBeenLastCalledWith({ service: "wordseed.supabase.other-project-session" });
  });

  it("writes SDK values to separate device-only secure services", async () => {
    const storage = createKeychainSessionStorage();
    vi.mocked(setGenericPassword).mockResolvedValue({ service: "test", storage: STORAGE_TYPE.AES_GCM_NO_AUTH });
    await storage.setItem("project-session", "session-json");
    expect(setGenericPassword).toHaveBeenCalledWith("supabase-session", "session-json", { service: "wordseed.supabase.project-session", accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY, cloudSync: false });
  });

  it("propagates failed secure writes instead of claiming persistence", async () => {
    vi.mocked(setGenericPassword).mockResolvedValue(false);
    await expect(createKeychainSessionStorage().setItem("session", "value")).rejects.toThrow("persist");
  });

  it("removes only the requested SDK key", async () => {
    vi.mocked(resetGenericPassword).mockResolvedValue(true);
    await createKeychainSessionStorage().removeItem("session");
    expect(resetGenericPassword).toHaveBeenCalledWith({ service: "wordseed.supabase.session" });
    expect(getGenericPassword).not.toHaveBeenCalled();
  });

  it("allows idempotent removal but surfaces a secret that could not be removed", async () => {
    vi.mocked(resetGenericPassword).mockResolvedValue(false);
    vi.mocked(getGenericPassword).mockResolvedValueOnce(false).mockResolvedValueOnce({ username: "supabase-session", password: "still-present", service: "test", storage: STORAGE_TYPE.AES_GCM_NO_AUTH });
    const storage = createKeychainSessionStorage();
    await expect(storage.removeItem("missing")).resolves.toBeUndefined();
    await expect(storage.removeItem("session")).rejects.toThrow("remove");
  });
});
