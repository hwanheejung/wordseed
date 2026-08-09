# Components and Handlers

## Component contracts

- Define each component's Props immediately above the component.
- Name the contract `${ComponentName}Props`.
- Let the component specify only the concept it needs.
- Never derive child Props from a parent's query response type.
- Keep interfaces lightweight. If a component conveys one concept, pass that concept rather than a collection of related implementation details.
- Treat multiple reference props as a warning that the schema or component boundary may be wrong.

```tsx
interface TagChipProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}
```

Avoid boolean-prop explosions. Use a discriminated variant or separate components when variants have materially different behavior.

## File and component order

Use this predictable order:

1. Imports
2. File-local types and interfaces
3. File-local constants
4. Component declaration
5. Fragment or query hooks
6. Router and environment hooks
7. Local state or reducer
8. Mutations
9. Event handlers
10. Effects
11. Early returns
12. JSX
13. File-local pure helpers

Keep every hook call before conditional returns.

Do not force business helpers to the bottom if they belong to a lower-layer module; move them to their owner instead.

## JSX and derived rendering

Express simple render-only conditions and transformations directly where they render.

```tsx
{card.meanings.map((meaning) => (
  <MeaningItem key={meaning.id} meaning={meaning} />
))}
```

Do not move a simple condition into a variable merely to shorten JSX.

Allow a variable or early return when:

- Multiple render paths reuse the same result.
- A branch is substantial enough to obscure the component.
- The value expresses a meaningful domain decision returned by a lower-layer function.
- Computing it inside JSX would repeat expensive work.

Do not leave detailed business rules in a page component. Replace raw conditions with a named pure function owned by the relevant domain.

## Handlers and callbacks

- Name callback props `onSave`, `onClose`, `onSelect`, or another event-shaped `on...` name.
- Name extracted internal handlers `handleSave`, `handleClose`, or `handleSelect`.
- Keep a one-expression callback inline when it is used once and remains readable.
- Extract a handler when it contains multiple statements, is reused, owns an async boundary, or needs a meaningful name.
- Perform consequences of a user event in that event handler, not in an effect watching state.
- Pass navigation as a close or completion callback; do not navigate from a generic child implicitly.

## Refs and memoization

- Do not use `useCallback` by default.
- Use it only when reference identity is part of an API contract, an external subscription, or a verified memoization boundary.
- Do not add `memo`, `useMemo`, or callback memoization speculatively.
- Question the component or schema boundary before adding multiple fragment or domain refs.

## Component extraction

Extract by responsibility and contract, not by line count.

Extract when the child:

- Owns a coherent rendering responsibility.
- Can define a small independent Props contract.
- Owns a fragment or interaction boundary.
- Is genuinely reused.

Do not extract wrappers that only rename an element or forward every prop unchanged.
