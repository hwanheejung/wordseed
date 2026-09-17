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
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_JWT_AUDIENCE: "authenticated",
      ALLOW_EMAIL_TEST_LOGIN: false,
    });
  });

  it("normalizes configured CORS origins", () => {
    expect(
      validateEnvironment({
        NODE_ENV: "production",
        PORT: "4100",
        CORS_ORIGINS: "https://app.wordseed.dev, https://admin.wordseed.dev ",
        DATABASE_URL: "postgresql://example.com/wordseed",
        SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toEqual({
      NODE_ENV: "production",
      PORT: 4100,
      CORS_ORIGINS: [
        "https://app.wordseed.dev",
        "https://admin.wordseed.dev",
      ],
      DATABASE_URL: "postgresql://example.com/wordseed",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_JWT_AUDIENCE: "authenticated",
      ALLOW_EMAIL_TEST_LOGIN: false,
    });
  });

  it.each(["development", "test"])("allows explicit email test login in %s", (NODE_ENV) => {
    expect(validateEnvironment({ NODE_ENV, ALLOW_EMAIL_TEST_LOGIN: "true" }).ALLOW_EMAIL_TEST_LOGIN).toBe(true);
    expect(validateEnvironment({ NODE_ENV, ALLOW_EMAIL_TEST_LOGIN: "false" }).ALLOW_EMAIL_TEST_LOGIN).toBe(false);
  });

  it.each(["1", "yes", "TRUE", "", true])("rejects invalid email test flag %s", (flag) => {
    expect(() => validateEnvironment({ ALLOW_EMAIL_TEST_LOGIN: flag })).toThrow("ALLOW_EMAIL_TEST_LOGIN");
  });

  it("forbids email test login in production", () => {
    expect(() => validateEnvironment({ NODE_ENV: "production", DATABASE_URL: "postgresql://example.com/wordseed", SUPABASE_URL: "https://example.supabase.co", ALLOW_EMAIL_TEST_LOGIN: "true" })).toThrow("ALLOW_EMAIL_TEST_LOGIN must be false in production");
  });

  it("rejects an invalid port", () => {
    expect(() => validateEnvironment({ PORT: "70000" })).toThrow(
      "Invalid API environment configuration",
    );
  });

  it("requires a database URL in production", () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: "production",
        SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toThrow("DATABASE_URL is required in production");
  });

  it("requires a Supabase URL in production", () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://example.com/wordseed",
      }),
    ).toThrow("SUPABASE_URL is required in production");
  });
});
