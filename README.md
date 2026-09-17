# Wordseed

Wordseed is a vocabulary product for building a personal collection quickly and revisiting one expression at a time in short, user-controlled moments.

Product decisions and MVP scope live in [`docs/context`](./docs/context/README.md). Read that context before changing product behavior, learning policy, screens, notifications, or dictionary behavior.

## Workspace

```text
apps/
  api/       NestJS, Apollo GraphQL, Prisma, and PostgreSQL backend for mobile
  mobile/    Expo and React Native client using Relay
  web/       Existing Vite PWA and its independent Vercel functions
packages/
  graphql-schema/   Shared generated GraphQL schema
```

`apps/web` is the existing PWA. `apps/mobile` and `apps/api` form the new mobile product. The API does not replace the web app's `/api/cards/*` functions.

## Requirements

- Node.js 20 or later
- pnpm 10.28.1
- PostgreSQL for API database workflows

```bash
pnpm install
```

## Development

```bash
# Existing web app with its Vercel functions
pnpm dev

# Web UI only
pnpm dev:web:ui

# Mobile API
pnpm dev:api

# Expo mobile app
pnpm dev:mobile
```

The web app uses `apps/web/.env`. The API validates its environment at startup and can use `apps/api/.env` for local overrides.

## API and database

The mobile API exposes GraphQL at `http://localhost:4000/graphql`. Health and dictionary queries are public; user queries require a Supabase access token.

The PostgreSQL database is the serving source of truth for the dictionary. No Prisma migration history exists yet, so local schema changes currently use the development reset workflow:

```bash
pnpm db:push
pnpm db:seed
pnpm db:check
```

The current dictionary API uses `DictionaryLexeme`, `DictionarySense`, and `DictionarySynset` concepts. See [`docs/architecture/dictionary-target-model.md`](./docs/architecture/dictionary-target-model.md).

```graphql
query DictionaryLexemes {
  dictionaryLexemes(query: "grind", first: 10) {
    totalCount
    edges {
      cursor
      node {
        id
        canonicalLemma
        lexicalCategory {
          code
          displayName
        }
        senses {
          id
          glosses {
            languageTag
            text
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## OEWN source preparation

The OEWN importer prepares traceable staging data; it does not write serving dictionary records to the database.

```bash
pnpm --filter @wordseed/api dictionary:prepare:oewn -- /path/to/english-wordnet-2025.xml.gz
```

The pinned source metadata is in `apps/api/dictionary-import/oewn-2025.json`. Generated staging files are written under `apps/api/.cache/dictionary-import/` and are ignored by Git.

## Generated contracts

After changing GraphQL API types or mobile operations, update the shared schema and Relay artifacts:

```bash
pnpm schema:generate
pnpm --filter @wordseed/mobile relay
```

Do not hand-edit generated Relay or GraphQL files.

## Verification

```bash
pnpm verify
pnpm build
pnpm seed:compat
```

`pnpm verify` runs structure checks, type checking, linting, and tests across the workspace. Database commands and runtime smoke tests require their external services and are verified separately.

## Project guidance

- Engineering rules: [`AGENTS.md`](./AGENTS.md)
- Product context: [`docs/context/README.md`](./docs/context/README.md)
- Dictionary architecture: [`docs/architecture/dictionary-target-model.md`](./docs/architecture/dictionary-target-model.md)
- Web-specific SEED reference: [`apps/web/docs/seed-design-llm.md`](./apps/web/docs/seed-design-llm.md)
