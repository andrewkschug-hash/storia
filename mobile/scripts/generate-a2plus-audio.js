/**
 * Guarded, idempotent audio generation for A2+ genre paths.
 *
 * Usage:
 *   node mobile/scripts/generate-a2plus-audio.js --dry-run
 *   node mobile/scripts/generate-a2plus-audio.js --pilot --dry-run
 *   node mobile/scripts/generate-a2plus-audio.js --pilot --generate
 *   node mobile/scripts/generate-a2plus-audio.js --generate
 *   node mobile/scripts/generate-a2plus-audio.js --story=la-casa-delle-finestre --from=1 --to=5 --generate
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const {
  A2_PLUS_STORIES,
  repoRoot,
  ttsGatewayDir,
  loadJson,
  collectA2PlusClipPlan,
  printHumanReviewableManifest,
} = require('./a2plus-audio-common');

const registryPath = path.join(ttsGatewayDir, 'data', 'registry.json');
const audioDataDir = path.join(ttsGatewayDir, 'data', 'audio');

function parseCliArgs(argv) {
  let dryRun = true;
  let generate = false;
  let pilot = false;
  let storyId = null;
  let from = null;
  let to = null;

  for (const arg of argv) {
    if (arg === '--generate') {
      generate = true;
      dryRun = false;
    } else if (arg === '--dry-run' || arg === '--preflight') {
      dryRun = true;
      generate = false;
    } else if (arg === '--pilot') {
      pilot = true;
    } else if (arg.startsWith('--story=')) {
      storyId = arg.slice('--story='.length);
    } else if (arg.startsWith('--from=')) {
      from = Number(arg.slice('--from='.length));
    } else if (arg.startsWith('--to=')) {
      to = Number(arg.slice('--to='.length));
    }
  }

  return { dryRun: generate ? false : dryRun, generate, pilot, storyId, from, to };
}

function loadExistingRegistryAssets() {
  if (!fs.existsSync(registryPath)) return new Map();
  try {
    const data = loadJson(registryPath);
    const map = new Map();
    for (const asset of data.assets ?? []) {
      if (asset.contentId && asset.text && asset.voiceId && (asset.status === 'approved' || asset.status === 'review_required')) {
        // Verify audio file actually exists on disk
        const key = asset.cacheKey || asset.id;
        const mp3Path = path.join(audioDataDir, `${key}.mp3`);
        if (fs.existsSync(mp3Path) && fs.statSync(mp3Path).size > 0) {
          map.set(`${asset.contentId}:${asset.voiceId}`, asset);
        }
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

function updateRegistryWithAsset(newAsset) {
  let registry = { assets: [] };
  if (fs.existsSync(registryPath)) {
    try {
      registry = loadJson(registryPath);
    } catch {
      registry = { assets: [] };
    }
  }
  if (!Array.isArray(registry.assets)) registry.assets = [];

  const existingIdx = registry.assets.findIndex(
    (a) => a.contentId === newAsset.contentId && a.voiceId === newAsset.voiceId,
  );
  if (existingIdx >= 0) {
    registry.assets[existingIdx] = newAsset;
  } else {
    registry.assets.push(newAsset);
  }

  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n', 'utf8');
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2));

  console.log('================================================================');
  console.log(`  A2+ AUDIO GENERATION PIPELINE — ${options.generate ? 'EXECUTION' : 'DRY-RUN'}`);
  if (options.pilot) console.log('  MODE: Pilot Chapters Only (Chapter 1 per story)');
  if (options.storyId) console.log(`  STORY FILTER: ${options.storyId}`);
  console.log('================================================================\n');

  const plan = collectA2PlusClipPlan(options);
  printHumanReviewableManifest(plan, options);

  if (plan.unmappedSpeakers.length > 0) {
    console.error('FAIL-CLOSED: Unmapped speaker voices detected:');
    for (const u of plan.unmappedSpeakers) {
      console.error(`  - ${u.storyId} ${u.chapterId}:${u.sentenceId} → ${u.speakerId}`);
    }
    console.error('\nNo audio requests were made.');
    process.exit(1);
  }

  // Idempotency check against registry
  const existingAssets = loadExistingRegistryAssets();
  const missingClips = [];
  const existingClips = [];

  for (const clip of plan.clips) {
    const key = `${clip.contentId}:${clip.voiceId}`;
    const hit = existingAssets.get(key);
    if (hit && hit.text === clip.text) {
      existingClips.push(clip);
    } else {
      missingClips.push(clip);
    }
  }

  console.log('IDEMPOTENCY AUDIT:');
  console.log(`  Total Planned Clips:     ${plan.clips.length}`);
  console.log(`  Existing Valid Clips:    ${existingClips.length}`);
  console.log(`  Missing Clips to Gen:    ${missingClips.length}\n`);

  if (!options.generate) {
    console.log('Dry-run complete. No audio requests made.');
    console.log('To generate:');
    console.log(`  node mobile/scripts/generate-a2plus-audio.js ${options.pilot ? '--pilot ' : ''}--generate`);
    process.exit(0);
  }

  if (missingClips.length === 0) {
    console.log('All planned clips already exist in registry with valid audio files.');
    console.log('Nothing to generate. Next step: packaging.');
    process.exit(0);
  }

  // Dynamic import of TTS gateway helper
  const { GoogleTTSProvider } = await import(pathToFileURL(path.join(ttsGatewayDir, 'src', 'providers.ts')).href);
  const { loadGatewayEnv } = await import(pathToFileURL(path.join(ttsGatewayDir, 'src', 'env.ts')).href);
  const {
    countBillableCharacters,
    evaluateGoogleTtsGuard,
    loadPricingFile,
    runtimeGuardInputs,
    withGoogleApiPermit,
  } = await import(pathToFileURL(path.join(ttsGatewayDir, 'src', 'googleTtsGuard.ts')).href);
  const { audioCacheKey } = await import(pathToFileURL(path.join(ttsGatewayDir, 'src', 'cacheKey.ts')).href);

  loadGatewayEnv();
  const tts = new GoogleTTSProvider(process.env);
  const runtime = runtimeGuardInputs();
  const pricing = loadPricingFile();

  // Safety margin check: monthly_used + planned_chars + 15% safety margin <= hard_limit
  const SAFETY_MARGIN_RATIO = 0.15;
  const missingChars = missingClips.reduce((acc, c) => acc + c.charCount, 0);
  const charactersWithMargin = Math.ceil(missingChars * (1 + SAFETY_MARGIN_RATIO));
  const currentMonthUsed = runtime.trackedUsage?.charactersGenerated ?? 0;
  const hardLimit = runtime.hardLimitChars ?? 900000;

  console.log('SAFETY & BUDGET INVARIANT CHECK:');
  console.log(`  Current Month Used:      ${currentMonthUsed.toLocaleString()} chars`);
  console.log(`  Missing Chars to Gen:    ${missingChars.toLocaleString()} chars`);
  console.log(`  Chars with 15% Margin:   ${charactersWithMargin.toLocaleString()} chars`);
  console.log(`  Projected Total:         ${(currentMonthUsed + charactersWithMargin).toLocaleString()} chars`);
  console.log(`  Configured Hard Limit:   ${hardLimit.toLocaleString()} chars`);

  if (currentMonthUsed + charactersWithMargin > hardLimit) {
    console.error('\nFAIL-CLOSED: Projected volume with safety margin exceeds configured limit.');
    console.error(`  ${currentMonthUsed + charactersWithMargin} > ${hardLimit}`);
    console.error('Aborting generation.');
    process.exit(1);
  }
  console.log('  Budget Check:            PASS\n');

  fs.mkdirSync(audioDataDir, { recursive: true });

  let successCount = 0;
  let failedCount = 0;
  const errors = [];

  for (let i = 0; i < missingClips.length; i++) {
    const clip = missingClips[i];
    const counted = countBillableCharacters(clip.text);
    if (!counted.ok) {
      failedCount++;
      errors.push(`${clip.contentId}: ${counted.error}`);
      continue;
    }

    const cacheKey = audioCacheKey({
      provider: 'google',
      voiceId: clip.voiceId,
      language: 'it-IT',
      speed: 'normal',
      text: clip.text,
      generationVersion: 1,
    });

    const guard = evaluateGoogleTtsGuard({
      planned: [
        {
          storyId: clip.storyId,
          chapterId: clip.chapterId,
          sentenceId: clip.sentenceId,
          logicalVoice: clip.speakerId,
          googleVoiceId: clip.voiceId,
          language: 'it-IT',
          text: clip.text,
          generationSpeed: 'normal',
          generationVersion: 1,
          outputFilename: `${cacheKey}.mp3`,
          estimatedBillableCharacters: counted.chars,
          action: 'generate',
        },
      ],
      pricing,
      hardLimitChars: runtime.hardLimitChars,
      trackedUsage: runtime.trackedUsage,
      providerConfigured: true,
      now: runtime.now,
      dryRun: false,
      allowPaidUsage: false,
    });

    if (!guard.allowed) {
      failedCount++;
      errors.push(`Guard rejected ${clip.contentId}: ${guard.error}`);
      break;
    }

    process.stdout.write(`[${i + 1}/${missingClips.length}] ${clip.storyId} Ch${clip.chapterNumber} ${clip.sentenceId} (${clip.speakerId} → ${clip.voiceName})... `);

    try {
      const result = await withGoogleApiPermit(guard, () =>
        tts.generateSpeech({
          text: clip.text,
          voiceId: clip.voiceId,
          language: 'it-IT',
          speed: 'normal',
        }),
      );

      const destFile = path.join(audioDataDir, `${cacheKey}.mp3`);
      fs.writeFileSync(destFile, Buffer.from(result.audio));

      const newAsset = {
        id: cacheKey,
        contentId: clip.contentId,
        cacheKey,
        text: clip.text,
        speakerId: clip.speakerId,
        voiceId: clip.voiceId,
        provider: 'google',
        language: 'it-IT',
        speed: 'normal',
        generationVersion: 1,
        status: 'approved',
        audioUrl: `/audio/a1/${cacheKey}.mp3`,
        durationMs: null,
      };

      updateRegistryWithAsset(newAsset);
      successCount++;
      const kb = (result.audio.byteLength / 1024).toFixed(1);
      console.log(`OK (${kb} KB)`);
    } catch (err) {
      failedCount++;
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${clip.contentId}: ${msg}`);
      console.log(`FAILED (${msg})`);
    }
  }

  console.log('\n================================================================');
  console.log('  GENERATION COMPLETED');
  console.log('================================================================');
  console.log(`  Total Missing Requested:  ${missingClips.length}`);
  console.log(`  Successfully Generated:   ${successCount}`);
  console.log(`  Failed:                   ${failedCount}`);
  console.log('================================================================\n');

  if (errors.length) {
    console.error('Errors encountered:');
    for (const e of errors.slice(0, 10)) console.error(`  - ${e}`);
    if (failedCount > 0) process.exit(1);
  }

  console.log('Next step: node mobile/scripts/package-a2plus-audio.js');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
