import type { User } from "./user";

export abstract class UserRepository {
  abstract findByAuthSubject(authSubject: string): Promise<User | null>;

  abstract upsertByAuthSubject(authSubject: string): Promise<User>;
}
