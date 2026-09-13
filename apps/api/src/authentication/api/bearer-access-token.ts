export function readBearerAccessToken(
  authorizationHeader: string | undefined,
): string | null {
  if (!authorizationHeader) return null;

  const match = /^Bearer ([^\s]+)$/i.exec(authorizationHeader);

  return match?.[1] ?? null;
}
