import { Module, type Type } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { DictionaryResolver, DictionarySenseResolver } from "./api/dictionary.resolver";
import { DictionaryService } from "./application/dictionary.service";
import { DictionaryRepository } from "./domain/dictionary.repository";
import { PrismaDictionaryRepository } from "./infrastructure/prisma-dictionary.repository";

export const DICTIONARY_GRAPHQL_RESOLVERS = [
  DictionaryResolver,
  DictionarySenseResolver,
] satisfies Type<unknown>[];

@Module({
  imports: [DatabaseModule],
  exports: [DictionaryService],
  providers: [
    ...DICTIONARY_GRAPHQL_RESOLVERS,
    DictionaryService,
    {
      provide: DictionaryRepository,
      useClass: PrismaDictionaryRepository,
    },
  ],
})
export class DictionaryModule {}
