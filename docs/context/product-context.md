# Product context

## Product goal

Wordseed aims to be a vocabulary product that is substantially easier and more useful than existing vocabulary apps.

It should help users build a personal vocabulary collection with minimal effort and turn collected expressions into retrievable language without requiring a dedicated study block.

## Initial target user

The initial user is a Korean-speaking intermediate English learner who frequently encounters useful words and expressions but cannot reliably retrieve them when writing or speaking.

This includes people who:

- study expressions by chapter or topic;
- encounter expressions in videos, documents, conversations, or work;
- remember a Korean meaning but cannot retrieve the English expression;
- repeatedly confuse similar expressions;
- want to revisit a semantic group such as decoration, negotiation, or fitness.

Wordseed is not initially optimized for absolute beginners, classroom administration, real-time AI conversation, or simultaneous study of multiple languages.

## Job to be done

> When I encounter or decide to learn an English expression, I want to add it to my own vocabulary collection immediately and revisit it in spare moments, so that I can retrieve and use it later without organizing a study system myself.

## Value proposition

> Build a personal vocabulary collection from the English that matters to you, then learn one expression at a time in the moments you already have.

The value is the combination of:

- fast personal collection building;
- preservation of the user's original context;
- dictionary-backed meaning accuracy;
- one-expression micro-learning;
- resurfacing without manual review planning.

Dictionary depth, Sense matching, scheduling, and AI are enabling systems. They are not the primary user-facing promise.

## Decisions

- The product's basic learning unit is one expression, not a timed study session.
- Wordseed should fit into short breaks rather than require users to reserve a continuous study period.
- Thirty seconds is an interaction budget, not a visible countdown or a completion requirement.
- Collection must not require card editing, tagging, folder selection, or Sense confirmation before saving.
- Original text and source context should be retained whenever available.
- A suggested Sense may remain provisional until the expression is revisited.
- Saving many expressions is not success by itself. Collected expressions must convert into actual review interactions.
- Notifications must be user-controlled entry points, not punishment, streak pressure, or proof of memory.
- The public dictionary and private learning state are separate domains. Personal memory state must not be stored in dictionary relation tables.

## Product principles

### Capture first, resolve later

Do not interrupt the user's original activity to demand dictionary precision. Save first; resolve ambiguous meaning when the expression is next shown.

### One useful action per micro-moment

A user must be able to open one expression, see its meaning and context, and leave. Continuing to another expression is optional. Recall prompts may exist as an optional future mode, but they are not part of the default review experience.

### Earn interruption rights

Notifications and future widgets must respect user-selected timing and frequency. Ignoring an interruption is not a learning failure.

### Prefer evidence over declared confidence

Do not ask users to repeatedly classify themselves as knowing, confused, or not knowing. Record observable interaction data and require an explicit decision only when it changes product behavior.

### Do not turn collection into administration

Organization features must not make Wordseed feel like a spreadsheet, note system, or flashcard authoring tool.

## Hypotheses

- Extremely fast personal collection building is a stronger initial differentiator than a large catalog of prepared courses.
- One-expression interactions are more likely to fit real behavior than time-boxed study sessions.
- Original context improves later retrieval and makes a personal collection more valuable than a generic word list.
- Card view count and meaningful foreground viewing time may help prioritize future reviews.
- A user-controlled notification can create useful micro-moments without creating notification fatigue.

These hypotheses require product evidence. They must not be described as established learning science or validated retention behavior.

## Competitive constraints

- Do not compete with Duolingo primarily on streaks, leagues, or generalized gamification.
- Do not depend on entertainment-platform integration before the core collect-to-review loop works.
- Do not use low-quality AI images, pronunciation judgments, or generated explanations as a substitute for trustworthy dictionary content.
- Do not let a growing collection become a visible backlog that creates guilt or avoidance.
