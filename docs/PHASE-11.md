# Phase 11 — A2 audio (Ch 25–40)

**Status:** generated + packaged 2026-08-21 (Chirp3). **Curriculum freeze verified** for pathway-gate work; human listen → freeze AUDIO CATALOG v2 when ready.  
**Prerequisite:** curriculum freeze (prose + stamina patch + lesson layer) — **done**.

## Scope

| Item | Rule |
|------|------|
| Chapters | **25–40 only** |
| Provider | Google Chirp3 HD (same roster as Ch 1–24) |
| Do not touch | Ch **1–24** catalog assets, voices, or packaging |
| Source of truth | Authored chapter JSON (not `story.js` / `a2/build.js`) |

## Run record (2026-08-21)

| Step | Result |
|------|--------|
| Generate | `767/767` clips, 0 failures (`--from=25 --to=40 --generate`) |
| Package | Merged 767 into `catalog.json`; A1 `295` preserved |
| Validate | Production ready — 733 standard + 34 extended |

## Commands

```bash
# Preflight (no TTS)
node mobile/scripts/generate-a2-audio.js --from=25 --to=40

# Generate via gateway
node mobile/scripts/generate-a2-audio.js --from=25 --to=40 --generate

# Merge into catalog (never replaces Ch 1–20)
node mobile/scripts/package-a2-audio.js --from=25 --to=40

# Validate
node mobile/scripts/validate-a2-audio.js --from=25 --to=40
```

## Freeze note

After human listen spot-check, mark AUDIO CATALOG v2 (25–40) frozen in `voices.json` / `docs/TTS.md`. Until then, regenerate only for pronunciation or content defects in 25–40.
