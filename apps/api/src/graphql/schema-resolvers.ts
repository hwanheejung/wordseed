import type { Type } from "@nestjs/common";
import { DICTIONARY_GRAPHQL_RESOLVERS } from "../dictionary/dictionary.module";
import { HEALTH_GRAPHQL_RESOLVERS } from "../health/health.module";

export const GRAPHQL_SCHEMA_RESOLVERS: ReadonlyArray<Type<unknown>> = [
  ...DICTIONARY_GRAPHQL_RESOLVERS,
  ...HEALTH_GRAPHQL_RESOLVERS,
];
