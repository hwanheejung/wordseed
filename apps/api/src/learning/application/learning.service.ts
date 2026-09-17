import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { DictionaryService } from "../../dictionary/application/dictionary.service";
import type { DictionaryLexeme, DictionarySense } from "../../dictionary/domain/dictionary-lexeme";
import { UserService } from "../../user/application/user.service";
import { LearningRepository, type SavedLearningItemRecord, type SavedLearningItemPosition } from "../domain/learning.repository";

export class InvalidLearningInputError extends Error {}
export class DictionarySenseNotFoundError extends Error {}
export class LearningUserNotInitializedError extends Error {}

export interface SavedLearningItem {
  id: string;
  addedAt: Date;
  sense: DictionarySense;
  lexeme: DictionaryLexeme;
}
export interface SavedLearningItemsInput { first?: number; after?: string | null }
export interface SavedLearningItemPage {
  edges: readonly { cursor: string; node: SavedLearningItem }[];
  totalCount: number;
  pageInfo: { startCursor: string | null; endCursor: string | null; hasNextPage: boolean; hasPreviousPage: boolean };
}

const cursorSchema = z.object({ kind: z.literal("saved-learning-item"), userId: z.uuid(), id: z.uuid(), addedAt: z.iso.datetime() }).strict();
function encodeCursor(item: SavedLearningItemRecord): string {
  return Buffer.from(JSON.stringify({ kind: "saved-learning-item", userId: item.userId, id: item.id, addedAt: item.addedAt.toISOString() })).toString("base64url");
}
function decodeCursor(cursor: string, userId: string): SavedLearningItemPosition {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error("Invalid encoding");
    const decoded: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    const result = cursorSchema.parse(decoded);
    if (result.userId !== userId) throw new Error("Wrong owner");
    return { id: result.id, addedAt: new Date(result.addedAt) };
  } catch {
    throw new InvalidLearningInputError("Invalid saved learning item cursor.");
  }
}

@Injectable()
export class LearningService {
  constructor(private readonly repository: LearningRepository, private readonly users: UserService, private readonly dictionary: DictionaryService) {}

  private async userId(authSubject: string): Promise<string> {
    const user = await this.users.findCurrentUser(authSubject);
    if (!user) throw new LearningUserNotInitializedError("Complete sign-in before accessing saved learning items.");
    return user.id;
  }

  private async hydrate(item: SavedLearningItemRecord): Promise<SavedLearningItem> {
    const lexeme = await this.dictionary.findById(item.lexemeId);
    const sense = lexeme?.senses.find(({ id }) => id === item.senseId);
    if (!lexeme || !sense) throw new Error("Saved learning item dictionary reference is missing.");
    return { id: item.id, addedAt: item.addedAt, sense, lexeme };
  }

  async saveDictionarySense(authSubject: string, senseId: string): Promise<SavedLearningItem> {
    const userId = await this.userId(authSubject);
    if (!z.uuid().safeParse(senseId).success) throw new InvalidLearningInputError("senseId must be a UUID.");
    const item = await this.repository.save(userId, senseId);
    if (!item) throw new DictionarySenseNotFoundError("Dictionary sense not found.");
    return this.hydrate(item);
  }

  async mySavedLearningItems(authSubject: string, input: SavedLearningItemsInput): Promise<SavedLearningItemPage> {
    const userId = await this.userId(authSubject);
    const first = input.first ?? 20;
    if (!Number.isInteger(first) || first < 1 || first > 100) throw new InvalidLearningInputError("first must be between 1 and 100.");
    const after = input.after == null ? null : decodeCursor(input.after, userId);
    const result = await this.repository.list({ userId, first, after });
    const edges = await Promise.all(result.items.map(async (item) => ({ cursor: encodeCursor(item), node: await this.hydrate(item) })));
    return { edges, totalCount: result.totalCount, pageInfo: { startCursor: edges.at(0)?.cursor ?? null, endCursor: edges.at(-1)?.cursor ?? null, hasNextPage: result.hasNextPage, hasPreviousPage: after !== null } };
  }
}
