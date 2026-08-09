# Dependencies and Testing

## Dependency policy

Before adding a dependency:

1. Inspect installed dependencies and their type definitions.
2. Verify that the platform, React, Relay, SEED Design, or an installed package does not already cover the need.
3. Add a package only for a concrete current requirement.
4. Use one library consistently for one category of operation.

Do not install or use `es-toolkit` in this project. Prefer native JavaScript:

```ts
cards.map(...)
cards.filter(...)
cards.find(...)
```

Use existing platform operations for grouping, deduplication, sorting, or cloning when they are clear and sufficient. Add neither a utility dependency nor a custom generic abstraction speculatively.

Use `ts-pattern` only under the closed-union criteria in `control-flow-and-errors.md`; it is not a general replacement for `if`, `switch`, or JSX branching.

## What to test

Prioritize behavior whose contract can break silently:

- Pure business utilities such as scoring, scheduling, normalization, and eligibility
- Reducer transitions and exhaustive state handling
- Runtime validation at API, storage, and import boundaries
- Mutation behavior and cache updates
- User-visible interaction paths
- Regression cases for previously observed failures

Avoid tests that merely restate implementation details.

## Test style

- Test public behavior and meaningful outputs.
- Use fake timers for time-dependent business rules.
- Prefer focused assertions over large snapshots.
- Keep fixtures small and domain-representative.
- Test partial and failure outcomes, not only success.
- Keep deterministic test data local to the relevant test or a clearly owned fixture module.
- Do not generate QA screenshots or documentation unless the user asks; interactive visual verification may still be performed without preserving artifacts.
