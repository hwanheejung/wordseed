import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { CardsResponseSchema, toClientCard } from "../_lib/cards.js";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") return response.status(405).json({ error: "POST 요청만 지원해요." });
  if (!process.env.OPENAI_API_KEY) return response.status(503).json({ error: "OPENAI_API_KEY가 설정되지 않았어요." });
  const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 10_000) return response.status(400).json({ error: "1–10,000자의 단어나 문장을 입력해 주세요." });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
      reasoning: { effort: "low" },
      input: [
        {
          role: "system",
          content: "Create concise TOEFL vocabulary cards. Preserve supplied meanings and examples verbatim and mark them source. Fill only missing useful fields and mark those ai. Put the meaning used in the supplied context first. Korean definitions must be natural and short. Return no commentary outside the schema.",
        },
        { role: "user", content: text },
      ],
      text: { format: zodTextFormat(CardsResponseSchema, "vocabulary_cards"), verbosity: "low" },
    });
    if (!result.output_parsed) throw new Error("구조화된 카드가 반환되지 않았어요.");
    return response.status(200).json({ cards: result.output_parsed.cards.map(toClientCard) });
  } catch (error) {
    console.error(error);
    return response.status(502).json({ error: "AI 카드 생성에 실패했어요. 잠시 후 다시 시도해 주세요." });
  }
}
