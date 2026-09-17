import { Module, type Type } from "@nestjs/common";
import { AuthenticationModule } from "../authentication/authentication.module";
import { DatabaseModule } from "../database/database.module";
import { UserResolver } from "./api/user.resolver";
import { UserService } from "./application/user.service";
import { UserRepository } from "./domain/user.repository";
import { PrismaUserRepository } from "./infrastructure/prisma-user.repository";

export const USER_GRAPHQL_RESOLVERS = [UserResolver] satisfies Type<unknown>[];

@Module({
  imports: [AuthenticationModule, DatabaseModule],
  exports: [UserService],
  providers: [
    ...USER_GRAPHQL_RESOLVERS,
    UserService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
})
export class UserModule {}
