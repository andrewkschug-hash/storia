const fs = require('fs');

function tokenizeItalian(text) {
  const tokens = [];
  const re = /[\p{L}\p{N}’']+/gu;
  let match;
  while ((match = re.exec(text)) !== null) {
    tokens.push({
      surface: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return tokens;
}

const corePath = 'c:/Users/aksch/Code/storia/mobile/content/lexicon/italian-core.json';
const core = JSON.parse(fs.readFileSync(corePath, 'utf8'));

// Make sure everyday natural lemmas exist in core lexicon
const newNaturalBases = [
  { lemmaId: 'beccuccio', italian: 'beccuccio', english: 'spout / nozzle', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'medium', introducedChapter: 61, inflections: ['beccuccio', 'beccucci'] },
  { lemmaId: 'sottile', italian: 'sottile', english: 'thin / slender', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['sottile', 'sottili'] },
  { lemmaId: 'movimento', italian: 'movimento', english: 'movement', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['movimento', 'movimenti'] },
  { lemmaId: 'filtro', italian: 'filtro', english: 'filter / pour-over', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['filtro', 'filtri'] },
  { lemmaId: 'togliere', italian: 'togliere', english: 'to remove / take off', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['togliere', 'toglie', 'toglieva', 'tolse', 'tolto'] },
  { lemmaId: 'etiopia', italian: 'Etiopia', english: 'Ethiopia', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'medium', introducedChapter: 61, inflections: ['etiopia', 'Etiopia'] },
  { lemmaId: 'gelato', italian: 'gelato', english: 'frozen / ice-cold', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['gelato', 'gelata', 'gelati', 'gelate'] },
  { lemmaId: 'invalicabile', italian: 'invalicabile', english: 'impassable / insurmountable', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 63, inflections: ['invalicabile', 'invalicabili'] },
  { lemmaId: 'bagnato', italian: 'bagnato', english: 'wet', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['bagnato', 'bagnata', 'bagnati', 'bagnate'] },
  { lemmaId: 'chiudersi', italian: 'chiudersi', english: 'to close oneself in', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['chiudersi', 'chiude', 'chiudeva', 'chiuso'] },
  { lemmaId: 'corrucciato', italian: 'corrucciato', english: 'furrowed / frowning', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 64, inflections: ['corrucciato', 'corrucciata', 'corrucciati', 'corrucciate'] },
  { lemmaId: 'pialla', italian: 'pialla', english: 'planer (woodworking tool)', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 64, inflections: ['pialla', 'pialle'] },
  { lemmaId: 'sfumatura', italian: 'sfumatura', english: 'shade / nuance', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['sfumatura', 'sfumature'] },
  { lemmaId: 'termine', italian: 'termine', english: 'term / word', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['termine', 'termini'] },
  { lemmaId: 'raffreddare', italian: 'raffreddare', english: 'to cool down', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['raffreddare', 'raffredda', 'raffreddava', 'raffreddato'] },
  { lemmaId: 'valutare', italian: 'valutare', english: 'to evaluate / assess', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['valutare', 'valuta', 'valutava', 'valutando', 'valutato'] },
  { lemmaId: 'passaggio', italian: 'passaggio', english: 'passage / flow', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['passaggio', 'passaggi'] },
  { lemmaId: 'rallentare', italian: 'rallentare', english: 'to slow down', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['rallentare', 'rallenta', 'rallentava', 'rallentato'] },
  { lemmaId: 'materia', italian: 'materia', english: 'material / matter', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['materia', 'materie'] },
  { lemmaId: 'emergere', italian: 'emergere', english: 'to emerge / come out', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 50, inflections: ['emergere', 'emerge', 'emergeva', 'emerso'] },
  { lemmaId: 'brocca', italian: 'brocca', english: 'pitcher / jug', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 56, inflections: ['brocca', 'brocche'] }
];

for (const entry of newNaturalBases) {
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

// Harvest 1-65 historical mappings
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

// Extra explicit mappings for newly naturalized text
const naturalOverrides = {
  "beccuccio": "beccuccio",
  "sottile": "sottile",
  "movimenti": "movimento",
  "filtro": "filtro",
  "togliere": "togliere",
  "etiopia": "etiopia",
  "gelate": "gelato",
  "invalicabile": "invalicabile",
  "bagnata": "bagnato",
  "chiudersi": "chiudersi",
  "corrucciata": "corrucciato",
  "pialla": "pialla",
  "sfumatura": "sfumatura",
  "termine": "termine",
  "raffreddare": "raffreddare",
  "valutando": "valutare",
  "passaggio": "passaggio",
  "rallentare": "rallentare",
  "materia": "materia",
  "emergere": "emergere",
  "brocca": "brocca",
  "guadagno": "guadagno",
  "regolato": "regolare",
  "evidente": "evidente",
  "sentitamente": "sentito",
  "salì": "salire",
  "chiudeva": "chiudere",
  "calda": "caldo",
  "livello": "livello",
  "pressione": "pressione",
  "considerata": "considerare",
  "sbagliata": "sbagliato",
  "preparata": "preparare",
  "vivere": "vivere",
  "ascoltare": "ascoltare",
  "adattarsi": "adattare"
};

for (const [k, v] of Object.entries(naturalOverrides)) {
  dict.set(k.toLowerCase(), v);
}

function resolveToken(surface) {
  const lower = surface.toLowerCase();
  let lem = dict.get(lower);
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
    if (lower.startsWith(pr.p)) {
      const rest = lower.slice(pr.len);
      let matched = dict.get(rest);
      if (matched && coreSet.has(matched)) return matched;
      if (coreSet.has(rest)) return rest;
    }
  }

  if (coreSet.has(lower)) return lower;
  return lower;
}

let totalMissing = 0;
for (let i = 1; i <= 65; i++) {
  const numStr = i < 10 ? `0${i}` : `${i}`;
  const filePath = `./content/stories/luca-a-roma/chapters/chapter-${numStr}.json`;
  if (!fs.existsSync(filePath)) continue;

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

  if (missing.length > 0) {
    console.log(`❌ Chapter ${i} missing tokens: ${missing.length}`, missing);
    totalMissing += missing.length;
  } else {
    // console.log(`🎉 Chapter ${i}: 100% PERFECT 0 MISSING!`);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

console.log('====================================');
console.log(`Total missing across all Chapters 1-65: ${totalMissing}`);
