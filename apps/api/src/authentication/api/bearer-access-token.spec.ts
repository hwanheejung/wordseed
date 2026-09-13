import { describe, expect, it } from "vitest";
import { readBearerAccessToken } from "./bearer-access-token";

describe("readBearerAccessToken", () => {
  it("returns a bearer access token", () => {
    expect(readBearerAccessToken("Bearer access-token")).toBe("access-token");
    expect(readBearerAccessToken("bearer access-token")).toBe("access-token");
  });

  it("rejects missing and malformed authorization headers", () => {
    expect(readBearerAccessToken(undefined)).toBeNull();
    expect(readBearerAccessToken("Basic credentials")).toBeNull();
    expect(readBearerAccessToken("Bearer first second")).toBeNull();
    expect(readBearerAccessToken("Bearer ")).toBeNull();
  });
});
