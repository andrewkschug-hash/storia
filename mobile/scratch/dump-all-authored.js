const fs = require('fs');
const path = require('path');

const stories = [
  'luca-prima-di-roma-01',
  'luca-prima-di-roma-02',
  'luca-prima-di-roma-03',
  'luca-prima-di-roma-04',
  'luca-prima-di-roma-05',
  'luca-a-roma',
];

for (const storyId of stories) {
  const filePath = path.join(__dirname, `../content/stories/${storyId}/production-exercises.json`);
  if (!fs.existsSync(filePath)) continue;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`\n================================================================`);
  console.log(`STORY: ${storyId} (${data.exercises.length} exercises)`);
  console.log(`================================================================`);

  let currentCh = '';
  for (const ex of data.exercises) {
    if (ex.chapterId !== currentCh) {
      currentCh = ex.chapterId;
      console.log(`\n--- Chapter ${currentCh} ---`);
    }
    const alts = (ex.acceptableAnswers || []).join(' | ');
    console.log(`  [${ex.exerciseId || ex.id}]`);
    console.log(`    Prompt (EN):    "${ex.promptEn}"`);
    console.log(`    Expected (IT):  "${ex.expectedIt}"`);
    if (alts) {
      console.log(`    Acceptable:     [${alts}]`);
    }
  }
}
