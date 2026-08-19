# Storibase TTS Architecture

Italian audio is pregenerated, reviewed, and stored. The reader never calls a TTS vendor, never uses browser/phone speech synthesis, and never autoplays.

Primary loop: **READ → HEAR → UNDERSTAND → CONTINUE**. Reading stays primary. Audio is optional support.

## Beginner setup (start here)

You do **not** need ElevenLabs / Azure / Google voice IDs. Voice Lab shows names like “Antonio”.

Two processes:

1. **The app** — Expo, usually `http://localhost:8083`
2. **The TTS gateway** — a tiny local server at `http://127.0.0.1:8787` that holds API keys

```
App  →  TTS gateway  →  ElevenLabs  →  Italian audio  →  App
```

### 1. Start the gateway

```bash
cd services/tts-gateway
copy .env.example .env
npm start
```

On macOS/Linux use `cp .env.example .env`. Wait for:

`Storibase TTS gateway on http://127.0.0.1:8787`

### 2. Add an ElevenLabs API key

Either:

- Open Voice Lab and paste the key (it is written only to `services/tts-gateway/.env`), or
- Edit `services/tts-gateway/.env` and set `ELEVENLABS_API_KEY=...` then restart `npm start`

The key must include **voices_read** (or be unrestricted). Scoped keys without that permission return 401 in Voice Lab even when the key is otherwise valid.

Do **not** put the key in the Expo app.

### Google Cloud TTS (local ADC)

After ElevenLabs quota is a problem, use the Storibase TTS Google Cloud project:

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_STORIBASE_TTS_PROJECT_ID
```

Then in `services/tts-gateway/.env`:

```
GOOGLE_CLOUD_PROJECT=YOUR_STORIBASE_TTS_PROJECT_ID
```

Restart the gateway. Voice Lab should show **Google: Cloud TTS ready**. Do not paste a service-account JSON into the repo. Skip generating the A2 library until a tiny Italian preview sounds right.

### 3. Voice Lab

Home → **Voice Lab** (dev only)

1. Confirm **TTS Gateway: Connected** and **ElevenLabs: API configured**
2. **Test ElevenLabs**
3. **Load Italian Voices**
4. Type a sample such as `Ciao, mi chiamo Luca. Vivo a Roma.`
5. **Preview** a speaker
6. **Use for…** → Luca / Sofia / Narrator (and the others when ready)

The provider’s internal ID is stored automatically. It is never shown in the UI.

Do **not** generate the 20-chapter library yet. After the three core voices are locked, use Audio studio for a handful of sentences from chapters 1, 5, 10, and 20.

## 1. TTSProvider

```ts
interface TTSProvider {
  readonly id: "elevenlabs" | "azure" | "google";
  listVoices(language?: string): Promise<VoiceInfo[]>;
  generateSpeech(req: {
    text: string;
    voiceId: string;
    language: "it-IT";
    speed: "normal" | "slow";
  }): Promise<{ audio: ArrayBuffer; format: "mp3" | "wav" | "ogg"; provider; cacheKey }>;
}
```

Implementations live only on the gateway:

- `ElevenLabsTTSProvider`
- `AzureTTSProvider`
- `GoogleTTSProvider`

The mobile app talks to `TtsGatewayClient`. Changing `TTS_PROVIDER` does not require Reader changes.

## 2. Security

Credentials stay in `services/tts-gateway` environment variables:

- `ELEVENLABS_API_KEY`
- `AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION`
- `GOOGLE_CLOUD_PROJECT` (Application Default Credentials; preferred)
- `GOOGLE_TTS_API_KEY` (optional fallback only)
- `TTS_PROVIDER` (default `elevenlabs`)

- `GOOGLE_TTS_HARD_LIMIT_CHARS` (required local safety ceiling; do not set this to Google’s full free allowance)

Never put keys in the Expo bundle. The client only receives approved audio URLs or cache keys. See `services/tts-gateway/.env.example`.

## 2b. Google TTS cost guard

Every Google `generateSpeech` call requires a preflight permit. Scripts default to `--dry-run`.

Billable characters: Unicode code points (`Array.from(text).length`) of the exact `input.text` sent to Cloud TTS. Whitespace and punctuation count. Storibase does not send SSML. Pricing and free-allowance figures live only in `services/tts-gateway/config/google-tts-pricing.json`. Local usage is `services/tts-gateway/data/google-tts-usage.json` (updated only after a successful generate). The hard limit is independent of Google’s quota.

```
npx tsx services/tts-gateway/scripts/google-tts-preflight.ts --target=a1 --from=1 --to=20 --dry-run
```


## 3. Pipeline

Story content → speaker assignment → TTS provider → voice → generate → human review → approve → store → Reader plays stored audio.

Do **not** call a provider when the learner presses Play.

Do **not** generate the full 20-chapter library until Voice Lab has locked:

1. one male voice (Luca)
2. one female voice (Sofia)
3. one narrator

Then generate a handful of sentences from chapters 1, 5, 10, and 20 and listen back-to-back before batching.

## 4. Cache key / versioning

```
provider | voiceId | language | speed | text | generationVersion
```

Changed text produces a new key. Adaptive variants therefore cannot reuse the wrong clip. Slow (`0.75x`) audio is a separate approved asset, not a pitch shift.

Unchanged approved/review-required clips are not regenerated unless `regenerate: true`.

## 5. Character voices

Persistent assignments live in `mobile/content/audio/voices.json`.

Luca, Sofia, Marco, Giulia, Nonna Rosa, Narrator, and Padrone each have `provider`, `voiceId`, `language: it-IT`, and `speakingStyle`.

`speakerId: null` resolves to `narrator`. A character's voice does not change between chapters unless an administrator edits the roster.

## 6. Reader UX

- Small ▶ / ❚❚ on sentences that have **approved** audio
- Highlight the sentence being spoken; word taps still open the dictionary
- Replay the current sentence
- Optional **Listen** plays the chapter in story order, switching voices automatically
- Speed toggle `1.0×` / `0.75×`
- No autoplay
- Missing or failed audio never breaks reading and never falls back to a browser voice

Dictionary 🔊 plays cached word or phrase pronunciation. Phrases play as a natural phrase (`Ha fame.`), not per-word synthesis.

## 7. Dev tools

- Voice Lab: `/voice-lab` (`__DEV__`) — load Italian voices by name, preview, assign to characters
- Setup: `GET /v1/tts/status`, `GET /v1/tts/test`, `POST /v1/tts/setup`, `POST /v1/tts/assignments`
- Audio studio: `/audio-studio` (`__DEV__`) — generate / play / regenerate / approve / reject; generate a chapter without auto-approving

Gateway (from `services/tts-gateway`):

```
GET  /health
GET  /v1/tts/status
GET  /v1/tts/test?provider=
POST /v1/tts/setup
GET  /v1/tts/voices?provider=
GET  /v1/tts/assignments
POST /v1/tts/assignments
POST /v1/tts/generate
POST /v1/tts/batch
GET  /v1/tts/assets
GET  /v1/tts/audio/:cacheKey
POST /v1/tts/assets/:id/approve
POST /v1/tts/assets/:id/reject
```

Start with `npm start` in `services/tts-gateway` (binds to `127.0.0.1` by default). The reader app talks to the gateway only in development builds (`http://127.0.0.1:8787`); production builds do not use a client-side gateway URL. Authoring scripts may still set `EXPO_PUBLIC_TTS_GATEWAY_URL` locally.

## 8. Statuses

`not_generated` → `generating` → `generated` → `review_required` → `approved` | `failed`

Only `approved` assets are playable in the Reader.
