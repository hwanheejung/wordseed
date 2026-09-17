import type { INestApplication } from "@nestjs/common";
import { AbstractGraphQLDriver, GraphQLSchemaHost } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import { readFile } from "node:fs/promises";
import type { ApolloDriver } from "@nestjs/apollo";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { PrismaService } from "./database/prisma.service";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AccessTokenVerifier, InvalidAccessTokenError } from "./authentication/application/access-token-verifier";
import { UserRepository } from "./user/domain/user.repository";
import { DictionaryRepository } from "./dictionary/domain/dictionary.repository";
import type { DictionaryLexeme } from "./dictionary/domain/dictionary-lexeme";
import { LearningRepository } from "./learning/domain/learning.repository";
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

const senseId = "10000000-0000-4000-8000-000000000001";
const userA = "20000000-0000-4000-8000-000000000001";
const userB = "20000000-0000-4000-8000-000000000002";
const addedAt = new Date("2026-09-17T00:00:00.000Z");
const lexeme: DictionaryLexeme = {
  id: "30000000-0000-4000-8000-000000000001", canonicalLemma: "apple",
  language: { id: "en", code: "en", name: "English", defaultScriptCode: null },
  lexicalCategory: { id: "noun", code: "NOUN", displayName: "Noun" },
  lemmas: [], forms: [],
  senses: [{ id: senseId, order: 0, glosses: [{ id: "gloss", languageTag: "en", text: "a fruit" }],
    usages: [], synset: null, narratives: [], examples: [] }],
};
const row = { id: "40000000-0000-4000-8000-000000000001", userId: userA, senseId, lexemeId: lexeme.id, addedAt };
const save = vi.fn((userId: string, requestedSenseId: string) =>
  Promise.resolve(requestedSenseId === senseId ? { ...row, userId } : null));
const list = vi.fn(({ userId }: { userId: string }) => Promise.resolve({
  items: userId === userA ? [row] : [], totalCount: userId === userA ? 1 : 0, hasNextPage: false,
}));

describe("AppModule", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService).useValue({})
      .overrideProvider(AccessTokenVerifier).useValue({
        verify: (token: string) => {
          if (![userA, userB, "uninitialized"].includes(token)) throw new InvalidAccessTokenError();
          return Promise.resolve({ subject: token === "uninitialized" ? token : `subject-${token}`, sessionId: "test-session" });
        },
      })
      .overrideProvider(UserRepository).useValue({
        findByAuthSubject: (subject: string) => Promise.resolve(subject === "uninitialized" ? null : {
          id: subject.replace("subject-", ""), nativeLanguageTag: null, onboardingCompletedAt: null,
          timeZone: null, createdAt: addedAt, updatedAt: addedAt,
        }),
      })
      .overrideProvider(DictionaryRepository).useValue({ findById: () => Promise.resolve(lexeme) })
      .overrideProvider(LearningRepository).useValue({ save, list })
      .compile();

    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("serves the health query through the generated schema", async () => {
    const response = await app.get<ApolloDriver>(AbstractGraphQLDriver).instance.executeOperation({
      query: "{ health { service status } }",
    });
    if (response.body.kind !== "single") throw new Error("Expected a single result.");
    const responseBody: unknown = response.body.singleResult;

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
    const response = await app.get<ApolloDriver>(AbstractGraphQLDriver).instance.executeOperation(
      { query: "{ me { id } }" },
      { contextValue: { req: { headers: {} } } },
    );
    if (response.body.kind !== "single") throw new Error("Expected a single result.");
    const responseBody: unknown = response.body.singleResult;

    expect(() => unauthenticatedResponseSchema.parse(responseBody)).not.toThrow();
  });

  async function execute(query: string, token?: string) {
    const response = await app.get<ApolloDriver>(AbstractGraphQLDriver).instance.executeOperation(
      { query },
      { contextValue: { req: { headers: token ? { authorization: `Bearer ${token}` } : {} } } },
    );
    if (response.body.kind !== "single") throw new Error("Expected a single result.");
    return response.body.singleResult;
  }

  it.each([undefined, "invalid"])("blocks both learning operations with token %s", async (token) => {
    save.mockClear(); list.mockClear();
    for (const query of [
      `mutation { saveDictionarySense(senseId: "${senseId}") { id } }`,
      "{ mySavedLearningItems { totalCount } }",
    ]) {
      const result = await execute(query, token);
      expect(result.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
    }
    expect(save).not.toHaveBeenCalled(); expect(list).not.toHaveBeenCalled();
  });

  it("returns the saved Dictionary meaning and expression for the authenticated owner", async () => {
    const result = await execute(`mutation { saveDictionarySense(senseId: "${senseId}") {
      id addedAt sense { id glosses { text } } lexeme { canonicalLemma }
    } }`, userA);
    expect(result.errors).toBeUndefined();
    expect(result.data).toMatchObject({ saveDictionarySense: {
      id: row.id, addedAt: addedAt.toISOString(), sense: { id: senseId, glosses: [{ text: "a fruit" }] },
      lexeme: { canonicalLemma: "apple" },
    } });
    expect(save).toHaveBeenLastCalledWith(userA, senseId);
  });

  it("scopes list and count to the current user", async () => {
    const query = "{ mySavedLearningItems { totalCount edges { node { id } } pageInfo { hasNextPage } } }";
    expect((await execute(query, userA)).data).toMatchObject({ mySavedLearningItems: { totalCount: 1, edges: [{ node: { id: row.id } }] } });
    expect((await execute(query, userB)).data).toMatchObject({ mySavedLearningItems: { totalCount: 0, edges: [] } });
    expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ userId: userB }));
  });

  it("rejects a missing Sense and an uninitialized user", async () => {
    const missing = await execute('mutation { saveDictionarySense(senseId: "10000000-0000-4000-8000-000000000099") { id } }', userA);
    expect(missing.errors?.[0]?.extensions?.code).toBe("NOT_FOUND");
    expect(missing.data).toBeNull();
    save.mockClear(); list.mockClear();
    const uninitialized = await execute(`mutation { saveDictionarySense(senseId: "${senseId}") { id } }`, "uninitialized");
    expect(uninitialized.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
    expect(save).not.toHaveBeenCalled();
    expect((await execute("{ mySavedLearningItems { totalCount } }", "uninitialized")).errors).toHaveLength(1);
    expect(list).not.toHaveBeenCalled();
  });

  it("rejects invalid Sense IDs before persistence and forbids caller-supplied ownership", async () => {
    save.mockClear();
    const invalid = await execute('mutation { saveDictionarySense(senseId: "not-a-uuid") { id } }', userA);
    expect(invalid.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
    const forged = await execute(`mutation { saveDictionarySense(senseId: "${senseId}", userId: "${userB}") { id } }`, userA);
    expect(forged.errors?.[0]?.extensions?.code).toBe("GRAPHQL_VALIDATION_FAILED");
    expect(save).not.toHaveBeenCalled();
  });

  it.each(["first: 0", "first: 101", 'after: "invalid"'])("rejects invalid pagination %s", async (args) => {
    const result = await execute(`{ mySavedLearningItems(${args}) { totalCount } }`, userA);
    expect(result.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
  });

  it("keeps the shared schema in sync with the runtime schema", async () => {
    const { schema } = app.get(GraphQLSchemaHost);
    const runtimeSchema = `${printSchema(lexicographicSortSchema(schema))}\n`;
    const sharedSchema = await readFile(sharedSchemaPath, "utf8");

    expect(sharedSchema).toBe(runtimeSchema);
  });
});
