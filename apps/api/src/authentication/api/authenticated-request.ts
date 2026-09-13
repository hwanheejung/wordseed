import type { AuthenticatedPrincipal } from "../domain/authenticated-principal";

export interface AuthenticatedRequest {
  headers: {
    authorization?: string;
  };
  authenticatedPrincipal?: AuthenticatedPrincipal;
}
