import type { CardDraft, ExtractedCandidate } from "../domain/types";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new Error("AI endpoint is not configured.");
    }
    const payload = (await response.json()) as { error?: string } & T;
    if (!response.ok) throw new Error(payload.error || "AI 요청을 처리하지 못했어요.");
    return payload;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("AI 요청 시간이 초과되었어요.", { cause: error });
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function enrichText(text: string) {
  const result = await postJson<{ cards: CardDraft[] }>("/api/cards/enrich", { text });
  if (!Array.isArray(result.cards)) throw new Error("AI 카드 응답 형식이 올바르지 않아요.");
  return result.cards;
}

export async function extractImage(imageDataUrl: string) {
  const result = await postJson<{ candidates: ExtractedCandidate[] }>("/api/cards/extract", { imageDataUrl });
  if (!Array.isArray(result.candidates)) throw new Error("AI 추출 응답 형식이 올바르지 않아요.");
  return result.candidates;
}

export function manualDraft(text: string): CardDraft {
  const [firstLine, ...context] = text.trim().split(/\n+/);
  return {
    term: firstLine.trim(),
    acceptedVariants: [],
    meanings: [{ definitionKo: "", provenance: "user" }],
    synonyms: [],
    antonyms: [],
    examples: context.length
      ? [{ en: context.join(" "), type: "sentence", provenance: "source" }]
      : [],
    sourceText: context.join(" ") || undefined,
    sourceLabel: "직접 입력",
  };
}

export const demoPhotoCandidates: ExtractedCandidate[] = [
  {
    ...manualDraft("mitigate\nThe new policy could mitigate the harmful effects of air pollution."),
    meanings: [{ definitionKo: "완화하다, 경감하다", provenance: "source" }],
    synonyms: ["alleviate", "reduce"],
    selected: true,
    confidence: 0.96,
    sourceLabel: "사진에서 추출 · 데모",
  },
  {
    ...manualDraft("subsequent"),
    meanings: [{ definitionKo: "그다음의, 이후의", provenance: "source" }],
    selected: true,
    confidence: 0.91,
    sourceLabel: "사진에서 추출 · 데모",
  },
  {
    ...manualDraft("ambiguous"),
    meanings: [{ definitionKo: "모호한, 여러 의미로 해석되는", provenance: "ai" }],
    selected: false,
    confidence: 0.82,
    sourceLabel: "사진에서 추출 · 데모",
  },
];
