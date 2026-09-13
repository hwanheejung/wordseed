import { describe, expect, it } from "vitest";
import type { User } from "../domain/user";
import { UserRepository } from "../domain/user.repository";
import { UserService } from "./user.service";

const authSubject = "00000000-0000-4000-8000-000000000001";
const user: User = {
  id: "10000000-0000-4000-8000-000000000001",
  nativeLanguageTag: null,
  onboardingCompletedAt: null,
  timeZone: null,
  createdAt: new Date("2026-08-31T00:00:00.000Z"),
  updatedAt: new Date("2026-08-31T00:00:00.000Z"),
};

class TestUserRepository extends UserRepository {
  currentUser: User | null = null;

  findByAuthSubject(subject: string): Promise<User | null> {
    return Promise.resolve(subject === authSubject ? this.currentUser : null);
  }

  upsertByAuthSubject(subject: string): Promise<User> {
    if (subject === authSubject) this.currentUser = user;

    return Promise.resolve(user);
  }
}

describe("UserService", () => {
  it("creates the application user when sign-in completes", async () => {
    const repository = new TestUserRepository();
    const service = new UserService(repository);

    await expect(service.findCurrentUser(authSubject)).resolves.toBeNull();
    await expect(service.completeSignIn(authSubject)).resolves.toEqual(user);
    await expect(service.findCurrentUser(authSubject)).resolves.toEqual(user);
  });

  it("returns the same user when sign-in completion is retried", async () => {
    const service = new UserService(new TestUserRepository());

    const first = await service.completeSignIn(authSubject);
    const retried = await service.completeSignIn(authSubject);

    expect(retried.id).toBe(first.id);
  });
});
