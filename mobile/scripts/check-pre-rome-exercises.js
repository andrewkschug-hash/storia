const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'content', 'stories');

const stories = [
  'luca-prima-di-roma-01',
  'luca-prima-di-roma-02',
  'luca-prima-di-roma-03',
  'luca-prima-di-roma-04',
  'luca-prima-di-roma-05',
];

for (const storyId of stories) {
  const storyDir = path.join(root, storyId);
  const prod = JSON.parse(fs.readFileSync(path.join(storyDir, 'production-exercises.json'), 'utf8'));
  const trans = JSON.parse(fs.readFileSync(path.join(storyDir, 'sentence-english.json'), 'utf8'));
  console.log(`\n=================== ${storyId} (${prod.exercises.length} exercises) ===================`);
  
  for (const ex of prod.exercises) {
    const chNum = ex.chapterId.split('-').pop();
    const chFile = path.join(storyDir, 'chapters', `chapter-${chNum}.json`);
    const chData = JSON.parse(fs.readFileSync(chFile, 'utf8'));
    let sent = null;
    for (const p of chData.paragraphs) {
      for (const s of p.sentences) {
        if (s.id === ex.sourceSentenceId) {
          sent = s;
          break;
        }
      }
    }
    const en = trans[`${ex.chapterId}:${ex.sourceSentenceId}`];
    console.log(`[${ex.chapterId}] ${ex.exerciseId} (src: ${ex.sourceSentenceId})`);
    console.log(`  Expected: "${ex.expectedIt}"`);
    console.log(`  Prompt:   "${ex.promptEn}"`);
    console.log(`  Story IT: "${sent ? sent.text : 'MISSING'}" (speaker: ${sent ? (sent.speakerId || 'narration') : 'N/A'})`);
    console.log(`  Story EN: "${en || 'NO_EN'}"`);
  }
}
