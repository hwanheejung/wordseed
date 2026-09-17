import {
  Environment,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
} from "relay-runtime";

interface RelayEnvironmentOptions {
  apiUrl: string;
  getAccessToken: () => Promise<string | null>;
}

// Each signed-in session owns a separate store; refreshed tokens are read per request.
export function createRelayEnvironment(
  { apiUrl, getAccessToken }: RelayEnvironmentOptions,
): Environment {
  const fetchGraphQL: FetchFunction = async (request, variables) => {
    const accessToken = await getAccessToken();
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ query: request.text, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}.`);
    }

    return response.json();
  };

  return new Environment({
    getDataID,
    network: Network.create(fetchGraphQL),
    store: new Store(new RecordSource()),
  });
}

function getDataID(
  fieldValue: Record<string, unknown>,
  typeName: string,
): string | null {
  return typeof fieldValue.id === "string"
    ? `${typeName}:${fieldValue.id}`
    : null;
}
