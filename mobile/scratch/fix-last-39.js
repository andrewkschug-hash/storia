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

const last39 = {
  "disegnando": "disegnare", "pulendo": "pulire", "avvolta": "avvolgere",
  "rivolse": "rivolgere", "dirigersi": "dirigere", "nere": "nero",
  "ammirando": "ammirare", "ebbe": "avere", "prolungato": "prolungato",
  "mettendosi": "mettere", "sciacquò": "sciacquare", "versò": "versare",
  "attraversò": "attraversare", "dizionari": "dizionario", "correvano": "correre",
  "ammetteva": "ammettere", "notò": "notare", "riprendendo": "riprendere",
  "udiva": "udire", "verbali": "verbale", "allungò": "allungare",
  "accumulata": "accumulare", "gradi": "grado", "l'abilità": "abilita",
  "abilità": "abilita", "impolverate": "impolverare", "adatti": "adattare",
  "corposa": "corposo", "trasformazione": "trasformazione", "comunità": "comunita",
  "rigidità": "rigidita", "dell'albero": "albero", "aiutandola": "aiutare",
  "facendola": "fare", "perse": "perdere", "caldissimo": "caldo",
  "aromatiche": "aromatico", "disponendole": "disporre", "riprendervi": "riprendere",
  "trovasse": "trovare", "prendersi": "prendere", "neri": "nero",
  "pioveva": "piovere", "intervenendo": "intervenire", "condividendo": "condividere",
  "inverni": "inverno", "allargarglisi": "allargare", "nato": "nascere",
  "personali": "personale", "dover": "dovere", "ridusse": "ridurre",
  "diventata": "diventare", "rimettendosi": "rimettere", "volle": "volere",
  "torneremo": "tornare", "passeremo": "passare", "comprese": "comprendere",
  "porte": "porta", "sollevò": "sollevare", "annotate": "annotare",
  "dovrebbe": "dovere", "regolo": "regolare", "guardandolo": "guardare",
  "esatta": "esatto", "prendessi": "prendere", "pretendessi": "pretendere",
  "estratta": "estrarre", "bevve": "bere", "delicata": "delicato",
  "ricca": "ricco", "porse": "porgere", "assaggiate": "assaggiare",
  "ditemi": "dire", "voglia": "volere", "privi": "privo",
  "accompagnato": "accompagnare", "strumenti": "strumento", "piegarle": "piegare",
  "lavata": "lavare", "piogge": "pioggia", "tornavano": "tornare",
  "aperte": "aperto", "nate": "nascere", "ceramiche": "ceramica",
  "forme": "forma", "spiccavano": "spiccare", "servendo": "servire",
  "proponeva": "proporre", "profili": "profilo", "fermavano": "fermare",
  "vicine": "vicino", "sorseggiando": "sorseggiare", "chiacchierando": "chiacchierare",
  "avvertiva": "avvertire", "valorizzava": "valorizzare", "vide": "vedere",
  "sorridevano": "sorridere", "calmi": "calmo", "salutarlo": "salutare",
  "felicissimo": "felice", "trovarci": "trovare", "calme": "calmo",
  "scaldasse": "scaldare", "desiderano": "desiderare", "finivano": "finire",
  "ridevano": "ridere", "attirando": "attirare", "ospitava": "ospitare",
  "provenienza": "provenienza", "festeggiare": "festeggiare", "dell'iniziativa": "iniziativa",
  "scena": "scena", "difendere": "difendere"
};

for (const [k, v] of Object.entries(last39)) {
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
      let matched = dict.get(rest);
      if (matched && coreSet.has(matched)) return matched;
      if (coreSet.has(rest)) return rest;
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
