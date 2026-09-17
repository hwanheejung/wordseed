import { UseGuards } from "@nestjs/common";
import { Args, ID, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLError } from "graphql";
import { CurrentPrincipal } from "../../authentication/api/current-principal.decorator";
import { GraphqlAuthenticationGuard } from "../../authentication/api/graphql-authentication.guard";
import type { AuthenticatedPrincipal } from "../../authentication/domain/authenticated-principal";
import { DictionarySenseNotFoundError, InvalidLearningInputError, LearningService, LearningUserNotInitializedError } from "../application/learning.service";
import { SavedLearningItemConnectionObject, SavedLearningItemObject } from "./saved-learning-item.type";

function translateLearningError(error: unknown): never {
  if (error instanceof InvalidLearningInputError) throw new GraphQLError(error.message, { extensions: { code: "BAD_USER_INPUT" } });
  if (error instanceof DictionarySenseNotFoundError) throw new GraphQLError(error.message, { extensions: { code: "NOT_FOUND" } });
  if (error instanceof LearningUserNotInitializedError) throw new GraphQLError(error.message, { extensions: { code: "FORBIDDEN" } });
  throw error;
}

@Resolver(() => SavedLearningItemObject)
@UseGuards(GraphqlAuthenticationGuard)
export class LearningResolver {
  constructor(private readonly learning: LearningService) {}

  @Mutation(() => SavedLearningItemObject, { description: "Saves an existing Dictionary Sense once for the authenticated user, preserving its original added time." })
  async saveDictionarySense(@CurrentPrincipal() principal: AuthenticatedPrincipal, @Args("senseId", { type: () => ID }) senseId: string): Promise<SavedLearningItemObject> {
    try { return await this.learning.saveDictionarySense(principal.subject, senseId); }
    catch (error: unknown) { return translateLearningError(error); }
  }

  @Query(() => SavedLearningItemConnectionObject, { description: "Lists the authenticated user's saved items by addedAt descending, then ID descending, using forward cursor pagination." })
  async mySavedLearningItems(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Args("first", { type: () => Int, defaultValue: 20 }) first: number,
    @Args("after", { type: () => String, nullable: true }) after?: string,
  ): Promise<SavedLearningItemConnectionObject> {
    try { return await this.learning.mySavedLearningItems(principal.subject, { first, after }); }
    catch (error: unknown) { return translateLearningError(error); }
  }
}
