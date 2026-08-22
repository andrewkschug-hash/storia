# A2+ pathway gate

**Status:** implemented (Stories first-time gate + A2+ tab pathway cards).  
**Does not** author romance/fantasy or touch Casa / Luca prose.

## Product

After Luca A2 → choose next Italian story (not “unlock next level”).

| Path | Status |
|------|--------|
| La casa delle finestre | Available |
| Una lettera per Elena | Coming soon |
| Il villaggio che non esiste | Coming soon |

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
