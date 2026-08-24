// @vitest-environment jsdom

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { db, saveCard } from "../api/local-card-repository";
import { useCardsQuery } from "./use-cards-query";

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

describe("useCardsQuery", () => {
  it("keeps every tag available when the visible cards are filtered", async () => {
    const first = await saveCard({
      term: "mitigate",
      tags: ["academic"],
      meanings: [
        {
          expression: "mitigate",
          definitionKo: "완화하다",
          examples: [],
        },
      ],
    });
    await saveCard({
      term: "resilient",
      tags: ["TOEFL"],
      meanings: [
        {
          expression: "resilient",
          definitionKo: "회복력이 있는",
          examples: [],
        },
      ],
    });

    const { result } = renderHook(() =>
      useCardsQuery({ ids: [first.saved!.id] }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cards.map((card) => card.term)).toEqual(["mitigate"]);
    expect(result.current.availableTags).toEqual(["academic", "TOEFL"]);
  });
});
