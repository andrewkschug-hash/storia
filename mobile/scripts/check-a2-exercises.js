const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'content', 'stories', 'luca-a-roma');
const prod = JSON.parse(fs.readFileSync(path.join(root, 'production-exercises.json'), 'utf8'));
const trans = JSON.parse(fs.readFileSync(path.join(root, 'sentence-english.json'), 'utf8'));

for (let ch = 21; ch <= 40; ch++) {
  const chNum = String(ch).padStart(2, '0');
  const chFile = path.join(root, 'chapters', `chapter-${chNum}.json`);
  const chData = JSON.parse(fs.readFileSync(chFile, 'utf8'));
  const sents = new Map();
  for (const p of chData.paragraphs) {
    for (const s of p.sentences) {
      sents.set(s.id, s);
    }
  }
  const chExs = prod.exercises.filter((e) => e.chapterId === `luca-a-roma-${chNum}`);
  console.log(`\n=== CHAPTER ${chNum} (${chExs.length} exercises) ===`);
  for (const ex of chExs) {
    const s = sents.get(ex.sourceSentenceId);
    const en = trans[`luca-a-roma-${chNum}:${ex.sourceSentenceId}`];
    console.log(`  [${ex.exerciseId}] ${ex.sourceSentenceId}`);
    console.log(`    Expected: "${ex.expectedIt}"`);
    console.log(`    Prompt:   "${ex.promptEn}"`);
    console.log(`    Story IT: "${s ? s.text : 'MISSING'}"`);
    console.log(`    Story EN: "${en || 'NO_EN'}"`);
  }
}
