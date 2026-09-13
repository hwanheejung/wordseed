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

### Mobile authentication

The mobile API accepts Supabase Auth access tokens for Apple and Google users.
Configure `SUPABASE_URL` for the Supabase project and keep
`SUPABASE_JWT_AUDIENCE=authenticated`. The Supabase project must use an
asymmetric JWT signing key so the API can verify tokens through its JWKS
endpoint.

After native Apple or Google authentication creates a Supabase session, send
the access token with each protected GraphQL request:

```http
Authorization: Bearer <supabase-access-token>
```

Call `completeSignIn` once after authentication to idempotently create the
Wordseed user. `me` returns the initialized user. Health and dictionary queries
remain public.

### Local API database

The API uses PostgreSQL through Prisma. The current development schema contains
users and dictionary entries; no Prisma migration files are created yet.

After creating the local `wordseed_dev` database, apply the current development
schema and insert one word plus one expression:

```bash
pnpm db:push
pnpm db:seed
pnpm db:check
```

`db:push` synchronizes the local development database without creating a
migration. `db:check` verifies the Prisma connection and prints the current
dictionary entry count.

Start the API and open GraphiQL at `http://localhost:4000/graphql`:

```graphql
query DictionaryEntries {
  dictionaryEntries(query: "grind", first: 10) {
    totalCount
    edges {
      cursor
      node {
        id
        headword
        kind
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### OEWN source preparation

The first dictionary importer reads the pinned Open English WordNet 2025 XML
release and prepares traceable source material for the current target expressions.
Download the source file from the URL recorded in
`apps/api/dictionary-import/oewn-2025.json`, then run:

```bash
pnpm --filter @wordseed/api dictionary:prepare:oewn -- /path/to/english-wordnet-2025.xml.gz
```

The importer verifies the source checksum, version, language, and license before
writing `candidates.jsonl`, `import-report.json`, and sharded source YAML under
`apps/api/.cache/dictionary-import/oewn-2025`. Generated files are ignored by
Git:

```text
staging/
  attribution.yaml
  entries/en/a.yaml ... z.yaml, other.yaml
  synsets/en/<part-of-speech>/<source-id-hash-prefix-00..ff>.yaml
```

Entry shards use the normalized headword's first ASCII letter and fall back to
`other`. Synset shards use the lowercase part of speech plus the first two hex
characters of a SHA-256 hash of the OEWN synset ID. Staging entries and synsets
retain OEWN source IDs and release attribution so a later promotion step can be
reviewed and traced.

Staging YAML is regenerable source material. The API never serves it, and it is
not the Wordseed dictionary source of truth. The PostgreSQL database is the only
serving source. Promoting selected staging records into Wordseed-owned IDs and
content will be a separate, controlled bootstrap step; this command does not
write to the database. The current `db:seed` command continues to load the
handcrafted Wordseed DB dataset.

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
