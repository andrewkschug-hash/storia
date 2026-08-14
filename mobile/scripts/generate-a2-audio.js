/**
 * Generate production A2 sentence audio (chapters 21–40) via the TTS gateway.
 *
 * SAFE DEFAULT: preflight only. Does not call TTS unless --generate is passed.
 *
 * Usage:
 *   node mobile/scripts/generate-a2-audio.js
 *   node mobile/scripts/generate-a2-audio.js --from=21 --to=24
 *   node mobile/scripts/generate-a2-audio.js --generate
 *
 * Reads authored chapter JSON only. Never reads story.js.
 * Range outside 21–40 fails immediately.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  MIN_CHAPTER,
  MAX_CHAPTER,
  contentRoot,
  repoRoot,
  collectClipPlan,
  printPreflight,
  parseA2Range,
  isA1ContentId,
  loadJson,
} = require('./a2-audio-common');

const voicesPath = path.join(contentRoot, 'audio', 'voices.json');
const catalogPath = path.join(contentRoot, 'audio', 'catalog.json');
const registryPath = path.join(repoRoot, 'services', 'tts-gateway', 'data', 'registry.json');
const GATEWAY = process.env.EXPO_PUBLIC_TTS_GATEWAY_URL || 'http://127.0.0.1:8787';

const { resolveSpeakerVoice } = require('./voice-roster-common');

function existingA1CacheKeys() {
  const keys = new Set();
  if (fs.existsSync(catalogPath)) {
    const catalog = loadJson(catalogPath);
    for (const asset of catalog.assets ?? []) {
      if (isA1ContentId(asset.contentId) && (asset.cacheKey || asset.id)) {
        keys.add(asset.cacheKey || asset.id);
      }
    }
  }
  if (fs.existsSync(registryPath)) {
    const registry = loadJson(registryPath);
    for (const asset of registry.assets ?? []) {
      if (isA1ContentId(asset.contentId) && (asset.cacheKey || asset.id)) {
        keys.add(asset.cacheKey || asset.id);
      }
    }
  }
  return keys;
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
  const { from, to, generate } = parseA2Range(process.argv.slice(2));
  console.log('SAFE MODE: authored production content is READ-ONLY.');
  console.log('story.js is NOT used as the production source of truth.');
  console.log('build.js will NOT be executed.\n');

  const plan = collectClipPlan(from, to);
  printPreflight(plan, from, to);

  const guard = spawnSync(
    'npx',
    ['tsx', 'scripts/google-tts-preflight.ts', '--target=a2', `--from=${from}`, `--to=${to}`, '--dry-run'],
    { stdio: 'inherit', cwd: path.join(repoRoot, 'services', 'tts-gateway'), shell: true },
  );
  if (guard.status !== 0) process.exit(guard.status ?? 1);

  if (!generate) {
    console.log('\nPreflight only. No TTS calls were made.');
    console.log('To generate audio later:');
    console.log('  node mobile/scripts/generate-a2-audio.js --generate');
    process.exit(0);
  }

  const a1Keys = existingA1CacheKeys();
  const status = await gatewayJson('/v1/tts/status');
  if (!status.ok || !status.providers?.[status.provider]?.configured) {
    throw new Error(`Gateway provider ${status.provider} is not configured`);
  }
  console.log(`\nProvider: ${status.provider}`);

  const assign = await gatewayJson('/v1/tts/assignments');
  const roster = assign.roster ?? loadJson(voicesPath);

  let generated = 0;
  let failed = 0;
  let skippedA1 = 0;
  const errors = [];

  for (const { chapter, sentences: authoredSentences } of plan.chapters) {
    const byId = new Map(authoredSentences.map((s) => [s.id, s]));
    const chapterClips = plan.clips.filter((c) => c.chapterNumber === chapter.number);
    const payloads = [];

    for (const clip of chapterClips) {
      const authored = byId.get(clip.sentenceId);
      if (!authored) throw new Error(`Clip ${clip.contentId} not in authored JSON`);
      const expectedText = clip.variantId === 'standard' ? authored.text : clip.text;
      if (clip.text !== expectedText) {
        throw new Error(`Source text differs from authored JSON for ${clip.contentId}`);
      }
      const voice = resolveSpeakerVoice(roster, clip.speakerId);
      if (!voice) {
        throw new Error(`No production voice assigned for ${clip.speakerId}`);
      }
      payloads.push({
        text: clip.text,
        voiceId: voice.voiceId,
        speakerId: clip.speakerId,
        contentId: clip.contentId,
        speed: 'normal',
        provider: voice.provider || status.provider,
        regenerate: false,
      });
    }

    process.stdout.write(`Chapter ${chapter.number} (${payloads.length} clips)… `);
    const result = await gatewayJson('/v1/tts/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId: chapter.id, sentences: payloads }),
    });

    const assets = result.assets ?? [];
    const batchErrors = result.errors ?? [];
    for (const asset of assets) {
      const key = asset.cacheKey || asset.id;
      if (key && a1Keys.has(key)) {
        skippedA1 += 1;
        errors.push(`Refused to overwrite A1 cacheKey ${key} (${asset.contentId})`);
        continue;
      }
      generated += 1;
    }
    failed += batchErrors.length;
    for (const err of batchErrors) {
      errors.push(`ch${chapter.number} #${err.index} ${err.speakerId ?? ''}: ${err.error}`);
    }
    console.log(`${assets.length} returned, ${batchErrors.length} failed`);
  }

  console.log('\nDone');
  console.log(`  Assets kept: ${generated}`);
  console.log(`  A1 overwrite refusals: ${skippedA1}`);
  console.log(`  Failures: ${failed}`);
  if (errors.length) {
    console.log('  First errors:');
    for (const line of errors.slice(0, 10)) console.log(`   - ${line}`);
  }
  console.log('\nNext: node mobile/scripts/package-a2-audio.js');
  if (failed > 0 || skippedA1 > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
