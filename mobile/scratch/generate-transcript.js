const fs = require('fs');
const path = require('path');

const storiesDir = path.join(__dirname, '..', 'content', 'stories', 'luca-a-roma');
const chaptersDir = path.join(storiesDir, 'chapters');
const sentenceEnglish = JSON.parse(fs.readFileSync(path.join(storiesDir, 'sentence-english.json'), 'utf8'));

let output = '';

for (let i = 1; i <= 40; i++) {
  const chNumStr = String(i).padStart(2, '0');
  const chFile = path.join(chaptersDir, `chapter-${chNumStr}.json`);
  const chData = JSON.parse(fs.readFileSync(chFile, 'utf8'));
  
  output += `## Chapter ${i}: ${chData.title} (${chData.titleIt})\n\n`;
  
  for (const paragraph of chData.paragraphs) {
    const pSentences = [];
    for (const sent of paragraph.sentences) {
      const key = `${chData.id}:${sent.id}`;
      const enText = sentenceEnglish[key];
      if (!enText) {
        throw new Error(`Missing English translation for ${key}`);
      }
      if (sent.kind === 'dialogue' && sent.speakerId) {
        const speakerName = sent.speakerId.charAt(0).toUpperCase() + sent.speakerId.slice(1);
        pSentences.push(`${speakerName}: "${enText}"`);
      } else {
        pSentences.push(enText);
      }
    }
    output += pSentences.join(' ') + '\n\n';
  }
  output += '---\n\n';
}

fs.writeFileSync(path.join(__dirname, 'transcript-1-40.md'), output, 'utf8');
console.log('Successfully generated transcript for chapters 1-40, total length:', output.length);
