import { Field, GraphQLISODateTime, ID, Int, ObjectType } from "@nestjs/graphql";
import { DictionaryLexemeObject, DictionarySenseObject } from "../../dictionary/api/dictionary-lexeme.type";
import { PageInfoObject } from "../../graphql/page-info.type";

@ObjectType("SavedLearningItem")
export class SavedLearningItemObject {
  @Field(() => ID) id!: string;
  @Field(() => GraphQLISODateTime) addedAt!: Date;
  @Field(() => DictionarySenseObject) sense!: DictionarySenseObject;
  @Field(() => DictionaryLexemeObject) lexeme!: DictionaryLexemeObject;
}

@ObjectType("SavedLearningItemEdge")
export class SavedLearningItemEdgeObject {
  @Field() cursor!: string;
  @Field(() => SavedLearningItemObject) node!: SavedLearningItemObject;
}

@ObjectType("SavedLearningItemConnection")
export class SavedLearningItemConnectionObject {
  @Field(() => [SavedLearningItemEdgeObject]) edges!: readonly SavedLearningItemEdgeObject[];
  @Field(() => Int) totalCount!: number;
  @Field(() => PageInfoObject) pageInfo!: PageInfoObject;
}
