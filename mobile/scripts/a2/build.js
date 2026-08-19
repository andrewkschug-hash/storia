/**
 * Build Phase 10 A2 chapters 25–40 without rewriting A1 or frozen A1+ (1–24).
 *
 * WARNING: Overwrites authored chapter JSON for chapters 25–40 from scripts/a2/story.js.
 * Canonical SOT is content/stories/luca-a-roma/chapters/chapter-{25..40}.json.
 * story.js is a LEGACY DRAFT — not production SOT. Phase 10C rewrites prose by hand.
 *
 * Run: node scripts/a2/build.js --force
 */
const fs = require('fs');
const path = require('path');

const { requireGeneratorForceFlag } = require('../phase10-bridge-guard');
requireGeneratorForceFlag('a2/build.js', {
  chapterRange: '25–40 (+ manifest EN/adaptive for A2)',
  extra:
    '  Note: story.js draft diverges from authored JSON. Prefer Blueprint v1 manual rewrite.',
});

const { inflections, lemmas: newLemmas } = require('./lexicon-patch');
const { buildLemmaMap, lemmasFor, tokenizeItalian } = require('./lemma-map');
const { chapters: allAuthored } = require('./story');
const { adaptive } = require('./adaptive');
const {
  PHASE10_CHAPTER_COUNT,
  assertPhase10ChapterRange,
  selectPhase10Chapters,
  isPhase10ContentKey,
} = require('./phase10-range');

const root = path.join(__dirname, '..', '..');
const lexiconPath = path.join(root, 'content', 'lexicon', 'italian-core.json');
const chaptersDir = path.join(root, 'content', 'stories', 'luca-a-roma', 'chapters');
const manifestPath = path.join(root, 'content', 'stories', 'luca-a-roma', 'manifest.json');
const englishPath = path.join(root, 'content', 'stories', 'luca-a-roma', 'sentence-english.json');
const adaptivePath = path.join(root, 'content', 'stories', 'luca-a-roma', 'adaptive-variants.json');

// Phase 10 safety: resolve & guard the generation set BEFORE any writes.
const authored = selectPhase10Chapters(allAuthored);
assertPhase10ChapterRange(authored);
if (authored.length !== PHASE10_CHAPTER_COUNT) {
  throw new Error(
    `Expected ${PHASE10_CHAPTER_COUNT} Phase 10 A2 chapters (25–40), got ${authored.length}`,
  );
}

function mergeLexicon() {
  const file = JSON.parse(fs.readFileSync(lexiconPath, 'utf8'));
  const byId = new Map(file.lexicon.map((e) => [e.lemmaId, e]));
  for (const [lemmaId, extras] of Object.entries(inflections)) {
    const entry = byId.get(lemmaId);
    if (!entry) throw new Error(`Cannot patch missing lemma ${lemmaId}`);
    const set = new Set([...(entry.inflections ?? []), ...extras]);
    entry.inflections = [...set];
  }
  for (const lemma of newLemmas) {
    if (byId.has(lemma.lemmaId)) {
      const entry = byId.get(lemma.lemmaId);
      const set = new Set([...(entry.inflections ?? []), ...(lemma.inflections ?? [])]);
      entry.inflections = [...set];
      continue;
    }
    file.lexicon.push(lemma);
    byId.set(lemma.lemmaId, lemma);
  }
  fs.writeFileSync(lexiconPath, JSON.stringify(file, null, 2) + '\n', 'utf8');
  return file.lexicon;
}

function phrase(surface, literalEn, naturalEn, text) {
  const tokens = tokenizeItalian(text);
  const needle = tokenizeItalian(surface);
  const start = tokens.findIndex((_, i) =>
    needle.every((n, j) => tokens[i + j]?.toLowerCase() === n.toLowerCase()),
  );
  if (start < 0) return null;
  return { surface, literalEn, naturalEn, tokenStart: start, tokenEnd: start + needle.length - 1 };
}

function materialize(map, chapter) {
  let sentenceN = 0;
  const paragraphs = chapter.paragraphs.map((p, pi) => ({
    id: `p${pi + 1}`,
    order: pi + 1,
    sentences: p.map((s) => {
      sentenceN += 1;
      const id = `s${String(sentenceN).padStart(2, '0')}`;
      const lemmas = lemmasFor(map, s.text, `${chapter.id}:${id}`, unknown);
      const row = {
        id,
        text: s.text,
        speakerId: s.speaker ?? null,
        kind: s.speaker ? 'dialogue' : 'narration',
        lemmas,
      };
      if (s.phrases?.length) {
        const phrases = s.phrases
          .map((ph) => phrase(ph.surface, ph.literalEn, ph.naturalEn, s.text))
          .filter(Boolean);
        if (phrases.length) row.phrases = phrases;
      }
      return row;
    }),
  }));
  const questions = chapter.questions.map((q, i) => ({
    id: `ch${String(chapter.number).padStart(2, '0')}_q${String(i + 1).padStart(2, '0')}`,
    chapterId: chapter.id,
    ...q,
  }));
  return {
    id: chapter.id,
    storyId: 'luca-a-roma',
    number: chapter.number,
    title: chapter.title,
    titleIt: chapter.titleIt,
    difficultyLevel: 2,
    locationIds: chapter.locationIds,
    characterIds: chapter.characterIds,
    events: chapter.events,
    paragraphs,
    questions,
    _english: paragraphs.flatMap((p) =>
      p.sentences.map((s, idx) => {
        const src = chapter.paragraphs.flat()[paragraphs.slice(0, paragraphs.indexOf(p)).reduce((n, x) => n + x.sentences.length, 0) + idx];
        return src;
      }),
    ),
  };
}

function collectEnglish(chapter) {
  const out = {};
  let n = 0;
  for (const p of chapter.paragraphs) {
    for (const s of p) {
      n += 1;
      const id = `s${String(n).padStart(2, '0')}`;
      if (!s.english) throw new Error(`${chapter.id}:${id} missing english`);
      out[`${chapter.id}:${id}`] = s.english;
    }
  }
  return out;
}

function wordCount(chapterJson) {
  let n = 0;
  for (const p of chapterJson.paragraphs) {
    for (const s of p.sentences) n += s.lemmas.length;
  }
  return n;
}

const lexicon = mergeLexicon();
const map = buildLemmaMap(lexicon);
const unknown = new Map();

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
// Preserve frozen A1 (1–20) and A1+ bridge (21–24); only refresh Phase 10 A2 (25–40).
manifest.chapters = manifest.chapters.filter((c) => c.number <= 24);
manifest.synopsis =
  'Luca arriva a Roma, trova una casa e un lavoro, aiuta gli amici — e poi la sua nuova vita al caffè diventa più grande.';
manifest.cefrLevel = 'A1';

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
for (const key of Object.keys(english)) {
  if (isPhase10ContentKey(key)) delete english[key];
}

const adaptiveFile = JSON.parse(fs.readFileSync(adaptivePath, 'utf8'));
for (const key of Object.keys(adaptiveFile.sentences)) {
  if (isPhase10ContentKey(key)) delete adaptiveFile.sentences[key];
}

for (const src of authored) {
  materialize(map, src);
}
if (unknown.size > 0) {
  console.error(`Unknown forms (${unknown.size}):`);
  for (const [form, where] of [...unknown.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.error(`  ${form}  ←  ${where}`);
  }
  process.exit(1);
}

// Re-assert immediately before any chapter JSON writes.
assertPhase10ChapterRange(authored);

for (const src of authored) {
  const json = materialize(map, src);
  delete json._english;
  const file = `chapter-${String(src.number).padStart(2, '0')}.json`;
  fs.writeFileSync(path.join(chaptersDir, file), JSON.stringify(json, null, 2) + '\n', 'utf8');
  Object.assign(english, collectEnglish(src));
  const wc = wordCount(json);
  console.log('wrote', file, src.titleIt, `${wc} words`, `${src.questions.length} questions`);
  if (wc < 320) console.warn('  (short of the A2 stamina range)');
  manifest.chapters.push({
    id: src.id,
    number: src.number,
    title: src.title,
    titleIt: src.titleIt,
    difficultyLevel: 2,
    file,
  });
}

function materializeAdaptive(map, rows) {
  const out = {};
  for (const [key, row] of Object.entries(rows)) {
    const variants = (row.variants ?? []).map((v) => {
      const lemmas = lemmasFor(map, v.text, `${key}:${v.id}`, unknown);
      const item = {
        id: v.id,
        text: v.text,
        lemmas,
        reinforces: v.reinforces ?? row.reinforces,
      };
      if (v.phraseReinforces ?? row.phraseReinforces) {
        item.phraseReinforces = v.phraseReinforces ?? row.phraseReinforces;
      }
      if (v.phrases?.length) {
        const phrases = v.phrases.map((ph) => phrase(ph.surface, ph.literalEn, ph.naturalEn, v.text)).filter(Boolean);
        if (phrases.length) item.phrases = phrases;
      }
      if (v.english) english[`${key}:${v.id}`] = v.english;
      return item;
    });
    out[key] = { reinforces: row.reinforces, variants };
    if (row.phraseReinforces) out[key].phraseReinforces = row.phraseReinforces;
  }
  return out;
}

const adaptivePhase10 = Object.fromEntries(
  Object.entries(adaptive).filter(([key]) => isPhase10ContentKey(key)),
);
const adaptiveOut = materializeAdaptive(map, adaptivePhase10);
if (unknown.size > 0) {
  console.error(`Unknown adaptive forms (${unknown.size}):`);
  for (const [form, where] of [...unknown.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.error(`  ${form}  ←  ${where}`);
  }
  process.exit(1);
}

Object.assign(adaptiveFile.sentences, adaptiveOut);
fs.writeFileSync(adaptivePath, JSON.stringify(adaptiveFile, null, 2) + '\n', 'utf8');
fs.writeFileSync(englishPath, JSON.stringify(english, null, 2) + '\n', 'utf8');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('updated manifest, english, adaptive, lexicon');
