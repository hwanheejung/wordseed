import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";
import type { ApiEnvironment } from "../../config/environment";
import {
  AccessTokenVerifier,
  InvalidAccessTokenError,
} from "../application/access-token-verifier";
import type { AuthenticatedPrincipal } from "../domain/authenticated-principal";

const accessTokenClaimsSchema = z.object({
  sub: z.uuid(),
  session_id: z.uuid(),
  role: z.literal("authenticated"),
  is_anonymous: z.literal(false),
  app_metadata: z.object({
    providers: z.array(z.enum(["apple", "google", "email"])).min(1),
  }),
});

@Injectable()
export class SupabaseAccessTokenVerifier extends AccessTokenVerifier {
  private readonly allowEmailTestLogin: boolean;
  private readonly audience: string;
  private readonly issuer: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(configService: ConfigService<ApiEnvironment, true>) {
    super();

    const supabaseUrl = configService
      .get("SUPABASE_URL", { infer: true })
      .replace(/\/$/, "");

    this.allowEmailTestLogin = configService.get("NODE_ENV", { infer: true }) !== "production" &&
      configService.get("ALLOW_EMAIL_TEST_LOGIN", { infer: true }) === true;
    this.audience = configService.get("SUPABASE_JWT_AUDIENCE", {
      infer: true,
    });
    this.issuer = `${supabaseUrl}/auth/v1`;
    this.jwks = createRemoteJWKSet(
      new URL(`${this.issuer}/.well-known/jwks.json`),
    );
  }

  async verify(accessToken: string): Promise<AuthenticatedPrincipal> {
    try {
      const { payload } = await jwtVerify(accessToken, this.jwks, {
        audience: this.audience,
        issuer: this.issuer,
      });
      const claims = accessTokenClaimsSchema.parse(payload);
      if (!this.allowEmailTestLogin && claims.app_metadata.providers.includes("email")) {
        throw new Error("Email test login is disabled.");
      }

      return {
        subject: claims.sub,
        sessionId: claims.session_id,
      };
    } catch (error: unknown) {
      throw new InvalidAccessTokenError("Invalid Supabase access token.", {
        cause: error,
      });
    }
  }
}
