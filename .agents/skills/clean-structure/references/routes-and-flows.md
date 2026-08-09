# Routes and Flows

## Page-owned flows

Keep a route-specific multi-step flow as one route with one explicit state machine unless a step must be URL-addressable or independently navigable.

For the Add Card flow:

- Use one `/add` route.
- Represent input, extraction, selection, and review as internal steps.
- Do not reflect those steps in the URL.
- Store the in-progress session temporarily in `sessionStorage`.
- Let `AddCardPage` own one discriminated-union state directly.
- Do not create a workflow context, controller hook, or manager object.
- Let child feature components report events through callbacks.

Example shape:

```ts
type AddCardState =
  | { step: "input"; draft: AddCardDraft }
  | { step: "extracting"; draft: AddCardDraft }
  | { step: "selecting"; candidates: Candidate[] }
  | { step: "reviewing"; cards: CardDraft[] }
  | { step: "failed"; draft: AddCardDraft; error: Error };
```

Treat the entire Add Card process as one internal flow, not as separate route pages.

## Navigation

- Keep navigation decisions in the route.
- Pass close, completion, or selection actions as callbacks.
- Do not hide navigation inside entity components, custom controllers, or domain hooks.

## Page and section layout

- Let a page control spacing between its direct sections.
- Let each direct section own its horizontal padding.
- Prevent a page's main composition from knowing detailed business conditions; receive meaningful lower-layer results instead.

## Shared chrome

- Place a generic `AppHeader` in `shared/ui`.
- Place `BottomNavigation` in `widgets` because it composes application destinations and behavior.
- Keep `LearningCardSession` in `features` because it implements a business action.
