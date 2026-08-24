import { beforeEach, describe, expect, it } from "vitest";
import {
  getAllCards,
  persistMemoryAid,
  replaceCardRepositorySnapshot,
  saveCard,
} from "@/entities/card";
import {
  createLibraryBackup,
  restoreLibraryBackup,
} from "./library-backup";

beforeEach(async () => {
  await replaceCardRepositorySnapshot({
    cards: [],
    meanings: [],
    reviewEvents: [],
  });
});

describe("library backup", () => {
  it("restores an exported library snapshot", async () => {
    const result = await saveCard({
      term: "account",
      tags: ["finance"],
      meanings: [
        {
          expression: "account",
          definitionKo: "계좌",
          examples: [
            {
              en: "She opened a bank account.",
              ko: "그녀는 은행 계좌를 개설했다.",
              type: "sentence",
            },
          ],
          fillInBlankExamples: [
            {
              en: "She opened a bank account near her office.",
              ko: "그녀는 사무실 근처에서 은행 계좌를 개설했다.",
              answer: "bank account",
              type: "sentence",
            },
          ],
        },
      ],
    });
    await persistMemoryAid(
      result.saved!.meanings[0],
      "계좌를 열어 돈을 맡기는 장면을 떠올린다.",
    );
    const backup = await createLibraryBackup();
    await replaceCardRepositorySnapshot({
      cards: [],
      meanings: [],
      reviewEvents: [],
    });

    await restoreLibraryBackup(backup);

    expect(await getAllCards()).toMatchObject([
      {
        term: "account",
        tags: ["finance"],
        meanings: [
          {
            definitionKo: "계좌",
            memoryAid: "계좌를 열어 돈을 맡기는 장면을 떠올린다.",
          },
        ],
      },
    ]);
  });

  it("migrates legacy testExamples at the import boundary", async () => {
    await saveCard({
      term: "induce",
      meanings: [
        {
          expression: "induce",
          definitionKo: "유발하다",
          examples: [
            {
              en: "Stress can induce headaches.",
              type: "sentence",
            },
          ],
          fillInBlankExamples: [
            {
              en: "Cold weather can induce dormancy.",
              ko: "추운 날씨는 휴면을 유발할 수 있다.",
              answer: "induce",
              type: "sentence",
            },
          ],
        },
      ],
    });
    const legacy = JSON.parse(await createLibraryBackup()) as {
      meanings: Array<Record<string, unknown>>;
    };
    legacy.meanings = legacy.meanings.map(
      ({ fillInBlankExamples, ...meaning }) => ({
        ...meaning,
        testExamples: fillInBlankExamples,
      }),
    );

    await restoreLibraryBackup(JSON.stringify(legacy));

    expect((await getAllCards())[0].meanings[0].fillInBlankExamples).toHaveLength(
      1,
    );
  });

  it("rejects an unsupported backup payload", async () => {
    await expect(
      restoreLibraryBackup(JSON.stringify({ version: 99 })),
    ).rejects.toThrow("지원하지 않는 백업 파일이에요.");
  });
});
