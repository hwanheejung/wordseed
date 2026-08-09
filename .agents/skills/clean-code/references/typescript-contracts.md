# TypeScript Contracts

## Choosing `interface` and `type`

- Use `interface` for component Props and extendable object contracts.
- Use `type` for unions, intersections, function signatures, mapped types, and aliases.
- Keep file-private types beside their owner.
- Export a type only when another module consumes its contract.

## Ownership

- Let the module that owns a concept own its type.
- Do not create a global `types.ts` dumping ground.
- Do not source common types from mutation artifacts or route query responses.
- Do not re-export generated GraphQL response types as domain types.
- Let Relay fragment keys form entity component data contracts after Relay is introduced.

## Public boundaries

- Annotate exported function parameters and return values when they define a module contract.
- Allow inference for obvious local variables and private callbacks.
- Model distinct commands explicitly, such as `CreateCardInput` and `UpdateCardInput`.
- Do not use `Partial<Card>` to avoid designing a real input contract.
- Prefer literal unions over enums.
- Prefer `satisfies` over type assertions when checking a value's shape.
- Use an assertion only after a runtime guarantee that TypeScript cannot express.

```ts
const reviewOptions = [
  { value: "unknown", label: "Unknown" },
  { value: "confusing", label: "Confusing" },
  { value: "known", label: "Known" },
] satisfies ReviewOption[];
```

## External data

- Treat API responses, imported JSON, browser storage, URL input, and database migration payloads as `unknown`.
- Validate external values at the boundary with the project's runtime schema library.
- Convert validated transport data into owned domain contracts before passing it deeper.
- Keep runtime validation out of ordinary internal function calls.
- Never use `any` to bypass a boundary.

## Invalid states

- Use discriminated unions to make mutually exclusive states explicit.
- Do not encode one state machine with several loosely related booleans.
- Require exhaustive handling of closed unions.
- Avoid optional properties when each variant can state exactly which fields exist.

## IDs and branded types

Use plain typed IDs by default. Introduce branded IDs only when multiple ID domains are frequently mixed and the compiler protection justifies the conversion overhead. Do not add branding preemptively.
