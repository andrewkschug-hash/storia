const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// 1. Fix luca-a-roma chapter 16
const ch16Path = path.join(root, 'content', 'stories', 'luca-a-roma', 'chapters', 'chapter-16.json');
const ch16 = JSON.parse(fs.readFileSync(ch16Path, 'utf8'));

// Fix s03: porta -> portare
for (const p of ch16.paragraphs) {
  for (const s of p.sentences) {
    if (s.id === 's03' && s.lemmas.includes('porta')) {
      s.lemmas = s.lemmas.map(l => l === 'porta' ? 'portare' : l);
    }
    if (s.id === 's12' && s.lemmas.includes('parte')) {
      s.lemmas = s.lemmas.map(l => l === 'parte' ? 'partire' : l);
    }
  }
}

// Fix question ch16_q02
for (const q of ch16.questions) {
  if (q.id === 'ch16_q02') {
    q.choices = q.choices.map(c => c === 'A suitcase (valigia)' ? 'A suitcase' : c);
    q.explanation = q.explanation.replace('valigia', 'suitcase');
  }
}
fs.writeFileSync(ch16Path, JSON.stringify(ch16, null, 2) + '\n', 'utf8');
console.log('Updated luca-a-roma chapter-16.json');

// 2. Fix luca-a-roma chapter 19
const ch19Path = path.join(root, 'content', 'stories', 'luca-a-roma', 'chapters', 'chapter-19.json');
const ch19 = JSON.parse(fs.readFileSync(ch19Path, 'utf8'));
for (const p of ch19.paragraphs) {
  for (const s of p.sentences) {
    if (s.id === 's09' && s.lemmas.includes('parte')) {
      s.lemmas = s.lemmas.map(l => l === 'parte' ? 'partire' : l);
    }
  }
}
fs.writeFileSync(ch19Path, JSON.stringify(ch19, null, 2) + '\n', 'utf8');
console.log('Updated luca-a-roma chapter-19.json');

// 3. Fix luca-a-roma chapter 23
const ch23Path = path.join(root, 'content', 'stories', 'luca-a-roma', 'chapters', 'chapter-23.json');
const ch23 = JSON.parse(fs.readFileSync(ch23Path, 'utf8'));
for (const p of ch23.paragraphs) {
  for (const s of p.sentences) {
    if (s.id === 's09' && s.lemmas.includes('porta')) {
      s.lemmas = s.lemmas.map(l => l === 'porta' ? 'portare' : l);
    }
  }
}
fs.writeFileSync(ch23Path, JSON.stringify(ch23, null, 2) + '\n', 'utf8');
console.log('Updated luca-a-roma chapter-23.json');

// 4. Fix questions in chapter 08 and 09
const ch08Path = path.join(root, 'content', 'stories', 'luca-a-roma', 'chapters', 'chapter-08.json');
const ch08 = JSON.parse(fs.readFileSync(ch08Path, 'utf8'));
for (const q of ch08.questions) {
  if (q.id === 'ch08_q02') {
    q.choices = q.choices.map(c => c.replace(' (scusa)', ''));
  }
}
fs.writeFileSync(ch08Path, JSON.stringify(ch08, null, 2) + '\n', 'utf8');

const ch09Path = path.join(root, 'content', 'stories', 'luca-a-roma', 'chapters', 'chapter-09.json');
const ch09 = JSON.parse(fs.readFileSync(ch09Path, 'utf8'));
for (const q of ch09.questions) {
  if (q.id === 'ch09_q01') {
    q.choices = q.choices.map(c => c.replace(' (padrone)', ''));
  }
}
fs.writeFileSync(ch09Path, JSON.stringify(ch09, null, 2) + '\n', 'utf8');
console.log('Updated luca-a-roma chapters 08 and 09 questions');

// 5. Fix lettera-per-elena chapters
const elenaChapters = ['chapter-01.json', 'chapter-03.json', 'chapter-07.json', 'chapter-10.json', 'chapter-17.json', 'chapter-18.json', 'chapter-19.json', 'chapter-21.json'];
const elenaDir = path.join(root, 'content', 'stories', 'lettera-per-elena', 'chapters');

for (const file of elenaChapters) {
  const filePath = path.join(elenaDir, file);
  if (!fs.existsSync(filePath)) continue;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;
  for (const p of data.paragraphs) {
    for (const s of p.sentences) {
      if (s.lemmas && s.lemmas.includes('porta')) {
        // If "porta" in text is used as verb ("Bruna le porta", "Porta il caffè", etc.)
        const isVerb = /\bporta\s+(un|il|le|i)\b/i.test(s.text) || /\ble\s+porta\b/i.test(s.text);
        if (isVerb) {
          s.lemmas = s.lemmas.map(l => l === 'porta' ? 'portare' : l);
          changed = true;
        }
      }
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Updated lettera-per-elena ${file}`);
  }
}
