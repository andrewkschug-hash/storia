/**
 * A1 audio production preflight (chapters 1–20).
 *
 * Usage:
 *   node mobile/scripts/check-a1-audio.js
 *
 * Checks chapters, sentences, speakers, voice assignments, and gateway readiness.
 * Does not generate audio.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const mobileRoot = path.join(__dirname, '..');
const contentRoot = path.join(mobileRoot, 'content');
const storyPath = path.join(contentRoot, 'stories', 'luca-a-roma');
const chaptersDir = path.join(storyPath, 'chapters');
const voicesPath = path.join(contentRoot, 'audio', 'voices.json');
const GATEWAY = process.env.EXPO_PUBLIC_TTS_GATEWAY_URL || 'http://127.0.0.1:8787';

const REQUIRED_SPEAKERS = ['narrator', 'luca', 'sofia', 'marco', 'giulia', 'nonna-rosa', 'padrone'];

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function resolveSpeakerId(speakerId) {
  if (!speakerId || speakerId === 'narrator') return 'narrator';
  return speakerId;
}

function isPlaceholder(voiceId) {
  return !voiceId || String(voiceId).startsWith('lab-');
}

async function gatewayGet(pathname) {
  const res = await fetch(`${GATEWAY.replace(/\/$/, '')}${pathname}`);
  if (!res.ok) throw new Error(`${pathname} → ${res.status}`);
  return res.json();
}

function check(label, ok, detail) {
  const mark = ok ? '✓' : '✗';
  console.log(`${mark} ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

async function main() {
  let ready = true;
  const failures = [];

  console.log('A1 AUDIO PREFLIGHT\n');

  const manifest = loadJson(path.join(storyPath, 'manifest.json'));
  const a1 = (manifest.chapters ?? []).filter((c) => c.number >= 1 && c.number <= 20);
  ready =
    check('Chapters', a1.length === 20, `${a1.length}/20 listed in manifest`) && ready;
  if (a1.length !== 20) failures.push('Manifest must list chapters 1–20');

  const chapters = [];
  const sentenceIds = new Map();
  const speakersUsed = new Set();
  let sentenceCount = 0;
  let emptyText = 0;
  let missingSpeakerRef = 0;

  for (const summary of a1) {
    const file = path.join(chaptersDir, summary.file);
    if (!fs.existsSync(file)) {
      ready = check(`Chapter file ${summary.file}`, false, 'missing') && ready;
      failures.push(`Missing ${summary.file}`);
      continue;
    }
    const chapter = loadJson(file);
    if (chapter.id !== summary.id || chapter.number !== summary.number) {
      ready =
        check(`Chapter ${summary.number} identity`, false, `${chapter.id} vs ${summary.id}`) &&
        ready;
      failures.push(`Identity mismatch for chapter ${summary.number}`);
    }
    chapters.push(chapter);

    for (const paragraph of chapter.paragraphs ?? []) {
      for (const sentence of paragraph.sentences ?? []) {
        sentenceCount += 1;
        const key = `${chapter.id}:${sentence.id}`;
        if (sentenceIds.has(key)) {
          ready = check('Duplicate sentence IDs', false, key) && ready;
          failures.push(`Duplicate sentence id ${key}`);
        }
        sentenceIds.set(key, sentence);
        if (!sentence.text || !String(sentence.text).trim()) {
          emptyText += 1;
          failures.push(`Empty text ${key}`);
        }
        const speaker = resolveSpeakerId(sentence.speakerId);
        speakersUsed.add(speaker);
        if (sentence.speakerId && !REQUIRED_SPEAKERS.includes(sentence.speakerId)) {
          missingSpeakerRef += 1;
          failures.push(`Unknown speaker ${sentence.speakerId} on ${key}`);
        }
      }
    }
  }

  ready =
    check(
      'Sentences',
      emptyText === 0 && sentenceCount > 0,
      `${sentenceCount} sentences across A1`,
    ) && ready;
  if (emptyText > 0) ready = false;

  ready =
    check(
      'Speakers',
      missingSpeakerRef === 0,
      `used: ${[...speakersUsed].sort().join(', ')}`,
    ) && ready;

  const voices = loadJson(voicesPath);
  const assignments = voices.characters ?? {};
  const unassigned = [];
  for (const speaker of [...speakersUsed]) {
    const row = assignments[speaker];
    if (!row || isPlaceholder(row.voiceId)) unassigned.push(speaker);
  }
  ready =
    check(
      'Voice assignments',
      unassigned.length === 0,
      unassigned.length === 0
        ? `provider=${voices.activeProvider}; ${speakersUsed.size} characters assigned`
        : `missing: ${unassigned.join(', ')}`,
    ) && ready;
  if (unassigned.length) failures.push(`Unassigned voices: ${unassigned.join(', ')}`);

  let gatewayOk = false;
  let provider = voices.activeProvider;
  try {
    const status = await gatewayGet('/v1/tts/status');
    gatewayOk = Boolean(status.ok && status.connected && status.providers?.[status.provider]?.configured);
    provider = status.provider;
    ready =
      check(
        'Gateway',
        gatewayOk,
        gatewayOk ? `${provider} configured at ${GATEWAY}` : 'not ready',
      ) && ready;
    if (!gatewayOk) failures.push('TTS gateway not ready');

    const assign = await gatewayGet('/v1/tts/assignments');
    const rosterChars = assign.roster?.characters ?? {};
    const gatewayMissing = [...speakersUsed].filter((id) => {
      const row = rosterChars[id];
      return !row?.voiceId || isPlaceholder(row.voiceId);
    });
    ready =
      check(
        'Gateway voice roster',
        gatewayMissing.length === 0,
        gatewayMissing.length === 0
          ? 'matches production speakers'
          : `missing: ${gatewayMissing.join(', ')}`,
      ) && ready;
    if (gatewayMissing.length) failures.push(`Gateway missing: ${gatewayMissing.join(', ')}`);
  } catch (error) {
    ready = check('Gateway', false, error instanceof Error ? error.message : String(error)) && ready;
    failures.push('Cannot reach TTS gateway');
  }

  const missingMeta = [];
  for (const chapter of chapters) {
    for (const paragraph of chapter.paragraphs ?? []) {
      for (const sentence of paragraph.sentences ?? []) {
        if (!sentence.id) missingMeta.push(`${chapter.id}: missing sentence id`);
        if (sentence.text == null) missingMeta.push(`${chapter.id}: missing text`);
      }
    }
  }
  ready =
    check('Missing data', missingMeta.length === 0, missingMeta.length ? missingMeta[0] : 'none') &&
    ready;
  if (missingMeta.length) failures.push(...missingMeta.slice(0, 5));

  console.log('');
  if (ready) {
    console.log('✓ Ready for generation');
    console.log(`  Provider: ${provider}`);
    console.log(`  Chapters: 1–20 (${chapters.length})`);
    console.log(`  Sentences: ${sentenceCount}`);
    console.log(`  Speakers: ${[...speakersUsed].sort().join(', ')}`);
    console.log('');
    console.log('Generate with:');
    console.log('  node mobile/scripts/generate-a1-audio.js');
    console.log('Then package with:');
    console.log('  node mobile/scripts/package-a1-audio.js');
    process.exit(0);
  }

  console.log('✗ Not ready for generation');
  for (const failure of failures.slice(0, 20)) console.log(`  - ${failure}`);
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
