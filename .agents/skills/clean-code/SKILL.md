---
name: clean-code
description: Apply this project's predictable, AI-friendly TypeScript and React coding conventions. Use when implementing or reviewing components, hooks, state transitions, reducers, effects, event handlers, types, validation, errors, tests, or control flow; and when deciding whether to introduce abstractions or declarative libraries such as ts-pattern.
---

# Clean Code

Write explicit, local, compiler-enforced code that another agent can understand and safely change from a PRD. Prefer boring control flow and strong contracts over clever abstractions.

Use `clean-structure` separately whenever files, ownership, imports, or FSD layers may change.

## Required workflow

1. Identify the component, state, function, or boundary that owns the behavior.
2. Model valid states and inputs before implementing branches.
3. Keep logic local until a concrete responsibility or reuse boundary justifies extraction.
4. Prefer pure functions for business rules and explicit callbacks for actions.
5. Use effects only to synchronize with external systems.
6. Make invalid and unhandled states fail through types, exhaustive matching, or boundary validation.
7. Remove wrappers and abstractions whose purpose cannot be stated precisely.

## Reference routing

- Read [components-and-handlers.md](references/components-and-handlers.md) for component contracts, JSX, file order, handlers, refs, and extraction decisions.
- Read [state-hooks-and-effects.md](references/state-hooks-and-effects.md) for `useState`, reducers, custom hooks, effects, callbacks, and `sessionStorage`.
- Read [typescript-contracts.md](references/typescript-contracts.md) for type ownership, Props, unions, assertions, generated types, and runtime validation.
- Read [control-flow-and-errors.md](references/control-flow-and-errors.md) for business conditions, `ts-pattern`, result unions, errors, and declarative branching.
- Read [dependencies-and-testing.md](references/dependencies-and-testing.md) before adding a dependency or deciding what to test.

Load only the references relevant to the task. Read all five for a broad implementation or repository-wide code-quality review.

## Non-negotiable defaults

- Do not create controller, workflow, or manager hooks that hide page ownership.
- Do not use effects for derived state, rendering transformations, event consequences, or data fetching.
- Do not use `any`, broad `Partial<DomainType>`, or unchecked external data.
- Do not make a child component depend on a parent query-response type.
- Do not precompute simple render-only branches outside JSX.
- Do not use `useCallback` or memoization without an identity or measured performance requirement.
- Do not install or use `es-toolkit`; prefer native JavaScript operations.
- Use `ts-pattern` selectively for closed discriminated unions with at least three meaningful cases, and finish with `.exhaustive()`.
- Keep business rules in named pure functions and keep expected failures explicit.
