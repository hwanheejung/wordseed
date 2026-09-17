import { beforeEach, describe, expect, it, vi } from "vitest";
import { commitMutation } from "react-relay";
import { Environment, Network, RecordSource, Store } from "relay-runtime";
import { completeSignIn } from "./complete-sign-in";

vi.mock("react-relay", () => ({ commitMutation: vi.fn(), graphql: vi.fn() }));
const environment = new Environment({ network: Network.create(() => { throw new Error("Network must not be called in this test."); }), store: new Store(new RecordSource()) });

beforeEach(() => vi.clearAllMocks());

describe("completeSignIn", () => {
  it("resolves the initialized application user ID", async () => {
    vi.mocked(commitMutation).mockImplementationOnce((_environment, config) => {
      config.onCompleted?.({ completeSignIn: { id: "internal-user-id" } }, null);
      return { dispose() {} };
    });
    await expect(completeSignIn(environment)).resolves.toBe("internal-user-id");
  });

  it("rejects GraphQL failures even if partial user data is returned", async () => {
    vi.mocked(commitMutation).mockImplementationOnce((_environment, config) => {
      config.onCompleted?.({ completeSignIn: { id: "partial-id" } }, [{ message: "Not authenticated", severity: "ERROR" }]);
      return { dispose() {} };
    });
    await expect(completeSignIn(environment)).rejects.toThrow("initialize");
  });

  it("rejects a missing user payload", async () => {
    vi.mocked(commitMutation).mockImplementationOnce((_environment, config) => {
      config.onCompleted?.({ completeSignIn: null }, null);
      return { dispose() {} };
    });
    await expect(completeSignIn(environment)).rejects.toThrow("initialize");
  });

  it("propagates a transport failure", async () => {
    const failure = new Error("offline");
    vi.mocked(commitMutation).mockImplementationOnce((_environment, config) => {
      config.onError?.(failure);
      return { dispose() {} };
    });
    await expect(completeSignIn(environment)).rejects.toBe(failure);
  });
});
