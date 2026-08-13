# Story architecture (Phase 12I)

CEFR level, narrative arc, story, and chapter are separate.

```
CEFR A1
  Narrative arc: luca-prima-di-roma   (planned)
    Stories: luca-prima-di-roma-01 … 05   (planned, no prose)
  Narrative arc: luca-a-roma          (available)
    Story: luca-a-roma
      Ch 1–20 A1 · 21–24 A1+ · 25–40 A2
CEFR (independent)
  Narrative arc: elena-torna-a-casa   (draft, not part of Luca’s journey)
```

Narrative order is independent of chapter numbers. Pre-Rome stories precede Luca a Roma. Do not use chapter 41+.

## Catalog

`mobile/content/story-catalog.json` + `src/content/catalog.ts`

- `available` — production load via `getContentBundle(storyId)`
- `draft` — inspect only (`inspectDraftStory`); incomplete OK
- `planned` — catalog placeholder; no chapter files required

Luca a Roma stays available. Pre-Rome IDs are fixed (`luca-prima-di-roma-01` … `05`). Titles and chapter targets are locked in Phase 12J (`docs/LUCA-PRIMA-DI-ROMA-12J.md`). Prose is not authored yet.

## Content loading

`getContentBundle(storyId = "luca-a-roma")` returns a **story-scoped** bundle. Default no-arg call remains Luca for all existing screens.

Chapter identity is `(storyId, chapterId)`. Chapter number is not globally unique.

## Shared vs story-local entities

- **Shared:** global `characters.json` / `locations.json`. One Luca record for pre-Rome + Luca a Roma. Do not duplicate Luca.
- **Story-local:** optional files beside a story manifest (Elena). `mergeStoryEntities` keeps shared IDs on collision and appends new IDs.

## Progress

Keyed by `storyId` (`storia:progress:${storyId}`). Optional `narrativeArc` on the record. Completing `luca-prima-di-roma-01 / chapter-01` must never complete `luca-a-roma / chapter-01`.

No cross-story unlock rules yet.

## A1 domains

Chapter schema allows optional `primaryDomain` / `secondaryDomains`. Do not invent domains for existing Luca chapters.

## CEFR readiness

`evaluateLevelReadiness` still uses Luca a Roma chapter ranges (A1 = Ch1–20). That is **story progression for Luca**, not final A1 completion.

`collectA1ReadinessSignals` / `evaluateCrossStoryA1Readiness` expose future cross-story data only (`implemented: false`).

## Stories UI

`buildLearnerJourney()` is the data model (A1 pre-Rome + Luca 1–20, A1+ 21–24, A2 25–40). No visual redesign in 12I.

## Remaining after 12J (authoring+)

- Author 32 pre-Rome chapters per `docs/LUCA-PRIMA-DI-ROMA-12J.md` (still planned until complete)
- Append Pietralba cast/locations; do not edit Luca a Roma prose
- Wire Stories UI to journey groups
- Cross-story A1 readiness algorithm
- Optional cross-story unlock after pre-Rome → Rome
- Elena remains draft until a dedicated finish phase
