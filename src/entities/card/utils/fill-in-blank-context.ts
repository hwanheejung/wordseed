import { hasExactPhrase } from "@/shared/utils/text-pattern";

export function isSpecificFillInBlankContext(text: string, answer: string) {
  if (!answer.trim() || !hasExactPhrase(text, answer)) return false;

  return !/(used? (?:the )?(?:term|word|expression)|meaning of|which (?:term|word|expression)|fits? (?:the|this|a) (?:new )?context|clarify the central idea)/i.test(
    text,
  );
}
