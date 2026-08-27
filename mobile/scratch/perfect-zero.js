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
  { lemmaId: 'opinione', italian: 'opinione', english: 'opinion', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['opinione', 'opinioni'] },
  { lemmaId: 'gratificante', italian: 'gratificante', english: 'gratifying / rewarding', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['gratificante', 'gratificanti'] },
  { lemmaId: 'annuale', italian: 'annuale', english: 'annual / yearly', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['annuale', 'annuali'] }
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

// Complete surface mapping
const fullTable = {
  "pensata": "pensare", "farebbe": "fare", "opinione": "opinione", "attenta": "attento",
  "tovagliolo": "tovagliolo", "capirci": "capire", "gratificante": "gratificante",
  "differenti": "differente", "leggevano": "leggere", "traducevano": "tradurre",
  "scambiavano": "scambiare", "sorseggiando": "sorseggiare", "separati": "separare",
  "asciugava": "asciugare", "correggere": "correggere", "segatura": "segatura",
  "appoggiandosi": "appoggiare", "spezzare": "spezzare", "dorati": "dorato",
  "asciugato": "asciugare", "strofinaccio": "strofinaccio", "confermavano": "confermare",
  "reciproca": "reciproco", "cresceva": "crescere", "riconosciuto": "riconoscere",
  "scendevano": "scendere", "basilica": "basilica", "spaventato": "spaventato",
  "piegarsi": "piegare", "affrontare": "affrontare", "gelida": "gelido",
  "permetterci": "permettere", "ripulendo": "ripulire", "scacciò": "scacciare",
  "decisero": "decidere", "sabati": "sabato", "stampando": "stampare",
  "semplici": "semplice", "cartoncini": "cartoncino", "informativi": "informativo",
  "riciclata": "riciclato", "quarantotto": "quarantotto", "esauriti": "esaurito",
  "batteva": "battere", "dodici": "dodici", "raccolsero": "raccogliere",
  "massiccio": "massiccio", "distribuì": "distribuire", "panetto": "panetto",
  "fresca": "fresco", "guidando": "guidare", "inesperte": "inesperto",
  "riempirono": "riempire", "sciogliendo": "sciogliere", "tavoletta": "tavoletta",
  "venature": "venatura", "fibra": "fibra", "ascoltavano": "ascoltare",
  "affascinati": "affascinare", "toccando": "toccare", "ruvide": "ruvido",
  "diventavano": "diventare", "lisce": "liscio", "tatto": "tatto",
  "preparando": "preparare", "proveniente": "provenire", "raccolti": "raccolto",
  "torta": "torta", "casalinga": "casalingo", "mele": "mela",
  "cannella": "cannella", "mescolava": "mescolare", "tagliato": "tagliare",
  "assaggio": "assaggio", "usò": "usare", "formule": "formula",
  "parlò": "parlare", "abbia": "avere", "estragga": "estrarre",
  "assaggiavano": "assaggiare", "confrontando": "confrontare", "impressioni": "impressione",
  "fiori": "fiore", "agrumi": "agrume", "anziana": "anziano",
  "rivestirsi": "rivestire", "acquistarono": "acquistare", "ordinarono": "ordinare",
  "regalare": "regalare", "chiesero": "chiedere", "iscriversi": "iscrivere",
  "uscì": "uscire", "salutando": "salutare", "calorosamente": "calorosamente",
  "disordinato": "disordinato", "avanzato": "avanzare", "sedendosi": "sedere",
  "facciamo": "fare", "vendiamo": "vendere", "offriamo": "offrire",
  "sistemando": "sistemare", "costretti": "costringere", "avremmo": "avere",
  "fossero": "essere", "ripensò": "ripensare", "comprese": "comprendere",
  "operative": "operativo", "rafforzare": "rafforzare", "insegnato": "insegnare",
  "abitudini": "abitudine", "passive": "passivo", "durature": "duraturo",
  "reinventarsi": "reinventare", "precedettero": "precedere", "diventarono": "diventare",
  "infrasettimanali": "infrasettimanale", "piovosi": "piovoso", "entravano": "entrare",
  "chiacchiere": "chiacchiera", "fermarsi": "fermare", "registratore": "registratore",
  "rifletteva": "riflettere", "sufficienti": "sufficiente", "chiudendo": "chiudere",
  "auguri": "augurio", "scambiati": "scambiare", "fermò": "fermare",
  "ghirlande": "ghirlanda", "verdi": "verde", "portoni": "portone",
  "addobbate": "addobbare", "riflettevano": "riflettere", "sanpietrini": "sanpietrino",
  "compagni": "compagno", "generosi": "generoso", "avrebbe": "avere",
  "nuove": "nuovo", "nessuna": "nessuno", "potuto": "potere",
  "acceso": "accendere", "accoglierlo": "accogliere", "accomodi": "accomodare",
  "preferisce": "preferire", "preparami": "preparare", "ritieni": "ritenere",
  "fornirti": "fornire", "vasta": "vasto", "offrirebbero": "offrire",
  "apprendista": "apprendista", "comporterebbe": "comportare", "parametri": "parametro",
  "dovremmo": "dovere", "volumi": "volume", "uniformare": "uniformare",
  "fissò": "fissare", "accetti": "accettare", "trimestrali": "trimestrale",
  "contano": "contare", "portarti": "portare", "volevo": "volere",
  "avresti": "avere", "reagito": "reagire", "intagliati": "intagliare",
  "ringrazio": "ringraziare", "lavorato": "lavorare", "profondamente": "profondamente",
  "parlava": "parlare", "battuto": "battere", "speravo": "sperare",
  "confondono": "confondere", "finiscono": "finire", "rimasti": "rimanere",
  "gioventù": "gioventu", "apprese": "apprendere", "alzato": "alzare",
  "andarsene": "andarsene", "consigli": "consiglio", "camminando": "camminare",
  "fiero": "fiero", "illuminata": "illuminato", "rimasto": "rimanere",
  "rifiutare": "rifiutare", "lavoratore": "lavoratore", "ricordi": "ricordo",
  "contrario": "contrario", "permette": "permettere", "all'analisi": "analisi",
  "all’analisi": "analisi", "annuale": "annuale", "basato": "basare",
  "divertenti": "divertente", "facce": "faccia", "partecipanti": "partecipante",
  "intrecciate": "intrecciare", "goccio": "goccio", "diffidente": "diffidente",
  "convinto": "convinto", "difendermi": "difendere", "continuamente": "continuamente",
  "contasse": "contare", "debolezza": "debolezza", "spezzando": "spezzare",
  "rispettosi": "rispettoso", "donatogli": "donare", "storie": "storia",
  "riportò": "riportare", "tovagliolino": "tovagliolino", "successiva": "successivo",
  "varia": "vario", "programmi": "programma", "positiva": "positivo",
  "passeggiava": "passeggiare", "l'esempio": "esempio", "l’esempio": "esempio",
  "passati": "passato", "accendi": "accendere", "accogli": "accogliere",
  "pigrizia": "pigrizia", "riponevano": "riporre", "l'apprendista": "apprendista",
  "l’apprendista": "apprendista", "insicurezze": "insicurezza", "rispettata": "rispettare",
  "unite": "unire", "scandiva": "scandire", "prepararle": "preparare",
  "capitolo": "capitolo", "po'": "poco", "po’": "poco", "po": "poco"
};

for (const [k, v] of Object.entries(fullTable)) {
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
