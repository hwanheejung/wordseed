import {
  Environment,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
} from "relay-runtime";

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/graphql";

const fetchGraphQL: FetchFunction = async (request, variables) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: request.text,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}.`);
  }

  return response.json();
};

function getDataID(
  fieldValue: Record<string, unknown>,
  typeName: string,
): string | null {
  return typeof fieldValue.id === "string"
    ? `${typeName}:${fieldValue.id}`
    : null;
}

export const relayEnvironment = new Environment({
  getDataID,
  network: Network.create(fetchGraphQL),
  store: new Store(new RecordSource()),
});
