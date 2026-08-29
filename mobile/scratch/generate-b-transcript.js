const fs = require('fs');
const path = require('path');

const chDir = path.join(__dirname, '..', 'content', 'stories', 'luca-a-roma', 'chapters');
const enPath = path.join(__dirname, '..', 'content', 'stories', 'luca-a-roma', 'sentence-english.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

let out = '';

out += '# Arc: B1 — Bigger decisions (Decisioni più grandi)\n\n';

for (let i = 41; i <= 55; i++) {
  const num = String(i).padStart(2, '0');
  const chData = JSON.parse(fs.readFileSync(path.join(chDir, `chapter-${num}.json`), 'utf8'));
  
  out += `### Chapter ${i}: ${chData.title} (${chData.titleIt})\n\n`;
  
  for (const p of chData.paragraphs) {
    const pSentences = [];
    for (const s of p.sentences) {
      const key = `luca-a-roma-${num}:${s.id}`;
      const translation = en[key];
      if (!translation) {
        console.error(`Missing translation for ${key}`);
        pSentences.push(s.text);
      } else {
        pSentences.push(translation);
      }
    }
    out += pSentences.join(' ') + '\n\n';
  }
  
  out += '---\n\n';
}

out += '# Arc: B1+ — The Reality of Choice (La realtà della scelta)\n\n';

for (let i = 56; i <= 70; i++) {
  const num = String(i).padStart(2, '0');
  const chData = JSON.parse(fs.readFileSync(path.join(chDir, `chapter-${num}.json`), 'utf8'));
  
  out += `### Chapter ${i}: ${chData.title} (${chData.titleIt})\n\n`;
  
  for (const p of chData.paragraphs) {
    const pSentences = [];
    for (const s of p.sentences) {
      const key = `luca-a-roma-${num}:${s.id}`;
      const translation = en[key];
      if (!translation) {
        console.error(`Missing translation for ${key}`);
        pSentences.push(s.text);
      } else {
        pSentences.push(translation);
      }
    }
    out += pSentences.join(' ') + '\n\n';
  }
  
  out += '---\n\n';
}

const outPath = path.join(__dirname, 'transcript-b-stories.md');
fs.writeFileSync(outPath, out, 'utf8');
console.log('Successfully generated transcript for B stories, length:', out.length);
