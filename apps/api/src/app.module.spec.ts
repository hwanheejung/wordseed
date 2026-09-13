import type { INestApplication } from "@nestjs/common";
import { GraphQLSchemaHost } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import { readFile } from "node:fs/promises";
import type { Server } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { AppModule } from "./app.module";

const healthResponseSchema = z.object({
  data: z.object({
    health: z.object({
      service: z.literal("wordseed-api"),
      status: z.literal("ok"),
    }),
  }),
});

const unauthenticatedResponseSchema = z.object({
  data: z.object({ me: z.null() }),
  errors: z.array(
    z.object({
      message: z.literal("Authentication required."),
      extensions: z.object({ code: z.literal("UNAUTHENTICATED") }),
    }),
  ),
});

const sharedSchemaPath = resolve(
  process.cwd(),
  "../../packages/graphql-schema/schema.graphql",
);
const requireFromTest = createRequire(__filename);
const { lexicographicSortSchema, printSchema } = requireFromTest(
  "graphql",
) as typeof import("graphql");

describe("AppModule", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("serves the health query through the generated schema", async () => {
    const httpServer = app.getHttpServer() as Server;
    const response = await request(httpServer)
      .post("/graphql")
      .send({ query: "{ health { service status } }" })
      .expect(200);
    const responseBody: unknown = response.body;

    expect(healthResponseSchema.parse(responseBody)).toEqual({
      data: {
        health: {
          service: "wordseed-api",
          status: "ok",
        },
      },
    });
  });

  it("keeps user queries behind authentication", async () => {
    const httpServer = app.getHttpServer() as Server;
    const response = await request(httpServer)
      .post("/graphql")
      .send({ query: "{ me { id } }" })
      .expect(200);
    const responseBody: unknown = response.body;

    expect(() => unauthenticatedResponseSchema.parse(responseBody)).not.toThrow();
  });

  it("keeps the shared schema in sync with the runtime schema", async () => {
    const { schema } = app.get(GraphQLSchemaHost);
    const runtimeSchema = `${printSchema(lexicographicSortSchema(schema))}\n`;
    const sharedSchema = await readFile(sharedSchemaPath, "utf8");

    expect(sharedSchema).toBe(runtimeSchema);
  });
});
