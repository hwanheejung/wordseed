const CARD_RULES = `
Return only data that matches the provided response schema.

Card rules:
- Support useful English words and expressions from everyday, academic, and professional contexts.
- Keep each distinct sense as a separate meaning with its own expression, definition, part of speech, pronunciation, relations, and examples.
- Use meaning.expression for the exact learnable word, phrase, collocation, phrasal verb, or grammar pattern. Use an empty array when a meaning has no clear synonyms or antonyms.
- Mark supplied or visible content as source. Mark inferred or newly written content as ai.
- Give every meaning at least one concise, natural study example and a natural Korean definition and translation.
- Treat notation such as "~", "A", and "B" as replaceable slots. In examples, replace the slots with concrete words and inflect the expression naturally.
`.trim();

const TEXT_INPUT_RULES = `
Text input rules:
- For newline-separated entries, create exactly one card per non-empty line. Do not merge lines.
- Preserve supplied meanings and examples verbatim and assign them to the sense they demonstrate.
- If the input is a complete sentence, preserve it verbatim as a source study example and make the card term the most reusable non-obvious expression or grammar pattern it demonstrates.
- Normalize inflected grammar patterns to a canonical learning form, such as "have A do B" from "had a former employee make".
- Put the sense demonstrated by the supplied context first.
`.trim();

const FILL_IN_THE_BLANK_RULES = `
Fill-in-the-blank rules:
- Create exactly 2 fillInBlankExamples for every meaning. Each example must test only that meaning in a realistic situation.
- Include a natural Korean translation in ko.
- Store the canonical expression and only valid grammatical answer variants in acceptedVariants.
- Finalize en first. Then copy the exact, non-empty, contiguous answer span from en into answer.
- For an abstract pattern such as "have A do B", use a concrete realization such as "had a technician repair" in both en and answer. Never put "A", "B", or "~" in them.
- After answer is blanked, the remaining context must contain enough semantic or grammatical clues to infer it.
- Never discuss or name the target word itself. Avoid metalinguistic frames such as "the passage uses", "meaning of", "which word", or "fits this context".

Before returning, check every meaning:
- It has exactly 2 fillInBlankExamples.
- Every answer was copied verbatim from its final en.
- Every blank leaves specific clues for the intended meaning.
- Every ko naturally translates its en.
- No example discusses the target word or expression itself.

Correct any failed check before returning.
`.trim();

export const ENRICH_SYSTEM_PROMPT = `
Create vocabulary cards from the user's English words, expressions, or sentences.

${TEXT_INPUT_RULES}

${CARD_RULES}

${FILL_IN_THE_BLANK_RULES}
`.trim();

export const EXTRACT_SYSTEM_PROMPT = `
Extract vocabulary cards from the image.

Image input rules:
- Create one card for each clearly visible, learnable English headword or expression. Do not turn definitions or example sentences into additional cards.
- Copy visible meanings, relations, and examples faithfully. Never mark inferred content as source.
- Assign extraction confidence from 0 to 1.

${CARD_RULES}

${FILL_IN_THE_BLANK_RULES}
`.trim();
