import { z } from "zod";

export interface MemoryAidRequest {
  term: string;
  meaning: {
    expression: string;
    definitionKo: string;
    definitionEn?: string;
    partOfSpeech?: string;
    synonyms: string[];
    antonyms: string[];
    examples: Array<{
      en: string;
      ko?: string;
    }>;
  };
}

const memoryAidResponseSchema = z.object({
  memoryAid: z.string().trim().min(1).max(16_000),
});
const errorResponseSchema = z.object({ error: z.string() });

export async function requestMemoryAid(
  input: MemoryAidRequest,
): Promise<string> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 90_000);

  try {
    const response = await fetch("/api/cards/memory-aid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    const rawBody = await response.text();
    const parsedBody = parseJson(rawBody);
    if (!response.ok) {
      const errorPayload = errorResponseSchema.safeParse(parsedBody);
      const message = errorPayload.success
        ? errorPayload.data.error
        : rawBody.trim().slice(0, 2_000) || "Unknown API error";

      throw new Error(`HTTP ${response.status} ${response.statusText}: ${message}`);
    }

    const result = memoryAidResponseSchema.safeParse(parsedBody);
    if (!result.success)
      throw new Error("외우는 팁을 만들지 못했어요. 다시 시도해 주세요.");

    return result.data.memoryAid;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError")
      throw new Error("외우는 팁을 만드는 데 시간이 걸리고 있어요. 다시 시도해 주세요.", {
        cause: error,
      });

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}
