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

// More base entries to ensure 100% coverage
const extraLemmas = [
  { lemmaId: 'sentore', italian: 'sentore', english: 'hint / trace / scent', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 66, inflections: ['sentore', 'sentori'] },
  { lemmaId: 'riepilogo', italian: 'riepilogo', english: 'summary / recapitulation', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['riepilogo', 'riepiloghi'] }
];

for (const entry of extraLemmas) {
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

// 1-65 harvest
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

// Exhaustive word mapping
const overrides = {
  "po'": "poco", "po’": "poco", "po": "poco",
  "caffè": "caffe", "caffe": "caffe", "perché": "perche", "più": "piu", "già": "gia",
  "sarà": "essere", "può": "potere", "così": "cosi", "lì": "li", "là": "la", "è": "essere",
  "chiedevano": "chiedere", "bevevano": "bere", "leggendo": "leggere",
  "studiata": "studiare", "sentore": "sentore", "gelida": "gelido",
  "permetterci": "permettere", "insegno": "insegnare", "oggetti": "oggetto",
  "basi": "base", "muovendosi": "muovere", "naturali": "naturale",
  "considerava": "considerare", "attenti": "attento", "vederla": "vedere",
  "ricordi": "ricordo", "contrario": "contrario", "permette": "permettere",
  "all'analisi": "analisi", "all’analisi": "analisi", "riepilogo": "riepilogo",
  "arrivò": "arrivare", "diventati": "diventare", "attraversava": "attraversare",
  "ritrovata": "ritrovare", "quarant'anni": "quaranta", "quarant’anni": "quaranta",
  "lasciavano": "lasciare", "decise": "decidere", "cancellata": "cancellare",
  "sostituita": "sostituire", "moda": "moda", "moderna": "moderno", "mondi": "mondo",
  "giudicare": "giudicare", "intensità": "intensita", "misero": "mettere",
  "aumentati": "aumentare", "controllando": "controllare", "accumulati": "accumulare",
  "lasciarci": "lasciare", "chiuderci": "chiudere", "fossimo": "essere",
  "guidate": "guidare", "ritieni": "ritenere", "parlarti": "parlare",
  "versandolo": "versare", "realizzata": "realizzare", "finisse": "finire",
  "voler": "volere", "farti": "fare", "larga": "largo", "scala": "scala",
  "difficoltà": "difficolta", "sostituirle": "sostituire", "confermavano": "confermare",
  "solidità": "solidita", "graduale": "graduale", "sana": "sano", "bravi": "bravo",
  "familiarità": "familiarita", "darle": "dare", "fluivano": "fluire",
  "freschi": "fresco", "agganciò": "agganciare", "bruna": "bruno", "aperto": "aperto",
  "sergio": "sergio", "cavour": "cavour", "morandi": "morandi", "teresa": "teresa",
  "maggiore": "maggior", "vincoli": "vincoli", "lezioni": "lezione",
  "apprese": "apprendere", "titolo": "titolo", "allettante": "allettante",
  "rimpianto": "rimpianto", "indescrivibile": "indescrivibile", "lavoratore": "lavoratore",
  "ritrovò": "ritrovare", "scritte": "scrivere", "impreviste": "imprevisto",
  "tenevano": "tenere", "rileggendo": "rileggere", "sentisse": "sentire",
  "attraversate": "attraversare", "superate": "superare", "quegli": "quello",
  "pensassimo": "pensare", "mostrandole": "mostrare", "annuale": "annuale",
  "dimostrarci": "dimostrare", "qual": "quale", "basato": "basare",
  "divertenti": "divertente", "facce": "faccia", "partecipanti": "partecipante",
  "accorti": "accorgersi", "intrecciate": "intrecciare", "un'amicizia": "amicizia",
  "un’amicizia": "amicizia", "goccio": "goccio", "diffidente": "diffidente",
  "convinto": "convinto", "difendermi": "difendere", "continuamente": "continuamente",
  "contasse": "contare", "debolezza": "debolezza", "spezzando": "spezzare",
  "rispettosi": "rispettoso", "donatogli": "donare", "storie": "storia",
  "riportò": "riportare", "vellutata": "vellutato", "tovagliolino": "tovagliolino",
  "scambiò": "scambiare", "varia": "vario", "adattando": "adattare",
  "arrivarono": "arrivare", "recuperata": "recuperare", "salutarono": "salutare",
  "commentando": "commentare", "programmi": "programma", "positiva": "positivo",
  "varcasse": "varcare", "proseguiva": "proseguire", "passeggiava": "passeggiare",
  "godendosi": "godere", "incrociò": "incrociare", "riempirgli": "riempire",
  "l'esempio": "esempio", "l’esempio": "esempio", "valori": "valore",
  "studiando": "studiare", "italiana": "italiano", "differenze": "differenza",
  "bambina": "bambino", "tagliava": "tagliare", "diffondendo": "diffondere",
  "sognato": "sognare", "bui": "buio", "accendi": "accendere",
  "accogli": "accogliere", "pigrizia": "pigrizia", "riponevano": "riporre",
  "l'apprendista": "apprendista", "l’apprendista": "apprendista",
  "insicurezze": "insicurezza", "rispettata": "rispettare", "unite": "unire",
  "scandiva": "scandire", "prepararle": "preparare", "capitolo": "capitolo",
  "santa": "santo", "sant'andrea": "santo", "sant’andrea": "santo"
};

for (const [k, v] of Object.entries(overrides)) {
  dict.set(k.toLowerCase(), v);
}

function resolveToken(rawSurface) {
  let clean = rawSurface.replace(/^[«"“”'‘]+|[»"“”'’]+$/gu, '').toLowerCase();
  if (clean === '') clean = rawSurface.toLowerCase();

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
for (let i = 1; i <= 70; i++) {
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
    console.log(`❌ Chapter ${i} missing tokens: ${missing.length}`, missing.slice(0, 10));
    totalMissing += missing.length;
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

console.log('====================================');
console.log(`Total missing across all Chapters 1-70: ${totalMissing}`);
