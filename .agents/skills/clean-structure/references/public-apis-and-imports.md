# Public APIs and Imports

## Dependency direction

Enforce this direction:

```text
routes -> widgets -> features -> entities -> shared
```

Lower layers never import higher layers.

## Slice public APIs

Every externally consumed slice may expose a root `index.ts`. Other layers must import only from that public API.

```ts
// Correct: external import through the entity public API
import { VocabularyCard } from "@/entities/card";

// Incorrect: reaches into entity internals
import { VocabularyCard } from "@/entities/card/ui/vocabulary-card";
```

Use direct file imports only within the same slice.

```ts
// Inside entities/card
import type { Card } from "../types/card";
```

Keep a public API deliberate:

- Export only contracts intended for other layers.
- Do not export internal helpers preemptively.
- Do not use wildcard exports.
- Keep exports explicit so an agent can identify the supported surface.
- Remove stale exports when implementations move.

```ts
export { VocabularyCard } from "./ui/vocabulary-card";
export type { Card, CardMeaning } from "./types/card";
```

## Same-layer isolation

- Do not import one feature slice from another feature slice.
- Do not import one widget slice from another widget slice.
- Avoid entity-to-entity imports.
- Permit an entity GraphQL fragment to spread another entity fragment when the GraphQL schema relationship requires it. Do not use this exception for ordinary TypeScript helpers or UI composition.

Move orchestration upward rather than creating lateral dependencies. A route may compose two features and pass each the callbacks or entity contracts it needs.

## Type origins

The module that owns a concept owns its type.

- Do not import common types from mutation artifacts.
- Do not define shared domain types in a route.
- Do not re-export generated GraphQL response types as domain contracts.
- Do not move a type to `shared/` merely because multiple domain modules use it; first identify the actual domain owner.
