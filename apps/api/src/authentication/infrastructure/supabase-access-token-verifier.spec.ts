import { ConfigService } from "@nestjs/config";
import {
  exportJWK,
  generateKeyPair,
  SignJWT,
  type GenerateKeyPairResult,
} from "jose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type ApiEnvironment,
  validateEnvironment,
} from "../../config/environment";
import { InvalidAccessTokenError } from "../application/access-token-verifier";
import { SupabaseAccessTokenVerifier } from "./supabase-access-token-verifier";

const authSubject = "00000000-0000-4000-8000-000000000001";
const sessionId = "10000000-0000-4000-8000-000000000001";
const supabaseUrl = "https://wordseed.supabase.co";
const issuer = `${supabaseUrl}/auth/v1`;
const keyId = "test-signing-key";

describe("SupabaseAccessTokenVerifier", () => {
  let keyPair: GenerateKeyPairResult;
  let verifier: SupabaseAccessTokenVerifier;

  beforeEach(async () => {
    keyPair = await generateKeyPair("ES256");
    const publicJwk = await exportJWK(keyPair.publicKey);
    const fetchJwks = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          keys: [
            {
              ...publicJwk,
              alg: "ES256",
              kid: keyId,
              use: "sig",
            },
          ],
        }),
        {
          headers: { "content-type": "application/json" },
          status: 200,
        },
      ),
    );

    vi.stubGlobal("fetch", fetchJwks);
    verifier = new SupabaseAccessTokenVerifier(createConfigService());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts a signed token from the configured Supabase project", async () => {
    const accessToken = await signAccessToken(keyPair.privateKey);

    await expect(verifier.verify(accessToken)).resolves.toEqual({
      subject: authSubject,
      sessionId,
    });
  });

  it("rejects a token issued for another audience", async () => {
    const accessToken = await signAccessToken(
      keyPair.privateKey,
      "another-audience",
    );

    await expect(verifier.verify(accessToken)).rejects.toBeInstanceOf(
      InvalidAccessTokenError,
    );
  });

  it("rejects sessions that do not belong to Apple or Google identities", async () => {
    const accessToken = await signAccessToken(
      keyPair.privateKey,
      "authenticated",
      ["email"],
    );

    await expect(verifier.verify(accessToken)).rejects.toBeInstanceOf(
      InvalidAccessTokenError,
    );
  });

  it("accepts email identities only when explicitly enabled for development", async () => {
    verifier = new SupabaseAccessTokenVerifier(createConfigService("true"));
    const token = await signAccessToken(keyPair.privateKey, "authenticated", ["email"]);
    await expect(verifier.verify(token)).resolves.toEqual({ subject: authSubject, sessionId });
  });

  it("rejects email identities with an explicit false flag", async () => {
    verifier = new SupabaseAccessTokenVerifier(createConfigService("false"));
    await expect(verifier.verify(await signAccessToken(keyPair.privateKey, "authenticated", ["email"]))).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it.each(["apple", "google"])("preserves the %s provider policy with email testing enabled", async (provider) => {
    verifier = new SupabaseAccessTokenVerifier(createConfigService("true"));
    await expect(verifier.verify(await signAccessToken(keyPair.privateKey, "authenticated", [provider]))).resolves.toMatchObject({ subject: authSubject });
  });

  it("rejects expired email tokens even when testing is enabled", async () => {
    verifier = new SupabaseAccessTokenVerifier(createConfigService("true"));
    await expect(verifier.verify(await signAccessToken(keyPair.privateKey, "authenticated", ["email"], { expiresAt: "-1m" }))).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it("rejects email tokens from the wrong issuer even when testing is enabled", async () => {
    verifier = new SupabaseAccessTokenVerifier(createConfigService("true"));
    await expect(verifier.verify(await signAccessToken(keyPair.privateKey, "authenticated", ["email"], { tokenIssuer: "https://other.supabase.co/auth/v1" }))).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it("rejects anonymous email tokens even when testing is enabled", async () => {
    verifier = new SupabaseAccessTokenVerifier(createConfigService("true"));
    await expect(verifier.verify(await signAccessToken(keyPair.privateKey, "authenticated", ["email"], { anonymous: true }))).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it("rejects email tokens with the wrong audience even when testing is enabled", async () => {
    verifier = new SupabaseAccessTokenVerifier(createConfigService("true"));
    await expect(verifier.verify(await signAccessToken(keyPair.privateKey, "another-audience", ["email"]))).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it("rejects unsupported providers even when email testing is enabled", async () => {
    verifier = new SupabaseAccessTokenVerifier(createConfigService("true"));
    await expect(verifier.verify(await signAccessToken(keyPair.privateKey, "authenticated", ["github"]))).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it("rejects malformed tokens without exposing verifier errors", async () => {
    await expect(verifier.verify("not-a-jwt")).rejects.toMatchObject({
      message: "Invalid Supabase access token.",
    });
  });
});

function createConfigService(allowEmailTestLogin?: "true" | "false"): ConfigService<ApiEnvironment, true> {
  const environment = validateEnvironment({ SUPABASE_URL: supabaseUrl, ALLOW_EMAIL_TEST_LOGIN: allowEmailTestLogin });

  return new ConfigService<ApiEnvironment, true>(environment);
}

function signAccessToken(
  privateKey: GenerateKeyPairResult["privateKey"],
  audience = "authenticated",
  providers: string[] = ["apple"],
  options: { expiresAt?: string; tokenIssuer?: string; anonymous?: boolean } = {},
): Promise<string> {
  return new SignJWT({
    app_metadata: { providers },
    is_anonymous: options.anonymous ?? false,
    role: "authenticated",
    session_id: sessionId,
  })
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setSubject(authSubject)
    .setIssuer(options.tokenIssuer ?? issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(options.expiresAt ?? "5m")
    .sign(privateKey);
}
