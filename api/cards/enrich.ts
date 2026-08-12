import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  CardsResponseSchema,
  toClientCard,
  type GeneratedCard,
} from "../_lib/cards.js";
import {
  createEnrichmentBatches,
  hasSuppliedKoreanText,
  type EnrichmentBatch,
} from "../_lib/enrich-input.js";
import { serializeApiError } from "../_lib/errors.js";
import { ENRICH_SYSTEM_PROMPT } from "../_lib/prompts.js";

const MAX_ENRICH_ENTRIES = 80;
const MAX_CONCURRENT_BATCHES = 3;

class CardGenerationValidationError extends Error {
  status = 422;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== "POST")
    return response.status(405).json({ error: "POST 요청만 지원해요." });
  if (!process.env.OPENAI_API_KEY)
    return response
      .status(503)
      .json({ error: "OPENAI_API_KEY가 설정되지 않았어요." });

  const body =
    typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 10_000)
    return response
      .status(400)
      .json({ error: "1–10,000자의 단어나 문장을 입력해 주세요." });

  const batches = createEnrichmentBatches(text);
  const entryCount = batches.reduce(
    (count, batch) => count + batch.entries.length,
    0,
  );
  if (entryCount > MAX_ENRICH_ENTRIES)
    return response.status(400).json({
      error: `한 번에 최대 ${MAX_ENRICH_ENTRIES}개까지 만들 수 있어요. 입력을 나눠 주세요.`,
    });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const cards = await generateBatches(client, batches);

    return response.status(200).json({ cards: cards.map(toClientCard) });
  } catch (error) {
    console.error(error);
    const failure = serializeApiError(error);

    return response.status(failure.status).json({ error: failure.message });
  }
}

async function generateBatches(
  client: OpenAI,
  batches: EnrichmentBatch[],
): Promise<GeneratedCard[]> {
  const results: GeneratedCard[][] = new Array(batches.length);
  let nextBatchIndex = 0;

  const worker = async () => {
    while (nextBatchIndex < batches.length) {
      const batchIndex = nextBatchIndex;
      nextBatchIndex += 1;

      results[batchIndex] = await generateBatch(client, batches[batchIndex]);
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(MAX_CONCURRENT_BATCHES, batches.length) },
      worker,
    ),
  );

  return results.flat();
}

async function generateBatch(
  client: OpenAI,
  batch: EnrichmentBatch,
): Promise<GeneratedCard[]> {
  const includesSuppliedKoreanText = batch.entries.some(hasSuppliedKoreanText);
  const cards = await requestCards(
    client,
    batch.text,
    includesSuppliedKoreanText,
  );

  if (cards.length !== batch.entries.length) {
    return generateEntriesIndividually(client, batch.entries);
  }

  return cards;
}

async function generateEntriesIndividually(
  client: OpenAI,
  entries: string[],
): Promise<GeneratedCard[]> {
  return Promise.all(
    entries.map(async (entry) => {
      const cards = await requestCards(
        client,
        entry,
        hasSuppliedKoreanText(entry),
      );
      const card = cards[0];

      if (cards.length !== 1 || !card) {
        throw new CardGenerationValidationError(
          `‘${entry.slice(0, 80)}’의 카드를 분리하지 못했어요. 입력을 확인한 뒤 다시 시도해 주세요.`,
        );
      }

      return card;
    }),
  );
}

async function requestCards(
  client: OpenAI,
  text: string,
  includesSuppliedKoreanText: boolean,
): Promise<GeneratedCard[]> {
  const result = await client.responses.parse({
    model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
    reasoning: { effort: includesSuppliedKoreanText ? "medium" : "low" },
    input: [
      {
        role: "system",
        content: ENRICH_SYSTEM_PROMPT,
      },
      { role: "user", content: text },
    ],
    text: {
      format: zodTextFormat(CardsResponseSchema, "vocabulary_cards"),
      verbosity: "low",
    },
  });
  if (!result.output_parsed)
    throw new CardGenerationValidationError(
      "구조화된 카드가 반환되지 않았어요.",
    );

  return result.output_parsed.cards;
}
