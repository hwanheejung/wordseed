import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { Prisma } from "../../generated/prisma/client";
import {
  LearningRepository,
  type ListSavedLearningItemsCriteria,
  type SavedLearningItemRecord,
  type SavedLearningItemsResult,
} from "../domain/learning.repository";

const itemInclude = { sense: { select: { lexemeId: true } } } satisfies Prisma.SavedLearningItemInclude;
type ItemRecord = Prisma.SavedLearningItemGetPayload<{ include: typeof itemInclude }>;

function toItem(record: ItemRecord): SavedLearningItemRecord {
  return { id: record.id, userId: record.userId, senseId: record.senseId, addedAt: record.addedAt, lexemeId: record.sense.lexemeId };
}

@Injectable()
export class PrismaLearningRepository extends LearningRepository {
  constructor(private readonly prisma: PrismaService) { super(); }

  async save(userId: string, senseId: string): Promise<SavedLearningItemRecord | null> {
    const where = { userId_senseId: { userId, senseId } };
    const existing = await this.prisma.savedLearningItem.findUnique({ where, include: itemInclude });
    if (existing) return toItem(existing);

    const sense = await this.prisma.dictionarySense.findUnique({ where: { id: senseId }, select: { id: true } });
    if (!sense) return null;

    try {
      return toItem(await this.prisma.savedLearningItem.create({ data: { userId, senseId }, include: itemInclude }));
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const winner = await this.prisma.savedLearningItem.findUnique({ where, include: itemInclude });
        if (winner) return toItem(winner);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        const remainingSense = await this.prisma.dictionarySense.findUnique({ where: { id: senseId }, select: { id: true } });
        if (!remainingSense) return null;
      }
      throw error;
    }
  }

  async list({ userId, first, after }: ListSavedLearningItemsCriteria): Promise<SavedLearningItemsResult> {
    const where: Prisma.SavedLearningItemWhereInput = {
      userId,
      ...(after ? { OR: [
        { addedAt: { lt: after.addedAt } },
        { addedAt: after.addedAt, id: { lt: after.id } },
      ] } : {}),
    };
    const [items, totalCount] = await Promise.all([
      this.prisma.savedLearningItem.findMany({ where, include: itemInclude, orderBy: [{ addedAt: "desc" }, { id: "desc" }], take: first + 1 }),
      this.prisma.savedLearningItem.count({ where: { userId } }),
    ]);
    return { items: items.slice(0, first).map(toItem), totalCount, hasNextPage: items.length > first };
  }
}
