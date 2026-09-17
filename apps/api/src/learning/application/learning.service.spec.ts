import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DictionaryService } from "../../dictionary/application/dictionary.service";
import type { DictionaryLexeme } from "../../dictionary/domain/dictionary-lexeme";
import { UserService } from "../../user/application/user.service";
import { LearningRepository, type SavedLearningItemRecord, type ListSavedLearningItemsCriteria } from "../domain/learning.repository";
import { InvalidLearningInputError, LearningService } from "./learning.service";

const userId = "00000000-0000-4000-8000-000000000001";
const senseId = "00000000-0000-4000-8000-000000000002";
const lexeme: DictionaryLexeme = {
  id: "00000000-0000-4000-8000-000000000003", canonicalLemma: "run", language: { id: "language", code: "en", name: "English", defaultScriptCode: null }, lexicalCategory: { id: "category", code: "VERB", displayName: "Verb" }, lemmas: [], forms: [],
  senses: [{ id: senseId, order: 0, glosses: [], usages: [], synset: null, narratives: [], examples: [] }],
};
const item: SavedLearningItemRecord = { id: "00000000-0000-4000-8000-000000000004", userId, senseId, lexemeId: lexeme.id, addedAt: new Date("2026-09-17T00:00:00.123Z") };
const repository = { save: vi.fn(), list: vi.fn() };
const users = { findCurrentUser: vi.fn() };
const dictionary = { findById: vi.fn() };
let service: LearningService;

beforeEach(async () => {
  vi.resetAllMocks();
  users.findCurrentUser.mockResolvedValue({ id: userId });
  dictionary.findById.mockResolvedValue(lexeme);
  repository.list.mockResolvedValue({ items: [item], totalCount: 1, hasNextPage: false });
  const module = await Test.createTestingModule({ providers: [LearningService, { provide: LearningRepository, useValue: repository }, { provide: UserService, useValue: users }, { provide: DictionaryService, useValue: dictionary }] }).compile();
  service = module.get(LearningService);
});

describe("saved learning item pagination", () => {
  it("defaults to 20 and roundtrips a millisecond-precise keyset without an offset", async () => {
    const page = await service.mySavedLearningItems("subject", {});
    expect(repository.list).toHaveBeenCalledWith({ userId, first: 20, after: null });
    expect(page.edges[0]?.node).toMatchObject({ id: item.id, sense: { id: senseId }, lexeme: { canonicalLemma: "run" } });
    await service.mySavedLearningItems("subject", { first: 1, after: page.pageInfo.endCursor });
    expect(repository.list).toHaveBeenLastCalledWith({ userId, first: 1, after: { id: item.id, addedAt: item.addedAt } });
  });

  it("traverses tied timestamps without duplicates when a newer item arrives between pages", async () => {
    const tiedOlder = { ...item, id: "00000000-0000-4000-8000-000000000003" };
    const oldest = { ...item, id: "00000000-0000-4000-8000-000000000002", addedAt: new Date("2026-09-16T00:00:00.000Z") };
    const records = [oldest, tiedOlder, item];
    repository.list.mockImplementation(({ userId: owner, first, after }: ListSavedLearningItemsCriteria) => {
      const ordered = records.filter((record) => record.userId === owner).sort((left, right) => right.addedAt.getTime() - left.addedAt.getTime() || right.id.localeCompare(left.id));
      const boundary = after ? ordered.findIndex((record) => record.id === after.id && record.addedAt.getTime() === after.addedAt.getTime()) + 1 : 0;
      return Promise.resolve({ items: ordered.slice(boundary, boundary + first), totalCount: ordered.length, hasNextPage: boundary + first < ordered.length });
    });
    const firstPage = await service.mySavedLearningItems("subject", { first: 1 });
    records.push({ ...item, id: "00000000-0000-4000-8000-000000000099", addedAt: new Date("2026-09-18T00:00:00.000Z") });
    const secondPage = await service.mySavedLearningItems("subject", { first: 1, after: firstPage.pageInfo.endCursor });
    const thirdPage = await service.mySavedLearningItems("subject", { first: 1, after: secondPage.pageInfo.endCursor });
    expect([firstPage, secondPage, thirdPage].flatMap((page) => page.edges.map(({ node }) => node.id))).toEqual([item.id, tiedOlder.id, oldest.id]);
    expect(thirdPage.pageInfo).toMatchObject({ hasPreviousPage: true, hasNextPage: false });
  });

  it("rejects another user's cursor before repository access", async () => {
    const page = await service.mySavedLearningItems("subject", {});
    users.findCurrentUser.mockResolvedValue({ id: "00000000-0000-4000-8000-000000000099" });
    repository.list.mockClear();
    await expect(service.mySavedLearningItems("other-subject", { after: page.pageInfo.endCursor })).rejects.toBeInstanceOf(InvalidLearningInputError);
    expect(repository.list).not.toHaveBeenCalled();
  });

  it.each(["", "invalid", "%%%", Buffer.from(JSON.stringify({ kind: "saved-learning-item", userId, id: item.id, addedAt: "not-a-date" })).toString("base64url")])("rejects malformed cursor %s", async (after) => {
    await expect(service.mySavedLearningItems("subject", { after })).rejects.toBeInstanceOf(InvalidLearningInputError);
    expect(repository.list).not.toHaveBeenCalled();
  });

  it.each([0, -1, 101, 1.5, NaN])("rejects invalid page size %s", async (first) => {
    await expect(service.mySavedLearningItems("subject", { first })).rejects.toBeInstanceOf(InvalidLearningInputError);
    expect(repository.list).not.toHaveBeenCalled();
  });

  it("represents an empty list with null cursors", async () => {
    repository.list.mockResolvedValue({ items: [], totalCount: 0, hasNextPage: false });
    expect(await service.mySavedLearningItems("subject", {})).toEqual({ edges: [], totalCount: 0, pageInfo: { startCursor: null, endCursor: null, hasNextPage: false, hasPreviousPage: false } });
  });
});
