# Product model

## Core loop

```text
Encounter or choose an expression
  -> collect it immediately
  -> preserve text and source context
  -> attach a provisional Sense when possible
  -> place it in the personal collection
  -> resurface one expression in a micro-moment
  -> show the expression, meaning, and useful context
  -> record the interaction
  -> resurface it again until the user explicitly marks it Mastered
```

## Capability model

### F0: Dictionary

The dictionary identifies lexical meaning and supports search, Sense selection, examples, pronunciation, related expressions, and future semantic discovery.

The dictionary is a shared knowledge system. It does not own an individual user's memory state.

### F1: Collect

Collect turns an encountered expression into a private learning item with minimal interruption.

The progression is:

1. direct text search and save;
2. pasted text or lists;
3. operating-system sharing and photo recognition;
4. continuous camera scanning for books or printed vocabulary lists.

Collection should retain the expression, original context, source when available, and a provisional Sense candidate. The user may correct the Sense later.

### F2: Review one expression

The default review interaction is intentionally small:

1. show the expression and its intended meaning immediately;
2. include the saved context and concise usage evidence;
3. allow the user to mark the item as Mastered;
4. allow the user to leave immediately or continue to another expression.

There is no required recall delay, answer reveal, or `Did not know / Unsure / Knew` assessment. Recall prompts may be explored later as an optional mode without changing how the Library presents vocabulary.

### F3: Resurface

Wordseed brings expressions back during user-approved micro-moments. A learning item remains eligible for review until the user explicitly marks it as mastered.

The future review algorithm may use:

- valid card view count;
- meaningful foreground viewing time;
- time since the previous view;
- whether the interaction used saved or new context;
- the item's age and review history.

The algorithm is intentionally deferred. Current implementation must collect clean events without pretending that view time alone proves recall accuracy.

## Master decision

`Master` is the only explicit learning-state decision required from the user.

- Pressing `Master` removes the item from the normal review queue.
- Mastery is user-declared; Wordseed does not infer it automatically from viewing time.
- The user must be able to reverse Master and return the item to review.
- Mastering an item does not delete its history or dictionary link.
- The UI must prevent accidental mastery and make the consequence clear without adding a confirmation dialog to every use.

## Measurement model

### Record now

- collection entry and completion;
- collection duration;
- source type;
- provisional Sense assignment and later correction;
- card impression with foreground start and end;
- valid foreground viewing duration;
- continuation to another expression;
- Master and unmaster events;
- notification delivery, open, dismissal when available, and notification setting changes.

### Do not infer yet

- that a fast reveal means the user knew the answer;
- that a long view means deeper learning;
- that an ignored notification means forgetting;
- that repeated views equal mastery;
- that a Master action is an objective measurement of language ability.

## Information architecture

### Quick Collect

- search or enter an expression;
- paste original context;
- save immediately;
- support batch input as the product evolves.

### Quick Review

- open directly to one reviewable expression;
- show the expression, meaning, and context immediately;
- optionally Master the expression;
- exit or continue.

### Library

- browse and search the personal collection;
- inspect original context and dictionary meaning;
- correct the Sense;
- see whether an item is active or mastered;
- restore a mastered item to review.

Dictionary detail and expression detail are subordinate flows, not primary navigation destinations.

## Deferred

- a production review-spacing algorithm;
- confidence-rating buttons;
- mandatory recall and answer-reveal interactions;
- timed study plans and required session lengths;
- complex folders, tags, and collection administration;
- AI-generated memory images;
- open-ended AI conversation;
- pronunciation scoring;
- XP, leagues, punitive streaks, and social competition;
- direct YouTube or Netflix dependency;
- calendar-driven vocabulary recommendations;
- full interactive widgets;
- multi-language product expansion.
