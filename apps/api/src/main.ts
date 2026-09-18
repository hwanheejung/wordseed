import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import type { ApiEnvironment } from "./config/environment";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<ApiEnvironment, true>);
  const corsOrigins = configService.get("CORS_ORIGINS", { infer: true });
  const port = configService.get("PORT", { infer: true });

  if (corsOrigins.length > 0) {
    app.enableCors({
      credentials: true,
      origin: corsOrigins,
    });
  }

  app.enableShutdownHooks();
  await app.listen(port, "::");
}

bootstrap().catch((error: unknown) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  console.error(message);
  process.exitCode = 1;
});
