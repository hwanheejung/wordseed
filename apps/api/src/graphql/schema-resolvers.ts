import type { Type } from "@nestjs/common";
import { DICTIONARY_GRAPHQL_RESOLVERS } from "../dictionary/dictionary.module";
import { HEALTH_GRAPHQL_RESOLVERS } from "../health/health.module";
import { USER_GRAPHQL_RESOLVERS } from "../user/user.module";

export const GRAPHQL_SCHEMA_RESOLVERS: ReadonlyArray<Type<unknown>> = [
  ...DICTIONARY_GRAPHQL_RESOLVERS,
  ...HEALTH_GRAPHQL_RESOLVERS,
  ...USER_GRAPHQL_RESOLVERS,
];
