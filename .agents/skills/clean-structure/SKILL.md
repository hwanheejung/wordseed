---
name: clean-structure
description: Apply this project's pragmatic Feature-Sliced Design architecture and Relay-ready ownership rules. Use when adding, moving, splitting, or reviewing frontend modules; deciding whether code belongs in routes, widgets, features, entities, shared, or app; defining slice public APIs; checking import boundaries; or designing route queries, entity fragments, mutations, and page-owned flows.
---

# Clean Structure

Use a pragmatic FSD architecture that makes ownership and dependency direction obvious to both humans and coding agents. This skill governs **where code belongs**. Use `clean-code` for **how code is written**.

## Required workflow

1. Name the product concept or user action that owns the change.
2. Select the lowest valid layer without inventing future reuse.
3. Keep the implementation inside one slice unless a real boundary requires another slice.
4. Expose the slice through its root public API and import only that API from other layers.
5. Verify downward imports, same-layer isolation, data ownership, and route composition.
6. Run the project's structure check when one exists.

## Layer map

```text
src/
  app/       # Global providers, configuration, bootstrapping
  routes/    # Route entry points; composition root outside FSD layers
  widgets/   # Reused, composed UI blocks with identical UI and behavior
  features/  # User-visible business actions
  entities/  # Domain models and fragment-driven representations
  shared/    # Domain-agnostic foundations
```

Enforce `routes -> widgets -> features -> entities -> shared`. Treat `app` as setup and dependency-injection infrastructure, not as a business-logic layer.

## Reference routing

- Read [layers-and-placement.md](references/layers-and-placement.md) when deciding ownership, extracting a slice, or reviewing an FSD tree.
- Read [public-apis-and-imports.md](references/public-apis-and-imports.md) when creating `index.ts`, importing across layers, or checking slice isolation.
- Read [relay-data-ownership.md](references/relay-data-ownership.md) for queries, fragments, mutations, entity UI, generated types, or backend migration work.
- Read [routes-and-flows.md](references/routes-and-flows.md) for page state, multi-step flows, navigation, widgets, or shared page chrome.
- Read [segments-and-naming.md](references/segments-and-naming.md) when creating or moving files inside a slice.

Load only the references relevant to the current task. Read all five for a repository-wide architecture refactor.

## Non-negotiable checks

- Import only downward across layers.
- Never cross-import feature slices. Request user confirmation if a design appears to require it.
- Avoid same-layer slice imports. The only accepted entity-to-entity exception is a GraphQL fragment spread that expresses a schema relationship.
- Expose cross-layer imports through the owning slice's root `index.ts`.
- Keep route queries at the route entry point and entity fragments in the consuming entity component.
- Keep navigation, persistence, fetching, and user actions out of entity UI.
- Create a widget only after identical UI and behavior are used by at least two routes.
- Keep one-route composition and state in the route until a lower-layer responsibility is independently justified.
- Never place feature workflows in `app/`.
- Never create vague `model/` or `lib/` segments inside slices.
