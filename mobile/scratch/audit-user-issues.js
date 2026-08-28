const fs = require('fs');
const path = require('path');

const lucaExercisesPath = path.join(__dirname, '../content/stories/luca-a-roma/production-exercises.json');
const lucaExercises = JSON.parse(fs.readFileSync(lucaExercisesPath, 'utf8'));

console.log('Total exercises in luca-a-roma:', lucaExercises.exercises.length);

// Let's inspect chapters 1-70
for (const ex of lucaExercises.exercises) {
  // Check specific keywords from user prompt
  const p = (ex.promptEn || '').toLowerCase();
  const e = (ex.expectedIt || '').toLowerCase();
  const acc = (ex.acceptableAnswers || []).join(' | ');

  if (p.includes('stay') || p.includes('work') || p.includes('money') || p.includes('soldi') || p.includes("what's wrong") || p.includes("leave") || p.includes("do") || p.includes("able") || p.includes("house") || ex.chapterId === 'ch08' || ex.chapterId === 'ch14' || ex.chapterId === 'ch15') {
    console.log(`[${ex.chapterId}][${ex.id}] promptEn: "${ex.promptEn}" | expectedIt: "${ex.expectedIt}" | acceptable: [${acc}]`);
  }
}
