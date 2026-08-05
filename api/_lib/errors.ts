interface ProviderError extends Error {
  status?: number;
  code?: string;
  type?: string;
  request_id?: string;
}

export function serializeApiError(error: unknown) {
  if (!(error instanceof Error)) {
    return { status: 502, message: typeof error === "string" ? error : JSON.stringify(error) };
  }

  const providerError = error as ProviderError;
  const status = Number.isInteger(providerError.status) && providerError.status! >= 400 && providerError.status! <= 599
    ? providerError.status!
    : 502;
  const metadata = [
    providerError.status ? `status=${providerError.status}` : undefined,
    providerError.code ? `code=${providerError.code}` : undefined,
    providerError.type ? `type=${providerError.type}` : undefined,
    providerError.request_id ? `request_id=${providerError.request_id}` : undefined,
  ].filter(Boolean);
  const name = providerError.name && providerError.name !== "Error" ? `${providerError.name}: ` : "";
  const suffix = metadata.length ? ` (${metadata.join(", ")})` : "";

  return { status, message: `${name}${providerError.message}${suffix}` };
}
