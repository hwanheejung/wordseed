import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { CandidatesResponseSchema, hasValidFillInBlankContexts, toClientCard } from "../_lib/cards.js";
import { serializeApiError } from "../_lib/errors.js";
import { EXTRACT_SYSTEM_PROMPT } from "../_lib/prompts.js";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") return response.status(405).json({ error: "POST 요청만 지원해요." });
  if (!process.env.OPENAI_API_KEY) return response.status(503).json({ error: "OPENAI_API_KEY가 설정되지 않았어요." });
  const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  const imageDataUrl = typeof body?.imageDataUrl === "string" ? body.imageDataUrl : "";
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(imageDataUrl) || imageDataUrl.length > 11_000_000) {
    return response.status(400).json({ error: "8MB 이하의 JPG, PNG 또는 WebP 이미지를 보내 주세요." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
      reasoning: { effort: "low" },
      input: [
        {
          role: "system",
          content: EXTRACT_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: "Extract vocabulary candidates and their visible study information from this image." },
            { type: "input_image", image_url: imageDataUrl, detail: "auto" },
          ],
        },
      ],
      text: { format: zodTextFormat(CandidatesResponseSchema, "vocabulary_candidates"), verbosity: "low" },
    });
    if (!result.output_parsed) throw new Error("구조화된 후보가 반환되지 않았어요.");
    if (!result.output_parsed.candidates.every(hasValidFillInBlankContexts)) throw new Error("일부 단어의 구체적인 빈칸 문맥이 생성되지 않았어요.");

    return response.status(200).json({
      candidates: result.output_parsed.candidates.map((candidate) => ({ ...toClientCard(candidate), confidence: candidate.confidence, selected: candidate.confidence >= 0.85 })),
    });
  } catch (error) {
    console.error(error);
    const failure = serializeApiError(error);

    return response.status(failure.status).json({ error: failure.message });
  }
}
