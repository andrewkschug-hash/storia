const fs = require('fs');

function tokenizeItalian(text) {
  const tokens = [];
  const re = /[\p{L}\p{N}’']+/gu;
  let match;
  while ((match = re.exec(text)) !== null) {
    let surface = match[0];
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

// Final batch of base lemmas to add to core
const finalCoreEntries = [
  { lemmaId: 'cooperazione', italian: 'cooperazione', english: 'cooperation / teamwork', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['cooperazione', 'cooperazioni'] },
  { lemmaId: 'tagliere', italian: 'tagliere', english: 'cutting board', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['tagliere', 'taglieri'] },
  { lemmaId: 'casereccio', italian: 'casereccio', english: 'rustic / homemade', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 69, inflections: ['casereccio', 'casereccia', 'caserecci', 'caserecce'] },
  { lemmaId: 'merenda', italian: 'merenda', english: 'afternoon snack', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['merenda', 'merende'] },
  { lemmaId: 'improvvisato', italian: 'improvvisato', english: 'impromptu / improvised', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['improvvisato', 'improvvisata', 'improvvisati', 'improvvisate'] },
  { lemmaId: 'ripercorrere', italian: 'ripercorrere', english: 'to retrace / look back on', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['ripercorrere', 'ripercorre', 'ripercorreva', 'ripercorso'] },
  { lemmaId: 'significativo', italian: 'significativo', english: 'meaningful / significant', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['significativo', 'significativa', 'significativi', 'significative'] },
  { lemmaId: 'farcela', italian: 'farcela', english: 'to make it / succeed', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['farcela', 'ce la fa', 'ce la faceva', 'ce l\'ha fatta'] },
  { lemmaId: 'graffio', italian: 'graffio', english: 'scratch', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['graffio', 'graffi'] },
  { lemmaId: 'realmente', italian: 'realmente', english: 'really / truly', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['realmente'] },
  { lemmaId: 'facilita', italian: 'facilità', english: 'ease / facility', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['facilità', 'facilita'] },
  { lemmaId: 'brindisi', italian: 'brindisi', english: 'toast (cheers)', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['brindisi'] },
  { lemmaId: 'stellato', italian: 'stellato', english: 'starry / starlit', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['stellato', 'stellata', 'stellati', 'stellate'] },
  { lemmaId: 'richiudere', italian: 'richiudere', english: 'to close again / close up', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['richiudere', 'richiude', 'richiudeva', 'richiuso'] },
  { lemmaId: 'cristallino', italian: 'cristallino', english: 'crystalline / crystal clear', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['cristallino', 'cristallina', 'cristallini', 'cristalline'] },
  { lemmaId: 'dinamico', italian: 'dinamico', english: 'dynamic', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['dinamico', 'dinamica', 'dinamici', 'dinamiche'] },
  { lemmaId: 'frattura', italian: 'frattura', english: 'fracture / divide', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['frattura', 'fratture'] },
  { lemmaId: 'integro', italian: 'integro', english: 'whole / intact / upright', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['integro', 'integra', 'integri', 'integre'] },
  { lemmaId: 'sopravvissuto', italian: 'sopravvissuto', english: 'survivor', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['sopravvissuto', 'sopravvissuta', 'sopravvissuti', 'sopravvissute'] },
  { lemmaId: 'fondamenta', italian: 'fondamenta', english: 'foundations', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['fondamenta'] },
  { lemmaId: 'carica', italian: 'carica', english: 'energy / boost / charge', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['carica', 'cariche'] },
  { lemmaId: 'ricchezza', italian: 'ricchezza', english: 'wealth / richness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['ricchezza', 'ricchezze'] },
  { lemmaId: 'architetto', italian: 'architetto', english: 'architect', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['architetto', 'architetti'] },
  { lemmaId: 'organismo', italian: 'organismo', english: 'organism', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['organismo', 'organismi'] },
  { lemmaId: 'tessuto', italian: 'tessuto', english: 'fabric / tissue', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['tessuto', 'tessuti'] },
  { lemmaId: 'biscotto', italian: 'biscotto', english: 'biscuit / cookie', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['biscotto', 'biscotti'] },
  { lemmaId: 'casalingo', italian: 'casalingo', english: 'homemade / domestic', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['casalingo', 'casalinga', 'casalinghi', 'casalinghe'] },
  { lemmaId: 'villa', italian: 'villa', english: 'villa', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['villa', 'ville'] },
  { lemmaId: 'complicita', italian: 'complicità', english: 'camaraderie / complicity', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['complicità', 'complicita'] },
  { lemmaId: 'motore', italian: 'motore', english: 'engine / motor', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['motore', 'motori'] },
  { lemmaId: 'mattinata', italian: 'mattinata', english: 'morning (duration)', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['mattinata', 'mattinate'] },
  { lemmaId: 'banca', italian: 'banca', english: 'bank', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['banca', 'banche'] },
  { lemmaId: 'conoscenza', italian: 'conoscenza', english: 'knowledge / acquaintance', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['conoscenza', 'conoscenze'] },
  { lemmaId: 'dono', italian: 'dono', english: 'gift', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['dono', 'doni'] },
  { lemmaId: 'vivente', italian: 'vivente', english: 'living', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['vivente', 'viventi'] },
  { lemmaId: 'morale', italian: 'morale', english: 'moral', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['morale', 'morali'] },
  { lemmaId: 'spirituale', italian: 'spirituale', english: 'spiritual', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['spirituale', 'spirituali'] },
  { lemmaId: 'custodire', italian: 'custodire', english: 'to guard / keep safe', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['custodire', 'custodisce', 'custodiva', 'custodito', 'custodita'] },
  { lemmaId: 'tramandare', italian: 'tramandare', english: 'to pass down / hand down', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['tramandare', 'tramanda', 'tramandava', 'tramandato', 'tramandata'] },
  { lemmaId: 'comanda', italian: 'comanda', english: 'order (restaurant/cafe order)', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 70, inflections: ['comanda', 'comande'] },
  { lemmaId: 'grammatica', italian: 'grammatica', english: 'grammar', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['grammatica', 'grammatiche'] },
  { lemmaId: 'uccellino', italian: 'uccellino', english: 'little bird', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['uccellino', 'uccellini'] },
  { lemmaId: 'listello', italian: 'listello', english: 'wood strip / batten', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 70, inflections: ['listello', 'listelli'] },
  { lemmaId: 'gradevole', italian: 'gradevole', english: 'pleasant / agreeable', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['gradevole', 'gradevoli'] },
  { lemmaId: 'dipendenza', italian: 'dipendenza', english: 'dependence / employment', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['dipendenza', 'dipendenze'] },
  { lemmaId: 'rendita', italian: 'rendita', english: 'passive income / annuities / coasting', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 70, inflections: ['rendita', 'rendite'] },
  { lemmaId: 'atto', italian: 'atto', english: 'act / deed', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['atto', 'atti'] },
  { lemmaId: 'colmare', italian: 'colmare', english: 'to fill up / soothe', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['colmare', 'colma', 'colmava', 'colmato'] },
  { lemmaId: 'contadino', italian: 'contadino', english: 'peasant / farmer', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['contadino', 'contadina', 'contadini', 'contadine'] },
  { lemmaId: 'indissolubilmente', italian: 'indissolubilmente', english: 'indissolubly', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['indissolubilmente'] },
  { lemmaId: 'universale', italian: 'universale', english: 'universal', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['universale', 'universali'] },
  { lemmaId: 'inconciliabile', italian: 'inconciliabile', english: 'irreconcilable', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['inconciliabile', 'inconciliabili'] },
  { lemmaId: 'chiesa', italian: 'chiesa', english: 'church', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['chiesa', 'chiese'] },
  { lemmaId: 'bronzeo', italian: 'bronzeo', english: 'bronze / bronze-sounding', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 70, inflections: ['bronzeo', 'bronzea', 'bronzei', 'bronzee'] },
  { lemmaId: 'fermezza', italian: 'fermezza', english: 'firmness / steadiness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['fermezza'] },
  { lemmaId: 'ventata', italian: 'ventata', english: 'gust of wind / breeze', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['ventata', 'ventate'] }
];

for (const entry of finalCoreEntries) {
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

// Complete final dictionary overrides
const zeroMissingOverrides = {
  "cooperazione": "cooperazione", "tagliere": "tagliere", "casereccio": "casereccio",
  "merenda": "merenda", "improvvisata": "improvvisato", "ripercorrere": "ripercorrere",
  "divertenti": "divertente", "significativi": "significativo", "facce": "faccia",
  "partecipanti": "partecipante", "intrecciate": "intrecciare", "un'amicizia": "amicizia",
  "confidato": "confidare", "versandosi": "versare", "goccio": "goccio",
  "diffidente": "diffidente", "convinto": "convinto", "farcela": "farcela",
  "continuamente": "continuamente", "debolezza": "debolezza", "graffi": "graffio",
  "realmente": "realmente", "facilità": "facilita", "brindisi": "brindisi",
  "stellato": "stellato", "richiuso": "richiudere", "cristallina": "cristallino",
  "dinamico": "dinamico", "frattura": "frattura", "integra": "integro",
  "sopravvissuto": "sopravvissuto", "fondamenta": "fondamenta", "arrivò": "arrivare",
  "diventati": "diventare", "naturali": "naturale", "attraversava": "attraversare",
  "ritrovata": "ritrovare", "riportò": "riportare", "carica": "carica",
  "tovagliolino": "tovagliolino", "successiva": "successivo", "varia": "vario",
  "ricchezza": "ricchezza", "architetti": "architetto", "organismo": "organismo",
  "tessuto": "tessuto", "biscotti": "biscotto", "casalinghi": "casalingo",
  "villa": "villa", "programmi": "programma", "complicità": "complicita",
  "motore": "motore", "positiva": "positivo", "mattinata": "mattinata",
  "passeggiava": "passeggiare", "banca": "banca", "conoscenza": "conoscenza",
  "dono": "dono", "l'esempio": "esempio", "vivente": "vivente",
  "morali": "morale", "spirituale": "spirituale", "custodita": "custodire",
  "tramandata": "tramandare", "comanda": "comanda", "grammatica": "grammatica",
  "uccellino": "uccellino", "listello": "listello", "gradevole": "gradevole",
  "passati": "passato", "dipendenza": "dipendenza", "rendita": "rendita",
  "ricordi": "ricordo", "pigrizia": "pigrizia", "atto": "atto",
  "l'apprendista": "apprendista", "colmare": "colmare", "contadini": "contadino",
  "indissolubilmente": "indissolubilmente", "universale": "universale",
  "sembravano": "sembrare", "inconciliabili": "inconciliabile", "chiesa": "chiesa",
  "bronzeo": "bronzeo", "fermezza": "fermezza", "ventata": "ventata",
  "capitolo": "capitolo", "caffè": "caffe", "caffe": "caffe",
  "perché": "perche", "più": "piu", "già": "gia", "sarà": "essere",
  "può": "potere", "così": "cosi", "lì": "li", "là": "la", "è": "essere",
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
  "confermavano": "confermare", "solidità": "solidita", "graduale": "graduale",
  "sana": "sano", "bravi": "bravo", "familiarità": "familiarita",
  "darle": "dare", "fluivano": "fluire", "freschi": "fresco",
  "agganciò": "agganciare", "bruna": "bruno", "aperto": "aperto",
  "sergio": "sergio", "cavour": "cavour", "morandi": "morandi",
  "teresa": "teresa", "maggiore": "maggior", "vincoli": "vincoli"
};

for (const [k, v] of Object.entries(zeroMissingOverrides)) {
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
    console.log(`❌ Chapter ${i} missing tokens: ${missing.length}`, missing);
    totalMissing += missing.length;
  } else {
    // console.log(`🎉 Chapter ${i}: 100% PERFECT 0 MISSING!`);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

console.log('====================================');
console.log(`Total missing across all Chapters 1-70: ${totalMissing}`);
