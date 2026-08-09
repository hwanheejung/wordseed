# Layers and Placement

## Placement sequence

Ask these questions in order:

1. Is this global application setup, a provider, or configuration? Place it in `app/`.
2. Is this the entry point that composes a URL-addressable screen? Place it in `routes/`.
3. Is this identical UI and behavior reused by at least two routes? Consider `widgets/`.
4. Is this a user-visible business action? Place it in `features/`.
5. Is this a domain model, domain operation, or fragment-driven representation? Place it in `entities/`.
6. Is this truly domain-agnostic? Place it in `shared/`.

Choose the lowest valid layer. Do not promote code for hypothetical reuse.

## `app/`

Allow:

- Global providers and dependency injection
- Router initialization
- Application startup
- Global error boundaries
- Environment and build configuration
- Global styles

Forbid:

- Business workflows
- Page controllers
- Domain repositories exposed as global convenience modules
- Feature state

## `routes/`

Treat routes as composition roots outside the FSD layers.

- Keep one file per page, such as `routes/HomePage.tsx` and `routes/AddCardPage.tsx`.
- Own the page query, page-level state, navigation decisions, and vertical arrangement of direct sections.
- Compose lower layers without reimplementing their rules.
- Keep route-specific code in the route until it has a valid lower-layer owner.
- Do not create a route slice directory merely to mirror a URL.

## `widgets/`

Create a widget only when at least two routes reuse both:

- The same composed UI
- The same behavior

Do not create widgets for single-page sections or visual grouping alone. A widget may compose features and entities, but it must not become a dumping ground for page logic.

Example decisions:

- A bottom navigation rendered and behaving identically across pages: widget.
- A page-specific card review section: keep it in the route or its owning feature.
- A learning-card session implementing a business action: feature, not widget.

## `features/`

A feature represents a user-visible business action, not a technical operation.

Good feature slices:

- `manage-cards`
- `study-session`
- `test-session`
- `filter-cards`
- `backup-library`

Rules:

- A feature may import entities and shared code.
- A feature must not import another feature.
- If feature-to-feature dependency appears necessary, stop and request explicit user confirmation before implementing it.
- Let the route coordinate sibling features through props and callbacks.
- Do not place a page-wide controller or workflow hook in a feature.

## `entities/`

An entity owns domain vocabulary, reusable domain operations, persistence adapters during the local-data phase, and fragment-driven representations.

Entity UI is not every component containing domain data. It is a reusable projection whose data contract belongs to that component. Keep user actions in features.

## `shared/`

Shared code must be domain-agnostic. If a name includes product vocabulary such as card, study, test, vocabulary, or tag semantics, it probably does not belong in shared.

Appropriate examples:

- Generic UI primitives
- Generic browser helpers
- Generic hooks such as `useDebounce`
- Generic formatting or normalization functions
- Cross-cutting infrastructure with no domain policy

`shared/ui/AppHeader` is valid because it is generic page chrome. Bottom navigation is a widget because it composes application destinations and behavior.
