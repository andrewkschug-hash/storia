const fs = require('fs');
const path = require('path');

const storyDir = path.join(__dirname, '../content/stories/luca-a-roma');
const exercises = JSON.parse(fs.readFileSync(path.join(storyDir, 'production-exercises.json'), 'utf8')).exercises;

const checks = [];

for (let ch = 1; ch <= 40; ch++) {
  const chId = `luca-a-roma-${String(ch).padStart(2, '0')}`;
  const chJsonPath = path.join(storyDir, 'chapters', `chapter-${String(ch).padStart(2, '0')}.json`);
  if (!fs.existsSync(chJsonPath)) continue;

  const chData = JSON.parse(fs.readFileSync(chJsonPath, 'utf8'));
  const chExercises = exercises.filter(e => e.chapterId === chId);
  const sentenceMap = new Map();
  if (chData.paragraphs) {
    for (const p of chData.paragraphs) {
      for (const s of p.sentences) {
        sentenceMap.set(s.id, s.text);
      }
    }
  }

  for (const ex of chExercises) {
    const sText = sentenceMap.get(ex.sourceSentenceId) || 'MISSING';
    
    // Check 1st person vs 3rd person pronoun consistency
    const pLower = ex.promptEn.toLowerCase();
    const eLower = ex.expectedIt.toLowerCase();
    
    let note = '';
    if (pLower.startsWith('i ') || pLower.startsWith("i'") || pLower.startsWith("i’")) {
      // Prompt is 1st person singular
      if (!/\b(ho|sono|cerco|mangio|cammino|voglio|vedo|resto|chiedo|lavoro|trovo|vengo|preparo|parlo|penso|accetto|dico|parto|posso|so)\b/.test(eLower) && !eLower.startsWith('mi ') && !eLower.startsWith('ti ')) {
        note = 'Check: English is 1st person singular ("I"), verify Italian verb';
      }
    } else if (pLower.startsWith('we ') || pLower.startsWith("we'")) {
      // Prompt is 1st person plural
      if (!/\b(abbiamo|siamo|andiamo|viaggiamo|vediamo|lavoriamo|prepariamo|aspettiamo|proviamo|facciamo|possiamo|risolviamo)\b/.test(eLower) && !eLower.startsWith('ci ')) {
        note = 'Check: English is 1st person plural ("We"), verify Italian verb';
      }
    } else if (pLower.startsWith('luca ') || pLower.startsWith('marco ') || pLower.startsWith('sofia ')) {
      // Prompt is 3rd person named subject
      if (!eLower.includes('luca') && !eLower.includes('marco') && !eLower.includes('sofia')) {
        note = 'Check: Named subject in English, verify Italian subject';
      }
    }

    checks.push({
      ch,
      exerciseId: ex.exerciseId,
      sourceSentenceId: ex.sourceSentenceId,
      sText,
      promptEn: ex.promptEn,
      expectedIt: ex.expectedIt,
      alts: ex.acceptableAnswers || [],
      note
    });
  }
}

console.log(`Total checks: ${checks.length}`);
const notes = checks.filter(c => c.note);
console.log(`Notes to review: ${notes.length}`);
for (const n of notes) {
  console.log(`[Ch ${n.ch}][${n.exerciseId}] ${n.note}`);
  console.log(`  Story line:    "${n.sText}"`);
  console.log(`  English:       "${n.promptEn}"`);
  console.log(`  Expected (IT): "${n.expectedIt}"`);
}
