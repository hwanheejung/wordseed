import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { z } from "zod";
import { serializeApiError } from "../_lib/errors.js";
import { normalizeGeneratedMemoryAid } from "../_lib/memory-aid.js";
import { MEMORY_AID_SYSTEM_PROMPT } from "../_lib/prompts.js";

const MemoryAidRequestSchema = z.object({
  term: z.string().trim().min(1).max(200),
  meaning: z.object({
    expression: z.string().trim().min(1).max(200),
    definitionKo: z.string().trim().min(1).max(1_000),
    definitionEn: z.string().trim().max(1_000).optional(),
    partOfSpeech: z.string().trim().max(100).optional(),
    synonyms: z.array(z.string().trim().min(1).max(200)).max(20),
    antonyms: z.array(z.string().trim().min(1).max(200)).max(20),
    examples: z
      .array(
        z.object({
          en: z.string().trim().min(1).max(1_000),
          ko: z.string().trim().max(1_000).optional(),
        }),
      )
      .max(5),
  }),
});

class MemoryAidValidationError extends Error {
  status = 422;
}

function parseRequestBody(body: unknown): unknown {
  if (typeof body !== "string") return body;

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return undefined;
  }
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

  const parsed = MemoryAidRequestSchema.safeParse(
    parseRequestBody(request.body),
  );
  if (!parsed.success)
    return response.status(400).json({ error: "단어 뜻 정보를 확인해 주세요." });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
      reasoning: { effort: "low" },
      instructions: MEMORY_AID_SYSTEM_PROMPT,
      input: JSON.stringify(parsed.data),
      max_output_tokens: 700,
      text: { verbosity: "low" },
    });
    if (result.status !== "completed")
      throw new MemoryAidValidationError(
        "외우는 팁을 만들지 못했어요.",
      );

    const memoryAid = normalizeGeneratedMemoryAid(result.output_text);
    if (!memoryAid || memoryAid.length > 16_000)
      throw new MemoryAidValidationError(
        "외우는 팁을 만들지 못했어요.",
      );

    return response.status(200).json({ memoryAid });
  } catch (error) {
    console.error(error);
    const failure = serializeApiError(error);

    return response.status(failure.status).json({ error: failure.message });
  }
}
