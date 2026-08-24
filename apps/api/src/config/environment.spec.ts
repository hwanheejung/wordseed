import { describe, expect, it } from "vitest";
import { validateEnvironment } from "./environment";

describe("validateEnvironment", () => {
  it("provides safe local defaults", () => {
    expect(validateEnvironment({})).toEqual({
      NODE_ENV: "development",
      PORT: 4000,
      CORS_ORIGINS: [],
      DATABASE_URL:
        "postgresql://wordseed:wordseed@127.0.0.1:5432/wordseed_dev?schema=public",
    });
  });

  it("normalizes configured CORS origins", () => {
    expect(
      validateEnvironment({
        NODE_ENV: "production",
        PORT: "4100",
        CORS_ORIGINS: "https://app.wordseed.dev, https://admin.wordseed.dev ",
        DATABASE_URL: "postgresql://example.com/wordseed",
      }),
    ).toEqual({
      NODE_ENV: "production",
      PORT: 4100,
      CORS_ORIGINS: [
        "https://app.wordseed.dev",
        "https://admin.wordseed.dev",
      ],
      DATABASE_URL: "postgresql://example.com/wordseed",
    });
  });

  it("rejects an invalid port", () => {
    expect(() => validateEnvironment({ PORT: "70000" })).toThrow(
      "Invalid API environment configuration",
    );
  });

  it("requires a database URL in production", () => {
    expect(() => validateEnvironment({ NODE_ENV: "production" })).toThrow(
      "DATABASE_URL is required in production",
    );
  });
});
