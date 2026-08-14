/**
 * Tiny Google Cloud TTS smoke test. Does not generate story audio.
 *
 *   cd services/tts-gateway
 *   npx tsx scripts/test-google-tts.ts
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loadGatewayEnv, providerConfigured } from '../src/env';
import {
  countBillableCharacters,
  evaluateGoogleTtsGuard,
  loadPricingFile,
  parseHardLimit,
  runtimeGuardInputs,
  withGoogleApiPermit,
} from '../src/googleTtsGuard';
import { GoogleTTSProvider } from '../src/providers';

loadGatewayEnv();

async function main() {
  if (!providerConfigured('google')) {
    throw new Error(
      'Google TTS is not configured. Run gcloud auth application-default login and set GOOGLE_CLOUD_PROJECT.',
    );
  }
  const tts = new GoogleTTSProvider(process.env);
  const voices = await tts.listVoices('it-IT');
  if (voices.length === 0) throw new Error('No Italian Google voices returned.');
  const voice = voices[0];
  console.log(`Voices: ${voices.length}`);
  console.log(`Using: ${voice.displayName ?? voice.name} (${voice.id})`);
  const sample = 'Ciao, mi chiamo Luca. Vivo a Roma.';
  const counted = countBillableCharacters(sample);
  if (!counted.ok) throw new Error(counted.error);
  const runtime = runtimeGuardInputs();
  const pricing = loadPricingFile();
  const limit = parseHardLimit(process.env.GOOGLE_TTS_HARD_LIMIT_CHARS);
  const evaluation = evaluateGoogleTtsGuard({
    planned: [
      {
        storyId: 'smoke',
        chapterId: 'smoke',
        sentenceId: 's01',
        logicalVoice: 'narrator',
        googleVoiceId: voice.id,
        language: 'it-IT',
        text: sample,
        generationSpeed: 'normal',
        generationVersion: 1,
        outputFilename: 'smoke',
        estimatedBillableCharacters: counted.chars,
        action: 'generate',
      },
    ],
    pricing,
    hardLimitChars: limit.ok ? limit.chars : runtime.hardLimitChars,
    trackedUsage: runtime.trackedUsage,
    providerConfigured: true,
    now: runtime.now,
  });
  if (!evaluation.allowed) throw new Error(evaluation.error);
  const result = await withGoogleApiPermit(evaluation, () =>
    tts.generateSpeech({
      text: sample,
      voiceId: voice.id,
      language: 'it-IT',
      speed: 'normal',
    }),
  );
  const out = join(process.cwd(), 'data', 'google-tts-smoke.mp3');
  writeFileSync(out, Buffer.from(result.audio));
  console.log(`Wrote ${out} (${result.audio.byteLength} bytes)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
