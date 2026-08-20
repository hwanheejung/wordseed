// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  createMagicExpression,
  loadMagicExpressions,
  removeMagicExpression,
  updateMagicExpression,
} from "./local-magic-expression-repository";

beforeEach(() => {
  window.localStorage.clear();
});

describe("local magic expression repository", () => {
  it("seeds the six topic defaults when the collection has not been initialized", () => {
    const expressions = loadMagicExpressions();

    expect(expressions).toHaveLength(6);
    expect(expressions.map(({ title }) => title)).toEqual([
      "Fun",
      "Meet People",
      "Save Time",
      "Save Money",
      "Relieve Stress/Less Stressful",
      "Learn or Education/Past Experience",
    ]);
    expect(expressions[0]?.description).toContain("\n\n---\n\n");
    expect(expressions[0]?.description).toContain("**First of all, I can**");
  });

  it("merges paired legacy defaults without removing user expressions", () => {
    window.localStorage.setItem(
      "wordseed:toefl-magic-expressions",
      JSON.stringify({
        version: 1,
        items: [
          { id: "default-fun-1", title: "Fun 1", description: "First" },
          { id: "default-fun-2", title: "Fun 2", description: "Second" },
          { id: "custom", title: "Mine", description: "My expression" },
        ],
      }),
    );

    const expressions = loadMagicExpressions();

    expect(expressions.map(({ title }) => title)).toEqual(["Fun", "Mine"]);
  });

  it("persists added and edited Markdown expressions", () => {
    const created = createMagicExpression({
      title: "  Opening  ",
      description: "  **Personally**, I prefer this option.  ",
    });
    const createdExpression = created.at(-1);

    expect(createdExpression).toBeDefined();
    if (!createdExpression) return;

    const updated = updateMagicExpression(createdExpression.id, {
      title: "  Better opening  ",
      description: "  **In my view**, this works better.  ",
    });

    expect(updated.at(-1)).toMatchObject({
      title: "Better opening",
      description: "**In my view**, this works better.",
    });
    expect(loadMagicExpressions()).toEqual(updated);
  });

  it("does not reseed defaults after the user deletes every expression", () => {
    loadMagicExpressions().forEach(({ id }) => removeMagicExpression(id));

    expect(loadMagicExpressions()).toEqual([]);
  });
});
