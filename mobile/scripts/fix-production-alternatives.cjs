const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../content/stories');

const FIXES = [
  { file: 'luca-a-roma/production-exercises.json', id: 'luca-a-roma-ch25-prod-01', remove: ['Luca è arrivata presto.'] },
  { file: 'luca-a-roma/production-exercises.json', id: 'luca-a-roma-ch08-prod-01', remove: ['Mi aiuti?'] },
  { file: 'luca-a-roma/production-exercises.json', id: 'luca-a-roma-ch15-prod-02', remove: ['Andiamo insieme.'] },
  { file: 'luca-a-roma/production-exercises.json', id: 'luca-a-roma-ch05-prod-02', remove: ['Come va?'] },
  { file: 'luca-a-roma/production-exercises.json', id: 'luca-a-roma-ch13-prod-03', remove: ['Voglio un biglietto.'] },
  { file: 'luca-a-roma/production-exercises.json', id: 'luca-a-roma-ch11-prod-02', remove: ['È un amico.'] },
  { file: 'luca-a-roma/production-exercises.json', id: 'luca-a-roma-ch18-prod-01', remove: ['Il treno non va.'] },
  // ch21–24 frozen: skip. ch25+ A2: only clear gender error below.
  { file: 'luca-a-roma/production-exercises.json', id: 'luca-a-roma-ch25-prod-01', remove: ['Luca è arrivata presto.'] },
  { file: 'luca-prima-di-roma-02/production-exercises.json', id: 'luca-prima-di-roma-02-ch02-prod-03', remove: ['Luca si alza.'] },
  { file: 'luca-prima-di-roma-02/production-exercises.json', id: 'luca-prima-di-roma-02-ch07-prod-02', remove: ['Domani Luca si alza alle sette.'] },
  { file: 'luca-prima-di-roma-04/production-exercises.json', id: 'luca-prima-di-roma-04-ch05-prod-01', removeContains: ['Luca prende'] },
  { file: 'luca-prima-di-roma-05/production-exercises.json', id: 'luca-prima-di-roma-05-ch01-prod-01', remove: ['Oggi è il compleanno di Luca.'] },
  { file: 'luca-prima-di-roma-05/production-exercises.json', id: 'luca-prima-di-roma-05-ch02-prod-01', remove: ['Elisa vieni sabato?'] },
  { file: 'luca-prima-di-roma-03/production-exercises.json', id: 'luca-prima-di-roma-03-ch06-prod-03', remove: ['A Luca piacciono le mele.'] },
];

const SPEAK_FIXES = [
  { file: 'luca-a-roma/speak-scenes.json', lineId: 'luca-a-roma-speak-15-l01', remove: ['Marco va al caffè.'] },
  { file: 'luca-a-roma/speak-scenes.json', lineId: 'luca-a-roma-speak-15-l04', remove: ['Vuole un biglietto.'] },
  { file: 'luca-a-roma/speak-scenes.json', lineId: 'luca-a-roma-speak-20-l03', remove: ['Siamo a casa.'] },
  { file: 'luca-prima-di-roma/speak-scenes.json', lineId: 'luca-prima-di-roma-01-speak-5-l01', remove: ['Davide e alla porta.'] },
  { file: 'luca-prima-di-roma/speak-scenes.json', lineId: 'luca-prima-di-roma-03-speak-5-l04', remove: ['Dieci euro.'] },
];

function stripTypos(alts) {
  if (!Array.isArray(alts)) return alts;
  const bad = [
    / e alla /i,
    /\bc'e\b/i,
    /\bdov'e\b/i,
    /\bpuo\b(?!\w)/i,
    /\blunedi\b/i,
    /\be libera\b/i,
    /\be a scuola\b/i,
    /\be al banco\b/i,
    /\be nel soggiorno\b/i,
  ];
  return alts.filter((a) => !bad.some((re) => re.test(a)));
}

let removed = 0;
let scanned = 0;
const byFile = {};

for (const fix of FIXES) {
  const fp = path.join(root, fix.file);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const ex = data.exercises.find((e) => e.exerciseId === fix.id);
  if (!ex) {
    console.log('MISSING', fix.id);
    continue;
  }
  const before = [...(ex.acceptableAnswers || [])];
  scanned += before.length;
  let next = before;
  if (fix.remove) next = next.filter((a) => !fix.remove.includes(a));
  if (fix.removeContains) next = next.filter((a) => !fix.removeContains.some((s) => a.includes(s)));
  next = stripTypos(next);
  const delta = before.length - next.length;
  removed += delta;
  if (next.length) ex.acceptableAnswers = next;
  else delete ex.acceptableAnswers;
  byFile[fix.file] = (byFile[fix.file] || 0) + delta;
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n');
}

for (const fix of SPEAK_FIXES) {
  const fp = path.join(root, fix.file);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let found = false;
  for (const scene of data.scenes) {
    for (const line of scene.lines) {
      if (line.id !== fix.lineId) continue;
      found = true;
      const before = [...(line.acceptableAnswers || [])];
      scanned += before.length;
      let next = before.filter((a) => !fix.remove.includes(a));
      next = stripTypos(next);
      const delta = before.length - next.length;
      removed += delta;
      if (next.length) line.acceptableAnswers = next;
      else delete line.acceptableAnswers;
      byFile[fix.file] = (byFile[fix.file] || 0) + delta;
    }
  }
  if (!found) console.log('MISSING LINE', fix.lineId);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n');
}

for (const rel of [
  'luca-prima-di-roma/speak-scenes.json',
  'luca-prima-di-roma-01/production-exercises.json',
  'luca-prima-di-roma-02/production-exercises.json',
  'luca-prima-di-roma-03/production-exercises.json',
  'luca-prima-di-roma-04/production-exercises.json',
  'luca-prima-di-roma-05/production-exercises.json',
]) {
  const fp = path.join(root, rel);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let delta = 0;
  if (data.exercises) {
    for (const ex of data.exercises) {
      if (!ex.acceptableAnswers) continue;
      scanned += ex.acceptableAnswers.length;
      const before = ex.acceptableAnswers.length;
      ex.acceptableAnswers = stripTypos(ex.acceptableAnswers).filter((a) => {
        const prompt = ex.promptEn || '';
        const expected = ex.expectedIt || '';
        const is1 =
          /\bI\b|I'm|I’m|my\b/i.test(prompt) ||
          /^(Mi |Ho |Sono |Vado |Voglio |Devo |Posso |Prendo )/i.test(expected);
        if (is1 && /\bLuca\b/.test(a) && !/\bLuca\b/.test(expected)) return false;
        if (/^A Luca\b/.test(a) && /^Mi\b/.test(expected)) return false;
        return true;
      });
      if (!ex.acceptableAnswers.length) delete ex.acceptableAnswers;
      delta += before - (ex.acceptableAnswers?.length || 0);
    }
  }
  if (data.scenes) {
    for (const scene of data.scenes) {
      for (const line of scene.lines) {
        if (!line.acceptableAnswers) continue;
        scanned += line.acceptableAnswers.length;
        const before = line.acceptableAnswers.length;
        line.acceptableAnswers = stripTypos(line.acceptableAnswers);
        if (!line.acceptableAnswers.length) delete line.acceptableAnswers;
        delta += before - (line.acceptableAnswers?.length || 0);
      }
    }
  }
  removed += delta;
  byFile[rel] = (byFile[rel] || 0) + delta;
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n');
}

console.log(JSON.stringify({ scannedAltsApprox: scanned, removed, byFile }, null, 2));
