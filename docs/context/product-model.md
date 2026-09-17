# Product model

## Dictionary and saving

A saved learning item references a published Wordseed Dictionary Sense. Personal collections contain membership and user state, not private lexical definitions.

Save existing results directly. For a missing meaning, submit an addition request; pending content is neither saved nor a validated review card. AI may create a Lexeme with its initial Sense or add a missing Sense, but cannot edit existing definitions, examples, cards, or identities. Report routes errors to separate correction, not automatic AI rewriting.

## Addition requests

Proposed flow: request an expression/meaning with identifying context → record pending request and save intent → generate/validate asynchronously → resolve published content to the requested Sense → save once.

Validation failure or timeout cannot create a private entry. Distinguish pending, processing, rejected, canceled, and fulfilled outcomes; do not promise unsupported completion times.

Before implementation, resolve these proposed safeguards:

- Clarify ambiguous meanings instead of auto-saving an arbitrary Sense.
- Allow cancellation; canceled requests must not later save.
- Deduplicate requests resolving to the same Sense and preserve existing Master state.
- Define retries, rejection, and ownership of unresolved requests.
- Define the destination if the selected wordbook is removed.
- Show fulfillment in-app; push is deferred.

These are design proposals, not claims of operational support.

## Master

Master declares mastery and removes the item from normal review without deleting history or membership. Mastered cards expose Unmaster. Never infer mastery from views or treat Master as dismissal. Removing wordbook membership does not change Master status.

## Library and wordbooks

Show expressions and meanings together. Default: recently added first.

Sort options: recently added first; oldest added first; recently studied first; least recently studied first; alphabetical.

Sorting differs from active/mastered or membership filters. “Studied” means an explicit detail visit, not demonstrated learning. Define never-viewed placement, tie-breaking, and collation consistently.

Wordbooks are optional many-to-many groupings. Removing membership does not delete the personal item. Apple Music guides collection browsing, artwork/layout, lists, and detail navigation; it does not justify playback controls or a player layer.

## Detail measurement

Opening a card detail immediately shows expression, meaning, and context, without recall delay, Reveal, or confidence ratings.

Record explicit opens, detail-view count, visible foreground duration, last-view time, and Master/Unmaster events. Exclude list exposure, Home previews, prefetching, and background time. Pause timing when the detail is hidden or the app leaves foreground. Define session deduplication and idle handling before instrumentation.

Events demonstrate viewing, not attention, correct recall, or mastery. Review-interval personalization remains deferred.

## Navigation

- Home: saved content and Quick Review, without a scheduling dependency.
- Library: expressions, wordbooks, sorting, and detail entry.
- Search: Dictionary lookup, save supported meanings, request additions.
- Detail: expression, meaning, examples/context, Master/Unmaster, Report.

Quick Review displays meaning immediately. Library ordering is separate from future review scheduling.

## Exclusions and later work

Chatbot, notifications, widgets, spare-moment targeting, and personalization follow the [roadmap](./mvp-roadmap.md). Required recall/tests, confidence ratings, timed sessions, pronunciation scoring, leagues, and punitive streaks are outside current scope. AI edits to existing Dictionary content are prohibited, not merely postponed.
