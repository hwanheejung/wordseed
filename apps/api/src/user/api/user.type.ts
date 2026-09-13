import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType("User", { description: "A Wordseed application user." })
export class UserObject {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  nativeLanguageTag!: string | null;

  @Field(() => Date, { nullable: true })
  onboardingCompletedAt!: Date | null;

  @Field(() => String, { nullable: true })
  timeZone!: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
