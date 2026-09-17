import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class DictionaryLexemesArgs {
  @Field(() => String, { defaultValue: "en" })
  languageTag: string = "en";

  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => Int, { defaultValue: 20 })
  first: number = 20;

  @Field(() => String, { nullable: true })
  after?: string;
}
