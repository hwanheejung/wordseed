# Wordseed

Wordseed is a pnpm workspace orchestrated by Turborepo. The existing mobile-first vocabulary PWA is isolated in `apps/web` without changing its runtime behavior.

## Workspace

```text
apps/
  web/        # Existing Vite web application
api/          # Legacy API prototype, excluded from the web workspace
```

## Run locally

```bash
pnpm install
pnpm dev
```

The app includes demo cards and keeps manual capture, study, test, search, and backup features available without an API key.

Run a command for the web package directly when needed:

```bash
pnpm --filter @wordseed/web dev
pnpm --filter @wordseed/web build
```

## API boundary

The legacy `api/cards` prototype remains at the repository root for reference, but it is not part of the web workspace, web verification, or Vercel web deployment. The existing frontend request paths remain unchanged until the replacement API is connected.

## Vercel

Configure the existing Vercel project with `apps/web` as its Root Directory. The app-level `vercel.json` skips a deployment when that directory has no changes.

## Data and review schedule

- All vocabulary cards, provenance, schedules, and review events live in IndexedDB.
- Study sessions start in Unknown, Confusing, Known order, then rotate every reviewed card to the back indefinitely.
- Test sessions rotate indefinitely through cards with valid hidden contexts.
- Card status and review-event timestamps remain stored for learning history; no time-based scheduling is applied.
- JSON export omits original photos while preserving extracted source text.

## Verification

```bash
pnpm verify
pnpm build
pnpm seed:compat
```

`pnpm verify` runs the structure check, type checking, lint, and test suite in
the same order locally and in automation.

The supplied SEED Design LLM reference is saved at `docs/seed-design-llm.md`. The project-local SEED skill is installed at `.agents/skills/seed-design/`.
