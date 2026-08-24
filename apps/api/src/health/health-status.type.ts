import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType({ description: "Current operational status of the Wordseed API." })
export class HealthStatus {
  @Field({ description: "Whether the API can accept requests." })
  status!: string;

  @Field({ description: "Name of the responding service." })
  service!: string;
}
