# A2+ pathway gate

**Status:** implemented (Stories first-time gate + A2+ tab pathway cards).  
**Does not** touch Casa / Luca prose when flipping pathway availability.

## Product

After Luca A2 → choose next Italian story (not “unlock next level”).

| Path | Status |
|------|--------|
| La casa delle finestre | Available (live) |
| Una lettera per Elena | Available (22 chapters) |
| Il villaggio che non esiste | Available (24 chapters) |

Design/bible SOT: [`docs/PHASE-13-A2-PLUS-GENRE-PATHS.md`](PHASE-13-A2-PLUS-GENRE-PATHS.md) (**authored 2026-08-22**).

## Persistence

- `pathwayGateSeen`
- `primaryPathwayStoryId` (switchable; progress stays per `storyId`)

Local: `storia:pathway-prefs:v1`. Synced via `LearnerPreferences`.

## Entry

- Learner: Luca Ch 40 completed.
- Dev / `unlockAllChapters`: bypass.

## Code

- `mobile/src/pathway/*`
- `PathwayGate`, `A2PlusPathwayPanel`, `PathwayWorldCard`
- Stories tab A2+ uses pathway panel (not a flat Casa-only row)
