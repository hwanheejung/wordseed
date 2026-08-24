# Wordseed

Wordseed is a pnpm workspace orchestrated by Turborepo. The existing mobile-first vocabulary PWA is isolated in `apps/web` without changing its runtime behavior.

## Workspace

```text
apps/
  api/        # New NestJS + Apollo GraphQL server for the mobile app
  web/        # Existing Vite web app and its Vercel functions under api/
```

## Run locally

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs the web app and its Vercel functions together at
`http://localhost:5173`. The functions read `apps/web/.env`.

The app includes demo cards and keeps study, test, search, and backup features
available without an API key. AI-assisted card creation requires
`OPENAI_API_KEY`.

Run a command for the web package directly when needed:

```bash
pnpm --filter @wordseed/web dev
pnpm --filter @wordseed/web build
```

The package-level web dev command starts only Vite. Use `pnpm dev` when testing
the `/api/cards/*` functions locally.

Run the new mobile application API separately:

```bash
pnpm dev:api
```

The GraphQL endpoint is available at `http://localhost:4000/graphql`. The
server validates its environment at startup; copy `apps/api/.env.example` to
`apps/api/.env` only when overriding the local defaults.

## API boundary

The existing web-only functions live under `apps/web/api/cards` and are exposed
as `/api/cards/*`. The new `apps/api` server is an independent backend for the
mobile application and does not replace these web request paths.

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
