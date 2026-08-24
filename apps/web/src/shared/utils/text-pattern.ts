export function phraseExpression(phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return new RegExp(`\\b${escaped}\\b`, "gi");
}

export function hasExactPhrase(text: string, phrase: string) {
  return phraseExpression(phrase).test(text);
}
