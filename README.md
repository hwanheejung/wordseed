# Wordseed

A mobile-first TOEFL vocabulary PWA for capturing words from text or photos, reviewing complete cards, and testing recall with contextual fill-in-the-blank questions.

## Run locally

```bash
pnpm install
pnpm dev
```

The app includes demo cards and keeps manual capture, study, test, search, and backup features available without an API key.

## AI configuration

Set `OPENAI_API_KEY` in the Vercel project environment. The key is read only by the serverless handlers under `api/cards/` and is never shipped to the browser.

Optional environment setting:

```bash
OPENAI_MODEL=gpt-5.6-terra
```

Deploy the repository to Vercel so `/api/cards/extract` and `/api/cards/enrich` run as serverless functions. During plain Vite development, unavailable endpoints fall back to an editable manual card or demo photo candidates.

## Data and review schedule

- All vocabulary cards, provenance, schedules, and review events live in IndexedDB.
- Unknown answers reset a card and return in 5 minutes.
- Confusing answers retain the stage and return in 12 hours.
- Correct answers advance through 1, 2, 4, 7, 14, and 30 days.
- JSON export omits original photos while preserving extracted source text.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm seed:compat
```

The supplied SEED Design LLM reference is saved at `docs/seed-design-llm.md`. The project-local SEED skill is installed at `.agents/skills/seed-design/`.
