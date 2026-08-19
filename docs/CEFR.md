# Storibase CEFR progression

CEFR is a **content-targeting framework**, not a vocabulary prison and not a gate.

The Luca story continues across levels. The Italian matures as his life matures.

Luca a Roma A1 (chapters 1–20) is **not** the same as “A1 complete.” Pre-Rome A1 stories will broaden domain coverage. Cross-story A1 readiness is not implemented yet; see `docs/STORY-ARCHITECTURE.md`.

```
A1  — Luca prima di Roma (5 planned shorts, 32 ch target) + Luca a Roma chapters 1–20
A1+ — Luca a Roma chapters 21–24
A2  — Luca a Roma chapters 25–40 (written; audio not generated)
A2+ — New problems             (planned)
B1  — Bigger decisions         (planned)
B1+ — Relationships & work     (planned)
B2  — More complicated adult life
C1  — Natural Italian
```

Story length should grow with the level (supporting metric, not padding): A1 ~150–350 words, A2 ~400–700, B1 ~700–1200, and so on. A1 chapters stay shorter on purpose.

No future chapters are generated automatically. Architecture and measurement come first.

## What is measured

Difficulty is a transparent mix of:

- vocabulary CEFR / frequency
- sentence length and clauses
- tense and connector complexity
- novelty (% new lemmas)
- comprehension question types (direct → inference)

Weights live in `DIFFICULTY_WEIGHTS`. Estimated band maps from the 0–100 score. A1 vs A1+ is still **ON TARGET** for an A1 chapter.

## What does not happen

- Existing chapters are not rewritten to chase the score.
- Learners are never told they failed a level.
- Levels are never locked.
- One good chapter never promotes the learner.
- A1 → B1 skips are rejected.

Readiness is a recommendation: “You seem ready for slightly more challenging stories.”

## Authoring

Use `createArcAuthoringTemplate` / `content/stories/luca-a-roma/a2-arc.template.json` for the next arc. Human-reviewed prose remains the source of truth.

Dev screen: Home → **CEFR audit**.
