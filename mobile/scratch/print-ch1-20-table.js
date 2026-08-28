const fs = require('fs');
const path = require('path');

const storyDir = path.join(__dirname, '../content/stories/luca-a-roma');
const exercises = JSON.parse(fs.readFileSync(path.join(storyDir, 'production-exercises.json'), 'utf8')).exercises;

for (let ch = 1; ch <= 20; ch++) {
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

  console.log(`\n### Chapter ${ch}: ${chData.title} (*${chData.titleIt}*)`);
  console.log(`| # | English Prompt | Expected Italian Answer | Also Acceptable | Story Sentence |`);
  console.log(`| :--- | :--- | :--- | :--- | :--- |`);

  chExercises.forEach((ex, idx) => {
    const sText = sentenceMap.get(ex.sourceSentenceId) || '—';
    const alts = (ex.acceptableAnswers || []).map(a => `\`${a}\``).join('<br>') || '—';
    console.log(`| ${idx + 1} | "${ex.promptEn}" | **${ex.expectedIt}** | ${alts} | *"${sText}"* |`);
  });
}
