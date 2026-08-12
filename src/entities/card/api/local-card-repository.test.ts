import { beforeEach, describe, expect, it } from "vitest";
import {
  createSearchTokens,
  db,
  getAllCards,
  getReviewHistoryStats,
  normalizeTags,
  persistMemoryAid,
  persistReviewResult,
  saveCard,
} from "./local-card-repository";

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
    await saveCard({
      term: "account",
      tags: ["finance"],
      meanings: [
        {
          expression: "account",
          definitionKo: "계좌",
          partOfSpeech: "noun",
          acceptedVariants: ["account", "bank account"],
          examples: [
            {
              en: "I opened a savings account.",
              type: "sentence",
            },
          ],
          fillInBlankExamples: [
            {
              en: "Please use my bank account.",
              ko: "제 은행 계좌를 사용해 주세요.",
              answer: "bank account",
              type: "sentence",
            },
            {
              en: "She closed the account yesterday.",
              ko: "그녀는 어제 계좌를 해지했다.",
              answer: "account",
              type: "sentence",
            },
          ],
        },
      ],
    });

    expect(await db.cards.count()).toBe(1);
    expect(await db.meanings.count()).toBe(1);
    const [card] = await getAllCards();
    expect(card.meanings[0].status).toBe("unknown");

    const firstMeaning = await persistReviewResult(
      card.id,
      card.meanings[0],
      "unknown",
    );
    const secondMeaning = await persistReviewResult(
      card.id,
      firstMeaning,
      "confusing",
    );
    await persistReviewResult(card.id, secondMeaning, "correct");
    expect((await db.meanings.get(card.meanings[0].id))?.status).toBe(
      "correct",
    );
    const events = await db.reviewEvents.toArray();
    expect(events.map(({ fromStatus, toStatus }) => [fromStatus, toStatus])).toEqual([
      ["unknown", "unknown"],
      ["unknown", "confusing"],
      ["confusing", "correct"],
    ]);
    expect((await getReviewHistoryStats())[card.meanings[0].id]).toMatchObject({
      reviewCount: 3,
      difficultCount: 2,
    });
  });

  it("stores a memory aid on its meaning and preserves it when editing the card", async () => {
    const result = await saveCard({
      term: "coinage",
      meanings: [
        {
          expression: "coinage",
          definitionKo: "신조어를 만들어 냄",
          examples: [
            {
              en: "The expression is a recent coinage.",
              type: "sentence",
            },
          ],
        },
      ],
    });
    const saved = result.saved!;
    await persistMemoryAid(
      saved.meanings[0],
      "  동전을 찍듯 새로운 단어를 찍어낸다.  ",
    );

    await saveCard({
      id: saved.id,
      term: saved.term,
      meanings: [
        {
          id: saved.meanings[0].id,
          expression: "coinage",
          definitionKo: "새로운 말을 만들어 냄",
          examples: saved.meanings[0].examples,
        },
      ],
    });

    expect((await getAllCards())[0].meanings[0].memoryAid).toBe(
      "동전을 찍듯 새로운 단어를 찍어낸다.",
    );
  });
});
