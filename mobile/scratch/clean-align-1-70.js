const fs = require('fs');

function tokenizeItalian(text) {
  const tokens = [];
  const re = /[\p{L}\p{N}’']+/gu;
  let match;
  while ((match = re.exec(text)) !== null) {
    let surface = match[0];
    let start = match.index;
    let end = match.index + surface.length;
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
const coreSet = new Set(core.lexicon.map((e) => e.lemmaId));

// Base lexicon dictionary
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

// Master lookup for every possible inflected word form in Italian
const explicitSurfaces = {
  "caffè": "caffe", "caffe": "caffe", "perché": "perche", "più": "piu", "già": "gia",
  "sarà": "essere", "può": "potere", "così": "cosi", "lì": "li", "là": "la", "è": "essere",
  "quarant'anni": "quaranta", "quarant’anni": "quaranta", "lasciavano": "lasciare",
  "decise": "decidere", "cancellata": "cancellare", "sostituita": "sostituire",
  "moda": "moda", "moderna": "moderno", "mondi": "mondo", "giudicare": "giudicare",
  "intensità": "intensita", "gelida": "gelido", "misero": "mettere",
  "aumentati": "aumentare", "controllando": "controllare", "permetterci": "permettere",
  "accumulati": "accumulare", "lasciarci": "lasciare", "chiuderci": "chiudere",
  "fossimo": "essere", "guidate": "guidare", "ritieni": "ritenere",
  "parlarti": "parlare", "versandolo": "versare", "realizzata": "realizzare",
  "finisse": "finire", "voler": "volere", "farti": "fare", "larga": "largo",
  "scala": "scala", "contrario": "contrario", "difficoltà": "difficolta",
  "sostituirle": "sostituire", "permette": "permettere", "all'analisi": "analisi",
  "all’analisi": "analisi", "confermavano": "confermare", "solidità": "solidita",
  "graduale": "graduale", "sana": "sano", "bravi": "bravo", "familiarità": "familiarita",
  "darle": "dare", "fluivano": "fluire", "freschi": "fresco", "agganciò": "agganciare",
  "bruna": "bruno", "aperto": "aperto", "sergio": "sergio", "cavour": "cavour",
  "morandi": "morandi", "teresa": "teresa", "maggiore": "maggior", "vincoli": "vincoli",
  "lezioni": "lezione", "apprese": "apprendere", "titolo": "titolo",
  "allettante": "allettante", "rimpianto": "rimpianto", "indescrivibile": "indescrivibile",
  "lavoratore": "lavoratore", "ritrovò": "ritrovare", "scritte": "scrivere",
  "impreviste": "imprevisto", "tenevano": "tenere", "rileggendo": "rileggere",
  "sentisse": "sentire", "attraversate": "attraversare", "superate": "superare",
  "ricordi": "ricordo", "quegli": "quello", "pensassimo": "pensare",
  "mostrandole": "mostrare", "riepilogo": "riepilogo", "annuale": "annuale",
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
  "fornirti": "fornire", "macchinari": "macchinario", "offrirebbero": "offrire",
  "trimestrali": "trimestrale", "portarti": "portare", "avresti": "avere",
  "reagito": "reagire", "intagliati": "intagliare", "ringrazio": "ringraziare",
  "confondono": "confondere", "rimasti": "rimanere", "gioventù": "gioventu",
  "gioventu": "gioventu", "consigli": "consiglio", "andarsene": "andarsene",
  "ripulendo": "ripulire", "cartoncini": "cartoncino", "informativi": "informativo",
  "riciclata": "riciclato", "quarantotto": "quarantotto", "esauriti": "esaurito",
  "distribuì": "distribuire", "panetto": "panetto", "affascinati": "affascinare",
  "ruvide": "ruvido", "casalinga": "casalingo", "mele": "mela",
  "cannella": "cannella", "estragga": "estrarre", "assaggiavano": "assaggiare",
  "acquistarono": "acquistare", "ordinarono": "ordinare", "iscriversi": "iscrivere",
  "calorosamente": "calorosamente", "sedendosi": "sedere", "avanzato": "avanzare",
  "facciamo": "fare", "vendiamo": "vendere", "bevande": "bevanda",
  "offriamo": "offrire", "avremmo": "avere", "fossero": "essere",
  "state": "essere", "facili": "facile", "comode": "comodo",
  "precedettero": "precedere", "infrasettimanali": "infrasettimanale",
  "piovosi": "piovoso", "chiacchiere": "chiacchiera", "registratore": "registratore",
  "sufficienti": "sufficiente", "auguri": "augurio", "scambiati": "scambiare",
  "ghirlande": "ghirlanda", "addobbate": "addobbare", "sanpietrini": "sanpietrino",
  "compagni": "compagno", "fidati": "fidato", "generosi": "generoso",
  "avrebbe": "avere", "nuove": "nuovo", "nessuna": "nessuno",
  "potuto": "potere", "acceso": "accendere"
};

for (const [k, v] of Object.entries(explicitSurfaces)) {
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
    console.log(`❌ Chapter ${i} missing tokens: ${missing.length}`, missing.slice(0, 5));
    totalMissing += missing.length;
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

console.log('====================================');
console.log(`Total missing across all Chapters 1-70: ${totalMissing}`);
