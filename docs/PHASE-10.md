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
| 1–20 | A1 | Stable; rebuild via `build-chapters.js` (preserves ch > 20). **Audio catalog v1 frozen** (Chirp3). |
| 21–24 | A1+ | **Frozen** prose — no regeneration / rewrite; continuity-only repairs for named defects only. **Audio catalog v1 frozen** (Chirp3). |
| 25–40 | A2 | **CURRICULUM FROZEN (2026-08-21).** Text-locked + stamina patch locked. No prose edits except tagged defects. **Phase 11 audio packaged** (Chirp3; 767 clips; Ch 1–24 assets untouched). Human listen → freeze AUDIO CATALOG v2. Do **not** regenerate via `a2/build.js` without an explicit unlock. |

## Generator guards

| Script | Writes | Guard |
|--------|--------|-------|
| `build-a1plus-bridge.js` | ch 21–24 + EN/adaptive | Requires `--force` |
| `a2/build.js` | ch 25–40 + EN/adaptive | Requires `--force` |
| `a2/verify-production.ts` | nothing (read-only) | Safe |

## Execution order

1. **10A** — SOT, guards, artifact reconciliation (no ch 21–24 prose)
2. **10C** — Rewrite ch 25–30 (grammar staircase), then targeted 31–40 edits — **staircase + Speak-27 + Ch39/40 MINOR applied (2026-08-21)**
3. **Text-lock polish** — applied 2026-08-21 (calendar, naturalness, Ch40 Friday→Monday epilogue).
4. **Text lock** — **DONE 2026-08-21.** Ch 25–40 authored prose locked (human continuous read-through + ending confirmation). No casual prose edits.
4b. **Stamina patch** — **DONE 2026-08-21.** Early-A2 length + Ch 25 soft PP sequencing + sentence outliers (see `docs/A2-STAMINA-CEFR-AUDIT.md`). Lessons untouched.
5. **Lesson-layer freeze** — **DONE 2026-08-21.** Grammar notes, word-recap policy, and Speak scenes frozen (484/484). Continuity-only / named-defect repairs only. Do **not** reopen architecture or style polish.
6. **Curriculum freeze → Phase 11** — **CURRICULUM FROZEN 2026-08-21.** Ch 25–40 prose frozen. Phase 11 Chirp3 audio **generated + packaged** (767 clips; Ch 1–24 untouched). Remaining: human listen spot-check → freeze AUDIO CATALOG v2.

## Lesson layer — FROZEN (2026-08-21)

| Asset | Path / source | Status |
|-------|----------------|--------|
| Grammar notes 1–40 | `mobile/src/content/lessonBatches.ts` (`GRAMMAR_BY_BATCH`) | **Frozen** |
| Word recaps | `ReviewService.createBatchSession` / backfill policy | **Frozen** |
| Speak scenes | `mobile/content/stories/luca-a-roma/speak-scenes.json` | **Frozen** |
| LLM export snapshot | `mobile/content/stories/luca-a-roma/LLM-LESSONS-GRAMMAR-RECAP-SPEAK.txt` | Regenerable snapshot only |

**Freeze rules**

- Do **not** reopen lesson architecture, grammar-batch structure, or Speak design for style.
- Patch only tagged **bug** findings (objectively wrong/broken). Tags: `bug` / `CEFR` / `alignment` / `pedagogy` / `speak` / `recap`.
- Stylistic preferences do **not** trigger changes.
- Lessons support the text that exists; they do **not** compensate for chapter stamina / CEFR cliff. That is a separate curriculum workstream.

Do **not** start Chapter 25 prose until 10A verifies green.

## Blueprint v1 (locked)

- **25–30:** major rewrite — PP only → PP sequencing → imperfetto recognition → contrast → context → established contrast
- **31–40:** mostly KEEP; minor 35/39; ch 40 consolidation (no A2 inflation)
- **Speak-27:** approved (short opinion scene) — implement during 10C
- **Loop lemmas:** primary vocabulary design metric
- **Do Not Introduce** constraints per chapter 25–30 (see Blueprint v1 approval)

## Terminology

“Past tense begins in Chapter 25” means the first **deliberate learner-facing teaching** of passato prossimo — not that no past-looking form may appear in metadata or unavoidable derived artifacts.
