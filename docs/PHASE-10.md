# Phase 10 — A2 rewrite workflow

Blueprint v1 is **locked**. Past-tense **teaching** begins in Chapter 25 (passato prossimo). Chapters 21–24 are **frozen** (no prose changes).

## Source-of-truth hierarchy

```
Authored chapter JSON   content/stories/luca-a-roma/chapters/chapter-*.json
        ↓
Runtime bundle          getContentBundle() / loadContentBundle()
        ↓
Derived artifacts       sentence-english.json, production-exercises.json,
                        speak-scenes.json, adaptive-variants.json, comprehension (in chapter JSON)
        ↓
Tests & audits          vitest, validate-content.ts, a2/verify-production.ts
```

**Canonical SOT:** authored chapter JSON on disk.  
**Not SOT:** `scripts/a2/story.js`, `scripts/a2/story-*.js`, `scripts/chapters-a1plus-21-24.js` (generator inputs / legacy drafts only).

## Frozen ranges

| Range | Level | Status |
|-------|-------|--------|
| 1–20 | A1 | Stable; rebuild via `build-chapters.js` (preserves ch > 20) |
| 21–24 | A1+ | **Frozen** — do not regenerate without `--force` |
| 25–40 | A2 | Rewrite target (Blueprint v1); regenerate only via `a2/build.js --force` |

## Generator guards

| Script | Writes | Guard |
|--------|--------|-------|
| `build-a1plus-bridge.js` | ch 21–24 + EN/adaptive | Requires `--force` |
| `a2/build.js` | ch 25–40 + EN/adaptive | Requires `--force` |
| `a2/verify-production.ts` | nothing (read-only) | Safe |

## Execution order

1. **10A** — SOT, guards, artifact reconciliation (no ch 21–24 prose)
2. **10C** — Rewrite ch 25–30 (grammar staircase), then targeted 31–40 edits
3. **Text lock** — full A2 audit
4. **Phase 11** — A2 audio

Do **not** start Chapter 25 prose until 10A verifies green.

## Blueprint v1 (locked)

- **25–30:** major rewrite — PP only → PP sequencing → imperfetto recognition → contrast → context → established contrast
- **31–40:** mostly KEEP; minor 35/39; ch 40 consolidation (no A2 inflation)
- **Speak-27:** approved (short opinion scene) — implement during 10C
- **Loop lemmas:** primary vocabulary design metric
- **Do Not Introduce** constraints per chapter 25–30 (see Blueprint v1 approval)

## Terminology

“Past tense begins in Chapter 25” means the first **deliberate learner-facing teaching** of passato prossimo — not that no past-looking form may appear in metadata or unavoidable derived artifacts.
