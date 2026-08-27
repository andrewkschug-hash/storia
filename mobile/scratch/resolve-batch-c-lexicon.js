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

// Extra natural base lemmas for Movement 3
const extraBases = [
  { lemmaId: 'traccia', italian: 'traccia', english: 'trace / track', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['traccia', 'tracce'] },
  { lemmaId: 'accendere', italian: 'accendere', english: 'to turn on / light', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['accendere', 'accende', 'accendeva', 'acceso', 'accese'] },
  { lemmaId: 'svelto', italian: 'svelto', english: 'quick / brisk', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['svelto', 'svelta', 'svelti', 'svelte'] },
  { lemmaId: 'inaugurazione', italian: 'inaugurazione', english: 'opening / inauguration', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['inaugurazione', 'inaugurazioni'] },
  { lemmaId: 'immaginare', italian: 'immaginare', english: 'to imagine', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['immaginare', 'immagina', 'immaginava', 'immaginato'] },
  { lemmaId: 'selezione', italian: 'selezione', english: 'selection', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['selezione', 'selezioni'] },
  { lemmaId: 'tradizione', italian: 'tradizione', english: 'tradition', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['tradizione', 'tradizioni'] },
  { lemmaId: 'familiare', italian: 'familiare', english: 'familiar / family', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['familiare', 'familiari'] },
  { lemmaId: 'disappunto', italian: 'disappunto', english: 'disappointment', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['disappunto'] },
  { lemmaId: 'novita', italian: 'novità', english: 'novelty / news', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['novità', 'novita'] },
  { lemmaId: 'intesa', italian: 'intesa', english: 'understanding / harmony', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['intesa', 'intese'] },
  { lemmaId: 'collina', italian: 'collina', english: 'hill', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['collina', 'colline'] },
  { lemmaId: 'circostante', italian: 'circostante', english: 'surrounding', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['circostante', 'circostanti'] },
  { lemmaId: 'infilarsi', italian: 'infilarsi', english: 'to slip into / sneak in', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['infilarsi', 'infila', 'infilava', 'infilato'] },
  { lemmaId: 'ombroso', italian: 'ombroso', english: 'shady', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 67, inflections: ['ombroso', 'ombrosa', 'ombrosi', 'ombrose'] },
  { lemmaId: 'accorciare', italian: 'accorciare', english: 'to shorten', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['accorciare', 'accorcia', 'accorciava', 'accorciato', 'accorciate'] },
  { lemmaId: 'terracotta', italian: 'terracotta', english: 'terracotta / clay tile', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['terracotta', 'terrecotte'] },
  { lemmaId: 'assumere', italian: 'assumere', english: 'to assume / take on', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['assumere', 'assume', 'assumeva', 'assunto'] },
  { lemmaId: 'visitatore', italian: 'visitatore', english: 'visitor', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['visitatore', 'visitatori', 'visitatrice', 'visitatrici'] },
  { lemmaId: 'occasionale', italian: 'occasionale', english: 'occasional / casual', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['occasionale', 'occasionali'] },
  { lemmaId: 'travertino', italian: 'travertino', english: 'travertine (Roman limestone)', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 68, inflections: ['travertino'] },
  { lemmaId: 'monumento', italian: 'monumento', english: 'monument', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['monumento', 'monumenti'] },
  { lemmaId: 'invernale', italian: 'invernale', english: 'wintry / winter', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['invernale', 'invernali'] },
  { lemmaId: 'stabilita', italian: 'stabilità', english: 'stability', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 68, inflections: ['stabilità', 'stabilita'] },
  { lemmaId: 'raggiungere', italian: 'raggiungere', english: 'to reach / achieve', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['raggiungere', 'raggiunge', 'raggiungeva', 'raggiunto', 'raggiunta'] },
  { lemmaId: 'campanella', italian: 'campanella', english: 'small bell / chime', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['campanella', 'campanelle'] },
  { lemmaId: 'trillare', italian: 'trillare', english: 'to ring / chime', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 68, inflections: ['trillare', 'trilla', 'trillava', 'trillò', 'trillato'] },
  { lemmaId: 'settimanale', italian: 'settimanale', english: 'weekly', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['settimanale', 'settimanali'] },
  { lemmaId: 'quaderno', italian: 'quaderno', english: 'notebook', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['quaderno', 'quaderni'] },
  { lemmaId: 'completo', italian: 'completo', english: 'complete / full', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['completo', 'completa', 'completi', 'complete'] },
  { lemmaId: 'giungere', italian: 'giungere', english: 'to arrive / reach', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['giungere', 'giunge', 'giungeva', 'giunto', 'giunta'] },
  { lemmaId: 'approfondito', italian: 'approfondito', english: 'thorough / in-depth', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['approfondito', 'approfondita', 'approfonditi', 'approfondite'] },
  { lemmaId: 'confuso', italian: 'confuso', english: 'confused / scattered', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['confuso', 'confusa', 'confusi', 'confuse'] },
  { lemmaId: 'ansioso', italian: 'ansioso', english: 'anxious', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['ansioso', 'ansiosa', 'ansiosi', 'ansiose'] },
  { lemmaId: 'elenco', italian: 'elenco', english: 'list', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['elenco', 'elenchi'] },
  { lemmaId: 'svegliare', italian: 'svegliare', english: 'to wake up', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['svegliare', 'sveglia', 'svegliava', 'svegliò', 'svegliato'] },
  { lemmaId: 'promessa', italian: 'promessa', english: 'promise', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['promessa', 'promesse'] },
  { lemmaId: 'contemplare', italian: 'contemplare', english: 'to contemplate', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['contemplare', 'contempla', 'contemplava', 'contemplando', 'contemplato'] },
  { lemmaId: 'avviare', italian: 'avviare', english: 'to start / launch', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['avviare', 'avvia', 'avviava', 'avviando', 'avviato'] },
  { lemmaId: 'cosciente', italian: 'cosciente', english: 'conscious / aware', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['cosciente', 'coscienti'] },
  { lemmaId: 'regolarita', italian: 'regolarità', english: 'regularity / smoothness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['regolarità', 'regolarita'] },
  { lemmaId: 'condotto', italian: 'condotto', english: 'pipe / conduit / duct', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 70, inflections: ['condotto', 'condotti'] }
];

for (const entry of extraBases) {
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

// Master Batch C surface dictionary
const batchCWordMap = {
  "tracce": "traccia", "accendeva": "accendere", "svelti": "svelto",
  "immaginato": "immaginare", "selezioni": "selezione", "tradizioni": "tradizione",
  "familiari": "familiare", "chiedevano": "chiedere", "bevevano": "bere",
  "bollente": "bollente", "disappunto": "disappunto", "novità": "novita",
  "intesa": "intesa", "colline": "collina", "circostanti": "circostante",
  "infilava": "infilarsi", "ombrosi": "ombroso", "accorciate": "accorciare",
  "terracotta": "terracotta", "assumeva": "assumere", "gelida": "gelido",
  "visitatori": "visitatore", "occasionali": "occasionale", "travertino": "travertino",
  "monumenti": "monumento", "invernali": "invernale", "stabilità": "stabilita",
  "raggiunta": "raggiungere", "muovendosi": "muovere", "naturali": "naturale",
  "considerava": "considerare", "campanella": "campanella", "trillò": "trillare",
  "settimanale": "settimanale", "quaderni": "quaderno", "completi": "completo",
  "giunto": "giungere", "approfondito": "approfondito", "ritrovò": "ritrovare",
  "confuse": "confuso", "ansiose": "ansioso", "scritte": "scrivere",
  "elenchi": "elenco", "svegliò": "svegliare", "promessa": "promessa",
  "arrivò": "arrivare", "contemplando": "contemplare", "avviando": "avviare",
  "diventati": "diventare", "cosciente": "cosciente", "regolarità": "regolarita",
  "condotti": "condotto", "frizzante": "frizzante", "radicate": "radicato",
  "consolidate": "consolidato", "pensionato": "pensionato", "tipografia": "tipografia",
  "tipografo": "tipografo", "abitudinario": "abitudinario", "schietto": "schietto",
  "sostanza": "sostanza", "miscela": "miscela", "rotondità": "rotondita",
  "avvolgente": "avvolgente", "nocciola": "nocciola", "oste": "oste",
  "falegnameria": "falegnameria", "ventilata": "ventilato", "incolmabile": "incolmabile",
  "acciottolati": "acciottolato", "pungente": "pungente", "diminuiscono": "diminuire",
  "panico": "panico", "vittime": "vittima", "nido": "nido",
  "operoso": "operoso", "fraterno": "fraterno", "levigare": "levigare",
  "setose": "setoso", "maturazione": "maturazione", "indistruttibile": "indistruttibile",
  "consorzio": "consorzio", "distribuzione": "distribuzione", "profitti": "profitto",
  "standardizzare": "standardizzare", "ingranaggio": "ingranaggio", "conferma": "conferma",
  "sigillo": "sigillo", "copertina": "copertina", "catastrofe": "catastrofe",
  "smantellare": "smantellare", "imposte": "imposta", "utile": "utile",
  "contabile": "contabile", "pecorino": "pecorino", "smentiscono": "smentire",
  "faldoni": "faldone", "consacrazione": "consacrazione", "irreversibile": "irreversibile",
  "costruttore": "costruttore", "incrollabili": "incrollabile", "precoce": "precoce",
  "toppa": "toppa", "spago": "spago", "provinciale": "provinciale",
  "ciliegio": "ciliegio", "inchino": "inchino", "eredità": "eredita",
  "fecondo": "fecondo", "autorevole": "autorevole", "sintesi": "sintesi",
  "rintocchi": "rintocco", "all'alba": "alba", "dell'alba": "alba",
  "all'apertura": "apertura", "all'inaugurazione": "inaugurazione", "nell'entusiasmo": "entusiasmo",
  "dall'oggi": "oggi", "all'angolo": "angolo", "nell'aria": "aria",
  "dall'aria": "aria", "sull'attaccapanni": "attaccapanni", "dall'inverno": "inverno",
  "all'inverno": "inverno", "nell'inverno": "inverno", "dall'inizio": "inizio",
  "all'inizio": "inizio", "dall'ingresso": "ingresso", "all'ingresso": "ingresso",
  "nell'ingresso": "ingresso", "dall'unione": "unione", "all'unione": "unione",
  "nell'unione": "unione", "dall'interno": "interno", "all'interno": "interno",
  "nell'interno": "interno", "dall'esperienza": "esperienza", "all'esperienza": "esperienza",
  "nell'esperienza": "esperienza", "dall'orgoglio": "orgoglio", "all'orgoglio": "orgoglio",
  "nell'orgoglio": "orgoglio", "dall'umiltà": "umilta", "all'umiltà": "umilta",
  "nell'umiltà": "umilta", "dall'ansia": "ansia", "all'ansia": "ansia",
  "nell'ansia": "ansia", "dall'ombra": "ombra", "all'ombra": "ombra",
  "nell'ombra": "ombra", "dall'alto": "alto", "all'alto": "alto",
  "nell'alto": "alto", "dall'odore": "odore", "all'odore": "odore",
  "nell'odore": "odore", "dall'oro": "oro", "all'oro": "oro",
  "nell'oro": "oro", "dall'ora": "ora", "all'ora": "ora",
  "nell'ora": "ora", "dall'opera": "opera", "all'opera": "opera",
  "nell'opera": "opera", "dall'idea": "idea", "all'idea": "idea",
  "nell'idea": "idea"
};

for (const [k, v] of Object.entries(batchCWordMap)) {
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
