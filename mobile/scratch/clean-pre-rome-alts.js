const fs = require('fs');
const path = require('path');

const stories = [
  'luca-prima-di-roma-01',
  'luca-prima-di-roma-02',
  'luca-prima-di-roma-03',
  'luca-prima-di-roma-04',
  'luca-prima-di-roma-05',
];

for (const storyId of stories) {
  const filePath = path.join(__dirname, `../content/stories/${storyId}/production-exercises.json`);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let modified = false;

  for (const ex of data.exercises) {
    if (!ex.acceptableAnswers) continue;

    const normE = ex.expectedIt.toLowerCase().replace(/['’.,;:!?…\s]+/g, '');
    const cleaned = [];
    const seen = new Set([normE]);

    for (const alt of ex.acceptableAnswers) {
      const normAlt = alt.toLowerCase().replace(/['’.,;:!?…\s]+/g, '');
      if (!seen.has(normAlt) && normAlt.length > 0) {
        seen.add(normAlt);
        cleaned.push(alt.trim());
      } else {
        modified = true;
      }
    }

    if (cleaned.length > 0) {
      ex.acceptableAnswers = cleaned;
    } else {
      delete ex.acceptableAnswers;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`Cleaned duplicates in ${storyId}/production-exercises.json`);
  }
}
