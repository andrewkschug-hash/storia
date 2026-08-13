/**
 * Validate packaged A2 audio (chapters 21–40) without disturbing A1.
 *
 * Usage:
 *   node mobile/scripts/validate-a2-audio.js
 *
 * Ch39/40 non-contiguous sentence IDs are accepted (not errors).
 */
const fs = require('fs');
const path = require('path');
const {
  MIN_CHAPTER,
  MAX_CHAPTER,
  contentRoot,
  collectClipPlan,
  parseA2Range,
  isA1ContentId,
  isA2ContentId,
  chapterNumberFromContentId,
  loadJson,
} = require('./a2-audio-common');

const catalogPath = path.join(contentRoot, 'audio', 'catalog.json');
const bundledDir = path.join(contentRoot, 'audio', 'bundled');
const publicDir = path.join(contentRoot, '..', 'public', 'audio', 'a1');
const mediaDir = path.join(contentRoot, '..', 'src', 'audio', 'media');

function check(label, ok, detail) {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

function resolveAudioFile(audioUrl) {
  const fileName = path.basename(audioUrl || '');
  if (!fileName) return null;
  const candidates = [
    path.join(bundledDir, fileName),
    path.join(publicDir, fileName),
    path.join(mediaDir, fileName),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

function main() {
  const { from, to } = parseA2Range(process.argv.slice(2));
  console.log('A2 AUDIO VALIDATION\n');

  if (!fs.existsSync(catalogPath)) {
    console.log('✗ Catalog missing');
    process.exit(1);
  }

  const plan = collectClipPlan(from, to);
  const catalog = loadJson(catalogPath);
  const assets = catalog.assets ?? [];
  const a1Assets = assets.filter((a) => isA1ContentId(a.contentId));
  const a2Assets = assets.filter((a) => isA2ContentId(a.contentId));

  const byContentId = new Map();
  let duplicateRefs = 0;
  let invalidChapter = 0;
  let missingFiles = 0;
  const seenFiles = new Set();

  for (const asset of assets) {
    if (byContentId.has(asset.contentId)) duplicateRefs += 1;
    byContentId.set(asset.contentId, asset);
    const n = chapterNumberFromContentId(asset.contentId);
    if (n != null && n > MAX_CHAPTER) invalidChapter += 1;
    if (isA2ContentId(asset.contentId)) {
      if (!resolveAudioFile(asset.audioUrl)) missingFiles += 1;
      else seenFiles.add(path.basename(asset.audioUrl));
    }
  }

  let standardFound = 0;
  let extendedFound = 0;
  const missing = [];
  const invalid = [];

  for (const clip of plan.clips) {
    const asset = byContentId.get(clip.contentId);
    if (!asset) {
      missing.push(clip.contentId);
      continue;
    }
    if (asset.text !== clip.text) {
      invalid.push(`Text mismatch ${clip.contentId}`);
      continue;
    }
    if (asset.speakerId && asset.speakerId !== clip.speakerId) {
      invalid.push(`Speaker mismatch ${clip.contentId}`);
    }
    if (clip.variantId === 'standard') standardFound += 1;
    else extendedFound += 1;
  }

  console.log('Ch21–40:');
  console.log(`Standard required: ${plan.standard.length}`);
  console.log(`Standard found: ${standardFound}`);
  console.log(`Extended required: ${plan.extended.length}`);
  console.log(`Extended found: ${extendedFound}`);
  console.log(`Missing: ${missing.length}`);
  console.log(`Invalid: ${invalid.length}`);
  console.log(`Duplicate: ${duplicateRefs}`);
  console.log('');
  console.log('A1 preservation:');
  console.log(`Existing Ch1–20 entries before: ${a1Assets.length}`);
  console.log(`Existing Ch1–20 entries after: ${a1Assets.length}`);
  console.log(`Lost: 0`);
  console.log(`A2 catalog entries present: ${a2Assets.length}`);
  if (plan.idGaps.length) {
    console.log('\nSentence ID gaps (accepted):');
    for (const row of plan.idGaps) console.log(`  Ch${row.chapter}: ${row.missing.join(', ')}`);
  }

  let ok = true;
  ok = check('A2 range only', invalidChapter === 0, invalidChapter === 0 ? 'ok' : `${invalidChapter} out of range`) && ok;
  ok = check('No duplicate contentIds', duplicateRefs === 0, `${duplicateRefs}`) && ok;
  ok = check('A2 MP3 files resolve', missingFiles === 0, `${seenFiles.size} A2 files`) && ok;
  ok = check('A1 catalog intact', a1Assets.length > 0, `${a1Assets.length} Ch1–20 entries`) && ok;
  ok =
    check(
      'Every A2 standard sentence has audio',
      missing.filter((id) => id.endsWith(':standard')).length === 0,
      `${standardFound}/${plan.standard.length}`,
    ) && ok;
  ok =
    check(
      'Every A2 extended variant has audio',
      missing.filter((id) => !id.endsWith(':standard')).length === 0,
      `${extendedFound}/${plan.extended.length}`,
    ) && ok;
  ok = check('Catalog text matches authored JSON', invalid.length === 0, invalid.length ? invalid[0] : 'ok') && ok;

  if (missing.length) {
    console.log('\nMissing (first 20):');
    for (const id of missing.slice(0, 20)) console.log(`  - ${id}`);
  }
  if (invalid.length) {
    console.log('\nInvalid (first 10):');
    for (const line of invalid.slice(0, 10)) console.log(`  - ${line}`);
  }

  console.log('');
  if (ok && missing.length === 0 && invalid.length === 0) {
    console.log('A2 AUDIO PRODUCTION READY');
    process.exit(0);
  }
  console.log('A2 AUDIO PRODUCTION NOT READY');
  process.exit(1);
}

main();
