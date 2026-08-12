import type { CardDraft, ExtractedCandidate } from "../types/card-draft";

async function postJson<T>(path: string, body: unknown, timeoutMs: number): Promise<T> {
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
      const rawMessage = rawBody.trim().slice(0, 2_000) || "Empty non-JSON response";
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${rawMessage}`);
    }
    if (!response.ok) {
      const rawMessage = payload.error || rawBody.trim() || "Unknown API error";
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${rawMessage}`);
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`AbortError: ${path} exceeded the ${timeoutMs}ms client timeout`, { cause: error });
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
  );
  if (!Array.isArray(result.cards)) throw new Error("AI 카드 응답 형식이 올바르지 않아요.");

  return result.cards;
}

export async function extractImage(imageDataUrl: string) {
  const result = await postJson<{ candidates: ExtractedCandidate[] }>("/api/cards/extract", { imageDataUrl }, 210_000);
  if (!Array.isArray(result.candidates)) throw new Error("AI 추출 응답 형식이 올바르지 않아요.");

  return result.candidates;
}
