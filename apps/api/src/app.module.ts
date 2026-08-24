import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import {
  type ApiEnvironment,
  validateEnvironment,
} from "./config/environment";
import { DictionaryModule } from "./dictionary/dictionary.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateEnvironment,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<ApiEnvironment, true>,
      ): ApolloDriverConfig => ({
        autoSchemaFile: true,
        driver: ApolloDriver,
        graphiql:
          configService.get("NODE_ENV", { infer: true }) !== "production",
        path: "/graphql",
        sortSchema: true,
      }),
    }),
    DictionaryModule,
    HealthModule,
  ],
})
export class AppModule {}
