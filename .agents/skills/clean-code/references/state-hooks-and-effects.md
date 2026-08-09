# State, Hooks, and Effects

## State selection

Use the smallest state model that makes invalid combinations impossible.

- Use `useState` for an independent primitive or simple value.
- Use one discriminated union for mutually exclusive UI states.
- Use `useReducer` when at least three meaningful transitions exist, multiple fields change together, or transition validity deserves focused tests.
- Let Relay own server state.
- Do not keep two states for one concept when one source of truth can represent it.

```ts
type AddCardState =
  | { step: "input"; draft: AddCardDraft }
  | { step: "extracting"; draft: AddCardDraft }
  | { step: "selecting"; candidates: Candidate[] }
  | { step: "reviewing"; cards: CardDraft[] }
  | { step: "failed"; draft: AddCardDraft; error: Error };
```

## Reducers

- Keep reducers pure and outside the component.
- Name actions as events that happened, not setter commands.
- Model payloads explicitly.
- Test valid transitions and impossible or ignored transitions.
- Use exhaustive matching for closed action or state unions with at least three cases.

Prefer:

```ts
{ type: "extractionSucceeded"; candidates: Candidate[] }
```

Avoid:

```ts
{ type: "setStep"; step: string }
```

## Custom hooks

Create a custom hook only when it:

- Encapsulates an external stateful lifecycle or subscription, or
- Has at least two real consumers that reuse the same stateful behavior, or
- Represents a cohesive feature action that cannot be a pure function and has a narrow input/output contract.

Do not create a custom hook merely to shorten a component or hide page-local complexity. Keep a single-page state machine in the page plus a pure reducer.

Avoid vague names and responsibilities:

- `useController`
- `useWorkflow`
- `useManager`
- `usePageLogic`

Never hide navigation, unrelated mutations, and multiple feature states inside one hook.

## Effects

Use an effect only to synchronize React with an external system, including:

- Browser storage
- Timers
- DOM or imperative libraries
- Event listeners
- Analytics
- External subscriptions

Do not use an effect for:

- Derived state
- Rendering transformations
- Calling a consequence after a user action
- Synchronizing two React states
- Data fetching that belongs to Relay
- Invoking a parent callback because local state changed

Put the effect after handlers and before early returns. Add a one-line comment immediately above every effect naming the external system and synchronization purpose. Provide cleanup whenever the external resource requires it.

```ts
// Synchronize the in-progress add-card session with sessionStorage.
useEffect(() => {
  writeAddCardSession(state);
}, [state]);
```

## `sessionStorage`

For a temporary page flow:

- Read storage through a lazy state initializer.
- Validate the stored value before using it.
- Persist the current state through an effect.
- Remove it explicitly on completion or cancellation.
- Keep serialization and validation in named pure helpers.
- Do not create a custom persistence hook for one route.
