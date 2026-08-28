const fs = require('fs');
const path = require('path');

const luca = JSON.parse(fs.readFileSync(path.join(__dirname, '../content/stories/luca-a-roma/production-exercises.json'), 'utf8'));

console.log('Chapters in luca-a-roma exercises:');
const byChapter = {};
for (const ex of luca.exercises) {
  byChapter[ex.chapterId] = byChapter[ex.chapterId] || [];
  byChapter[ex.chapterId].push(ex);
}

for (const ch of Object.keys(byChapter)) {
  console.log(`\n=== Chapter ${ch} (${byChapter[ch].length} exercises) ===`);
  for (const ex of byChapter[ch]) {
    console.log(`- Prompt (EN): "${ex.promptEn}"`);
    console.log(`  Expected (IT): "${ex.expectedIt}"`);
    console.log(`  Acceptable: ${JSON.stringify(ex.acceptableAnswers || [])}`);
    console.log(`  SentenceId: ${ex.sentenceId}`);
  }
}
