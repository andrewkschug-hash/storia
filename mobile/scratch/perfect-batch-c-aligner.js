const fs = require('fs');

function tokenizeItalian(text) {
  // Strip outer quotes if any when matching tokens
  const tokens = [];
  const re = /[\p{L}\p{N}’']+/gu;
  let match;
  while ((match = re.exec(text)) !== null) {
    let surface = match[0];
    // strip leading/trailing single quotes if they are quotation marks
    let start = match.index;
    let end = match.index + surface.length;
    if (surface.startsWith("'") || surface.startsWith("‘") || surface.startsWith("’")) {
      if (surface.length > 1 && !surface.startsWith("l'") && !surface.startsWith("d'") && !surface.startsWith("un'") && !surface.startsWith("l’") && !surface.startsWith("d’") && !surface.startsWith("un’")) {
        surface = surface.slice(1);
        start += 1;
      }
    }
    if (surface.endsWith("'") || surface.endsWith("’") || surface.endsWith("’")) {
      if (surface.length > 1 && !surface.endsWith("po'") && !surface.endsWith("fa'")) {
        surface = surface.slice(0, -1);
        end -= 1;
      }
    }
    tokens.push({
      surface: surface,
      start: start,
      end: end,
    });
  }
  return tokens;
}

const corePath = 'c:/Users/aksch/Code/storia/mobile/content/lexicon/italian-core.json';
const core = JSON.parse(fs.readFileSync(corePath, 'utf8'));

// Register extra bases
const batchCBasesFinal = [
  { lemmaId: 'difensiva', italian: 'difensiva', english: 'defensive position', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 67, inflections: ['difensiva'] },
  { lemmaId: 'combinare', italian: 'combinare', english: 'to combine', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['combinare', 'combina', 'combinava', 'combinando', 'combinato'] },
  { lemmaId: 'degustazione', italian: 'degustazione', english: 'tasting / sampling', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['degustazione', 'degustazioni'] },
  { lemmaId: 'modellato', italian: 'modellato', english: 'clay modeling', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 67, inflections: ['modellato'] },
  { lemmaId: 'scoraggiamento', italian: 'scoraggiamento', english: 'discouragement', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['scoraggiamento'] },
  { lemmaId: 'dipinto', italian: 'dipinto', english: 'painted / painting', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['dipinto', 'dipinta', 'dipinti', 'dipinte'] },
  { lemmaId: 'appartenenza', italian: 'appartenenza', english: 'belonging', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['appartenenza'] }
];

for (const entry of batchCBasesFinal) {
  const existing = core.lexicon.find((e) => e.lemmaId === entry.lemmaId);
  if (!existing) {
    core.lexicon.push(entry);
  } else {
    existing.inflections = [...new Set([...(existing.inflections || []), ...(entry.inflections || [])])];
  }
}

fs.writeFileSync(corePath, JSON.stringify(core, null, 2), 'utf8');

const coreSet = new Set(core.lexicon.map((e) => e.lemmaId));
const dict = new Map();

for (const e of core.lexicon) {
  dict.set(e.lemmaId.toLowerCase(), e.lemmaId);
  dict.set(e.italian.toLowerCase(), e.lemmaId);
  if (e.inflections) {
    for (const inf of e.inflections) {
      dict.set(inf.toLowerCase(), e.lemmaId);
    }
  }
}

// Harvest 1-65
for (let i = 1; i <= 65; i++) {
  const numStr = i < 10 ? `0${i}` : `${i}`;
  const p = `c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-${numStr}.json`;
  if (fs.existsSync(p)) {
    const ch = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const para of ch.paragraphs) {
      for (const s of para.sentences) {
        const tokens = tokenizeItalian(s.text);
        if (tokens.length === s.lemmas.length) {
          for (let k = 0; k < tokens.length; k++) {
            const surface = tokens[k].surface.toLowerCase();
            const lem = s.lemmas[k];
            if (coreSet.has(lem)) {
              dict.set(surface, lem);
            }
          }
        }
      }
    }
  }
}

// Add exhaustive accent and inflection mappings
const fullMap = {
  "caffè": "caffe",
  "caffe": "caffe",
  "perché": "perche",
  "più": "piu",
  "già": "gia",
  "sarà": "essere",
  "può": "potere",
  "così": "cosi",
  "lì": "li",
  "là": "la",
  "è": "essere",
  "quarant'anni": "quaranta",
  "quarant’anni": "quaranta",
  "chiedevano": "chiedere",
  "bevevano": "bere",
  "leggendo": "leggere",
  "necessità": "necessita",
  "gelida": "gelido",
  "permetterci": "permettere",
  "difensiva": "difensiva",
  "combinando": "combinare",
  "degustazioni": "degustazione",
  "modellato": "modellato",
  "scoraggiamento": "scoraggiamento",
  "muovendosi": "muovere",
  "considerava": "considerare",
  "attenti": "attento",
  "vederla": "vedere",
  "accoglierlo": "accogliere",
  "accomodi": "accomodare",
  "preferisce": "preferire",
  "preparami": "preparare",
  "ritieni": "ritenere",
  "ritrovò": "ritrovare",
  "scritte": "scrivere",
  "impreviste": "imprevisto",
  "tenevano": "tenere",
  "rileggendo": "rileggere",
  "sentisse": "sentire",
  "attraversate": "attraversare",
  "superate": "superare",
  "quegli": "quello",
  "contrario": "contrario",
  "diventati": "diventare",
  "attraversava": "attraversare",
  "appartenenza": "appartenenza",
  "ritrovata": "ritrovare",
  "riportò": "riportare",
  "arrivo": "arrivo",
  "aperto": "aperto",
  "dipinta": "dipinto",
  "finiti": "finire",
  "iniziò": "iniziare",
  "tornò": "tornare",
  "mostrò": "mostrare",
  "spiegò": "spiegare",
  "lasciò": "lasciare",
  "guardò": "guardare",
  "pensò": "pensare",
  "cercò": "cercare",
  "trovò": "trovare",
  "portò": "portare",
  "sentì": "sentire",
  "capì": "capire",
  "finì": "finire",
  "aprì": "aprire",
  "uscì": "uscire",
  "morandi": "morandi",
  "sergio": "sergio",
  "cavour": "cavour",
  "teresa": "teresa",
  "maggiore": "maggior",
  "vincoli": "vincoli"
};

for (const [k, v] of Object.entries(fullMap)) {
  dict.set(k.toLowerCase(), v);
}

function resolveToken(surface) {
  let clean = surface.replace(/^[«"“”'‘]+|[»"“”'’]+$/gu, '').toLowerCase();
  if (clean === '') clean = surface.toLowerCase();

  let lem = dict.get(clean);
  if (lem && coreSet.has(lem)) return lem;

  // Handle elisions
  const prefixes = [
    { p: "quell'", len: 6 }, { p: "quell’", len: 6 },
    { p: "dell'", len: 5 }, { p: "dell’", len: 5 },
    { p: "dall'", len: 5 }, { p: "dall’", len: 5 },
    { p: "nell'", len: 5 }, { p: "nell’", len: 5 },
    { p: "sull'", len: 5 }, { p: "sull’", len: 5 },
    { p: "all'", len: 4 }, { p: "all’", len: 4 },
    { p: "un'", len: 3 }, { p: "un’", len: 3 },
    { p: "l'", len: 2 }, { p: "l’", len: 2 },
    { p: "d'", len: 2 }, { p: "d’", len: 2 }
  ];

  for (const pr of prefixes) {
    if (clean.startsWith(pr.p)) {
      const rest = clean.slice(pr.len);
      let matched = dict.get(rest);
      if (matched && coreSet.has(matched)) return matched;
      if (coreSet.has(rest)) return rest;
    }
  }

  if (coreSet.has(clean)) return clean;
  return clean;
}

let totalMissing = 0;
for (let i = 66; i <= 70; i++) {
  const filePath = `./content/stories/luca-a-roma/chapters/chapter-${i}.json`;
  const ch = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let missing = [];

  for (const para of ch.paragraphs) {
    for (const s of para.sentences) {
      const tokens = tokenizeItalian(s.text);
      s.lemmas = tokens.map((t) => {
        const lem = resolveToken(t.surface);
        if (!coreSet.has(lem)) {
          missing.push({ chapter: i, surface: t.surface, lemma: lem, sentence: s.id });
        }
        return lem;
      });
    }
  }

  console.log(`Chapter ${i} missing tokens: ${missing.length}`);
  if (missing.length > 0) {
    console.log(`Remaining in Ch ${i}:`, missing.slice(0, 10));
    totalMissing += missing.length;
  } else {
    console.log(`🎉 Chapter ${i}: 100% PERFECT 0 MISSING!`);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

console.log('====================================');
console.log(`Total missing across Batch C: ${totalMissing}`);
