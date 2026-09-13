import { Module } from "@nestjs/common";
import { GraphqlAuthenticationGuard } from "./api/graphql-authentication.guard";
import { AccessTokenVerifier } from "./application/access-token-verifier";
import { SupabaseAccessTokenVerifier } from "./infrastructure/supabase-access-token-verifier";

@Module({
  providers: [
    GraphqlAuthenticationGuard,
    SupabaseAccessTokenVerifier,
    {
      provide: AccessTokenVerifier,
      useExisting: SupabaseAccessTokenVerifier,
    },
  ],
  exports: [AccessTokenVerifier, GraphqlAuthenticationGuard],
})
export class AuthenticationModule {}
