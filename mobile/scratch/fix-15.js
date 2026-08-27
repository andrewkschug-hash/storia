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

// Ensure base entries
const requiredLemmas = [
  { lemmaId: 'prolungato', italian: 'prolungato', english: 'prolonged / extended', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 61, inflections: ['prolungato', 'prolungata', 'prolungati', 'prolungate'] },
  { lemmaId: 'dizionario', italian: 'dizionario', english: 'dictionary', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['dizionario', 'dizionari'] },
  { lemmaId: 'udire', italian: 'udire', english: 'to hear', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 61, inflections: ['udire', 'ode', 'udiva', 'udito'] },
  { lemmaId: 'grado', italian: 'grado', english: 'degree', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['grado', 'gradi'] },
  { lemmaId: 'abilita', italian: 'abilità', english: 'skill / ability', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['abilità', 'abilita'] },
  { lemmaId: 'impolverare', italian: 'impolverare', english: 'to dust / powder', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 62, inflections: ['impolverare', 'impolvera', 'impolverava', 'impolverato', 'impolverate'] },
  { lemmaId: 'adattare', italian: 'adattare', english: 'to adapt', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['adattare', 'adatta', 'adattava', 'adatti', 'adattato'] },
  { lemmaId: 'corposo', italian: 'corposo', english: 'full-bodied', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 63, inflections: ['corposo', 'corposa', 'corposi', 'corpose'] },
  { lemmaId: 'trasformazione', italian: 'trasformazione', english: 'transformation', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['trasformazione', 'trasformazioni'] },
  { lemmaId: 'comunita', italian: 'comunità', english: 'community', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['comunità', 'comunita'] },
  { lemmaId: 'rigidita', italian: 'rigidità', english: 'stiffness / rigidity', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['rigidità', 'rigidita'] },
  { lemmaId: 'albero', italian: 'albero', english: 'tree', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['albero', 'alberi'] }
];

for (const entry of requiredLemmas) {
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

// Additional direct mapping for exact token surfaces
const exactOverrides = {
  "prolungato": "prolungato",
  "dizionari": "dizionario",
  "udiva": "udire",
  "gradi": "grado",
  "l'abilità": "abilita",
  "abilità": "abilita",
  "impolverate": "impolverare",
  "adatti": "adattare",
  "corposa": "corposo",
  "trasformazione": "trasformazione",
  "comunità": "comunita",
  "rigidità": "rigidita",
  "dell'albero": "albero",
  "albero": "albero"
};

for (const [k, v] of Object.entries(exactOverrides)) {
  dict.set(k.toLowerCase(), v);
}

for (let i = 61; i <= 65; i++) {
  const filePath = `./content/stories/luca-a-roma/chapters/chapter-${i}.json`;
  const ch = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let missing = [];

  for (const para of ch.paragraphs) {
    for (const s of para.sentences) {
      const tokens = tokenizeItalian(s.text);
      for (let k = 0; k < tokens.length; k++) {
        const lower = tokens[k].surface.toLowerCase();
        let lem = s.lemmas[k];
        if (!coreSet.has(lem)) {
          if (dict.has(lower)) {
            s.lemmas[k] = dict.get(lower);
          } else if (lower.startsWith("l'") || lower.startsWith("l’")) {
            s.lemmas[k] = dict.get(lower.slice(2)) || lower.slice(2);
          } else if (lower.startsWith("dell'") || lower.startsWith("dell’")) {
            s.lemmas[k] = dict.get(lower.slice(5)) || lower.slice(5);
          }
        }
        if (!coreSet.has(s.lemmas[k])) {
          missing.push({ surface: tokens[k].surface, lemma: s.lemmas[k], sentence: s.id });
        }
      }
    }
  }

  console.log(`Chapter ${i} missing tokens: ${missing.length}`);
  if (missing.length > 0) {
    console.log(`Remaining in Ch ${i}:`, missing);
  } else {
    console.log(`🎉 Chapter ${i}: 100% PERFECT 0 MISSING!`);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}
