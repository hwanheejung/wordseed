import { Args, ID, Int, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLError } from "graphql";
import {
  DictionaryService,
  InvalidDictionaryQueryError,
} from "../application/dictionary.service";
import { DictionaryEntriesArgs } from "./dictionary-entries.args";
import {
  DictionaryEntryConnectionObject,
  DictionaryEntryObject,
  DictionarySenseObject,
  DictionarySenseRecommendationObject,
} from "./dictionary-entry.type";

@Resolver(() => DictionaryEntryObject)
export class DictionaryResolver {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Query(() => DictionaryEntryObject, {
    nullable: true,
    description: "Returns one dictionary entry by its stable ID.",
  })
  dictionaryEntry(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<DictionaryEntryObject | null> {
    return this.dictionaryService.findById(id);
  }

  @Query(() => DictionaryEntryConnectionObject, {
    description: "Searches dictionary entries using forward cursor pagination.",
  })
  async dictionaryEntries(
    @Args() args: DictionaryEntriesArgs,
  ): Promise<DictionaryEntryConnectionObject> {
    try {
      return await this.dictionaryService.search(args);
    } catch (error: unknown) {
      if (error instanceof InvalidDictionaryQueryError) {
        throw new GraphQLError(error.message, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      throw error;
    }
  }

}

@Resolver(() => DictionarySenseObject)
export class DictionarySenseResolver {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @ResolveField(() => [DictionarySenseRecommendationObject], {
    description: "Returns ranked one-hop lexical recommendations for this sense.",
  })
  async recommendations(
    @Parent() sense: DictionarySenseObject,
    @Args("first", { type: () => Int, defaultValue: 3 }) first: number,
  ): Promise<readonly DictionarySenseRecommendationObject[]> {
    try {
      return await this.dictionaryService.senseRecommendations(sense.id, first);
    } catch (error: unknown) {
      if (error instanceof InvalidDictionaryQueryError) {
        throw new GraphQLError(error.message, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      throw error;
    }
  }
}
