import { Module, type Type } from "@nestjs/common";
import { HealthResolver } from "./health.resolver";

export const HEALTH_GRAPHQL_RESOLVERS = [
  HealthResolver,
] satisfies Type<unknown>[];

@Module({
  providers: [...HEALTH_GRAPHQL_RESOLVERS],
})
export class HealthModule {}
