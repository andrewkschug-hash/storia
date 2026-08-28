const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, `../content/stories/luca-a-roma/production-exercises.json`);
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

for (let i = 1; i <= 30; i++) {
  const chId = `luca-a-roma-${String(i).padStart(2, '0')}`;
  const exercises = data.exercises.filter(e => e.chapterId === chId);
  console.log(`\n=== CHAPTER ${i} (${chId}) ===`);
  for (const ex of exercises) {
    const alts = (ex.acceptableAnswers || []).join(' | ');
    console.log(`  [${ex.exerciseId}]`);
    console.log(`    Prompt (EN):   "${ex.promptEn}"`);
    console.log(`    Expected (IT): "${ex.expectedIt}"`);
    if (alts) {
      console.log(`    Acceptable:    [${alts}]`);
    }
  }
}
