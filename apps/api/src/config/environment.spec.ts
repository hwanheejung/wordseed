import { describe, expect, it } from "vitest";
import { validateEnvironment } from "./environment";

describe("validateEnvironment", () => {
  it("provides safe local defaults", () => {
    expect(validateEnvironment({})).toEqual({
      NODE_ENV: "development",
      PORT: 4000,
      CORS_ORIGINS: [],
    });
  });

  it("normalizes configured CORS origins", () => {
    expect(
      validateEnvironment({
        NODE_ENV: "production",
        PORT: "4100",
        CORS_ORIGINS: "https://app.wordseed.dev, https://admin.wordseed.dev ",
      }),
    ).toEqual({
      NODE_ENV: "production",
      PORT: 4100,
      CORS_ORIGINS: [
        "https://app.wordseed.dev",
        "https://admin.wordseed.dev",
      ],
    });
  });

  it("rejects an invalid port", () => {
    expect(() => validateEnvironment({ PORT: "70000" })).toThrow(
      "Invalid API environment configuration",
    );
  });
});
