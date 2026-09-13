import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import type { User as UserRecord } from "../../generated/prisma/client";
import type { User } from "../domain/user";
import { UserRepository } from "../domain/user.repository";

function toUser(record: UserRecord): User {
  return {
    id: record.id,
    nativeLanguageTag: record.nativeLanguageTag,
    onboardingCompletedAt: record.onboardingCompletedAt,
    timeZone: record.timeZone,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByAuthSubject(authSubject: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { authSubject },
    });

    return user ? toUser(user) : null;
  }

  async upsertByAuthSubject(authSubject: string): Promise<User> {
    const user = await this.prisma.user.upsert({
      where: { authSubject },
      create: { authSubject },
      update: {},
    });

    return toUser(user);
  }
}
