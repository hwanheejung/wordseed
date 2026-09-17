# MVP roadmap

## Roadmap rule

Each MVP must close a usable collect-to-resurface loop. An MVP is not complete merely because one technical layer or dictionary model is complete.

## MVP 1: Fast personal collection and one-card review

### Outcome

A user can create a personal vocabulary collection from text, revisit one expression with minimal friction, and explicitly remove mastered items from future review.

### In scope

- dictionary search and detail sufficient to select an expression;
- direct text entry and save;
- original context entry when available;
- immediate saving without mandatory Sense confirmation;
- provisional Sense suggestion;
- a minimal personal Library;
- a one-expression review card;
- immediate display of the expression, meaning, and saved context;
- one `Master` action and a reversible unmaster action;
- at least one later resurfacing of a non-mastered item;
- a notification deep link to one expression, with user-controlled permission, timing, and frequency;
- collection, card-view, Master, and notification instrumentation.

### Validation questions

- Can users save an expression without feeling that they are authoring a flashcard?
- How long does a successful save take?
- Do users revisit collected expressions rather than only accumulating them?
- Does one-card entry reduce the friction of starting a review?
- When and why do users press Master?
- Do users understand that Master removes an item from normal review?
- Are notifications opened, ignored, or disabled at different frequencies?
- Can view count and foreground time be collected reliably without being mistaken for correctness?

### Failure conditions

- collection is not meaningfully easier than existing notes or flashcard tools;
- the Library grows while review-card opens remain rare;
- Sense resolution repeatedly blocks saving or first review;
- notifications are disabled before they create repeat value;
- users use Master only to clear the queue rather than to represent their intent.

## MVP 2: Faster import and lightweight personalization

### Outcome

Users can build a useful personal collection from more of the material they already use without entering every expression individually.

### Candidate scope

- pasted multi-line lists or passages;
- candidate-expression extraction and bulk confirmation;
- operating-system share flow;
- photo OCR with review before import;
- duplicate and already-mastered detection;
- basic notification-frequency adaptation from user behavior;
- a first review-prioritization policy using clean interaction history.

### Validation questions

- Does faster import increase reviewed expressions or only create a larger backlog?
- Which import source produces the highest collect-to-review conversion?
- Can users correct extraction and Sense mistakes faster than entering items manually?
- Does behavior-based notification adjustment reduce opt-outs?

## MVP 3: Continuous capture and contextual learning

### Outcome

Wordseed can transform larger real-world sources into a personal learning collection and connect related expressions without increasing management burden.

### Candidate scope

- continuous camera scanning for printed books and vocabulary lists;
- richer contextual and semantic search;
- confusion and nuance comparisons;
- topic-based and situation-based collections;
- new-context resurfacing;
- limited productive recall through writing or speaking;
- user-approved contextual recommendations such as calendar-related themes.

### Validation questions

- Is continuous scanning materially faster and more accurate than photo import?
- Do semantic relationships improve retrieval rather than distract from it?
- Do new-context prompts help users use expressions outside the original source?
- Are contextual recommendations useful enough to justify access to personal context?

## Product metrics

Do not use total saves as the primary success metric.

The core funnel is:

```text
collect started
  -> collect completed
  -> first card view
  -> later resurfacing
  -> repeat card view or Master
```

Track at minimum:

- median collection time;
- collect completion rate;
- collected-item to first-view conversion;
- time from collection to first view;
- later-resurfacing open rate;
- valid views per active item;
- proportion and timing of Master actions;
- unmaster rate;
- notification open, dismissal, and opt-out behavior;
- growth of collected-but-never-viewed items.

These metrics describe product behavior. They do not independently prove long-term learning efficacy.
