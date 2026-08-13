/**
 * Tiny Google Cloud TTS smoke test. Does not generate story audio.
 *
 *   cd services/tts-gateway
 *   npx tsx scripts/test-google-tts.ts
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loadGatewayEnv, providerConfigured } from '../src/env';
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
  const result = await tts.generateSpeech({
    text: 'Ciao, mi chiamo Luca. Vivo a Roma.',
    voiceId: voice.id,
    language: 'it-IT',
    speed: 'normal',
  });
  const out = join(process.cwd(), 'data', 'google-tts-smoke.mp3');
  writeFileSync(out, Buffer.from(result.audio));
  console.log(`Wrote ${out} (${result.audio.byteLength} bytes)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
