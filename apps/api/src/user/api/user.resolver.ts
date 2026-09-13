import { UseGuards } from "@nestjs/common";
import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentPrincipal } from "../../authentication/api/current-principal.decorator";
import { GraphqlAuthenticationGuard } from "../../authentication/api/graphql-authentication.guard";
import type { AuthenticatedPrincipal } from "../../authentication/domain/authenticated-principal";
import { UserService } from "../application/user.service";
import { UserObject } from "./user.type";

@Resolver(() => UserObject)
@UseGuards(GraphqlAuthenticationGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserObject, {
    description:
      "Creates the Wordseed user after external authentication, or returns the existing user.",
  })
  completeSignIn(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
  ): Promise<UserObject> {
    return this.userService.completeSignIn(principal.subject);
  }

  @Query(() => UserObject, {
    nullable: true,
    description: "Returns the authenticated Wordseed user, when initialized.",
  })
  me(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
  ): Promise<UserObject | null> {
    return this.userService.findCurrentUser(principal.subject);
  }
}
