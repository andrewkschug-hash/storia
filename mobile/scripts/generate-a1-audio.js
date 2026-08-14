/**
 * Generate production A1 sentence audio (chapters 1–20) via the TTS gateway.
 *
 * Prerequisites:
 *   1. Voice Lab: Load voices → preview → assign characters
 *   2. Gateway running with configured provider
 *   3. Preflight passes: node mobile/scripts/check-a1-audio.js
 *
 * Usage:
 *   node mobile/scripts/generate-a1-audio.js
 *   node mobile/scripts/generate-a1-audio.js --chapter=1
 *   node mobile/scripts/generate-a1-audio.js --from=1 --to=5
 *   node mobile/scripts/generate-a1-audio.js --generate
 *
 * Default is a Google TTS dry-run / cost-guard preflight. No audio is generated
 * unless --generate is passed AND the guard allows it.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..', '..');
const mobileRoot = path.join(__dirname, '..');
const contentRoot = path.join(mobileRoot, 'content');
const storyPath = path.join(contentRoot, 'stories', 'luca-a-roma');
const chaptersDir = path.join(storyPath, 'chapters');
const voicesPath = path.join(contentRoot, 'audio', 'voices.json');
const GATEWAY = process.env.EXPO_PUBLIC_TTS_GATEWAY_URL || 'http://127.0.0.1:8787';

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function resolveSpeakerId(speakerId) {
  if (!speakerId || speakerId === 'narrator') return 'narrator';
  return speakerId;
}

const { isPlaceholder, resolveSpeakerVoice } = require('./voice-roster-common');

function parseArgs(argv) {
  let from = 1;
  let to = 20;
  let generate = false;
  for (const arg of argv) {
    if (arg === '--generate') generate = true;
    else if (arg.startsWith('--chapter=')) {
      const n = Number(arg.slice('--chapter='.length));
      from = n;
      to = n;
    } else if (arg.startsWith('--from=')) {
      from = Number(arg.slice('--from='.length));
    } else if (arg.startsWith('--to=')) {
      to = Number(arg.slice('--to='.length));
    }
  }
  return { from: Math.max(1, from), to: Math.min(20, to), generate };
}

function runGoogleCostGuard(from, to) {
  const gatewayRoot = path.join(root, 'services', 'tts-gateway');
  const result = spawnSync(
    'npx',
    ['tsx', 'scripts/google-tts-preflight.ts', '--target=a1', `--from=${from}`, `--to=${to}`, '--dry-run'],
    { stdio: 'inherit', cwd: gatewayRoot, shell: true },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function gatewayJson(pathname, init) {
  const res = await fetch(`${GATEWAY.replace(/\/$/, '')}${pathname}`, init);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text };
  }
  if (!res.ok) throw new Error(data.error || `${pathname} → ${res.status}`);
  return data;
}

async function main() {
  const { from, to, generate } = parseArgs(process.argv.slice(2));
  console.log(`A1 AUDIO GENERATION — chapters ${from}–${to}\n`);
  runGoogleCostGuard(from, to);
  if (!generate) {
    console.log('\nDefault is dry-run. No Google TTS requests were made. No audio files generated.');
    console.log('To generate later (guarded): node mobile/scripts/generate-a1-audio.js --from=' + from + ' --to=' + to + ' --generate');
    process.exit(0);
  }

  const status = await gatewayJson('/v1/tts/status');
  if (!status.ok || !status.providers?.[status.provider]?.configured) {
    throw new Error(`Gateway provider ${status.provider} is not configured`);
  }
  console.log(`Provider: ${status.provider}`);

  const assign = await gatewayJson('/v1/tts/assignments');
  const roster = assign.roster ?? loadJson(voicesPath);
  const voiceNames = {};
  for (const id of Object.keys(roster.logicalVoices ?? roster.characters ?? {})) {
    const voice = resolveSpeakerVoice(roster, id);
    if (voice?.voiceName) voiceNames[id] = voice.voiceName;
  }
  console.log(
    'Voice assignments:',
    Object.entries(voiceNames)
      .map(([id, name]) => `${id}=${name}`)
      .join(', '),
  );

  const manifest = loadJson(path.join(storyPath, 'manifest.json'));
  const adaptive = loadJson(path.join(storyPath, 'adaptive-variants.json'));
  const adaptiveSentences = adaptive.sentences ?? {};
  let generated = 0;
  let failed = 0;
  const errors = [];

  for (let n = from; n <= to; n += 1) {
    const summary = manifest.chapters.find((c) => c.number === n);
    if (!summary) throw new Error(`Missing chapter ${n} in manifest`);
    const chapter = loadJson(path.join(chaptersDir, summary.file));
    const sentences = chapter.paragraphs.flatMap((p) => p.sentences);
    const payloads = [];

    for (const sentence of sentences) {
      const speakerId = resolveSpeakerId(sentence.speakerId);
      const voice = resolveSpeakerVoice(roster, speakerId);
      if (!voice) {
        throw new Error(`No production voice assigned for ${speakerId}`);
      }
      payloads.push({
        text: sentence.text,
        voiceId: voice.voiceId,
        speakerId,
        contentId: `sentence:${chapter.id}:${sentence.id}:standard`,
        speed: 'normal',
        provider: voice.provider || status.provider,
        regenerate: false,
      });

      // Adaptive variants share the same speaker; audio must match displayed text.
      const overlay = adaptiveSentences[`${chapter.id}:${sentence.id}`];
      for (const variant of overlay?.variants ?? []) {
        if (!variant?.text || !variant?.id) continue;
        payloads.push({
          text: variant.text,
          voiceId: voice.voiceId,
          speakerId,
          contentId: `sentence:${chapter.id}:${sentence.id}:${variant.id}`,
          speed: 'normal',
          provider: voice.provider || status.provider,
          regenerate: false,
        });
      }
    }

    process.stdout.write(`Chapter ${n} (${payloads.length} clips)… `);
    const result = await gatewayJson('/v1/tts/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId: chapter.id, sentences: payloads }),
    });

    const assets = result.assets ?? [];
    const batchErrors = result.errors ?? [];
    generated += assets.length;
    failed += batchErrors.length;
    for (const err of batchErrors) {
      errors.push(`ch${n} #${err.index} ${err.speakerId ?? ''}: ${err.error}`);
    }
    console.log(`${assets.length} ok, ${batchErrors.length} failed`);
  }

  console.log('\nDone');
  console.log(`  Assets returned: ${generated}`);
  console.log(`  Failures: ${failed}`);
  if (errors.length) {
    console.log('  First errors:');
    for (const line of errors.slice(0, 10)) console.log(`   - ${line}`);
  }
  console.log('\nNext: node mobile/scripts/package-a1-audio.js');
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
