import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { AuthenticatedPrincipal } from "../domain/authenticated-principal";
import type { AuthenticatedRequest } from "./authenticated-request";

interface GraphqlContext {
  req: AuthenticatedRequest;
}

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedPrincipal => {
    const principal = GqlExecutionContext.create(context)
      .getContext<GraphqlContext>()
      .req.authenticatedPrincipal;

    if (!principal) {
      throw new Error(
        "CurrentPrincipal requires GraphqlAuthenticationGuard to run first.",
      );
    }

    return principal;
  },
);
