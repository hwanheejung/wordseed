import { openAuthSessionAsync } from "expo-web-browser";
import type { OAuthBrowser } from "@/features/sign-in";

export const expoOAuthBrowser: OAuthBrowser = {
  async open(url, redirectUrl) {
    const result = await openAuthSessionAsync(url, redirectUrl);
    return result.type === "success"
      ? { status: "success", url: result.url }
      : { status: "cancelled" };
  },
};
