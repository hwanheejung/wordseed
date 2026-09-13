import { Injectable } from "@nestjs/common";
import type { User } from "../domain/user";
import { UserRepository } from "../domain/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  completeSignIn(authSubject: string): Promise<User> {
    return this.repository.upsertByAuthSubject(authSubject);
  }

  findCurrentUser(authSubject: string): Promise<User | null> {
    return this.repository.findByAuthSubject(authSubject);
  }
}
