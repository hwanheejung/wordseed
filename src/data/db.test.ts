import { beforeEach, describe, expect, it } from "vitest";
import {
  createSearchTokens,
  db,
  getAllCards,
  normalizeTags,
  recordReview,
  saveDraft,
} from "./db";

beforeEach(async () => {
  await db.transaction(
    "rw",
    db.cards,
    db.meanings,
    db.reviewEvents,
    async () => {
      await db.cards.clear();
      await db.meanings.clear();
      await db.reviewEvents.clear();
    },
  );
});

describe("current database model", () => {
  it("normalizes tags and Korean search tokens", () => {
    expect(normalizeTags([" TOEFL ", "#TOEFL", "", 42])).toEqual([
      "TOEFL",
    ]);
    expect(createSearchTokens("차지하다, 구성하다", "represent a part")).toEqual([
      "차지하다",
      "구성하다",
      "represent",
      "a",
      "part",
    ]);
  });

  it("stores meanings separately and records meaning-level reviews", async () => {
    await saveDraft({
      term: "account",
      tags: ["finance"],
      meanings: [
        {
          definitionKo: "계좌",
          partOfSpeech: "noun",
          acceptedVariants: ["account", "bank account"],
          examples: [
            {
              en: "I opened a savings account.",
              type: "sentence",
              provenance: "user",
            },
          ],
          testExamples: [
            {
              en: "Please use my bank account.",
              answer: "bank account",
              type: "sentence",
              provenance: "user",
            },
            {
              en: "She closed the account yesterday.",
              answer: "account",
              type: "sentence",
              provenance: "user",
            },
          ],
          provenance: "user",
        },
      ],
    });

    expect(await db.cards.count()).toBe(1);
    expect(await db.meanings.count()).toBe(1);
    const [card] = await getAllCards();
    expect(card.meanings[0].status).toBe("unknown");

    await recordReview(
      { card, meaning: card.meanings[0] },
      "study",
      "correct",
    );
    expect((await db.meanings.get(card.meanings[0].id))?.status).toBe(
      "correct",
    );
    expect((await db.reviewEvents.toArray())[0].meaningId).toBe(
      card.meanings[0].id,
    );
  });
});
