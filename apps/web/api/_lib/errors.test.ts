import { describe, expect, it } from "vitest";
import { serializeApiError } from "./errors.js";

describe("API error serialization", () => {
  it("preserves useful provider details without returning a stack trace", () => {
    const error = Object.assign(new Error("Rate limit reached"), {
      name: "RateLimitError",
      status: 429,
      code: "rate_limit_exceeded",
      request_id: "req_123",
    });

    expect(serializeApiError(error)).toEqual({
      status: 429,
      message: "RateLimitError: Rate limit reached (status=429, code=rate_limit_exceeded, request_id=req_123)",
    });
    expect(serializeApiError(error).message).not.toContain("errors.test.ts");
  });
});
