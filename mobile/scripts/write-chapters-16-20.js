/**
 * Write live JSON for Luca a Roma chapters 16–20 only.
 * Does not rewrite chapters 1–15 (JSON 7–8 diverge from JS on purpose).
 */
const fs = require('fs');
const path = require('path');
const chapters620 = require('./chapters-06-20');
const { questionsByChapterNumber } = require('./questions-01-20');

const outDir = path.join(__dirname, '..', 'content', 'stories', 'luca-a-roma', 'chapters');

for (const n of [16, 17, 18, 19, 20]) {
  const key = `chapter${String(n).padStart(2, '0')}`;
  const base = chapters620[key];
  if (!base) throw new Error(`Missing ${key}`);
  const questions = questionsByChapterNumber[n];
  if (!questions || questions.length < 2) {
    throw new Error(`Missing questions for chapter ${n}`);
  }
  const ch = { ...base, questions };
  const file = `chapter-${String(n).padStart(2, '0')}.json`;
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(ch, null, 2) + '\n', 'utf8');
  console.log('wrote', file, ch.titleIt);
}
