/**
 * Regen A2 continuous readthrough 25–40 from chapter JSON + sentence-english.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'content', 'stories', 'luca-a-roma');
const en = JSON.parse(fs.readFileSync(path.join(root, 'sentence-english.json'), 'utf8'));
const lines = [];

for (let n = 25; n <= 40; n++) {
  const id = `luca-a-roma-${String(n).padStart(2, '0')}`;
  const ch = JSON.parse(
    fs.readFileSync(path.join(root, 'chapters', `chapter-${String(n).padStart(2, '0')}.json`), 'utf8'),
  );
  lines.push('========================================================================');
  lines.push(`CHAPTER ${n}: ${ch.titleIt} / ${ch.title}`);
  lines.push('========================================================================');
  lines.push('');
  for (const p of ch.paragraphs) {
    for (const s of p.sentences) {
      const who = s.speakerId || 'narration';
      lines.push(`[${s.id} | ${who}] ${s.text}`);
      const e = en[`${id}:${s.id}`];
      if (e) lines.push(`  EN: ${e}`);
      lines.push('');
    }
    lines.push('');
  }
  lines.push('');
}

const out = path.join(root, 'A2-READTHROUGH-25-40.txt');
fs.writeFileSync(out, `${lines.join('\n').trimEnd()}\n`);
console.log('Wrote', out);
