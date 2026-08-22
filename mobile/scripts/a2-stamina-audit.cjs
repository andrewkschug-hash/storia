/**
 * Ch 20–40 stamina / CEFR metrics for curriculum audit.
 * Run: node mobile/scripts/a2-stamina-audit.cjs
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../content/stories/luca-a-roma/chapters');
const IMP_FORMS =
  /\b(era|erano|c'era|c'erano|aveva|avevano|voleva|doveva|poteva|sembrava|restava|ascoltava|parlava|guardava|lavorava|portava|stava|faceva|diceva|sapeva|pensava|aspettava|camminava|scriveva|serviva|aiutava|organizava|organizzava)\b/gi;
const PP_PAIR =
  /\b(ho|hai|ha|abbiamo|avete|hanno|sono|sei|è|siamo|siete)\s+\w+(ato|uta|uti|ute|uto|iti|ite|ito|so|sa|si|se|sto|sta|sti|ste|tto|tta|tti|tte|nto|nta|nti|nte)\b/gi;

function tokenize(text) {
  return text
    .normalize('NFC')
    .replace(/[“”«»]/g, '')
    .split(/\s+/)
    .map((t) => t.replace(/^[.,;:!?()…]+|[.,;:!?()…]+$/g, '').toLowerCase())
    .filter(Boolean);
}

const seen = new Set();
const rows = [];

for (let n = 20; n <= 40; n += 1) {
  const ch = JSON.parse(
    fs.readFileSync(path.join(dir, `chapter-${String(n).padStart(2, '0')}.json`), 'utf8'),
  );
  const sents = ch.paragraphs.flatMap((p) => p.sentences);
  let words = 0;
  const lengths = [];
  const lemmas = new Set();
  let newLemmas = 0;
  let ppish = 0;
  let impHits = 0;
  let dialogue = 0;
  let narr = 0;
  let seHits = 0;
  let cheHits = 0;

  for (const s of sents) {
    const toks = tokenize(s.text);
    words += toks.length;
    lengths.push(toks.length);
    if (s.kind === 'dialogue' || s.speakerId) dialogue += 1;
    else narr += 1;
    const text = s.text;
    const pp = text.match(PP_PAIR);
    if (pp) ppish += pp.length;
    const imps = text.match(IMP_FORMS);
    if (imps) impHits += imps.length;
    if (/\bse\b/i.test(text)) seHits += 1;
    if (/\bche\b/i.test(text)) cheHits += 1;
    for (const lem of s.lemmas || []) {
      lemmas.add(lem);
      if (!seen.has(lem)) {
        seen.add(lem);
        newLemmas += 1;
      }
    }
  }

  lengths.sort((a, b) => a - b);
  const avg = words / sents.length;
  const max = lengths[lengths.length - 1];
  const p90 = lengths[Math.floor((lengths.length - 1) * 0.9)] || max;
  rows.push({
    n,
    title: ch.titleIt,
    words,
    sents: sents.length,
    avg: Number(avg.toFixed(1)),
    max,
    p90,
    unique: lemmas.size,
    newLemmas,
    ppish,
    impHits,
    dialogue,
    narr,
    seHits,
    cheHits,
  });
}

console.log('ch\twords\tsents\tavg\tmax\tp90\tuniq\tnew\tppHits\timpHits\tse\tche\tdial\tnarr\ttitle');
for (const r of rows) {
  console.log(
    [
      r.n,
      r.words,
      r.sents,
      r.avg,
      r.max,
      r.p90,
      r.unique,
      r.newLemmas,
      r.ppish,
      r.impHits,
      r.seHits,
      r.cheHits,
      r.dialogue,
      r.narr,
      r.title,
    ].join('\t'),
  );
}

console.log('\n--- word deltas (flag ≥20% or ≥80 words) ---');
for (let i = 1; i < rows.length; i += 1) {
  const a = rows[i - 1];
  const b = rows[i];
  const d = b.words - a.words;
  const pct = (b.words / a.words - 1) * 100;
  if (Math.abs(pct) >= 20 || Math.abs(d) >= 80) {
    console.log(`${a.n}→${b.n}\tΔwords ${d}\t${pct.toFixed(0)}%\t${a.words}→${b.words}`);
  }
}

console.log('\n--- avg sentence length deltas ---');
for (let i = 1; i < rows.length; i += 1) {
  const a = rows[i - 1];
  const b = rows[i];
  const d = b.avg - a.avg;
  if (Math.abs(d) >= 1.5) console.log(`${a.n}→${b.n}\tavg ${a.avg}→${b.avg} (Δ${d.toFixed(1)})`);
}

console.log('\n--- new lemma spikes (≥14) ---');
for (const r of rows) {
  if (r.newLemmas >= 14) console.log(`ch${r.n}\tnew ${r.newLemmas}\twords ${r.words}`);
}

console.log('\n--- A2 band vs CEFR.md targets (A2 ~400–700 words) ---');
for (const r of rows.filter((x) => x.n >= 25)) {
  let band = 'ON';
  if (r.words < 350) band = 'SHORT';
  else if (r.words < 400) band = 'LOW';
  else if (r.words > 700) band = 'LONG';
  console.log(`ch${r.n}\t${r.words}\t${band}`);
}

const a1p = rows.filter((r) => r.n >= 21 && r.n <= 24);
const a2 = rows.filter((r) => r.n >= 25 && r.n <= 40);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
console.log('\n--- band means ---');
console.log(
  'A1+ 21–24 words mean',
  mean(a1p.map((r) => r.words)).toFixed(0),
  'avg sent',
  mean(a1p.map((r) => r.avg)).toFixed(1),
  'new lemmas mean',
  mean(a1p.map((r) => r.newLemmas)).toFixed(1),
);
console.log(
  'A2  25–40 words mean',
  mean(a2.map((r) => r.words)).toFixed(0),
  'avg sent',
  mean(a2.map((r) => r.avg)).toFixed(1),
  'new lemmas mean',
  mean(a2.map((r) => r.newLemmas)).toFixed(1),
);
console.log(
  'A2 early 25–30 words mean',
  mean(a2.filter((r) => r.n <= 30).map((r) => r.words)).toFixed(0),
);
console.log(
  'A2 late  31–40 words mean',
  mean(a2.filter((r) => r.n >= 31).map((r) => r.words)).toFixed(0),
);

fs.writeFileSync(
  path.join(__dirname, '../content/stories/luca-a-roma/A2-STAMINA-METRICS.json'),
  `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), rows }, null, 2)}\n`,
);
console.log('\nWrote A2-STAMINA-METRICS.json');
