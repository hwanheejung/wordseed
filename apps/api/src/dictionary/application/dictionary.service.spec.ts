import { describe, expect, it } from "vitest";
import { DictionaryService, InvalidDictionaryQueryError } from "./dictionary.service";
import { DictionaryRepository } from "../domain/dictionary.repository";
class StubRepository extends DictionaryRepository {
  findById() { return Promise.resolve(null); }
  search() { return Promise.resolve({ lexemes: [], totalCount: 0 }); }
  findSenseRecommendations() { return Promise.resolve([]); }
}
describe("DictionaryService", () => {
  it("accepts the mobile dictionary page size", async () => {
    await expect(
      new DictionaryService(new StubRepository()).search({ first: 100 }),
    ).resolves.toMatchObject({ totalCount: 0 });
  });

  it("rejects dictionary pages above the maximum", async () => {
    await expect(
      new DictionaryService(new StubRepository()).search({ first: 101 }),
    ).rejects.toThrow(InvalidDictionaryQueryError);
  });

  it("rejects oversized recommendation pages", () => {
    expect(() => new DictionaryService(new StubRepository()).senseRecommendations("sense", 6)).toThrow(InvalidDictionaryQueryError);
  });
});
