/**
 * Shared helpers for isolated A2+ audio pipeline across the three genre stories:
 *   1. La casa delle finestre (24 chapters)
 *   2. Una lettera per Elena (22 chapters)
 *   3. Il villaggio che non esiste (24 chapters)
 *
 * Read-only against authored story JSON.
 */
const fs = require('fs');
const path = require('path');

const mobileRoot = path.join(__dirname, '..');
const repoRoot = path.join(__dirname, '..', '..');
const contentRoot = path.join(mobileRoot, 'content');
const storiesDir = path.join(contentRoot, 'stories');
const ttsGatewayDir = path.join(repoRoot, 'services', 'tts-gateway');

const A2_PLUS_STORIES = {
  'la-casa-delle-finestre': {
    id: 'la-casa-delle-finestre',
    title: 'La casa delle finestre',
    genre: 'Thriller',
    totalChapters: 24,
    chapterPrefix: 'la-casa-delle-finestre',
    dir: path.join(storiesDir, 'la-casa-delle-finestre'),
  },
  'lettera-per-elena': {
    id: 'lettera-per-elena',
    title: 'Una lettera per Elena',
    genre: 'Romance',
    totalChapters: 22,
    chapterPrefix: 'lettera-per-elena',
    dir: path.join(storiesDir, 'lettera-per-elena'),
  },
  'il-villaggio-che-non-esiste': {
    id: 'il-villaggio-che-non-esiste',
    title: 'Il villaggio che non esiste',
    genre: 'Fantasy',
    totalChapters: 24,
    chapterPrefix: 'il-villaggio-che-non-esiste',
    dir: path.join(storiesDir, 'il-villaggio-che-non-esiste'),
  },
};

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function resolveSpeakerId(speakerId) {
  if (!speakerId || speakerId === 'narrator') return 'narrator';
  return speakerId;
}

function isA2PlusStoryId(storyId) {
  return Boolean(A2_PLUS_STORIES[storyId]);
}

function assertSentenceIntegrity(chapter) {
  const seen = new Set();
  const sentences = [];
  for (const paragraph of chapter.paragraphs ?? []) {
    for (const sentence of paragraph.sentences ?? []) {
      if (!sentence?.id) throw new Error(`Missing sentence.id in ${chapter.id}`);
      if (!sentence.text || !String(sentence.text).trim()) {
        throw new Error(`Missing sentence text ${chapter.id}:${sentence.id}`);
      }
      if (seen.has(sentence.id)) {
        throw new Error(`Duplicate sentence.id ${chapter.id}:${sentence.id}`);
      }
      seen.add(sentence.id);
      sentences.push(sentence);
    }
  }
  return sentences;
}

function loadAuthoredStoryChapters(storyId, fromChapter, toChapter) {
  const meta = A2_PLUS_STORIES[storyId];
  if (!meta) throw new Error(`Unknown A2+ story "${storyId}"`);

  const manifestPath = path.join(meta.dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing manifest for ${storyId} at ${manifestPath}`);
  }
  const manifest = loadJson(manifestPath);
  const chaptersDir = path.join(meta.dir, 'chapters');

  const from = fromChapter ?? 1;
  const to = toChapter ?? meta.totalChapters;
  if (from < 1 || to > meta.totalChapters || from > to) {
    throw new Error(`Invalid chapter range ${from}–${to} for ${storyId} (max ${meta.totalChapters})`);
  }

  const loadedChapters = [];
  for (let n = from; n <= to; n++) {
    const summary = (manifest.chapters ?? []).find((c) => c.number === n);
    if (!summary) throw new Error(`Missing chapter ${n} in manifest for ${storyId}`);
    const filePath = path.join(chaptersDir, summary.file);
    if (!fs.existsSync(filePath)) throw new Error(`Missing chapter file ${filePath}`);
    const chapter = loadJson(filePath);
    const sentences = assertSentenceIntegrity(chapter);
    loadedChapters.push({ summary, chapter, sentences });
  }

  return { meta, manifest, loadedChapters };
}

function collectA2PlusClipPlan(options = {}) {
  const { resolveSpeakerVoice } = require('./voice-roster-common');
  const voicesPath = path.join(contentRoot, 'audio', 'voices.json');
  const roster = loadJson(voicesPath);

  const selectedStoryIds = options.storyId
    ? [options.storyId]
    : Object.keys(A2_PLUS_STORIES);

  const plan = {
    stories: [],
    clips: [],
    narratorClipsCount: 0,
    characterClipsCount: 0,
    totalBillableChars: 0,
    unmappedSpeakers: [],
    idGaps: [],
  };

  for (const storyId of selectedStoryIds) {
    const from = options.pilot ? 1 : (options.from ?? 1);
    const to = options.pilot ? 1 : (options.to ?? A2_PLUS_STORIES[storyId].totalChapters);

    const { meta, manifest, loadedChapters } = loadAuthoredStoryChapters(storyId, from, to);
    const storyEntry = {
      meta,
      manifest,
      chapters: [],
    };

    for (const { chapter, sentences } of loadedChapters) {
      const chapterClips = [];

      // Check sentence ID sequential integrity
      const nums = sentences
        .map((s) => Number(String(s.id).replace(/^s/i, '')))
        .filter((x) => Number.isInteger(x))
        .sort((a, b) => a - b);
      if (nums.length) {
        const missing = [];
        for (let i = nums[0]; i <= nums[nums.length - 1]; i++) {
          if (!nums.includes(i)) missing.push(`s${String(i).padStart(2, '0')}`);
        }
        if (missing.length) plan.idGaps.push({ storyId, chapter: chapter.number, missing });
      }

      for (const sent of sentences) {
        const speakerId = resolveSpeakerId(sent.speakerId);
        const voice = resolveSpeakerVoice(roster, speakerId, 'google');
        if (!voice) {
          plan.unmappedSpeakers.push({
            storyId,
            chapterId: chapter.id,
            sentenceId: sent.id,
            speakerId,
          });
        }

        const charCount = Array.from(sent.text).length;
        plan.totalBillableChars += charCount;

        if (speakerId === 'narrator') {
          plan.narratorClipsCount++;
        } else {
          plan.characterClipsCount++;
        }

        const contentId = `sentence:${chapter.id}:${sent.id}:standard`;
        const clip = {
          storyId,
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          sentenceId: sent.id,
          speakerId,
          voiceId: voice?.voiceId ?? null,
          voiceName: voice?.voiceName ?? voice?.voiceId ?? 'UNMAPPED',
          text: sent.text,
          charCount,
          contentId,
        };

        chapterClips.push(clip);
        plan.clips.push(clip);
      }

      storyEntry.chapters.push({ chapter, sentences, clips: chapterClips });
    }

    plan.stories.push(storyEntry);
  }

  return plan;
}

function printHumanReviewableManifest(plan, options = {}) {
  console.log('================================================================');
  console.log(`  A2+ AUDIO GENERATION MANIFEST — ${options.dryRun ? 'DRY-RUN' : 'EXECUTION'}`);
  console.log('================================================================\n');

  for (const s of plan.stories) {
    console.log(`STORY: ${s.meta.title} (${s.meta.id}) — ${s.meta.genre}`);
    for (const ch of s.chapters) {
      const chNum = String(ch.chapter.number).padStart(2, '0');
      console.log(`  Chapter ${chNum} (${ch.chapter.id}) — ${ch.clips.length} sentences:`);
      for (const clip of ch.clips) {
        const vName = (clip.voiceName || 'UNMAPPED').replace(/^it[-_]IT[-_]/i, '');
        console.log(`    ${clip.sentenceId} ${clip.speakerId} → ${vName} (${clip.charCount} chars)`);
      }
      console.log('');
    }
  }

  console.log('================================================================');
  console.log('  MANIFEST SUMMARY');
  console.log('================================================================');
  console.log(`  Total Stories:       ${plan.stories.length}`);
  console.log(`  Total Chapters:      ${plan.stories.reduce((acc, s) => acc + s.chapters.length, 0)}`);
  console.log(`  Total Clips:         ${plan.clips.length}`);
  console.log(`  Narrator Clips:      ${plan.narratorClipsCount}`);
  console.log(`  Character Clips:     ${plan.characterClipsCount}`);
  console.log(`  Estimated Chars:     ${plan.totalBillableChars.toLocaleString()}`);
  console.log(`  Unknown / Unmapped:  ${plan.unmappedSpeakers.length}`);
  console.log(`  Sentence ID Gaps:    ${plan.idGaps.length}`);
  console.log(`  Fail-Closed Status:  ${plan.unmappedSpeakers.length === 0 ? 'PASS (Ready)' : 'BLOCKED'}`);
  console.log('================================================================\n');
}

module.exports = {
  A2_PLUS_STORIES,
  mobileRoot,
  repoRoot,
  contentRoot,
  storiesDir,
  ttsGatewayDir,
  loadJson,
  resolveSpeakerId,
  isA2PlusStoryId,
  assertSentenceIntegrity,
  loadAuthoredStoryChapters,
  collectA2PlusClipPlan,
  printHumanReviewableManifest,
};
