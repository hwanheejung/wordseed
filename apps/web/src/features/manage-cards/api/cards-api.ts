import type { CardDraft, ExtractedCandidate } from "../types/card-draft";

async function postJson<T>(
  path: string,
  body: unknown,
  timeoutMs: number,
  failureMessage: string,
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const rawBody = await response.text();
    let payload: ({ error?: string } & T) | undefined;
    try {
      payload = JSON.parse(rawBody) as { error?: string } & T;
    } catch {
      const details = rawBody.trim().slice(0, 2_000) || "Empty non-JSON response";
      throw new Error(
        `${failureMessage}\n[${path}] HTTP ${response.status} ${response.statusText}: ${details}`,
      );
    }
    if (!response.ok) {
      const details = payload.error || rawBody.trim() || "Unknown API error";
      throw new Error(
        `${failureMessage}\n[${path}] HTTP ${response.status} ${response.statusText}: ${details}`,
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `처리 시간이 초과됐어요.\n[${path}] Client timeout after ${timeoutMs}ms`,
        { cause: error },
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function enrichText(text: string) {
  const result = await postJson<{ cards: CardDraft[] }>(
    "/api/cards/enrich",
    { text },
    210_000,
    "카드를 만들지 못했어요. 잠시 후 다시 시도해 주세요.",
  );
  if (!Array.isArray(result.cards))
    throw new Error("카드를 만들지 못했어요. 다시 시도해 주세요.");

  return result.cards;
}

export async function extractImage(imageDataUrl: string) {
  const result = await postJson<{ candidates: ExtractedCandidate[] }>(
    "/api/cards/extract",
    { imageDataUrl },
    210_000,
    "사진을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.",
  );
  if (!Array.isArray(result.candidates))
    throw new Error("사진에서 단어를 찾지 못했어요. 다시 시도해 주세요.");

  return result.candidates;
}
