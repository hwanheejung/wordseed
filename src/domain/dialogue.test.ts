import { describe, expect, it } from "vitest";
import { parseDialogue } from "./dialogue";

describe("dialogue parsing", () => {
  it("turns two-speaker text into ordered chat turns", () => {
    expect(parseDialogue("A: What caused the change?\nB: The policy may _____ companies to act.")).toEqual([
      { speaker: "A", message: "What caused the change?" },
      { speaker: "B", message: "The policy may _____ companies to act." },
    ]);
  });
});
