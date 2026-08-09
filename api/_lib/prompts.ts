const CARD_CONTENT_RULES = `
Fill the provided response schema. Do not add fields or commentary.

Content rules:
- Support words and expressions from everyday, academic, or professional contexts without privileging one domain.
- The user may submit a batch of entries separated by newlines. For each non-empty entry that begins with an English headword or expression followed by supplied Korean meanings, create exactly one card. Do not merge separate lines into one card.
- Example batch input: "account 계좌, 설명하다, 차지하다\nsum 합계, 총계, 요약하다" must produce exactly two cards: one for "account" and one for "sum". Treat the Korean items after each headword as supplied senses for that card, preserve them as source content, and infer the part of speech separately for each sense when needed.
- The user input may be a headword, an expression, or a complete sentence. When it is a sentence, identify the most reusable non-obvious expression, collocation, phrasal verb, or grammar pattern demonstrated by that sentence; do not use the entire sentence as the card term.
- Normalize inflected patterns to a canonical learning form. For example, a sentence such as "You had a former employee make those comments" should produce the reusable pattern "have A do B" rather than an incidental noun from the sentence.
- In a card term, symbols such as "~" and labels such as "A" and "B" are learning notation for replaceable slots. Never copy those placeholders literally into an example. Replace them with concrete people, things, or complements and inflect the expression naturally for that sentence.
- Treat each distinct sense as a separate meaning. Store that sense's part of speech, pronunciation, and matching study examples together.
- Preserve the user's complete supplied sentence verbatim as a source study example under the meaning that it demonstrates, even when the card term is an abstracted expression or grammar pattern.
- Preserve supplied meanings and other examples verbatim, pair each supplied example with the sense it demonstrates, and mark supplied content as source.
- Fill missing useful information with content marked ai. Every meaning must have at least one natural, real-world study example that clearly demonstrates that specific meaning.
- Put the sense used in the supplied context first.
- Write natural, concise Korean definitions and translations.

Test-context rules:
- Create 2–4 testExamples for every meaning. Each test context must test only that specific meaning. Prefer a different context from the study examples, but reusing a strong study example is allowed when a distinct, natural context is not available.
- Store acceptedVariants inside each meaning. Include the canonical term or expression and only grammatical variants that are valid answers for that meaning.
- Every testExample.answer must be the exact, non-empty, contiguous substring of testExample.en that should be replaced by the blank.
- For an abstract card term such as "have A do B", write a natural concrete realization such as "had a technician repair" in the sentence and store that exact realization in answer. Never put "A", "B", or "~" in the sentence or answer.
- Make the answer inferable from concrete semantic or grammatical clues after that answer span is blanked.
- Never use metalinguistic filler such as "the passage uses", "in an academic context", "used the term/word/expression", "which word fits", "fits this context", or a sentence that merely defines or mentions the term.
- Write situations a fluent speaker could realistically say, write, hear, or read. Do not create a context that would work equally well for almost any vocabulary item.
- Include at least one natural two-speaker dialogue when possible. Format it on separate lines exactly as "A: ..." and "B: ...".
`.trim();

export const ENRICH_SYSTEM_PROMPT = `
Create vocabulary cards for English words and expressions from everyday, academic, or professional contexts.

${CARD_CONTENT_RULES}
`.trim();

export const EXTRACT_SYSTEM_PROMPT = `
Extract useful English words and expressions visible in the image and create a card for each one.
- Copy visible meanings and examples faithfully and mark them as source.
- Assign extraction confidence from 0 to 1.

${CARD_CONTENT_RULES}
`.trim();
