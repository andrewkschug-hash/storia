const fs = require('fs');
const path = require('path');

const luca = JSON.parse(fs.readFileSync(path.join(__dirname, '../content/stories/luca-a-roma/production-exercises.json'), 'utf8'));

const byChapter = {};
for (const ex of luca.exercises) {
  byChapter[ex.chapterId] = byChapter[ex.chapterId] || [];
  byChapter[ex.chapterId].push(ex);
}

for (let i = 1; i <= 20; i++) {
  const id = `luca-a-roma-${String(i).padStart(2, '0')}`;
  const idShort = `ch${String(i).padStart(2, '0')}`;
  const ch = byChapter[id] || byChapter[idShort] || byChapter[String(i)] || [];
  console.log(`\n=== Chapter ${id} (${ch.length} exercises) ===`);
  for (const ex of ch) {
    console.log(`- Prompt (EN): "${ex.promptEn}"`);
    console.log(`  Expected (IT): "${ex.expectedIt}"`);
    console.log(`  Acceptable: ${JSON.stringify(ex.acceptableAnswers || [])}`);
  }
}
