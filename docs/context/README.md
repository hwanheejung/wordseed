# Wordseed product context

This directory is the durable product context for harness-driven engineering. It exists to keep planning, design, implementation, and verification aligned when work moves between agents and sessions.

## Required reading order

1. [Product context](./product-context.md)
2. [Product model](./product-model.md)
3. [MVP roadmap](./mvp-roadmap.md)

Read the relevant architecture documents after these files when a task changes data ownership or system boundaries.

## Authority

- Statements under **Decisions** are current product constraints.
- Statements under **Hypotheses** require evidence and must not be presented as validated facts.
- Items under **Deferred** are intentionally outside the current scope.
- Code describes current implementation; these documents describe intended product behavior. A mismatch must be surfaced rather than silently resolved in either direction.
- Temporary implementation status, agent transcripts, and task checklists do not belong in this directory.

## Change policy

- Update these documents when a product decision changes.
- Record why a decision changed and which evidence caused the change.
- Do not expand MVP scope merely because the architecture can support it.
- Preserve the distinction between the public dictionary and a user's private learning data.
