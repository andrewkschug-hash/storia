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

// More base lemmas
const finalBasesC = [
  { lemmaId: 'sergio', italian: 'Sergio', english: 'Sergio (character name)', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'medium', introducedChapter: 66, inflections: ['sergio', 'Sergio'] },
  { lemmaId: 'desiderio', italian: 'desiderio', english: 'desire / wish', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['desiderio', 'desideri'] },
  { lemmaId: 'metodo', italian: 'metodo', english: 'method', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['metodo', 'metodi'] },
  { lemmaId: 'coltivazione', italian: 'coltivazione', english: 'cultivation / farming', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['coltivazione', 'coltivazioni'] },
  { lemmaId: 'fedele', italian: 'fedele', english: 'faithful / loyal', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['fedele', 'fedeli'] },
  { lemmaId: 'accennare', italian: 'accennare', english: 'to gesture / hint', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['accennare', 'accenna', 'accennava', 'accennato'] },
  { lemmaId: 'smorfia', italian: 'smorfia', english: 'grimace / smirk', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 66, inflections: ['smorfia', 'smorfie'] },
  { lemmaId: 'drasticamente', italian: 'drasticamente', english: 'drastically', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['drasticamente'] },
  { lemmaId: 'evidenza', italian: 'evidenza', english: 'evidence / prominence', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['evidenza', 'evidenze'] },
  { lemmaId: 'impegnativo', italian: 'impegnativo', english: 'demanding / challenging', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['impegnativo', 'impegnativa', 'impegnativi', 'impegnative'] },
  { lemmaId: 'preoccupante', italian: 'preoccupante', english: 'worrisome / concerning', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['preoccupante', 'preoccupanti'] },
  { lemmaId: 'forno', italian: 'forno', english: 'oven / kiln / bakery', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['forno', 'forni'] },
  { lemmaId: 'consumo', italian: 'consumo', english: 'consumption / usage', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['consumo', 'consumi'] },
  { lemmaId: 'considerevole', italian: 'considerevole', english: 'considerable / substantial', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['considerevole', 'considerevoli'] },
  { lemmaId: 'seta', italian: 'seta', english: 'silk', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['seta', 'sete'] },
  { lemmaId: 'cappello', italian: 'cappello', english: 'hat', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['cappello', 'cappelli'] },
  { lemmaId: 'attaccapanni', italian: 'attaccapanni', english: 'coat rack', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'medium', introducedChapter: 68, inflections: ['attaccapanni'] },
  { lemmaId: 'gioia', italian: 'gioia', english: 'joy', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['gioia', 'gioie'] },
  { lemmaId: 'esclamare', italian: 'esclamare', english: 'to exclaim', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['esclamare', 'esclama', 'esclamava', 'esclamò', 'esclamato'] },
  { lemmaId: 'allacciamento', italian: 'allacciamento', english: 'connection / hookup', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 69, inflections: ['allacciamento', 'allacciamenti'] },
  { lemmaId: 'ingenuo', italian: 'ingenuo', english: 'naive / simple', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['ingenuo', 'ingenua', 'ingenui', 'ingenue'] },
  { lemmaId: 'tenerezza', italian: 'tenerezza', english: 'tenderness / fondness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['tenerezza'] },
  { lemmaId: 'impreparato', italian: 'impreparato', english: 'unprepared', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['impreparato', 'impreparata', 'impreparati', 'impreparate'] },
  { lemmaId: 'vulnerabile', italian: 'vulnerabile', english: 'vulnerable', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['vulnerabile', 'vulnerabili'] },
  { lemmaId: 'sfogliare', italian: 'sfogliare', english: 'to leaf through / browse', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['sfogliare', 'sfoglia', 'sfogliava', 'sfogliando', 'sfogliato'] },
  { lemmaId: 'animarsi', italian: 'animarsi', english: 'to come alive / animate', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['animarsi', 'anima', 'animava', 'animato'] },
  { lemmaId: 'gatto', italian: 'gatto', english: 'cat', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['gatto', 'gatti', 'gatta', 'gatte'] },
  { lemmaId: 'pigramente', italian: 'pigramente', english: 'lazily', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['pigramente'] },
  { lemmaId: 'edicolante', italian: 'edicolante', english: 'newsagent', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'medium', introducedChapter: 70, inflections: ['edicolante', 'edicolanti'] },
  { lemmaId: 'giornale', italian: 'giornale', english: 'newspaper', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['giornale', 'giornali'] },
  { lemmaId: 'angoscia', italian: 'angoscia', english: 'anguish / dread', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['angoscia', 'angosce'] },
  { lemmaId: 'cavour', italian: 'Cavour', english: 'Cavour (metro station name)', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'medium', introducedChapter: 66, inflections: ['cavour', 'Cavour'] },
  { lemmaId: 'teresa', italian: 'Teresa', english: 'Teresa (character name)', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'medium', introducedChapter: 63, inflections: ['teresa', 'Teresa'] },
  { lemmaId: 'morandi', italian: 'Morandi', english: 'Morandi (lawyer name)', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'medium', introducedChapter: 68, inflections: ['morandi', 'Morandi'] },
  { lemmaId: 'maggior', italian: 'Maggiore', english: 'Maggiore (church name: Santa Maria Maggiore)', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'medium', introducedChapter: 66, inflections: ['maggiore', 'Maggiore'] },
  { lemmaId: 'vincoli', italian: 'Vincoli', english: 'Vincoli (church name: San Pietro in Vincoli)', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'medium', introducedChapter: 70, inflections: ['vincoli', 'Vincoli'] }
];

for (const entry of finalBasesC) {
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

// Full inflection helper for Batch C
const autoBatchC = {
  "lasciavano": "lasciare", "desiderio": "desiderio", "metodi": "metodo",
  "coltivazione": "coltivazione", "sergio": "sergio", "fedele": "fedele",
  "accennato": "accennare", "smorfia": "smorfia", "drasticamente": "drasticamente",
  "misero": "mettere", "evidenza": "evidenza", "impegnativa": "impegnativo",
  "preoccupante": "preoccupante", "forni": "forno", "consumi": "consumo",
  "aumentati": "aumentare", "considerevole": "considerevole", "seta": "seta",
  "attenti": "attento", "cappello": "cappello", "attaccapanni": "attaccapanni",
  "gioia": "gioia", "vederla": "vedere", "esclamò": "esclamare",
  "accoglierlo": "accogliere", "accomodi": "accomodare", "preferisce": "preferire",
  "impreviste": "imprevisto", "allacciamenti": "allacciamento", "ingenui": "ingenuo",
  "tenevano": "tenere", "rileggendo": "rileggere", "tenerezza": "tenerezza",
  "sentisse": "sentire", "impreparato": "impreparato", "vulnerabile": "vulnerabile",
  "sfogliando": "sfogliare", "animarsi": "animarsi", "gatto": "gatto",
  "attraversava": "attraversare", "pigramente": "pigramente", "edicolante": "edicolante",
  "giornali": "giornale", "appartenenza": "appartenenza", "ritrovata": "ritrovare",
  "riportò": "riportare", "angoscia": "angoscia", "cavour": "cavour",
  "teresa": "teresa", "morandi": "morandi", "maggiore": "maggior",
  "vincoli": "vincoli", "quarant’anni": "quaranta", "santa": "santo",
  "d’aria": "aria", "d’erbe": "erba", "d’ottone": "ottone", "d’ulivo": "olivo",
  "d’inverno": "inverno", "d’intesa": "intesa", "d’acqua": "acqua", "d’ingresso": "ingresso",
  "d’estate": "estate", "d’energia": "energia", "d’inadeguatezza": "inadeguatezza",
  "d’oro": "oro", "d’argento": "argento", "d’argilla": "argilla",
  "d’avanti": "avanti", "d’aiuto": "aiuto", "d’esperienza": "esperienza",
  "l’anno": "anno", "l’oro": "oro", "l’odore": "odore", "l’ombra": "ombra",
  "l’ansia": "ansia", "l’alba": "alba", "l’opera": "opera", "l’idea": "idea",
  "l’arte": "arte", "l’aria": "aria", "l’uomo": "uomo", "l’intesa": "intesa",
  "l’equilibrio": "equilibrio", "l’esperienza": "esperienza", "l’orgoglio": "orgoglio",
  "l’umiltà": "umilta", "l’inverno": "inverno", "l’inizio": "inizio",
  "l’ingresso": "ingresso", "l’unione": "unione", "l’interno": "interno",
  "l’avvocato": "avvocato", "l’eredità": "eredita", "l’aiuto": "aiuto",
  "l’incertezza": "incertezza", "l’ostacolo": "ostacolo", "l’ingorgo": "ingorgo",
  "l’angoscia": "angoscia", "l’utile": "utile", "l’amico": "amico",
  "l’artigiano": "artigiano", "l’apprendista": "apprendista", "l’esempio": "esempio",
  "l’uccellino": "uccellino", "l’atto": "atto", "l’espressione": "espressione",
  "l’onestà": "onesta", "l’offerta": "offerta", "l’iniziativa": "iniziativa",
  "l’insegnamento": "insegnamento", "l’avvenire": "avvenire", "l’emozione": "emozione",
  "l’ora": "ora", "l’aroma": "aroma", "l’ospite": "ospite", "l’attività": "attivita",
  "l’eleganza": "eleganza", "l’inchino": "inchino", "l’ondata": "ondata",
  "l’edicolante": "edicolante", "l’inaugurazione": "inaugurazione",
  "all’angolo": "angolo", "all’apertura": "apertura", "all’inaugurazione": "inaugurazione",
  "all’estero": "estero", "all’inizio": "inizio", "all’idea": "idea",
  "all’aroma": "aroma", "all’assaggio": "assaggio", "all’interno": "interno",
  "all’ingresso": "ingresso", "all’onestà": "onesta", "all’analisi": "analisi",
  "all’esterno": "esterno", "all’aperto": "aperto", "all’alba": "alba",
  "all’ombra": "ombra", "all’uomo": "uomo", "all’opera": "opera",
  "all’anima": "anima", "all’esperienza": "esperienza", "all’orgoglio": "orgoglio",
  "all’umiltà": "umilta", "all’inverno": "inverno", "all’anno": "anno",
  "all’aria": "aria",
  "dall’estate": "estate", "dall’angolo": "angolo", "dall’estero": "estero",
  "dall’oggi": "oggi", "dall’apertura": "apertura", "dall’idea": "idea",
  "dall’annuncio": "annuncio", "dall’argilla": "argilla", "dall’alto": "alto",
  "dall’America": "america", "dall’Africa": "africa", "dall’odore": "odore",
  "dall’inizio": "inizio", "dall’esperienza": "esperienza", "dall’orgoglio": "orgoglio",
  "dall’interno": "interno", "dall’avvocato": "avvocato", "dall’onestà": "onesta",
  "dall’ora": "ora", "dall’ansia": "ansia", "dall’ingorgo": "ingorgo",
  "dall’analisi": "analisi", "dall’attività": "attivita", "dall’aria": "aria",
  "dall’angoscia": "angoscia", "dall’inverno": "inverno", "dall’alba": "alba",
  "nell’aria": "aria", "nell’entusiasmo": "entusiasmo", "nell’ascoltare": "ascoltare",
  "nell’imporre": "imporre", "nell’aroma": "aroma", "nell’ombra": "ombra",
  "nell’assaggio": "assaggio", "nell’interno": "interno", "nell’ingresso": "ingresso",
  "nell’onestà": "onesta", "nell’analisi": "analisi", "nell’esperienza": "esperienza",
  "nell’opera": "opera", "nell’uomo": "uomo", "nell’anima": "anima",
  "nell’inverno": "inverno", "nell’anno": "anno", "nell’idea": "idea",
  "sull’attaccapanni": "attaccapanni", "sull’espresso": "espresso", "sull’importanza": "importanza",
  "sull’onestà": "onesta", "sull’analisi": "analisi", "sull’esperienza": "esperienza",
  "sull’opera": "opera", "sull’uomo": "uomo", "sull’anima": "anima",
  "sull’inverno": "inverno", "sull’anno": "anno", "sull’idea": "idea",
  "sull’aria": "aria", "sull’orlo": "orlo",
  "un’aria": "aria", "un’abitudine": "abitudine", "un’ora": "ora",
  "un’esperienza": "esperienza", "un’opportunità": "opportunita", "un’approvazione": "approvazione",
  "un’intesa": "intesa", "un’atmosfera": "atmosfera", "un’iniziativa": "iniziativa",
  "un’attività": "attivita", "un’emozione": "emozione", "un’illusione": "illusione",
  "un’amicizia": "amicizia", "un’idea": "idea", "un’opera": "opera",
  "un’ondata": "ondata", "un’eredità": "eredita", "un’arte": "arte",
  "un’eleganza": "eleganza", "un’intima": "intimo"
};

for (const [k, v] of Object.entries(autoBatchC)) {
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
