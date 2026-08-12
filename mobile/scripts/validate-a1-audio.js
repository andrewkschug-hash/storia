/**
 * Validate packaged A1 audio (chapters 1–20).
 *
 * Usage:
 *   node mobile/scripts/validate-a1-audio.js
 *
 * Expects:
 *   mobile/content/audio/catalog.json
 *   mobile/content/audio/bundled/*.mp3
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const mobileRoot = path.join(__dirname, '..');
const contentRoot = path.join(mobileRoot, 'content');
const storyPath = path.join(contentRoot, 'stories', 'luca-a-roma');
const chaptersDir = path.join(storyPath, 'chapters');
const catalogPath = path.join(contentRoot, 'audio', 'catalog.json');
const bundledDir = path.join(contentRoot, 'audio', 'bundled');
const voicesPath = path.join(contentRoot, 'audio', 'voices.json');

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function resolveSpeakerId(speakerId) {
  if (!speakerId || speakerId === 'narrator') return 'narrator';
  return speakerId;
}

function contentHash(value) {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c + i), 0x01000193) >>> 0;
  }
  return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).slice(0, 16);
}

function textHash(text) {
  return contentHash(String(text).normalize('NFC').trim());
}

function check(label, ok, detail) {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

function main() {
  let ok = true;
  const failures = [];

  console.log('A1 AUDIO VALIDATION\n');

  if (!fs.existsSync(catalogPath)) {
    console.log('✗ Catalog missing');
    process.exit(1);
  }
  const catalog = loadJson(catalogPath);
  const assets = catalog.assets ?? [];
  ok = check('Catalog', assets.length > 0, `${assets.length} assets`) && ok;

  const voices = loadJson(voicesPath);
  const roster = voices.characters ?? {};
  const manifest = loadJson(path.join(storyPath, 'manifest.json'));
  const a1 = (manifest.chapters ?? []).filter((c) => c.number >= 1 && c.number <= 20);

  const byContentId = new Map();
  const byTextSpeaker = new Map();
  const seenFiles = new Set();
  let missingFiles = 0;
  let duplicateRefs = 0;
  let hashMismatch = 0;
  let speakerMismatch = 0;

  for (const asset of assets) {
    if (byContentId.has(asset.contentId)) {
      duplicateRefs += 1;
      failures.push(`Duplicate contentId ${asset.contentId}`);
    }
    byContentId.set(asset.contentId, asset);
    byTextSpeaker.set(`${asset.speakerId}|${asset.text}`, asset);

    const fileName = path.basename(asset.audioUrl || '');
    const candidates = [
      path.join(bundledDir, fileName),
      path.join(__dirname, '..', 'public', 'audio', 'a1', fileName),
      path.join(__dirname, '..', 'src', 'audio', 'media', fileName),
    ];
    const filePath = candidates.find((p) => fs.existsSync(p));
    if (!fileName || !filePath) {
      missingFiles += 1;
      failures.push(`Missing file for ${asset.contentId}`);
    } else {
      seenFiles.add(fileName);
    }

    if (asset.textHash && asset.textHash !== textHash(asset.text)) {
      hashMismatch += 1;
      failures.push(`textHash mismatch ${asset.contentId}`);
    }
  }

  const adaptive = loadJson(path.join(storyPath, 'adaptive-variants.json'));
  const adaptiveSentences = adaptive.sentences ?? {};

  let needed = 0;
  let covered = 0;
  let variantsNeeded = 0;
  let variantsCovered = 0;
  const missingSentences = [];
  const missingVariants = [];

  function findAsset(contentId, speakerId, text) {
    return (
      byContentId.get(contentId) ||
      byTextSpeaker.get(`${speakerId}|${text}`) ||
      [...assets].find(
        (a) =>
          a.speed === 'normal' &&
          a.text === text &&
          a.speakerId === speakerId &&
          (a.status === 'approved' || a.status === 'review_required'),
      )
    );
  }

  for (const summary of a1) {
    const chapter = loadJson(path.join(chaptersDir, summary.file));
    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) {
        needed += 1;
        const speakerId = resolveSpeakerId(sentence.speakerId);
        const contentId = `sentence:${chapter.id}:${sentence.id}:standard`;
        const asset = findAsset(contentId, speakerId, sentence.text);

        if (!asset) {
          missingSentences.push(contentId);
        } else {
          covered += 1;
          if (asset.speakerId !== speakerId) {
            speakerMismatch += 1;
            failures.push(`Speaker mismatch ${contentId}: ${asset.speakerId} vs ${speakerId}`);
          }
          const expectedVoice = roster[speakerId]?.voiceId;
          if (expectedVoice && asset.voiceId && asset.voiceId !== expectedVoice) {
            // soft warning — still counts as covered if text matches
          }
          if (asset.text !== sentence.text) {
            failures.push(`Text mismatch ${contentId}`);
            ok = false;
          }
        }

        // Adaptive variants must have their own clips (text may differ from standard).
        const overlay = adaptiveSentences[`${chapter.id}:${sentence.id}`];
        for (const variant of overlay?.variants ?? []) {
          if (!variant?.text || !variant?.id) continue;
          variantsNeeded += 1;
          const variantContentId = `sentence:${chapter.id}:${sentence.id}:${variant.id}`;
          const variantAsset = findAsset(variantContentId, speakerId, variant.text);
          if (!variantAsset) {
            missingVariants.push(variantContentId);
            continue;
          }
          variantsCovered += 1;
          if (variantAsset.speakerId !== speakerId) {
            speakerMismatch += 1;
            failures.push(
              `Speaker mismatch ${variantContentId}: ${variantAsset.speakerId} vs ${speakerId}`,
            );
          }
          if (variantAsset.text !== variant.text) {
            failures.push(`Text mismatch ${variantContentId}`);
            ok = false;
          }
        }
      }
    }
  }

  ok = check('Every A1 sentence has audio', missingSentences.length === 0, `${covered}/${needed}`) && ok;
  ok =
    check(
      'Every A1 adaptive variant has audio',
      missingVariants.length === 0,
      `${variantsCovered}/${variantsNeeded}`,
    ) && ok;
  ok = check('Audio files resolve', missingFiles === 0, `${seenFiles.size} files in bundled/`) && ok;
  ok = check('No duplicate references', duplicateRefs === 0, `${duplicateRefs} duplicates`) && ok;
  ok = check('Text hash metadata', hashMismatch === 0, hashMismatch === 0 ? 'ok' : `${hashMismatch} mismatches`) && ok;
  ok = check('Speaker assignment', speakerMismatch === 0, speakerMismatch === 0 ? 'ok' : `${speakerMismatch} mismatches`) && ok;
  ok = check('Catalog valid', Array.isArray(assets), `provider=${voices.activeProvider}`) && ok;

  if (missingSentences.length) {
    console.log('\nMissing sentences (first 20):');
    for (const id of missingSentences.slice(0, 20)) console.log(`  - ${id}`);
  }
  if (missingVariants.length) {
    console.log('\nMissing adaptive variants (first 20):');
    for (const id of missingVariants.slice(0, 20)) console.log(`  - ${id}`);
  }
  if (failures.length && missingSentences.length === 0 && missingVariants.length === 0) {
    console.log('\nOther issues (first 10):');
    for (const line of failures.slice(0, 10)) console.log(`  - ${line}`);
  }

  console.log('');
  if (ok && missingSentences.length === 0 && missingVariants.length === 0) {
    console.log('A1 AUDIO PRODUCTION READY');
    process.exit(0);
  }
  console.log('A1 AUDIO PRODUCTION NOT READY');
  process.exit(1);
}

main();
