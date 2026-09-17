import { afterEach, describe, expect, it, vi } from "vitest";
import type { RequestParameters } from "relay-runtime";
import { createRelayEnvironment } from "./relayEnvironment";

const request: RequestParameters = { id: null, cacheID: "test-query", name: "TestQuery", operationKind: "query", text: "query TestQuery { me { id } }", metadata: {} };
afterEach(() => vi.unstubAllGlobals());

describe("authenticated Relay transport", () => {
  it("reads the current access token for each request, including refresh", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { me: { id: "user" } } })));
    // A fresh response body is needed for every request.
    fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ data: { me: { id: "user" } } }))));
    vi.stubGlobal("fetch", fetchMock);
    const getAccessToken = vi.fn().mockResolvedValueOnce("initial-token").mockResolvedValueOnce("refreshed-token");
    const environment = createRelayEnvironment({ apiUrl: "https://api.example/graphql", getAccessToken });
    await environment.getNetwork().execute(request, {}, {}).toPromise();
    await environment.getNetwork().execute(request, {}, {}).toPromise();
    expect(fetchMock).toHaveBeenNthCalledWith(1, "https://api.example/graphql", expect.objectContaining({ headers: { "Content-Type": "application/json", Authorization: "Bearer initial-token" } }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "https://api.example/graphql", expect.objectContaining({ headers: { "Content-Type": "application/json", Authorization: "Bearer refreshed-token" } }));
  });

  it("keeps authenticated users in separate caches", () => {
    const first = createRelayEnvironment({ apiUrl: "https://api.example/graphql", getAccessToken: async () => "first" });
    const second = createRelayEnvironment({ apiUrl: "https://api.example/graphql", getAccessToken: async () => "second" });
    first.commitUpdate((store) => { store.create("SavedLearningItem:private", "SavedLearningItem").setValue("first-user-item", "id"); });
    expect(first.getStore().getSource().get("SavedLearningItem:private")).toBeDefined();
    expect(second.getStore().getSource().get("SavedLearningItem:private")).toBeUndefined();
  });

  it("does not send a request if session validation fails", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const environment = createRelayEnvironment({ apiUrl: "https://api.example/graphql", getAccessToken: () => Promise.reject(new Error("Session changed")) });
    await expect(environment.getNetwork().execute(request, {}, {}).toPromise()).rejects.toThrow("Session changed");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces transport failure without leaking authorization", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })));
    const environment = createRelayEnvironment({ apiUrl: "https://api.example/graphql", getAccessToken: async () => "private-token" });
    await expect(environment.getNetwork().execute(request, {}, {}).toPromise()).rejects.toThrow("GraphQL request failed with status 503.");
  });
});
