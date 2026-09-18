# Wordseed product context

Durable product constraints for agents; implementation status and transcripts belong elsewhere.

## Reading order and ownership

1. [Product context](./product-context.md): goal, audience, governing decisions, hypotheses.
2. [Product model](./product-model.md): behavior, data ownership, unresolved interaction rules.
3. [MVP roadmap](./mvp-roadmap.md): release scope and validation.

Read these for product work. Read [Dictionary architecture](../architecture/dictionary-target-model.md) only for Dictionary schema, publishing, validation, or data-ownership work; it is not required for routine UI tasks.

For mobile authentication implementation and ownership, read [Mobile authentication](../architecture/mobile-authentication.md). It documents OAuth, session restoration, token refresh, and API account linking; product policy remains in the context documents above.

## Authority and maintenance

- Decisions constrain implementation; hypotheses remain unvalidated; candidates are not commitments.
- Documents describe intent; code describes implementation. Surface mismatches.
- Update the owning document when a decision changes, with its reason. Link rather than duplicate detailed rules.
- Do not expand scope because the architecture supports it.
- Preserve public Dictionary/private learning boundaries.
