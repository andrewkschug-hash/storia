/**
 * Shared helpers for isolated A2 audio scripts (chapters 21–40).
 * Read-only against authored story JSON. Never imports story.js.
 */
const fs = require('fs');
const path = require('path');

const MIN_CHAPTER = 21;
const MAX_CHAPTER = 40;

const mobileRoot = path.join(__dirname, '..');
const repoRoot = path.join(__dirname, '..', '..');
const contentRoot = path.join(mobileRoot, 'content');
const storyPath = path.join(contentRoot, 'stories', 'luca-a-roma');
const chaptersDir = path.join(storyPath, 'chapters');

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function resolveSpeakerId(speakerId) {
  if (!speakerId || speakerId === 'narrator') return 'narrator';
  return speakerId;
}

function chapterNumberFromContentId(contentId) {
  const match = String(contentId ?? '').match(/sentence:luca-a-roma-(\d{2}):/);
  if (!match) return null;
  return Number(match[1]);
}

function isA1ContentId(contentId) {
  const n = chapterNumberFromContentId(contentId);
  return n != null && n >= 1 && n <= 20;
}

function isA2ContentId(contentId) {
  const n = chapterNumberFromContentId(contentId);
  return n != null && n >= MIN_CHAPTER && n <= MAX_CHAPTER;
}

function parseA2Range(argv) {
  let from = MIN_CHAPTER;
  let to = MAX_CHAPTER;
  let generate = false;
  let dryRun = false;
  let skipGateway = false;
  for (const arg of argv) {
    if (arg === '--generate') generate = true;
    else if (arg === '--dry-run' || arg === '--preflight') dryRun = true;
    else if (arg === '--skip-gateway') skipGateway = true;
    else if (arg.startsWith('--chapter=')) {
      const n = Number(arg.slice('--chapter='.length));
      from = n;
      to = n;
    } else if (arg.startsWith('--from=')) from = Number(arg.slice('--from='.length));
    else if (arg.startsWith('--to=')) to = Number(arg.slice('--to='.length));
  }
  if (!Number.isInteger(from) || !Number.isInteger(to) || from > to) {
    throw new Error(`Invalid range ${from}–${to}. A2 audio only permits chapters ${MIN_CHAPTER}–${MAX_CHAPTER}.`);
  }
  if (from < MIN_CHAPTER || to > MAX_CHAPTER) {
    throw new Error(
      `A2 audio range ${from}–${to} is outside ${MIN_CHAPTER}–${MAX_CHAPTER}. ` +
        'Chapters 1–20 are frozen A1 audio. Do not use generate-a1 / package-a1 for A2.',
    );
  }
  return { from, to, generate, dryRun, skipGateway };
}

function loadAuthoredChapter(summary) {
  const file = path.join(chaptersDir, summary.file);
  if (!fs.existsSync(file)) throw new Error(`Missing authored chapter file ${summary.file}`);
  const chapter = loadJson(file);
  if (chapter.number < MIN_CHAPTER || chapter.number > MAX_CHAPTER) {
    throw new Error(`Chapter ${chapter.number} is outside A2 range ${MIN_CHAPTER}–${MAX_CHAPTER}`);
  }
  if (chapter.id !== summary.id || chapter.number !== summary.number) {
    throw new Error(`Identity mismatch for chapter ${summary.number}: ${chapter.id} vs ${summary.id}`);
  }
  return chapter;
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

function collectClipPlan(from, to) {
  const manifest = loadJson(path.join(storyPath, 'manifest.json'));
  const adaptive = loadJson(path.join(storyPath, 'adaptive-variants.json'));
  const adaptiveSentences = adaptive.sentences ?? {};
  const chapters = [];
  const clips = [];
  const idGaps = [];

  for (let n = from; n <= to; n += 1) {
    const summary = (manifest.chapters ?? []).find((c) => c.number === n);
    if (!summary) throw new Error(`Missing chapter ${n} in authored manifest`);
    const chapter = loadAuthoredChapter(summary);
    const sentences = assertSentenceIntegrity(chapter);
    chapters.push({ chapter, sentences });

    const nums = sentences
      .map((s) => Number(String(s.id).replace(/^s/i, '')))
      .filter((x) => Number.isInteger(x))
      .sort((a, b) => a - b);
    if (nums.length) {
      const missing = [];
      for (let i = nums[0]; i <= nums[nums.length - 1]; i += 1) {
        if (!nums.includes(i)) missing.push(`s${String(i).padStart(2, '0')}`);
      }
      if (missing.length) idGaps.push({ chapter: n, missing });
    }

    for (const sentence of sentences) {
      clips.push({
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        sentenceId: sentence.id,
        variantId: 'standard',
        speakerId: resolveSpeakerId(sentence.speakerId),
        text: sentence.text,
        contentId: `sentence:${chapter.id}:${sentence.id}:standard`,
      });
      const overlay = adaptiveSentences[`${chapter.id}:${sentence.id}`];
      for (const variant of overlay?.variants ?? []) {
        if (!variant?.text || !variant?.id) continue;
        clips.push({
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          sentenceId: sentence.id,
          variantId: variant.id,
          speakerId: resolveSpeakerId(sentence.speakerId),
          text: variant.text,
          contentId: `sentence:${chapter.id}:${sentence.id}:${variant.id}`,
        });
      }
    }
  }

  const standard = clips.filter((c) => c.variantId === 'standard');
  const extended = clips.filter((c) => c.variantId !== 'standard');
  return { manifest, chapters, clips, standard, extended, idGaps };
}

function printPreflight(plan, from, to) {
  console.log('A2 AUDIO PREFLIGHT');
  console.log(`Range: Ch${from}–${to}`);
  console.log('Source: authored chapter JSON');
  console.log(`Chapters: ${plan.chapters.length}`);
  console.log(`Standard clips required: ${plan.standard.length}`);
  console.log(`Extended clips required: ${plan.extended.length}`);
  console.log(`Total: ${plan.clips.length}`);
  if (plan.idGaps.length) {
    console.log('\nSentence ID gaps (advisory, not errors):');
    for (const row of plan.idGaps) {
      console.log(`  Ch${row.chapter}: ${row.missing.join(', ')}`);
    }
  }
  console.log('\nWill generate (contentIds use actual sentence.id):');
  for (const ch of plan.chapters) {
    const std = plan.standard.filter((c) => c.chapterNumber === ch.chapter.number).length;
    const ext = plan.extended.filter((c) => c.chapterNumber === ch.chapter.number).length;
    console.log(`  Ch${String(ch.chapter.number).padStart(2, '0')} ${ch.chapter.id}: ${std} standard + ${ext} extended`);
  }
}

module.exports = {
  MIN_CHAPTER,
  MAX_CHAPTER,
  mobileRoot,
  repoRoot,
  contentRoot,
  storyPath,
  chaptersDir,
  loadJson,
  resolveSpeakerId,
  chapterNumberFromContentId,
  isA1ContentId,
  isA2ContentId,
  parseA2Range,
  loadAuthoredChapter,
  assertSentenceIntegrity,
  collectClipPlan,
  printPreflight,
};
