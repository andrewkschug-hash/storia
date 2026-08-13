/**
 * A2 audio production preflight (chapters 21–40).
 *
 * Usage:
 *   node mobile/scripts/check-a2-audio.js
 *   node mobile/scripts/check-a2-audio.js --skip-gateway
 *
 * Read-only. Does not generate audio or write story/catalog files.
 */
const path = require('path');
const {
  MIN_CHAPTER,
  MAX_CHAPTER,
  contentRoot,
  collectClipPlan,
  printPreflight,
  parseA2Range,
  loadJson,
} = require('./a2-audio-common');

const voicesPath = path.join(contentRoot, 'audio', 'voices.json');
const GATEWAY = process.env.EXPO_PUBLIC_TTS_GATEWAY_URL || 'http://127.0.0.1:8787';

function isPlaceholder(voiceId) {
  return !voiceId || String(voiceId).startsWith('lab-');
}

async function gatewayGet(pathname) {
  const res = await fetch(`${GATEWAY.replace(/\/$/, '')}${pathname}`);
  if (!res.ok) throw new Error(`${pathname} → ${res.status}`);
  return res.json();
}

function check(label, ok, detail) {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

async function main() {
  const { from, to, skipGateway } = parseA2Range(process.argv.slice(2));
  const plan = collectClipPlan(from, to);
  printPreflight(plan, from, to);
  console.log('');

  let ready = true;
  const failures = [];
  ready = check('Chapter count', plan.chapters.length === to - from + 1, `${plan.chapters.length}`) && ready;

  const speakersUsed = new Set();
  for (const clip of plan.clips) speakersUsed.add(clip.speakerId);

  const voices = loadJson(voicesPath);
  const assignments = voices.characters ?? {};
  const unassigned = [...speakersUsed].filter((id) => {
    const row = assignments[id];
    return !row || isPlaceholder(row.voiceId);
  });
  ready =
    check(
      'Voice assignments',
      unassigned.length === 0,
      unassigned.length === 0
        ? `provider=${voices.activeProvider}; ${speakersUsed.size} characters`
        : `missing: ${unassigned.join(', ')}`,
    ) && ready;
  if (unassigned.length) failures.push(`Unassigned voices: ${unassigned.join(', ')}`);

  if (!skipGateway) {
    try {
      const status = await gatewayGet('/v1/tts/status');
      const gatewayOk = Boolean(
        status.ok && status.providers?.[status.provider]?.configured,
      );
      ready = check('Gateway', gatewayOk, gatewayOk ? status.provider : 'not ready') && ready;
      if (!gatewayOk) failures.push('TTS gateway not ready');
    } catch (error) {
      ready = check('Gateway', false, error instanceof Error ? error.message : String(error)) && ready;
      failures.push('Cannot reach TTS gateway (use --skip-gateway for offline preflight)');
    }
  } else {
    check('Gateway', true, 'skipped');
  }

  console.log('');
  if (ready) {
    console.log('✓ Ready for A2 generation (when explicitly requested with --generate)');
    console.log(`  Range: ${MIN_CHAPTER}–${MAX_CHAPTER}`);
    console.log(`  Standard: ${plan.standard.length}`);
    console.log(`  Extended: ${plan.extended.length}`);
    console.log('  node mobile/scripts/generate-a2-audio.js --generate');
    process.exit(0);
  }
  console.log('✗ Not ready for A2 generation');
  for (const failure of failures.slice(0, 20)) console.log(`  - ${failure}`);
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
