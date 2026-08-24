import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType("PageInfo", {
  description: "Cursor information for a Relay-compatible connection.",
})
export class PageInfoObject {
  @Field(() => String, { nullable: true })
  startCursor!: string | null;

  @Field(() => String, { nullable: true })
  endCursor!: string | null;

  @Field()
  hasNextPage!: boolean;

  @Field()
  hasPreviousPage!: boolean;
}
