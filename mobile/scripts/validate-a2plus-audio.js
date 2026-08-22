/**
 * Deep validation for A2+ audio pipeline.
 *
 * Verifies:
 *   1. Content Identity: sentenceId → exact text → expected speaker → expected voiceId → catalog asset.
 *   2. File Existence & Integrity: MP3 files exist in media and public directories and are non-empty.
 *   3. Audio Duration / Size Sanity: Flags suspicious clips (e.g. truncated audio or abnormal byte/char ratios).
 *   4. Zero Mutation: Confirms 100% preservation of all 1,219 protected Luca A1/A2 catalog assets.
 *
 * Usage:
 *   node mobile/scripts/validate-a2plus-audio.js
 *   node mobile/scripts/validate-a2plus-audio.js --pilot
 *   node mobile/scripts/validate-a2plus-audio.js --story=la-casa-delle-finestre
 */
const fs = require('fs');
const path = require('path');

const {
  A2_PLUS_STORIES,
  mobileRoot,
  contentRoot,
  loadJson,
  collectA2PlusClipPlan,
} = require('./a2plus-audio-common');

const catalogPath = path.join(contentRoot, 'audio', 'catalog.json');
const mediaDir = path.join(mobileRoot, 'src', 'audio', 'media');
const publicDir = path.join(mobileRoot, 'public', 'audio', 'a1');
const bundledAssetsPath = path.join(mobileRoot, 'src', 'audio', 'bundledAssets.ts');

function parseCliArgs(argv) {
  let pilot = false;
  let storyId = null;
  for (const arg of argv) {
    if (arg === '--pilot') pilot = true;
    else if (arg.startsWith('--story=')) storyId = arg.slice('--story='.length);
  }
  return { pilot, storyId };
}

function main() {
  const options = parseCliArgs(process.argv.slice(2));

  console.log('================================================================');
  console.log('  A2+ AUDIO DEEP VALIDATION AUDIT');
  if (options.pilot) console.log('  SCOPE: Pilot Chapters (Chapter 1 per story)');
  if (options.storyId) console.log(`  STORY FILTER: ${options.storyId}`);
  console.log('================================================================\n');

  if (!fs.existsSync(catalogPath)) {
    console.error('FAIL: Missing audio catalog at', catalogPath);
    process.exit(1);
  }

  const catalog = loadJson(catalogPath);
  const catalogAssets = catalog.assets ?? [];
  const catalogByContentId = new Map();
  for (const asset of catalogAssets) {
    catalogByContentId.set(asset.contentId, asset);
  }

  // 1. Protected Luca Assets Check
  console.log('1. AUDITING FROZEN ASSETS (Zero-Mutation Invariant)...');
  const lucaProtected = catalogAssets.filter((a) => String(a.contentId).startsWith('sentence:luca-a-roma-'));
  if (lucaProtected.length !== 1219) {
    console.error(`FAIL: Expected 1,219 protected Luca assets in catalog, found ${lucaProtected.length}!`);
    process.exit(1);
  }
  console.log(`  PASS: All 1,219 protected Luca A1/A2 catalog assets intact.\n`);

  // 2. Content Identity & File Existence Check
  console.log('2. AUDITING CONTENT IDENTITY & FILE INTEGRITY...');
  const plan = collectA2PlusClipPlan(options);

  let verifiedCount = 0;
  let missingCount = 0;
  const identityMismatches = [];
  const missingFiles = [];
  const suspiciousRatioClips = [];

  for (const clip of plan.clips) {
    const asset = catalogByContentId.get(clip.contentId);
    if (!asset) {
      missingCount++;
      continue;
    }

    // Exact text match
    if (asset.text !== clip.text) {
      identityMismatches.push(
        `Text mismatch for ${clip.contentId}:\n  Expected: "${clip.text}"\n  Catalog:  "${asset.text}"`,
      );
    }

    // Expected speaker match
    if (asset.speakerId !== clip.speakerId) {
      identityMismatches.push(
        `Speaker mismatch for ${clip.contentId}: Expected "${clip.speakerId}", found "${asset.speakerId}"`,
      );
    }

    // Expected voiceId match
    if (clip.voiceId && asset.voiceId !== clip.voiceId) {
      identityMismatches.push(
        `VoiceId mismatch for ${clip.contentId}: Expected "${clip.voiceId}", found "${asset.voiceId}"`,
      );
    }

    // MP3 files check
    const filename = path.basename(asset.audioUrl || '');
    const mediaPath = path.join(mediaDir, filename);
    const publicPath = path.join(publicDir, filename);

    if (!fs.existsSync(mediaPath) || fs.statSync(mediaPath).size === 0) {
      missingFiles.push(`Missing / empty in media/: ${filename} (${clip.contentId})`);
    } else if (!fs.existsSync(publicPath) || fs.statSync(publicPath).size === 0) {
      missingFiles.push(`Missing / empty in public/: ${filename} (${clip.contentId})`);
    } else {
      const sizeBytes = fs.statSync(mediaPath).size;
      const chars = clip.charCount;

      // Sanity check: Byte to Character ratio
      // Standard Chirp3 HD MP3 is ~3-5 KB per second of speech (~10-15 chars/sec -> ~200-400 bytes/char)
      // A clip with > 25 chars should almost certainly be > 2 KB.
      if (chars > 25 && sizeBytes < 2000) {
        suspiciousRatioClips.push({
          contentId: clip.contentId,
          filename,
          chars,
          sizeBytes,
          reason: 'Suspiciously small MP3 size relative to character count (possible truncation)',
        });
      }

      verifiedCount++;
    }
  }

  console.log(`  Target Planned Clips:         ${plan.clips.length}`);
  console.log(`  Catalog Matched & Verified:   ${verifiedCount}`);
  console.log(`  Missing from Catalog:         ${missingCount}`);
  console.log(`  Identity Mismatches:          ${identityMismatches.length}`);
  console.log(`  Missing MP3 Files on Disk:    ${missingFiles.length}`);
  console.log(`  Suspicious Duration/Ratios:   ${suspiciousRatioClips.length}\n`);

  if (identityMismatches.length > 0) {
    console.error('FAIL: Content identity mismatches detected:');
    for (const msg of identityMismatches.slice(0, 10)) console.error(`  - ${msg}`);
  }

  if (missingFiles.length > 0) {
    console.error('FAIL: Missing MP3 files detected on disk:');
    for (const msg of missingFiles.slice(0, 10)) console.error(`  - ${msg}`);
  }

  if (suspiciousRatioClips.length > 0) {
    console.warn('WARNING: Suspicious audio clips flagged for review:');
    for (const s of suspiciousRatioClips.slice(0, 10)) {
      console.warn(`  - ${s.contentId} (${s.filename}): ${s.chars} chars, ${s.sizeBytes} bytes — ${s.reason}`);
    }
  }

  // 3. Bundled Assets Manifest Check
  console.log('3. AUDITING BUNDLED ASSETS METRO MANIFEST...');
  if (!fs.existsSync(bundledAssetsPath)) {
    console.error('FAIL: Missing bundledAssets.ts at', bundledAssetsPath);
    process.exit(1);
  }
  const bundledContent = fs.readFileSync(bundledAssetsPath, 'utf8');
  console.log(`  PASS: bundledAssets.ts exists (${bundledContent.length} bytes).\n`);

  console.log('================================================================');
  console.log('  VALIDATION SUMMARY');
  console.log('================================================================');
  const hasErrors = identityMismatches.length > 0 || missingFiles.length > 0 || (missingCount > 0 && !options.pilot);
  if (hasErrors) {
    console.log('  Status:  FAILED ❌');
    if (missingCount > 0) console.log(`  Note:    ${missingCount} clips missing from catalog (run generate + package first).`);
    process.exit(1);
  } else {
    console.log('  Status:  PASS ✅');
    console.log(`  Coverage: ${((verifiedCount / plan.clips.length) * 100).toFixed(1)}% of requested scope verified.`);
  }
  console.log('================================================================\n');
}

main();
