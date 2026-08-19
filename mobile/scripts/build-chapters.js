/**
 * Writes Luca a Roma chapters 1–20 from the JS sources.
 *
 * Do not run this to "sync" live JSON after plot edits to chapters 7–8:
 * those JSON files were edited independently (job/money lines, padrone
 * dialogue). To refresh 16–20 only, use write-chapters-16-20.js.
 */
const fs = require('fs');
const path = require('path');

const { chapter01, chapter02, chapter03, chapter04, chapter05 } = require('./chapters-01-05');
const chapters620 = require('./chapters-06-20');
const { questionsByChapterNumber } = require('./questions-01-20');

const all = {
  1: chapter01,
  2: chapter02,
  3: chapter03,
  4: chapter04,
  5: chapter05,
  6: chapters620.chapter06,
  7: chapters620.chapter07,
  8: chapters620.chapter08,
  9: chapters620.chapter09,
  10: chapters620.chapter10,
  11: chapters620.chapter11,
  12: chapters620.chapter12,
  13: chapters620.chapter13,
  14: chapters620.chapter14,
  15: chapters620.chapter15,
  16: chapters620.chapter16,
  17: chapters620.chapter17,
  18: chapters620.chapter18,
  19: chapters620.chapter19,
  20: chapters620.chapter20,
};

const outDir = path.join(__dirname, '..', 'content', 'stories', 'luca-a-roma', 'chapters');
fs.mkdirSync(outDir, { recursive: true });

const manifestChapters = [];

for (let n = 1; n <= 20; n++) {
  const base = all[n];
  if (!base) throw new Error(`Missing chapter ${n}`);
  const questions = questionsByChapterNumber[n];
  if (!questions || questions.length < 2) {
    throw new Error(`Missing questions for chapter ${n}`);
  }
  const ch = { ...base, questions };
  const file = `chapter-${String(n).padStart(2, '0')}.json`;
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(ch, null, 2) + '\n', 'utf8');
  manifestChapters.push({
    id: ch.id,
    number: ch.number,
    title: ch.title,
    titleIt: ch.titleIt,
    difficultyLevel: ch.difficultyLevel,
    file,
  });
  console.log('wrote', file, ch.titleIt, `(${questions.length} questions)`);
}

const manifestPath = path.join(__dirname, '..', 'content', 'stories', 'luca-a-roma', 'manifest.json');
const existingManifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : null;
const preservedChapters = (existingManifest?.chapters ?? []).filter((c) => c.number > 20);

const manifest = {
  id: 'luca-a-roma',
  title: 'Luca in Rome',
  titleIt: 'Luca a Roma',
  slug: 'luca-a-roma',
  level: 1,
  synopsis:
    'Luca arriva a Roma, trova una casa, conosce Sofia e gli amici, lavora, aiuta Marco e fa un viaggio — poi torna a casa.',
  characterIds: ['luca', 'sofia', 'marco', 'giulia', 'nonna-rosa', 'padrone'],
  locationIds: [
    'roma',
    'stazione',
    'bar-centrale',
    'appartamento-luca',
    'quartiere',
    'lavoro-caffe',
    'casa-nonna',
    'centro',
    'strada',
    'fuori-roma',
  ],
  chapters: [...manifestChapters, ...preservedChapters].sort((a, b) => a.number - b.number),
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('wrote manifest.json');
