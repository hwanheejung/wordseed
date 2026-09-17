# MVP roadmap

## MVP 1: Dictionary-backed collection and revisiting

Outcome: conveniently save supported meanings and return to view them.

### Scope

- Home / Library / Search; direct Dictionary lookup and save.
- Pending addition requests and proposed post-publication automatic saving.
- Addition-only AI generation under the architecture validation contract; Report for existing errors.
- Optional wordbooks and unassigned items; Apple Music-inspired browsing.
- Expression and meaning visible together; detail Master/Unmaster.
- Newest-added default and all five Library sort options.
- Detail-open counts, foreground duration, and last-view timestamps.

Behavior is defined in [Product model](./product-model.md). Resolve asynchronous fulfillment rules before shipping auto-save. Public publishing remains gated by architecture quality and operational criteria.

### Validation and metrics

| Area | Questions | Evidence |
| --- | --- | --- |
| Existing content | Is saving easier than the user's current method? Do users return? | Search-to-save conversion/time; later visits; saved-item detail opens/duration. |
| Missing content | Does coverage block saving? Are requests understood and useful after fulfillment? | Miss/submission rates; pending age; fulfillment time; fulfilled/rejected/canceled/pending outcomes; automatic saves; subsequent detail visits. |
| Fulfillment accuracy | Is the intended meaning saved once? | Duplicate, wrong-meaning, and report rates. |
| Master | Do users understand mastery and its reversal? | Master/Unmaster events and user feedback. |
| Telemetry | Are detail counts and durations consistent? | Event-definition and measurement checks. |
| Dictionary quality | Can AI add accurate content without modifying existing entries? | Validation rejection, human-sampled errors, quarantine, rollback, and mutation-boundary checks. |

Measure existing saves and requests separately. Include pending and failed outcomes when assessing save performance. Engagement and Master events do not prove learning efficacy.

## MVP 2 candidates

- Chatbot/conversational Search.
- Pasted lists and bulk confirmation.
- Sharing and photo OCR.
- Recommended wordbook discovery and independent copying.
- Notification entry and user-controlled timing.
- Initial review policy using detail-view history.

Prioritize these explicitly; the list does not authorize implementing every candidate.

## Later candidates

Continuous camera scanning; semantic search and nuance comparisons; optional productive recall; widgets and contextual recommendations.

## Release boundaries

Chatbot and notifications are outside MVP 1. Pending requests must never appear as completed saves or validated cards. No private Dictionary fallback or AI edits to existing content are allowed.
