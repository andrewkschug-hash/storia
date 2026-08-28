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

  for (const ex of data.exercises) {
    const p = ex.promptEn || '';
    const e = ex.expectedIt || '';
    const alts = ex.acceptableAnswers || [];

    // Check for typos or oddities
    if (e.includes('cassa') || e.includes('poso') || p.includes('(soldi)')) {
      console.log(`[${storyId}][${ex.chapterId}][${ex.exerciseId}] FOUND ODDITY:`);
      console.log(`  Prompt: "${p}" | Expected: "${e}" | Alts: [${alts.join(', ')}]`);
    }

    // Check for duplicate alts
    for (const alt of alts) {
      if (alt.toLowerCase().replace(/['’.,!?]/g, '').trim() === e.toLowerCase().replace(/['’.,!?]/g, '').trim()) {
        console.log(`[${storyId}][${ex.chapterId}][${ex.exerciseId}] DUPLICATE ALT: "${alt}" vs Expected: "${e}"`);
      }
    }
  }
}
