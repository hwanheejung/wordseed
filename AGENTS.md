# Engineering Principles

## Implementation

- Choose the simplest implementation that fully satisfies the current requirements.
- Build the system in layers. Start with the smallest end-to-end version that works, then add one capability at a time on top of the working result.
- Never trade working code for unfinished complexity.

## Dependencies

- Check the project's installed dependencies before implementing functionality from scratch or adding a new package.
- Inspect a library's documentation and type definitions before concluding that it does not support a required capability.

## Architecture

- Make architectural decisions with the long term in mind.
- Do not accept short-lived workarounds that merely defer an inevitable replacement or rewrite.

## Product UX

- Prefer clear visual affordances over explanatory UX copy. Do not add instructions when the interaction is already apparent from the interface itself.
- Before creating or styling a UI pattern directly, check whether SEED Design already provides a component, layout primitive, template, or documented composition for it.
- Prefer composing installed SEED Design components and primitives over custom UI implementations. Add custom styling only for requirements that SEED Design does not cover, and keep that styling minimal.
