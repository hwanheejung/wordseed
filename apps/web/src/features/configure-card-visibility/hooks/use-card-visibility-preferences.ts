import { useState } from "react";
import { z } from "zod";
import type { ConcealableCardField } from "@/entities/card";
import type { CardVisibilityPreferences } from "../types/card-visibility";

const STORAGE_KEY = "wordseed:card-visibility:v1";
const fieldSchema = z.enum([
  "expression",
  "partOfSpeech",
  "pronunciation",
  "definitionKo",
  "definitionEn",
  "synonyms",
  "antonyms",
  "exampleEn",
  "exampleKo",
]);
const preferencesSchema = z.object({ concealedFields: z.array(fieldSchema) });

function readPreferences(): CardVisibilityPreferences {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return { concealedFields: [] };
    const result = preferencesSchema.safeParse(JSON.parse(stored));

    return result.success ? result.data : { concealedFields: [] };
  } catch {
    return { concealedFields: [] };
  }
}

export function useCardVisibilityPreferences() {
  const [preferences, setPreferences] = useState(readPreferences);

  const savePreferences = (concealedFields: ConcealableCardField[]) => {
    const next = { concealedFields } satisfies CardVisibilityPreferences;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setPreferences(next);
  };

  return { preferences, savePreferences };
}
