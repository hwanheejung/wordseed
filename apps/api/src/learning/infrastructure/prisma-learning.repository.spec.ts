import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "../../database/prisma.service";
import { Prisma } from "../../generated/prisma/client";
import { PrismaLearningRepository } from "./prisma-learning.repository";

const userId = "00000000-0000-4000-8000-000000000001";
const senseId = "00000000-0000-4000-8000-000000000002";
const row = { id: "00000000-0000-4000-8000-000000000003", userId, senseId, addedAt: new Date("2026-09-17T00:00:00.123Z"), sense: { lexemeId: "00000000-0000-4000-8000-000000000004" } };
const prisma = {
  savedLearningItem: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  dictionarySense: { findUnique: vi.fn() },
};
let repository: PrismaLearningRepository;

beforeEach(async () => {
  vi.resetAllMocks();
  const module = await Test.createTestingModule({ providers: [PrismaLearningRepository, { provide: PrismaService, useValue: prisma }] }).compile();
  repository = module.get(PrismaLearningRepository);
});

describe("PrismaLearningRepository", () => {
  it("returns the original identity and addition time without updating a repeat save", async () => {
    prisma.savedLearningItem.findUnique.mockResolvedValue(row);
    expect(await repository.save(userId, senseId)).toEqual({ ...row, sense: undefined, lexemeId: row.sense.lexemeId });
    expect(prisma.savedLearningItem.create).not.toHaveBeenCalled();
    expect(prisma.dictionarySense.findUnique).not.toHaveBeenCalled();
    expect(prisma.savedLearningItem.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_senseId: { userId, senseId } } }));
  });

  it("rejects a missing sense without creating a save", async () => {
    prisma.savedLearningItem.findUnique.mockResolvedValue(null);
    prisma.dictionarySense.findUnique.mockResolvedValue(null);
    expect(await repository.save(userId, senseId)).toBeNull();
    expect(prisma.savedLearningItem.create).not.toHaveBeenCalled();
  });

  it("creates only ownership and a dictionary reference", async () => {
    prisma.savedLearningItem.findUnique.mockResolvedValue(null);
    prisma.dictionarySense.findUnique.mockResolvedValue({ id: senseId });
    prisma.savedLearningItem.create.mockResolvedValue(row);
    expect(await repository.save(userId, senseId)).toMatchObject({ id: row.id, addedAt: row.addedAt });
    expect(prisma.savedLearningItem.create).toHaveBeenCalledWith(expect.objectContaining({ data: { userId, senseId } }));
  });

  it("recovers the winning save after a concurrent unique conflict", async () => {
    prisma.savedLearningItem.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(row);
    prisma.dictionarySense.findUnique.mockResolvedValue({ id: senseId });
    prisma.savedLearningItem.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("duplicate", { code: "P2002", clientVersion: "7.9.1" }));
    expect(await repository.save(userId, senseId)).toMatchObject({ id: row.id, addedAt: row.addedAt });
  });

  it("handles a sense deleted between lookup and insertion", async () => {
    prisma.savedLearningItem.findUnique.mockResolvedValue(null);
    prisma.dictionarySense.findUnique.mockResolvedValueOnce({ id: senseId }).mockResolvedValueOnce(null);
    prisma.savedLearningItem.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("foreign key", { code: "P2003", clientVersion: "7.9.1" }));
    expect(await repository.save(userId, senseId)).toBeNull();
  });

  it("does not hide unrelated persistence failures", async () => {
    const error = new Error("database unavailable");
    prisma.savedLearningItem.findUnique.mockResolvedValue(null);
    prisma.dictionarySense.findUnique.mockResolvedValue({ id: senseId });
    prisma.savedLearningItem.create.mockRejectedValue(error);
    await expect(repository.save(userId, senseId)).rejects.toBe(error);
  });

  it("scopes count and stable keyset reads to the owner and fetches one lookahead row", async () => {
    prisma.savedLearningItem.findMany.mockResolvedValue([row, { ...row, id: "older" }]);
    prisma.savedLearningItem.count.mockResolvedValue(3);
    const result = await repository.list({ userId, first: 1, after: { id: row.id, addedAt: row.addedAt } });
    expect(result).toMatchObject({ items: [{ id: row.id }], totalCount: 3, hasNextPage: true });
    expect(prisma.savedLearningItem.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId, OR: [{ addedAt: { lt: row.addedAt } }, { addedAt: row.addedAt, id: { lt: row.id } }] },
      orderBy: [{ addedAt: "desc" }, { id: "desc" }], take: 2,
    }));
    expect(prisma.savedLearningItem.count).toHaveBeenCalledWith({ where: { userId } });
  });
});
