import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import {
  AccessTokenVerifier,
  InvalidAccessTokenError,
} from "../application/access-token-verifier";
import type { AuthenticatedRequest } from "./authenticated-request";
import { readBearerAccessToken } from "./bearer-access-token";

interface GraphqlContext {
  req: AuthenticatedRequest;
}

@Injectable()
export class GraphqlAuthenticationGuard implements CanActivate {
  constructor(private readonly accessTokenVerifier: AccessTokenVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = GqlExecutionContext.create(context).getContext<GraphqlContext>()
      .req;
    const accessToken = readBearerAccessToken(request.headers.authorization);

    if (!accessToken) {
      throw createUnauthenticatedError();
    }

    try {
      request.authenticatedPrincipal =
        await this.accessTokenVerifier.verify(accessToken);

      return true;
    } catch (error: unknown) {
      if (error instanceof InvalidAccessTokenError) {
        throw createUnauthenticatedError(error);
      }

      throw error;
    }
  }
}

function createUnauthenticatedError(cause?: unknown): UnauthorizedException {
  return new UnauthorizedException("Authentication required.", {
    cause,
  });
}
