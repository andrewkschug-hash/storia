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

// Additional base lemmas
const finalBases = [
  { lemmaId: 'gentilezza', italian: 'gentilezza', english: 'kindness / gentleness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['gentilezza'] },
  { lemmaId: 'profumato', italian: 'profumato', english: 'fragrant / scented', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['profumato', 'profumata', 'profumati', 'profumate'] },
  { lemmaId: 'gelo', italian: 'gelo', english: 'frost / intense cold', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['gelo'] },
  { lemmaId: 'stupore', italian: 'stupore', english: 'amazement / wonder', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['stupore'] },
  { lemmaId: 'terra', italian: 'terra', english: 'earth / ground / land', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['terra', 'terre'] },
  { lemmaId: 'ospite', italian: 'ospite', english: 'guest', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['ospite', 'ospiti'] },
  { lemmaId: 'difendere', italian: 'difendere', english: 'to defend / shield', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['difendere', 'difende', 'difendeva', 'difeso'] },
  { lemmaId: 'provenienza', italian: 'provenienza', english: 'origin / provenance', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['provenienza'] },
  { lemmaId: 'meraviglioso', italian: 'meraviglioso', english: 'marvelous / wonderful', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['meraviglioso', 'meravigliosa', 'meravigliosi', 'meravigliose'] },
  { lemmaId: 'natura', italian: 'natura', english: 'nature', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['natura', 'nature'] },
  { lemmaId: 'clima', italian: 'clima', english: 'climate / atmosphere', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['clima'] },
  { lemmaId: 'dialogare', italian: 'dialogare', english: 'to dialogue / converse', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['dialogare', 'dialoga', 'dialogava', 'dialogato'] },
  { lemmaId: 'astratto', italian: 'astratto', english: 'abstract', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['astratto', 'astratta', 'astratti', 'astratte'] },
  { lemmaId: 'immutabile', italian: 'immutabile', english: 'immutable / unchangeable', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['immutabile', 'immutabili'] },
  { lemmaId: 'parametro', italian: 'parametro', english: 'parameter', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['parametro', 'parametri'] },
  { lemmaId: 'getto', italian: 'getto', english: 'pour / stream / jet', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['getto', 'getti'] },
  { lemmaId: 'raro', italian: 'raro', english: 'rare (rarissimo = very rare)', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['raro', 'rara', 'rari', 'rare', 'rarissimo', 'rarissima'] },
  { lemmaId: 'occupare', italian: 'occupare', english: 'to occupy / take up', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['occupare', 'occupa', 'occupava', 'occupi', 'occupato'] }
];

for (const entry of finalBases) {
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

// Harvest 1-60
for (let i = 1; i <= 60; i++) {
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

const finalWordsMap = {
  // Ch 61
  "mettendosi": "mettere", "sciacquò": "sciacquare", "comprendesse": "comprendere",
  "versò": "versare", "attraversò": "attraversare", "correvano": "correre",
  "ammetteva": "ammettere", "notò": "notare", "rivolse": "rivolgere",
  "riprendendo": "riprendere", "accompagnasse": "accompagnare", "verbali": "verbale",
  "allungò": "allungare", "accumulata": "accumulare", "profumato": "profumato",
  "rarissima": "raro", "occupi": "occupare", "tornerò": "tornare", "provenienza": "provenienza",

  // Ch 62
  "bruni": "bruno", "presentavano": "presentare", "attese": "attendere",
  "aspirando": "aspirare", "residua": "residuo", "nebulizzarlo": "nebulizzare",
  "diagnosticò": "diagnosticare", "complessi": "complesso", "aspetterebbe": "aspettare",
  "annuendo": "annuire", "mostrarsi": "mostrare", "volevamo": "volere",
  "matematica": "matematico", "lavorata": "lavorare", "perdersi": "perdere",
  "muovono": "muovere", "pretende": "pretendere", "ritrova": "ritrovare",
  "tavole": "tavola", "valorizzarla": "valorizzare", "aprirono": "aprire",
  "parametri": "parametro", "getti": "getto", "servì": "servire",
  "assaporando": "assaporare", "commentò": "commentare", "morbida": "morbido",
  "esisteva": "esistere", "creata": "creare", "astratti": "astratto",
  "immutabili": "immutabile", "l'abilità": "abilita", "dialogare": "dialogare",
  "clima": "clima", "impolverate": "impolverare", "meraviglioso": "meraviglioso",
  "adatti": "adattare", "natura": "natura",

  // Ch 63
  "gentilezza": "gentilezza", "corposa": "corposo", "gelo": "gelo",
  "stupore": "stupore", "trasformazione": "trasformazione", "terra": "terra",
  "ospite": "ospite", "comunità": "comunita",

  // Ch 64
  "rigidità": "rigidita", "dell'albero": "albero", "ricca": "ricco",

  // Ch 65
  "difendere": "difendere"
};

for (const [k, v] of Object.entries(finalWordsMap)) {
  dict.set(k.toLowerCase(), v);
}

function resolveToken(surface) {
  const lower = surface.toLowerCase();
  let lem = dict.get(lower);
  if (lem && coreSet.has(lem)) return lem;

  // Handle elisions
  const prefixes = [
    { p: "l'", len: 2 }, { p: "l’", len: 2 },
    { p: "un'", len: 3 }, { p: "un’", len: 3 },
    { p: "d'", len: 2 }, { p: "d’", len: 2 },
    { p: "dell'", len: 5 }, { p: "dell’", len: 5 },
    { p: "all'", len: 4 }, { p: "all’", len: 4 },
    { p: "dall'", len: 5 }, { p: "dall’", len: 5 },
    { p: "nell'", len: 5 }, { p: "nell’", len: 5 },
    { p: "sull'", len: 5 }, { p: "sull’", len: 5 }
  ];

  for (const pr of prefixes) {
    if (lower.startsWith(pr.p)) {
      const rest = lower.slice(pr.len);
      const matched = dict.get(rest);
      if (matched && coreSet.has(matched)) return matched;
    }
  }

  if (coreSet.has(lower)) return lower;
  return lower;
}

let totalMissing = 0;
for (let i = 61; i <= 65; i++) {
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
    console.log(`Remaining in Ch ${i}:`, missing);
    totalMissing += missing.length;
  } else {
    console.log(`🎉 Chapter ${i}: 100% PERFECT 0 MISSING!`);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

console.log('====================================');
console.log(`Total missing across Batch B: ${totalMissing}`);
