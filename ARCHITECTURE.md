# Storibase — Architecture

**Product:** Story-driven Italian reading engine  
**Stack:** Expo (React Native) + TypeScript · Expo Router · Zustand · SQLite · JSON content · Node TTS gateway  
**Root:** `C:\Users\aksch\Code\storia`

---

## 1. Current state

Greenfield. No prior app code. Flutter and Node are available on the machine; Expo was chosen for:

- Mobile-first UI with web preview during development
- Shared TypeScript types across app + TTS backend
- Fast iteration on reading/typography UX
- Straightforward dark/light theming

---

## 2. Folder structure

```
storia/
├── apps/
│   └── mobile/                 # Expo app (primary client)
│       ├── app/                # Expo Router screens
│       │   ├── (tabs)/         # Home, Stories, Vocabulary
│       │   ├── reader/[chapterId].tsx
│       │   ├── comprehension/[chapterId].tsx
│       │   ├── review/[chapterId].tsx
│       │   └── _dev/voice-lab.tsx   # DEV ONLY
│       ├── src/
│       │   ├── components/     # Reader, WordPanel, AudioBar, …
│       │   ├── features/       # home, reader, vocabulary, audio, grammar
│       │   ├── theme/          # colors, typography, spacing
│       │   ├── hooks/
│       │   └── lib/            # storage, analytics stubs
│       └── assets/
├── packages/
│   ├── content/                # Story JSON + vocabulary lexicon (data-driven)
│   │   ├── stories/
│   │   ├── characters/
│   │   ├── vocabulary/
│   │   └── grammar/
│   ├── domain/                 # Shared TypeScript models + pure engines
│   │   ├── models/
│   │   ├── vocabulary/         # familiarity scoring, controlled vocab
│   │   ├── repetition/
│   │   └── audio/              # TTSProvider interface, cache keys (no secrets)
│   └── ui-tokens/              # Shared design tokens (optional)
├── services/
│   └── tts-gateway/            # Secure backend for TTS (keys stay here)
│       ├── src/providers/      # ElevenLabs, Azure, Google
│       ├── src/cache/
│       └── src/routes/
├── docs/                       # Audio pipeline, Voice Lab, approval workflow
└── ARCHITECTURE.md
```

MVP may flatten to a single Expo app with `content/` and `src/domain/` inside the app, then extract packages when needed. Prefer clean boundaries from day one even if files live under `apps/mobile` initially.

**Initial (Phase 1–2) layout inside Expo app:**

```
apps/mobile/
  app/                    # navigation / screens
  src/
    components/
    domain/               # models + engines
    content/              # bundled story JSON (later: remote CMS)
    services/             # progress, audio client (calls gateway)
    store/                # Zustand
    theme/
```

---

## 3. Data models

```ts
// Identity
User { id, displayName, createdAt, settings: UserSettings }

// Story universe
Character {
  id, name, gender, ageDescription,
  voice: { provider: TTSProviderId, voiceId, language: "it-IT", speakingStyle }
}
Location { id, name, city?, description }
StoryEvent { id, storyId, chapterId, characterIds, summary, rememberedFacts[] }

Story {
  id, title, slug, level: 1|2|3|4,
  characterIds, synopsis, chapterIds[], status
}

Chapter {
  id, storyId, number, title, titleIt,
  difficultyLevel, targetNewWordCount,
  paragraphIds[], comprehensionQuestionIds[],
  estimatedWordCount
}

Paragraph { id, chapterId, order, sentenceIds[] }

Sentence {
  id, paragraphId, order,
  text,                    // raw Italian
  speakerId: string | null, // null = narrator
  kind: "narration" | "dialogue",
  tokens: Token[],         // words + phrase spans
  audio?: SentenceAudio
}

Token {
  surface,                 // "cammina"
  lemmaId?,                // → VocabularyEntry
  start, end,              // char offsets
  isPhraseAnchor?: boolean
}

Phrase {
  id, chapterId, surface,   // "ha fame"
  literalEn, naturalEn,
  tokenRange: [start, end]
}

VocabularyEntry {
  id, italian, english, lemma, pos,
  difficulty, frequency,
  introducedChapterId?,
  inflections?: string[]
}

UserVocabularyProgress {
  userId, lemmaId,
  state: "new" | "introduced" | "learning" | "familiar" | "mastered",
  encounterCount, tapCount, lastEncounteredAt,
  familiarityScore,        // 0–1, reading-weighted
  introducedChapterId?
}

ComprehensionQuestion {
  id, chapterId, promptEn,
  choices: { id, text, correct }[],
  testsUnderstandingOf?: string[]  // lemma ids / plot beats
}

ReadingSession {
  id, userId, chapterId,
  startedAt, endedAt?,
  scrollOffset?, lastSentenceId?,
  wordsEncountered, readingTimeMs,
  comprehensionScore?
}

GrammarPattern {
  id, nameIt, nameEn, explanationShort,
  exampleForms: string[],
  encounterThreshold,   // show only after N natural exposures
  relatedLemmaIds[]
}

SentenceAudio {
  sentenceId,
  provider, voiceId, language, speed: "normal" | "slow",
  status: "not_generated" | "generating" | "generated" | "review_required" | "approved" | "failed",
  cacheKey, uri?, version
}
```

---

## 4. Navigation architecture

**Expo Router (file-based)**

```
(tabs)
  index          → Home (Continue Reading, progress, streak)
  stories        → Story list / chapter list
  vocabulary     → Soft progress overview (not flashcards)
reader/[chapterId]           → Story reader (primary)
comprehension/[chapterId]    → Post-chapter questions
review/[chapterId]           → Light vocab review
settings                     → Theme, etc.
_dev/voice-lab               → DEV ONLY (hidden from prod builds)
```

Flow: **Home → Continue → Reader → (tap words) → Comprehension → Review → next chapter**

Reader stays uncluttered; word panel is a bottom sheet; audio bar is minimal.

---

## 5. Story content storage

- **Source of truth:** structured JSON under `src/content/stories/` (bundled for MVP).
- One file per chapter (or one story manifest + chapter files).
- Schema validated with Zod at load time.
- UI never hard-codes narrative text.
- Future: CMS / remote packs; same schema.

Example chapter shape:

```json
{
  "id": "roma-01",
  "number": 1,
  "title": "Arrivo a Roma",
  "paragraphs": [
    {
      "sentences": [
        {
          "id": "roma-01-s01",
          "speaker": null,
          "text": "Luca è a Roma.",
          "phrases": [{ "surface": "è a", "literalEn": "is at", "naturalEn": "is in" }]
        }
      ]
    }
  ],
  "questions": [ ... ]
}
```

Tokenizer runs at build/load to attach lemma IDs from the lexicon.

---

## 6. Vocabulary progress tracking

1. On sentence visible / chapter read → increment `encounterCount` for each lemma (debounced).
2. On word tap → increment `tapCount`; show panel; does **not** punish.
3. Familiarity score = weighted function of encounters, taps, recency, comprehension success.
4. State transitions (exposure-heavy, no forced quizzes):

| State       | Rule (initial)                          |
|-------------|-----------------------------------------|
| new         | never seen                              |
| introduced  | 1–2 encounters                          |
| learning    | 3–8 encounters or frequent taps         |
| familiar    | high exposure, low tap rate recently    |
| mastered    | sustained recognition over time         |

Persisted in **SQLite** (`expo-sqlite`) via a progress repository. Adaptive engine (Phase 6) reads these states to bias future chapter selection / generation—not to warp prose unnaturally.

---

## 7. Audio / multi-provider TTS

Pregenerated, reviewed Italian audio. Reader never calls a vendor and never uses browser TTS.

```ts
interface TTSProvider {
  readonly id: "elevenlabs" | "azure" | "google";
  listVoices(language?: string): Promise<VoiceInfo[]>;
  generateSpeech(req: {
    text: string;
    voiceId: string;
    language: "it-IT";
    speed: "normal" | "slow";
  }): Promise<{ audio: ArrayBuffer; format: "mp3" | "wav" | "ogg"; cacheKey: string }>;
}
```

- Implementations: `ElevenLabsTTSProvider`, `AzureTTSProvider`, `GoogleTTSProvider` in `services/tts-gateway`.
- Mobile app talks only to **tts-gateway** (`TtsGatewayClient`). Keys never ship in the client.
- Character voices are data (`mobile/content/audio/voices.json`); sentences store `speakerId` plus optional `audioAssetId`.
- Cache key: `provider|voiceId|language|speed|text|generationVersion`.
- Pipeline: generate → review → approve → Reader plays stored assets.
- On missing/failed audio: hide ▶, keep text; **no browser-voice fallback**.
- Voice Lab `/voice-lab` and Audio studio `/audio-studio` are `__DEV__` only.
- Do not batch all 20 chapters until Voice Lab locks male / female / narrator voices.

Full detail: `docs/TTS.md`.

---

## 8. Architectural risks

| Risk | Mitigation |
|------|------------|
| Scope creep into flashcards/grammar-first | Phase gates; reader remains primary screen |
| 20 chapters × 300–600 words = large content effort | Early chapters shorter; controlled vocab lists; content package separate from UI |
| Italian morphology (lemma mapping) | Explicit inflection lists + light tokenizer; improve iteratively |
| TTS cost / latency | Pre-generate + cache; free-tier Voice Lab; never TTS from client keys |
| Provider lock-in | TTSProvider interface; character voice as data |
| Offline reading + audio | SQLite + file cache; offline audio optional V1 |
| Monolithic reader component | Split: ReaderText, SentenceRow, WordPanel, AudioControls, ProgressHeader |

---

## 9. Phased implementation plan

| Phase | Deliverable | Exit criteria |
|-------|-------------|---------------|
| **0** | Architecture (this doc) | Agreed structure |
| **1** | App shell, nav, Home, Stories, Reader (placeholder content) | Runs on device/web; dark/light |
| **2** | Domain models, 20-chapter arc data, progress resume | Data-driven chapters; resume works |
| **3** | Tap-word panel + vocabulary tracking | Tap → panel; states update |
| **4** | Comprehension questions | 2–5 Qs after chapter |
| **5** | Vocabulary review screen | Light post-chapter review |
| **6** | Adaptive / controlled vocab engine | Chapter composition respects known/learning/new mix |
| **7** | TTS gateway + cache + reader audio + Voice Lab | Provider-swappable; character voices; no keys in app |
| **8** | CEFR leveling + story arcs | Measurable difficulty; gradual A1→C1; no locks |
| **9** | Polish, onboarding, retention | Calm motion; no gamification clutter |

**Rule:** Do not advance if the current phase is broken.

---

## 10. Design language (UI)

- Calm, literary, premium digital reader
- Expressive serif for titles; highly readable sans for body
- Soft atmospheric backgrounds (not flat white / not purple-gamified)
- Subtle progress only; no coins/hearts/confetti
- Large type, generous leading, comfortable margins
- Full dark / light support; Dynamic Type–friendly sizes

---

## Product north star

> Read → Hear → Understand → Continue

Everything else exists to make reading Italian easier and more compelling.
