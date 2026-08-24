import "reflect-metadata";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { NestFactory } from "@nestjs/core";
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from "@nestjs/graphql";
import { lexicographicSortSchema, printSchema } from "graphql";
import { GRAPHQL_SCHEMA_RESOLVERS } from "./schema-resolvers";

const SCHEMA_OUTPUT_PATH = resolve(
  __dirname,
  "../../../../packages/graphql-schema/schema.graphql",
);

async function generateSchema(): Promise<void> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule, {
    logger: false,
  });

  try {
    await app.init();

    const schemaFactory = app.get(GraphQLSchemaFactory);
    const schema = await schemaFactory.create([
      ...GRAPHQL_SCHEMA_RESOLVERS,
    ]);
    const schemaDocument = `${printSchema(lexicographicSortSchema(schema))}\n`;

    await mkdir(dirname(SCHEMA_OUTPUT_PATH), { recursive: true });
    await writeFile(SCHEMA_OUTPUT_PATH, schemaDocument, "utf8");
    process.stdout.write(`Generated ${SCHEMA_OUTPUT_PATH}\n`);
  } finally {
    await app.close();
  }
}

generateSchema().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack : String(error);

  process.stderr.write(`${message ?? "Unknown schema generation error"}\n`);
  process.exitCode = 1;
});
