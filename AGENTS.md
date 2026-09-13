# Engineering Principles

## Project Skills

- Load `clean-structure` before adding, moving, splitting, or reviewing modules, imports, FSD layers, route composition, Relay ownership, or slice public APIs.
- Load `clean-code` before implementing or reviewing React components, hooks, state, reducers, effects, handlers, TypeScript contracts, validation, control flow, errors, dependencies, or tests.
- Load both skills when a task changes implementation and structure.
- Treat these project-local skills and their routed references as the canonical engineering conventions. Do not duplicate their detailed rules in `AGENTS.md`.

## Agent Collaboration

- The primary Codex agent owns scope, sequencing, decisions, and the final answer. Do not create a separate lead subagent.
- Use Codex's built-in `explorer` for codebase mapping and `worker` for implementation and fixes.
- For material product changes, delegate bounded work to the matching project agent in `.codex/agents/`: `product_planner`, `product_designer`, `architecture_reviewer`, or `verifier`.
- Use only the specialists the task needs. Keep small, sequential tasks in the primary agent.
- Gather independent proposals before asking agents to critique one another. Limit debate to one evidence-based rebuttal round, then let the primary agent decide and record the material trade-off.
- Parallelize read-heavy research, exploration, and review. Avoid parallel edits to the same files unless each worker has an isolated checkout and a clear ownership boundary.
- After a material behavior change, have `verifier` check the stated acceptance criteria against the exact revision. A failed check returns to `worker` with reproduction evidence.
- Wait for every requested specialist before consolidating the result. Distinguish verified facts, inferences, and unresolved questions.

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
- When SEED Design does not cover a styling need, prefer Tailwind utilities in the component over adding reusable layout rules to a shared CSS file.
- Name reusable styles after their visual or layout behavior, not the first feature that uses them. Extract repeated behavior into shared patterns and remove obsolete selectors as part of related changes.
