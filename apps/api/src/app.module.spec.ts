import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { Server } from "node:http";
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
});
