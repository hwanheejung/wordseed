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

  it.each(["apple", "google"])("accepts a %s identity", async (provider) => {
    const token = await signAccessToken(keyPair.privateKey, "authenticated", [provider]);
    await expect(verifier.verify(token)).resolves.toEqual({ subject: authSubject, sessionId });
  });

  it.each(["apple", "google"])("accepts %s linked to an existing email identity", async (provider) => {
    const token = await signAccessToken(keyPair.privateKey, "authenticated", ["email", provider]);
    await expect(verifier.verify(token)).resolves.toEqual({ subject: authSubject, sessionId });
  });

  it("rejects expired social tokens", async () => {
    const token = await signAccessToken(keyPair.privateKey, "authenticated", ["google"], { expiresAt: "-1m" });
    await expect(verifier.verify(token)).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it("rejects social tokens from the wrong issuer", async () => {
    const token = await signAccessToken(keyPair.privateKey, "authenticated", ["apple"], { tokenIssuer: "https://other.supabase.co/auth/v1" });
    await expect(verifier.verify(token)).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it("rejects anonymous tokens", async () => {
    const token = await signAccessToken(keyPair.privateKey, "authenticated", ["apple"], { anonymous: true });
    await expect(verifier.verify(token)).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it("rejects unsupported providers", async () => {
    const token = await signAccessToken(keyPair.privateKey, "authenticated", ["github"]);
    await expect(verifier.verify(token)).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it("rejects malformed tokens without exposing verifier errors", async () => {
    await expect(verifier.verify("not-a-jwt")).rejects.toMatchObject({
      message: "Invalid Supabase access token.",
    });
  });
});

function createConfigService(): ConfigService<ApiEnvironment, true> {
  const environment = validateEnvironment({ SUPABASE_URL: supabaseUrl });

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
