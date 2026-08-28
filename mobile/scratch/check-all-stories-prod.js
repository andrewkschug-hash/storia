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
  if (!fs.existsSync(filePath)) {
    console.log(`Missing file: ${storyId}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Story: ${storyId}, exercises: ${data.exercises.length}`);
  for (const ex of data.exercises) {
    if (!ex.promptEn || !ex.expectedIt) {
      console.log(`  ERROR missing prompt/expected in ${ex.exerciseId}`);
    }
  }
}
