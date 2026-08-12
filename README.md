# Wordseed

A mobile-first vocabulary PWA for capturing English words and expressions from text or photos, reviewing complete cards, and testing recall in new contexts.

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

Deploy the repository to Vercel so `/api/cards/extract`, `/api/cards/enrich`, and `/api/cards/memory-aid` run as serverless functions. During plain Vite development, text input falls back to an editable manual card; photo extraction and memory-aid generation report that AI configuration is required.

## Data and review schedule

- All vocabulary cards, provenance, schedules, and review events live in IndexedDB.
- Study sessions start in Unknown, Confusing, Known order, then rotate every reviewed card to the back indefinitely.
- Test sessions rotate indefinitely through cards with valid hidden contexts.
- Card status and review-event timestamps remain stored for learning history; no time-based scheduling is applied.
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
