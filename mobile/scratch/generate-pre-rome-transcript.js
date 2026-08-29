const fs = require('fs');
const path = require('path');

const storiesDir = path.join(__dirname, '..', 'content', 'stories');
let output = '';

let count = 0;
for (let storyNum = 1; storyNum <= 5; storyNum++) {
  const storyId = `luca-prima-di-roma-0${storyNum}`;
  const dir = path.join(storiesDir, storyId);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const enSentences = JSON.parse(fs.readFileSync(path.join(dir, 'sentence-english.json'), 'utf8'));

  output += `# Story ${storyNum}: ${manifest.title} (${manifest.titleIt})\n\n`;

  const chFiles = fs.readdirSync(path.join(dir, 'chapters')).filter(f => f.endsWith('.json')).sort();
  for (const file of chFiles) {
    count++;
    const chData = JSON.parse(fs.readFileSync(path.join(dir, 'chapters', file), 'utf8'));
    output += `### Chapter ${count}: ${chData.title} (${chData.titleIt}) — [Story ${storyNum}, Episode ${chData.number}]\n\n`;

    for (const p of chData.paragraphs) {
      const pLines = [];
      for (const s of p.sentences) {
        const key = `${chData.id}:${s.id}`;
        const en = enSentences[key];
        if (!en) {
          throw new Error(`Missing English sentence for ${key}`);
        }
        if (s.kind === 'dialogue' && s.speakerId) {
          const spk = s.speakerId.charAt(0).toUpperCase() + s.speakerId.slice(1);
          pLines.push(`${spk}: "${en}"`);
        } else {
          pLines.push(en);
        }
      }
      output += pLines.join(' ') + '\n\n';
    }
    output += '---\n\n';
  }
}

fs.writeFileSync(path.join(__dirname, 'transcript-pre-rome.md'), output, 'utf8');
console.log('Successfully generated transcript for Luca Before Rome stories, length:', output.length);
