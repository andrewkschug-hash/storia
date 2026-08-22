# A2 stamina / CEFR curriculum audit (Ch 25–40)

**Date:** 2026-08-21  
**Scope:** Chapter prose progression only. **Lesson layer stays frozen.**  
**Inputs:** `scripts/a2-stamina-audit.cjs`, `scripts/a2-cefr-scores.ts`, Phase 10 blueprint, `docs/CEFR.md` (A2 ~400–700 words).

## Verdict (post-patch)

**Stamina patch applied** (`scripts/phase10-stamina-patch.cjs`): early A2 raised to ~380–420; Ch 25 opens with a short-PP ramp; Ch 32 / Ch 36 outliers split. Grammar staircase unchanged. Lessons / Speak / recaps untouched.

The **grammar staircase is working**. Remaining CEFR `TOO EASY` flags on 25–29 are from **familiar recycled vocabulary**, not broken past-tense teaching — do **not** chase the scorer with novelty.

| Band | Words (mean) | Avg sentence | New lemmas (mean) | Assessment |
|------|--------------|--------------|-------------------|------------|
| A1+ 21–24 | 252 | 6.4 | 32.8 | Frozen; present-tense bridge |
| A2 early 25–30 | **398** | ~8.9 | ~18 | Soft floor **~380+** after patch |
| A2 late 31–40 | 496 | ~10.8 | ~4.6 | On-band; consolidation |

### Early A2 length (post-patch)

| Ch | Words | Policy |
|----|-------|--------|
| 25 | 387 | Soft floor ~380–420 |
| 26 | 396 | Soft floor ~380–420 |
| 27 | 399 | Soft floor ~380–420 |
| 28 | 398 | Soft floor ~380–420 |
| 29 | 401 | Soft floor ~380–420 |
| 30 | 406 | Keep |
| 31 | 375 | Optional only; left unchanged |

Audit script still marks 25–28 as `LOW` vs the hard ~400 CEFR.md band; that is an **explicit soft-floor exception** for the early-A2 on-ramp after this patch.

## 24 → 25 transition (post-patch)

| Metric | Ch 24 | Ch 25 | Δ |
|--------|-------|-------|---|
| Words | 248 | 387 | +139 |
| Avg sentence | 6.4 | 8.2 | +1.8 |
| Max sentence | 10 | 16 | +6 |
| PP hits (heuristic) | ~1 | 35 | sharp rise |
| Imperfetto | 0 | 0 | OK (PP-only staircase) |

**Sequencing fix:** Ch 25 opener is now short PP → short PP → … before any ~15–16 word lines (not present-tense A1+ → long PP).

## Grammar progression vs blueprint

Matches Phase 10 staircase (unchanged):

| Ch | Intended | Observed |
|----|----------|----------|
| 25 | PP only | PP present; no imperfetto forms |
| 26 | PP sequencing | Chained `Poi/Dopo` + PP; no `se` |
| 27 | Imp recognition (≤2) | Cap respected (`ascoltava`, `era`) |
| 28 | Contrast | Imp + PP mixed |
| 29–30 | Context + `se` / plan language | Intact |
| 31–40 | Consolidation | Intact |

## Patch record

| Item | Status |
|------|--------|
| P0 Ch 25 soft PP ramp | Done |
| P1 Ch 25–29 → ~380–420 | Done |
| P2 Ch 32 26-word split | Done (`s24` / `s24b` / `s24c`) |
| P2 Ch 36 supporting 24-word split | Done (`s01` / `s01b` / `s01c`; speech untouched) |
| Ch 31 | Unchanged |
| Lessons / Speak / recaps | Untouched |

## Explicit non-goals (still)

- No lesson/grammar-note/Speak/recap edits.  
- No 21–24 edits.  
- No arc redesign.  
- No chasing CEFR scorer via rare vocabulary.

## Freeze checklist

- [x] Ch 25 opens with short PP before long lines  
- [x] Ch 25–30 each ≥ ~380 words (soft floor; 25–28 may show `LOW` vs hard 400 in audit)  
- [x] No accidental sentence > ~18–20 words outside intentional speech (max in 25–29 ≤16; Ch 32 max 17)  
- [x] Grammar staircase tests (`phase9.test.ts`) green  
- [x] Lesson layer untouched  
- [x] Human skim of 24→30 continuous read confirms softer entry  
- [x] **Curriculum freeze** (2026-08-21) → Phase 11 audio started 

## Artifact pointers

- Metrics JSON: `mobile/content/stories/luca-a-roma/A2-STAMINA-METRICS.json`  
- CEFR rows: `mobile/content/stories/luca-a-roma/A2-CEFR-AUDIT-20-40.json`  
- Patch script: `mobile/scripts/phase10-stamina-patch.cjs`  
- Readthrough: `mobile/content/stories/luca-a-roma/A2-READTHROUGH-25-40.txt` (`node scripts/regen-a2-readthrough.cjs`)  
- Regenerators: `node scripts/a2-stamina-audit.cjs`, `npx tsx scripts/a2-cefr-scores.ts`
