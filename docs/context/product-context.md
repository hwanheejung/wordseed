# Product context

## Goal and audience

Make personal vocabulary collection convenient and encourage users to revisit saved expressions. These are the MVP success claims; improved recall, fluency, and long-term learning remain unproven.

Initial users are Korean-speaking intermediate English learners collecting expressions from study, work, and daily life. Short visits should be useful without card authoring, timed sessions, or quizzes.

## Governing decisions

- Every saved item references the shared Wordseed Dictionary. There is no private Dictionary or unvalidated fallback.
- Existing meanings can be saved without choosing a wordbook. Missing or delayed/failed AI-validated content becomes an addition request, not a completed save. Automatic saving after publication is proposed; fulfillment details remain open.
- AI may create Lexemes or add missing Senses, never edit existing content. Report submits errors for separate correction.
- Master declares mastery and excludes an item from normal review; Unmaster reverses it. It is not dismissal or loss of interest.
- Library and details show expression and meaning together. No required recall, Reveal, or confidence rating.
- Only explicitly opened card details contribute learning-view telemetry. Duration indicates viewing, not correctness; scheduling is deferred.
- Navigation is Home / Library / Search. Apple Music guides browsing: expressions resemble songs, wordbooks resemble albums. Do not infer playback behavior or single ownership from this analogy.
- Wordbooks are optional groupings; an item may belong to none or several.
- Chatbot Search moves to MVP 2; notification-driven delivery and interruption timing are deferred.

## Principles and ownership

Keep existing-content saves fast, distinguish requests from saves, and preserve Dictionary quality when generation fails. Public additions must not expose private request context.

The Dictionary owns shared lexical content. Users own collection membership, context, Master status, and viewing history. Detailed behavior belongs in [Product model](./product-model.md).

## Hypotheses

- Fast personal collection differentiates Wordseed.
- Users return to their saved expressions.
- Users accept pending requests for missing coverage.
- Detail-view history can improve future review policies.
- Short visits fit user behavior better than required study sessions.

Competitor reviews and agent agreement do not establish these claims.

## Latest decision rationale

The product review narrowed initial value to convenient saving and revisiting. It deferred chatbot and notification delivery, disallowed provisional private saves, restricted AI to additions, adopted Apple Music as a UI reference, and scoped telemetry to detail visits.
