import { describe, expect, it } from "vitest";
import { parseOewnCliArguments } from "./oewn-cli-arguments";

describe("parseOewnCliArguments", () => {
  it("ignores the pnpm argument separator", () => {
    expect(parseOewnCliArguments(["--", "/tmp/oewn.xml.gz", "/tmp/output"])).toEqual({
      inputArgument: "/tmp/oewn.xml.gz",
      outputArgument: "/tmp/output",
    });
  });

  it("accepts arguments without a separator", () => {
    expect(parseOewnCliArguments(["/tmp/oewn.xml.gz"])).toEqual({
      inputArgument: "/tmp/oewn.xml.gz",
      outputArgument: undefined,
    });
  });

  it("rejects missing or excess positional arguments", () => {
    expect(() => parseOewnCliArguments(["--"])).toThrow("Usage:");
    expect(() =>
      parseOewnCliArguments(["input.xml.gz", "output", "unexpected"]),
    ).toThrow("Usage:");
  });
});
