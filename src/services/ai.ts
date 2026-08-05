import type { CardDraft, ExtractedCandidate } from "../domain/types";

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
  const result = await postJson<{ cards: CardDraft[] }>("/api/cards/enrich", { text }, 120_000);
  if (!Array.isArray(result.cards)) throw new Error("AI 카드 응답 형식이 올바르지 않아요.");
  return result.cards;
}

export async function extractImage(imageDataUrl: string) {
  const result = await postJson<{ candidates: ExtractedCandidate[] }>("/api/cards/extract", { imageDataUrl }, 210_000);
  if (!Array.isArray(result.candidates)) throw new Error("AI 추출 응답 형식이 올바르지 않아요.");
  return result.candidates;
}

export function manualDraft(text: string): CardDraft {
  const [firstLine, ...context] = text.trim().split(/\n+/);
  const koreanStart = firstLine.search(/[가-힣]/);
  const term = (koreanStart >= 0 ? firstLine.slice(0, koreanStart) : firstLine).trim();
  const suppliedMeanings = koreanStart >= 0
    ? firstLine.slice(koreanStart).trim().split(/[,;/·]+|\s+(?=[가-힣]+(?:하다|되다|이다)\b)/).filter(Boolean)
    : [];
  const sourceExample = context.join(" ").trim();
  const meanings = (suppliedMeanings.length ? suppliedMeanings : [""]).map((definitionKo, index) => ({
    definitionKo,
    provenance: definitionKo ? "source" as const : "user" as const,
    examples: [{
      en: index === 0 && sourceExample
        ? sourceExample
        : "",
      type: "sentence" as const,
      provenance: index === 0 && sourceExample ? "source" as const : "user" as const,
    }],
  }));
  return {
    term,
    acceptedVariants: [],
    meanings,
    synonyms: [],
    antonyms: [],
    testExamples: [
      { en: "", type: "sentence", provenance: "user" },
      { en: "", type: "dialogue", provenance: "user" },
    ],
    sourceText: sourceExample || undefined,
    sourceLabel: "직접 입력",
  };
}

export const demoPhotoCandidates: ExtractedCandidate[] = [
  {
    ...manualDraft("mitigate\nThe new policy could mitigate the harmful effects of air pollution."),
    meanings: [{
      definitionKo: "완화하다, 경감하다",
      provenance: "source",
      examples: [{ en: "The new policy could mitigate the harmful effects of air pollution.", type: "sentence", provenance: "source" }],
    }],
    synonyms: ["alleviate", "reduce"],
    selected: true,
    confidence: 0.96,
    sourceLabel: "사진에서 추출 · 데모",
  },
  {
    ...manualDraft("subsequent"),
    meanings: [{
      definitionKo: "그다음의, 이후의",
      provenance: "source",
      examples: [{ en: "Subsequent experiments confirmed the initial finding.", type: "sentence", provenance: "ai" }],
    }],
    selected: true,
    confidence: 0.91,
    sourceLabel: "사진에서 추출 · 데모",
  },
  {
    ...manualDraft("ambiguous"),
    meanings: [{
      definitionKo: "모호한, 여러 의미로 해석되는",
      provenance: "ai",
      examples: [{ en: "The instructions were ambiguous, so the students interpreted them differently.", type: "sentence", provenance: "ai" }],
    }],
    selected: false,
    confidence: 0.82,
    sourceLabel: "사진에서 추출 · 데모",
  },
];
