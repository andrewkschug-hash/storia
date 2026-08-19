# Storibase

Story-driven Italian reading app. Teach Italian through progressive, understandable stories — not flashcards-first drills.

See [ARCHITECTURE.md](./ARCHITECTURE.md), [docs/TTS.md](./docs/TTS.md), and [docs/CEFR.md](./docs/CEFR.md).

## Run (Phase 1)

```bash
cd mobile
npm start
# then press `w` for web, or scan with Expo Go
```

## Supabase accounts

Use a **dedicated Storibase** Supabase project (not the fragrance database).

1. Copy `mobile/.env.example` → `mobile/.env`
2. Paste **Project URL** + **anon/publishable key** from Supabase → Project Settings → API
3. In the Storibase project SQL editor, run `supabase/migrations/20260813_storia_profiles.sql`, then `supabase/migrations/20260813_storia_profile_avatar.sql`
4. Auth → Providers → Email: enable Email. For local/Vercel testing, you can turn **off** “Confirm email”
5. Auth → URL Configuration: add `storibase://` and your Vercel URL (e.g. `https://your-app.vercel.app`)
6. On Vercel, set the same `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (needed at **build** time)

Restart Expo after changing `.env`.

## Phase status

- [x] Phase 0 — Architecture
- [x] Phase 1 — App shell, Home, Stories, Reader
- [x] Phase 2 — Full 20-chapter data model + progress
- [x] Phase 2.1 — Content quality pass
- [x] Phase 3 — Tap-word / phrase comprehension
- [x] Phase 4 — Comprehension questions
- [x] Phase 5 — Vocabulary review
- [x] Phase 6 — Adaptive vocabulary engine
- [x] Phase 7 — Multi-provider TTS + Voice Lab
- [x] Phase 8 — CEFR leveling + story progression
- [x] Phase 9 — Polish / onboarding / A1 audio shipping — **FROZEN**

Phase 9 exit (frozen): first-run account + onboarding, A1 audio packaged for Ch 1–20, natural chapter pacing (0.9× + inter-sentence gaps), A1+ bridge Ch 21–24, English scaffolding fade, Italian recap anchors, optional review nudge, A1→A1+/A2 readiness UI. Do not expand A2 until Phase 10.

### Next (not started)

- **Phase 10** — Audit/rewrite A2 Ch 25–40 as a cohesive arc (longer, more interesting; gradual stamina)
- **Phase 11** — A2 audio + production only after A2 text is finalized
- **Phase 12+** — Reading UX polish, smarter vocabulary encounters, then B1+

### Content tooling

```bash
cd mobile
npm run content:validate   # load + vocab + CEFR audit
npm run content:build      # regenerate chapter JSON from scripts
npm run audio:check-a1     # A1 audio preflight
npm run audio:generate-a1  # generate via TTS gateway (voices already assigned)
npm run audio:package-a1   # copy into content/audio/bundled + catalog.json
npm run audio:validate-a1  # A1 AUDIO PRODUCTION READY
npm test
npm run typecheck
```

TTS gateway (keys stay here; never in the Expo app):

```bash
cd services/tts-gateway
copy .env.example .env
npm start              # http://127.0.0.1:8787
```

Then Home → **Voice Lab** (developer account or `__DEV__`): Load Italian Voices → Preview → Use for Luca / Sofia / Narrator. You never type a voice ID. See [docs/TTS.md](./docs/TTS.md).
