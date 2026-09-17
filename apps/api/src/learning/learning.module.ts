import { Module, type Type } from "@nestjs/common";
import { AuthenticationModule } from "../authentication/authentication.module";
import { DatabaseModule } from "../database/database.module";
import { DictionaryModule } from "../dictionary/dictionary.module";
import { UserModule } from "../user/user.module";
import { LearningResolver } from "./api/learning.resolver";
import { LearningService } from "./application/learning.service";
import { LearningRepository } from "./domain/learning.repository";
import { PrismaLearningRepository } from "./infrastructure/prisma-learning.repository";

export const LEARNING_GRAPHQL_RESOLVERS = [LearningResolver] satisfies Type<unknown>[];

@Module({
  imports: [AuthenticationModule, DatabaseModule, DictionaryModule, UserModule],
  providers: [...LEARNING_GRAPHQL_RESOLVERS, LearningService, { provide: LearningRepository, useClass: PrismaLearningRepository }],
})
export class LearningModule {}
