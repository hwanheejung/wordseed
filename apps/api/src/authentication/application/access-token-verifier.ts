import type { AuthenticatedPrincipal } from "../domain/authenticated-principal";

export class InvalidAccessTokenError extends Error {}

export abstract class AccessTokenVerifier {
  abstract verify(accessToken: string): Promise<AuthenticatedPrincipal>;
}
