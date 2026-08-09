# Segments and Naming

## Slice shape

Require a `ui/` segment in every feature, entity, and widget slice. If a proposed slice has no coherent UI responsibility, reconsider whether it should be a standalone slice before creating an empty structural shell. Add other concrete segments only when the slice actually needs them.

Allowed segment names include:

- `ui/`
- `api/`
- `hooks/`
- `types/`
- `utils/`
- `helpers/`
- `constants/`
- `validators/`
- `actions/`

Do not create empty segments for symmetry.

## Forbidden vague segments

Do not create these inside a slice:

- `model/`
- `lib/`

These names do not reveal whether a file contains state, validation, transformation, constants, or infrastructure. Select a segment that states the role.

## Hooks

- Keep domain-agnostic reusable hook primitives in `shared/hooks/`.
- Keep a slice-specific hook in that slice's `hooks/` segment.
- Colocate a domain-specific external lifecycle wrapper with the domain module that owns the underlying operation.
- Do not use a hook to move page ownership out of a route.

## Naming slices

- Name features after business actions.
- Name entities after domain concepts.
- Name widgets after the stable composed block they represent.
- Avoid structural names such as `common`, `misc`, `core`, `manager`, or `workflow` that obscure ownership.
