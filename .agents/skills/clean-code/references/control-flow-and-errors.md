# Control Flow and Errors

## Business conditions

- Move date calculations, scoring, eligibility, normalization, and domain decisions into named pure functions.
- Replace raw conditions such as `regionId === 1` with a meaningful domain predicate.
- Keep complex exception handling and branching in the lowest layer that has enough context to resolve it.
- Let higher layers consume a meaningful result declaratively.
- Remove wrappers that cannot explain what contract or policy they add.

## `ts-pattern`

Use `ts-pattern` selectively for a closed discriminated union with at least three meaningful cases, especially:

- Reducer transitions
- Multi-step page state
- API success, partial success, and failure
- Scoring outcomes
- Nested business branching where exhaustiveness matters

Finish a closed match with `.exhaustive()`. Do not use `.otherwise()` to hide missing cases.

Do not use `ts-pattern` for:

- A single boolean
- A simple two-way render branch
- Ordinary collection operations
- Code that is clearer as an early return or direct `if`

If `ts-pattern` is not installed and the current task is the first justified use, inspect the dependency policy and request or perform the normal in-scope dependency addition. Do not reproduce a partial pattern-matching abstraction locally.

## Expected failures

Represent expected, recoverable outcomes as a discriminated result when callers must handle them.

```ts
type ExtractionResult =
  | { status: "success"; cards: CardDraft[] }
  | { status: "partial"; cards: CardDraft[]; failures: ExtractionFailure[] }
  | { status: "failure"; error: ExtractionError };
```

Use exceptions for unexpected programmer errors, invariant violations, or framework error-boundary paths. Use Relay `@required(action: THROW)` when required fragment data is absent.

## Error boundaries and messages

- Preserve the original error as `cause` when translating an external error.
- Add domain context once at the boundary that understands it.
- Do not repeatedly catch and rethrow without adding policy or recovery.
- Let UI layers map typed expected failures to presentation.
- Do not reduce raw diagnostic information before it reaches the debugging boundary.

## Early returns

Use early returns for loading, missing, unauthorized, or terminal render states when they make the main JSX path clearer. Do not move a hook below an early return.
