# Relay and Data Ownership

## Query ownership

- Call `useLazyLoadQuery` only at the top level of a route page.
- Define the page query in that route file.
- Let the page compose fragment-owning children by passing fragment keys.
- Do not add nested fetching components or query-owning feature hooks.
- Avoid `network-only`; diagnose missing cache updates first.

## Entity fragments

An entity component owns the fragment for the data it renders. Define the fragment directly inside that component's `useFragment` call; do not extract a separate fragment constant.

```tsx
interface VocabularyCardProps {
  card: VocabularyCard_card$key;
}

function VocabularyCard({ card: cardRef }: VocabularyCardProps) {
  const card = useFragment(
    graphql`
      fragment VocabularyCard_card on Card {
        term @required(action: THROW)
        meanings @required(action: THROW) {
          definition @required(action: THROW)
        }
      }
    `,
    cardRef,
  );

  return <article>{card.term}</article>;
}
```

Use `@required(action: THROW)` for fields required by the component contract. Do not make the parent compensate for missing child data.

## Component contracts

- Let each child component define its own Props contract.
- Never type child Props from a parent query response.
- Pass one fragment reference for the concept represented by the component.
- Treat multiple fragment-reference props as a schema-design warning.
- Prefer schema traversal such as `advertisement.jobPost` over separate `advertisementRef` and `jobPostRef` props.
- Allow entity fragments to spread other entity fragments when the schema relationship requires it.

## Mutation ownership

- Place a mutation in the feature that owns the user action.
- Let the route receive success or close callbacks rather than hiding navigation in the mutation feature.
- Keep generated mutation artifacts private to the mutation implementation.
- Do not source common domain types from mutation responses.
- Update Relay records or connections correctly instead of defaulting to `network-only` refetching.

## Local data transition

Until the backend and Relay are introduced:

- Keep IndexedDB repositories behind entity or feature data boundaries.
- Present fragment-shaped view contracts to entity UI rather than mutable database records where practical.
- Do not pass repositories into UI components.
- Preserve the ownership boundaries above so replacing local repositories with Relay does not require redesigning page composition or entity UI.
