import type { Type } from "@nestjs/common";
import { HealthResolver } from "../health/health.resolver";

export const GRAPHQL_SCHEMA_RESOLVERS: ReadonlyArray<Type<unknown>> = [
  HealthResolver,
];
