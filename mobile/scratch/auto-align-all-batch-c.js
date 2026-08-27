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

// More base entries
const extraBases2 = [
  { lemmaId: 'te', italian: 'tè', english: 'tea', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['tè', 'te'] },
  { lemmaId: 'poesia', italian: 'poesia', english: 'poetry / poem', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['poesia', 'poesie'] },
  { lemmaId: 'giovanile', italian: 'giovanile', english: 'youthful', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['giovanile', 'giovanili'] },
  { lemmaId: 'straniero', italian: 'straniero', english: 'foreigner / foreign', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['straniero', 'straniera', 'stranieri', 'straniere'] },
  { lemmaId: 'superiorita', italian: 'superiorità', english: 'superiority', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['superiorità', 'superiorita'] },
  { lemmaId: 'giornaliero', italian: 'giornaliero', english: 'daily', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['giornaliero', 'giornaliera', 'giornalieri', 'giornaliere'] },
  { lemmaId: 'calo', italian: 'calo', english: 'drop / decline', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['calo', 'cali'] },
  { lemmaId: 'sensibile', italian: 'sensibile', english: 'perceptible / sensitive', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['sensibile', 'sensibili'] },
  { lemmaId: 'scoraggiare', italian: 'scoraggiare', english: 'to discourage', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['scoraggiare', 'scoraggia', 'scoraggiava', 'scoraggiato'] },
  { lemmaId: 'passeggiata', italian: 'passeggiata', english: 'stroll / walk', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['passeggiata', 'passeggiate'] },
  { lemmaId: 'azzerare', italian: 'azzerare', english: 'to zero out / wipe out', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['azzerare', 'azzera', 'azzerava', 'azzereranno', 'azzerato'] },
  { lemmaId: 'anzi', italian: 'anzi', english: 'on the contrary / in fact', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['anzi'] },
  { lemmaId: 'degustare', italian: 'degustare', english: 'to taste / sample', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 68, inflections: ['degustare', 'degusta', 'degustava', 'degustò', 'degustato'] },
  { lemmaId: 'mappa', italian: 'mappa', english: 'map', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['mappa', 'mappe'] },
  { lemmaId: 'paralizzare', italian: 'paralizzare', english: 'to paralyze', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['paralizzare', 'paralizza', 'paralizzava', 'paralizzato'] },
  { lemmaId: 'allontanare', italian: 'allontanare', english: 'to alienate / push away', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['allontanare', 'allontana', 'allontanava', 'allontanato'] },
  { lemmaId: 'coincidere', italian: 'coincidere', english: 'to coincide', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['coincidere', 'coincide', 'coincideva', 'coinciso'] },
  { lemmaId: 'soffocante', italian: 'soffocante', english: 'suffocating / stifling', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['soffocante', 'soffocanti'] },
  { lemmaId: 'smarrimento', italian: 'smarrimento', english: 'bewilderment / disorientation', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['smarrimento'] },
  { lemmaId: 'caotico', italian: 'caotico', english: 'chaotic', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['caotico', 'caotica', 'caotici', 'caotiche'] },
  { lemmaId: 'paralizzante', italian: 'paralizzante', english: 'paralyzing', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['paralizzante', 'paralizzanti'] },
  { lemmaId: 'inadeguatezza', italian: 'inadeguatezza', english: 'inadequacy', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['inadeguatezza'] }
];

for (const entry of extraBases2) {
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

// Exhaustive word mapping for batch C
const comprehensiveMapC = {
  "chiedevano": "chiedere", "bevevano": "bere", "delusione": "delusione",
  "tè": "te", "leggendo": "leggere", "poesie": "poesia", "giovanile": "giovanile",
  "un'invenzione": "invenzione", "stranieri": "straniero", "superiorità": "superiorita",
  "gelida": "gelido", "giornalieri": "giornaliero", "calo": "calo", "sensibile": "sensibile",
  "scoraggiava": "scoraggiare", "passeggiata": "passeggiata", "controllando": "controllare",
  "azzereranno": "azzerare", "anzi": "anzi", "permetterci": "permettere",
  "muovendosi": "muovere", "naturali": "naturale", "considerava": "considerare",
  "preparami": "preparare", "ritieni": "ritenere", "parlarti": "parlare",
  "versandolo": "versare", "realizzata": "realizzare", "finisse": "finire",
  "degustò": "degustare", "ritrovò": "ritrovare", "scritte": "scrivere",
  "mappa": "mappa", "attraversate": "attraversare", "superate": "superare",
  "paralizzato": "paralizzare", "allontanato": "allontanare", "coincideva": "coincidere",
  "quegli": "quello", "contrario": "contrario", "arrivò": "arrivare",
  "diventati": "diventare", "appartenenza": "appartenenza", "riportò": "riportare",
  "soffocante": "soffocante", "smarrimento": "smarrimento", "caotica": "caotico",
  "paralizzante": "paralizzante", "d'inadeguatezza": "inadeguatezza",
  "sergio": "sergio", "cavour": "cavour", "morandi": "morandi",
  "teresa": "teresa", "santa": "santo", "maggiore": "maggior", "vincoli": "vincoli",
  "quarant'anni": "quaranta", "quarant’anni": "quaranta", "pensionato": "pensionato",
  "tipografia": "tipografia", "tipografo": "tipografo", "abitudinario": "abitudinario",
  "schietto": "schietto", "sostanza": "sostanza", "miscela": "miscela",
  "rotondità": "rotondita", "avvolgente": "avvolgente", "nocciola": "nocciola",
  "oste": "oste", "falegnameria": "falegnameria", "ventilata": "ventilato",
  "incolmabile": "incolmabile", "acciottolati": "acciottolato", "pungente": "pungente",
  "diminuiscono": "diminuire", "panico": "panico", "vittime": "vittima",
  "nido": "nido", "operoso": "operoso", "fraterno": "fraterno",
  "levigare": "levigare", "setose": "setoso", "maturazione": "maturazione",
  "indistruttibile": "indistruttibile", "consorzio": "consorzio", "distribuzione": "distribuzione",
  "profitti": "profitto", "standardizzare": "standardizzare", "ingranaggio": "ingranaggio",
  "conferma": "conferma", "sigillo": "sigillo", "copertina": "copertina",
  "catastrofe": "catastrofe", "smantellare": "smantellare", "imposte": "imposta",
  "utile": "utile", "contabile": "contabile", "pecorino": "pecorino",
  "smentiscono": "smentire", "faldoni": "faldone", "consacrazione": "consacrazione",
  "irreversibile": "irreversibile", "costruttore": "costruttore", "incrollabili": "incrollabile",
  "precoce": "precoce", "toppa": "toppa", "spago": "spago", "provinciale": "provinciale",
  "ciliegio": "ciliegio", "inchino": "inchino", "eredità": "eredita",
  "fecondo": "fecondo", "autorevole": "autorevole", "sintesi": "sintesi",
  "rintocchi": "rintocco", "tracce": "traccia", "accendeva": "accendere",
  "svelti": "svelto", "immaginato": "immaginare", "selezioni": "selezione",
  "tradizioni": "tradizione", "familiari": "familiare", "bollente": "bollente",
  "disappunto": "disappunto", "novità": "novita", "intesa": "intesa",
  "colline": "collina", "circostanti": "circostante", "infilava": "infilarsi",
  "ombrosi": "ombroso", "accorciate": "accorciare", "terracotta": "terracotta",
  "assumeva": "assumere", "visitatori": "visitatore", "occasionali": "occasionale",
  "travertino": "travertino", "monumenti": "monumento", "invernali": "invernale",
  "stabilità": "stabilita", "raggiunta": "raggiungere", "campanella": "campanella",
  "trillò": "trillare", "settimanale": "settimanale", "quaderni": "quaderno",
  "completi": "completo", "giunto": "giungere", "approfondito": "approfondito",
  "confuse": "confuso", "ansiose": "ansioso", "elenchi": "elenco",
  "svegliò": "svegliare", "promessa": "promessa", "contemplando": "contemplare",
  "avviando": "avviare", "cosciente": "cosciente", "regolarità": "regolarita",
  "condotti": "condotto", "frizzante": "frizzante", "radicate": "radicato",
  "consolidate": "consolidato", "gatto": "gatto", "attraversava": "attraversare",
  "pigramente": "pigramente", "edicolante": "edicolante", "giornali": "giornale",
  "angoscia": "angoscia", "forni": "forno", "consumi": "consumo",
  "aumentati": "aumentare", "considerevole": "considerevole", "seta": "seta",
  "attenti": "attento", "cappello": "cappello", "attaccapanni": "attaccapanni",
  "gioia": "gioia", "esclamò": "esclamare", "accomodi": "accomodare",
  "preferisce": "preferire", "impreviste": "imprevisto", "allacciamenti": "allacciamento",
  "ingenui": "ingenuo", "tenevano": "tenere", "rileggendo": "rileggere",
  "tenerezza": "tenerezza", "sentisse": "sentire", "impreparato": "impreparato",
  "vulnerabile": "vulnerabile", "sfogliando": "sfogliare", "animarsi": "animarsi"
};

for (const [k, v] of Object.entries(comprehensiveMapC)) {
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
