/**
 * Phase 13 story package builder.
 * Reads authored sentence arrays, assigns lemmas (collecting unknowns into lexicon-additions),
 * writes chapters + sentence-english + manifest + arcs.
 *
 * Usage:
 *   node scripts/phase13/build-story.cjs lettera
 *   node scripts/phase13/build-story.cjs villaggio
 *   node scripts/phase13/build-story.cjs all
 */
const fs = require('fs');
const path = require('path');
const { buildLemmaMap, lemmasFor, tokenizeItalian } = require('../a2/lemma-map');

const ROOT = path.join(__dirname, '../..');
const CONTENT = path.join(ROOT, 'content/stories');
const CORE_LEXICON = path.join(ROOT, 'content/lexicon/italian-core.json');

const STORIES = {
  lettera: {
    storyId: 'lettera-per-elena',
    contentModule: './lettera-content.cjs',
    title: 'A letter for Elena',
    titleIt: 'Una lettera per Elena',
    synopsis:
      'Al Caffè Brenta un libro non si vende. Elena scrive a uno sconosciuto. Il martedì conosce già Pietro.',
    description:
      'An A2+ romance: people tell the truth in a café book, not to each other. The Tuesday driver is already in her week.',
    cefrLevel: 'A2+',
    chapterCount: 22,
    protagonistId: 'elena-marini',
    arcId: 'lettera-per-elena-a2-plus',
    arcDescription:
      'An A2+ romance about handwriting, Tuesday deliveries, and saying a true sentence aloud.',
    narrativeStage: 'Elena writes in the book and learns the face on the other side.',
  },
  villaggio: {
    storyId: 'il-villaggio-che-non-esiste',
    contentModule: './villaggio-content.cjs',
    title: 'The village that does not exist',
    titleIt: 'Il villaggio che non esiste',
    synopsis:
      'Giada scende a Collevento, cancellata dall\'orario. Il paese c\'è. Dopo il tramonto la strada è acqua.',
    description:
      'An A2+ grounded fantasy: a deleted village, a sluice clock, and a girl who must not become her mother.',
    cefrLevel: 'A2+',
    chapterCount: 24,
    protagonistId: 'giada-rinaldi',
    arcId: 'il-villaggio-che-non-esiste-a2-plus',
    arcDescription:
      'An A2+ folkloric mystery about maps, water, and mistaken identity — without magic.',
    narrativeStage: 'Giada learns why Collevento does not exist on the map.',
  },
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function wordCount(sentences) {
  return sentences.reduce((n, s) => n + tokenizeItalian(s.text).length, 0);
}

function chunkParagraphs(sentences, size = 5) {
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += size) {
    paragraphs.push(sentences.slice(i, i + size));
  }
  return paragraphs;
}

function loadLexicon(storyDir) {
  const core = JSON.parse(fs.readFileSync(CORE_LEXICON, 'utf8')).lexicon;
  const additionsPath = path.join(storyDir, 'lexicon-additions.json');
  let additions = [];
  if (fs.existsSync(additionsPath)) {
    additions = JSON.parse(fs.readFileSync(additionsPath, 'utf8')).lexicon ?? [];
  }
  return { core, additions, additionsPath };
}

function ensureAddition(additions, surface, storyId) {
  const lemmaId = surface
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9']/g, '');
  if (!lemmaId) return;
  if (additions.some((e) => e.lemmaId === lemmaId || e.italian.toLowerCase() === surface.toLowerCase())) {
    return;
  }
  additions.push({
    lemmaId,
    italian: surface,
    english: surface,
    partOfSpeech: 'other',
    difficulty: 2,
    frequency: 'medium',
    cefrLevel: 'A2+',
    notes: `Story-local for ${storyId}`,
  });
}

function buildChapter(meta, ch, lemmaMap, unknown, storyId) {
  const chapterId = `${storyId}-${pad(ch.number)}`;
  const builtSentences = [];
  let si = 0;
  for (const raw of ch.sentences) {
    si += 1;
    const sid = `s${pad(si)}`;
    const text = raw.text.trim();
    const lemmas = lemmasFor(lemmaMap, text, `${chapterId}:${sid}`, unknown);
    builtSentences.push({
      id: sid,
      text,
      speakerId: raw.speakerId ?? null,
      kind: raw.speakerId ? 'dialogue' : 'narration',
      lemmas,
      en: raw.en,
    });
  }

  const paragraphs = chunkParagraphs(builtSentences).map((group, idx) => ({
    id: `p${idx + 1}`,
    order: idx + 1,
    sentences: group.map(({ en, ...rest }) => rest),
  }));

  const questions = (ch.questions ?? []).map((q, qi) => ({
    id: `ch${pad(ch.number)}_q${pad(qi + 1)}`,
    chapterId,
    type: q.type ?? 'direct',
    question: q.question,
    choices: q.choices,
    correctChoice: q.correctChoice,
    explanation: q.explanation,
    difficulty: q.difficulty ?? 2,
  }));

  return {
    chapter: {
      id: chapterId,
      storyId,
      number: ch.number,
      title: ch.title,
      titleIt: ch.titleIt,
      difficultyLevel: 2,
      locationIds: ch.locationIds,
      characterIds: ch.characterIds,
      events: [
        {
          id: `ev-${chapterId}`,
          summary: ch.summary,
          characterIds: ch.characterIds,
          locationIds: ch.locationIds,
          rememberedFacts: ch.facts ?? [],
        },
      ],
      paragraphs,
      questions,
    },
    englishEntries: builtSentences.map((s) => [`${chapterId}:${s.id}`, s.en]),
    words: wordCount(builtSentences),
  };
}

function writeStory(key) {
  const cfg = STORIES[key];
  if (!cfg) throw new Error(`Unknown story key: ${key}`);
  const storyDir = path.join(CONTENT, cfg.storyId);
  const chaptersDir = path.join(storyDir, 'chapters');
  fs.mkdirSync(chaptersDir, { recursive: true });

  const contentPath = path.join(__dirname, cfg.contentModule);
  if (!fs.existsSync(contentPath)) {
    throw new Error(`Missing content module: ${contentPath}`);
  }
  // Clear require cache for iterative authoring
  delete require.cache[require.resolve(contentPath)];
  const chapters = require(contentPath);
  if (!Array.isArray(chapters) || chapters.length !== cfg.chapterCount) {
    throw new Error(
      `${cfg.storyId}: expected ${cfg.chapterCount} chapters, got ${chapters?.length ?? 0}`,
    );
  }

  let { core, additions, additionsPath } = loadLexicon(storyDir);
  let lemmaMap = buildLemmaMap([...core, ...additions]);
  const unknown = new Map();
  const english = {};
  const manifestChapters = [];
  const wordReport = [];

  // First pass: collect unknowns
  for (const ch of chapters) {
    buildChapter(cfg, ch, lemmaMap, unknown, cfg.storyId);
  }
  for (const [folded, sample] of unknown) {
    // sample like `id: "surface" in "..."`
    const m = sample.match(/: "([^"]+)" in/);
    const surface = m ? m[1] : folded;
    ensureAddition(additions, surface, cfg.storyId);
  }
  additions.sort((a, b) => a.lemmaId.localeCompare(b.lemmaId));
  fs.writeFileSync(additionsPath, JSON.stringify({ lexicon: additions }, null, 2) + '\n');
  lemmaMap = buildLemmaMap([...core, ...additions]);

  // Second pass: write chapters with real lemmas
  for (const ch of chapters) {
    const { chapter, englishEntries, words } = buildChapter(cfg, ch, lemmaMap, null, cfg.storyId);
    const file = `chapter-${pad(ch.number)}.json`;
    fs.writeFileSync(path.join(chaptersDir, file), JSON.stringify(chapter, null, 2) + '\n');
    for (const [k, v] of englishEntries) english[k] = v;
    manifestChapters.push({
      id: chapter.id,
      number: ch.number,
      title: ch.title,
      titleIt: ch.titleIt,
      difficultyLevel: 2,
      file,
    });
    wordReport.push({ n: ch.number, titleIt: ch.titleIt, words });
  }

  const characters = JSON.parse(fs.readFileSync(path.join(storyDir, 'characters.json'), 'utf8'));
  const locations = JSON.parse(fs.readFileSync(path.join(storyDir, 'locations.json'), 'utf8'));

  const arc = {
    id: cfg.arcId,
    storyId: cfg.storyId,
    cefrLevel: cfg.cefrLevel,
    title: cfg.title,
    titleIt: cfg.titleIt,
    description: cfg.arcDescription,
    narrativeStage: cfg.narrativeStage,
    chapterStart: 1,
    chapterEnd: cfg.chapterCount,
    status: 'available',
  };

  const manifest = {
    id: cfg.storyId,
    title: cfg.title,
    titleIt: cfg.titleIt,
    slug: cfg.storyId,
    level: 2,
    cefrLevel: cfg.cefrLevel,
    synopsis: cfg.synopsis,
    characterIds: characters.characters.map((c) => c.id),
    locationIds: locations.locations.map((l) => l.id),
    chapters: manifestChapters,
    arcs: [arc],
  };

  fs.writeFileSync(path.join(storyDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(path.join(storyDir, 'arcs.json'), JSON.stringify({ arcs: [arc] }, null, 2) + '\n');
  fs.writeFileSync(path.join(storyDir, 'sentence-english.json'), JSON.stringify(english, null, 2) + '\n');

  console.log(`\n${cfg.storyId}: ${cfg.chapterCount} chapters`);
  for (const row of wordReport) {
    console.log(`  ch${pad(row.n)} ${row.words}w  ${row.titleIt}`);
  }
  console.log(`  lexicon-additions: ${additions.length}`);
  console.log(`  unknowns absorbed: ${unknown.size}`);
}

const arg = process.argv[2] || 'all';
if (arg === 'all') {
  writeStory('lettera');
  writeStory('villaggio');
} else if (STORIES[arg]) {
  writeStory(arg);
} else {
  console.error('Usage: node build-story.cjs [lettera|villaggio|all]');
  process.exit(1);
}
