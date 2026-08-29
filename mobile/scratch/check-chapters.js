const fs = require('fs');
const path = require('path');

const storiesDir = path.join(__dirname, '..', 'content', 'stories', 'luca-a-roma');
const chaptersDir = path.join(storiesDir, 'chapters');
const sentenceEnglish = JSON.parse(fs.readFileSync(path.join(storiesDir, 'sentence-english.json'), 'utf8'));

for (let i = 1; i <= 40; i++) {
  const chNumStr = String(i).padStart(2, '0');
  const chFile = path.join(chaptersDir, `chapter-${chNumStr}.json`);
  if (!fs.existsSync(chFile)) {
    console.log(`Missing chapter ${i}`);
    continue;
  }
  const chData = JSON.parse(fs.readFileSync(chFile, 'utf8'));
  console.log(`Chapter ${i}: ${chData.title} (${chData.paragraphs.length} paragraphs, ${chData.paragraphs.reduce((acc, p) => acc + p.sentences.length, 0)} sentences)`);
}
