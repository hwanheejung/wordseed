import { Args, ID, Int, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLError } from "graphql";
import {
  DictionaryService,
  InvalidDictionaryQueryError,
} from "../application/dictionary.service";
import { DictionaryLexemesArgs } from "./dictionary-lexemes.args";
import {
  DictionaryLexemeConnectionObject,
  DictionaryLexemeObject,
  DictionarySenseObject,
  DictionarySenseRecommendationObject,
} from "./dictionary-lexeme.type";

@Resolver(() => DictionaryLexemeObject)
export class DictionaryResolver {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Query(() => DictionaryLexemeObject, {
    nullable: true,
    description: "Returns one dictionary lexeme by its stable ID.",
  })
  dictionaryLexeme(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<DictionaryLexemeObject | null> {
    return this.dictionaryService.findById(id);
  }

  @Query(() => DictionaryLexemeConnectionObject, {
    description: "Searches dictionary lexemes using forward cursor pagination.",
  })
  async dictionaryLexemes(
    @Args() args: DictionaryLexemesArgs,
  ): Promise<DictionaryLexemeConnectionObject> {
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
