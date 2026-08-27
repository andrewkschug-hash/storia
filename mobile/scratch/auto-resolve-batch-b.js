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
const coreMap = new Map();

for (const e of core.lexicon) {
  coreMap.set(e.lemmaId.toLowerCase(), e);
  coreMap.set(e.italian.toLowerCase(), e);
  if (e.inflections) {
    for (const inf of e.inflections) {
      coreMap.set(inf.toLowerCase(), e);
    }
  }
}

// Harvest from 1-60
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
            const target = core.lexicon.find((e) => e.lemmaId === lem);
            if (target) {
              coreMap.set(surface, target);
            }
          }
        }
      }
    }
  }
}

// Collect all unique unmatched tokens across 61-65
const allTokens = new Set();
for (let i = 61; i <= 65; i++) {
  const ch = JSON.parse(fs.readFileSync(`./content/stories/luca-a-roma/chapters/chapter-${i}.json`, 'utf8'));
  for (const para of ch.paragraphs) {
    for (const s of para.sentences) {
      for (const t of tokenizeItalian(s.text)) {
        allTokens.add(t.surface);
      }
    }
  }
}

console.log('Total unique tokens in Batch B:', allTokens.size);

// Additional manual word resolutions
const manualOverrides = {
  "dissolta": "dissolvere", "dimensione": "dimensione", "quiete": "quiete",
  "rettangolo": "rettangolo", "rettangoli": "rettangolo", "cotto": "cotto",
  "meticolosa": "meticoloso", "riparato": "riparato", "riparata": "riparato",
  "situare": "situare", "situata": "situare", "collegare": "collegare",
  "collegò": "collegare", "cavo": "cavo", "alimentazione": "alimentazione",
  "protetta": "protetto", "paio": "paio", "nere": "nero", "esposta": "esporre",
  "vestiti": "vestito", "falegname": "falegname", "sacco": "sacco", "corda": "corda",
  "gestisce": "gestire", "orvieto": "orvieto", "esaminarne": "esaminare",
  "esteriore": "esteriore", "sviluppo": "sviluppo", "bourbon": "bourbon",
  "guatemala": "guatemala", "altissima": "alto", "provocare": "provocare",
  "provocata": "provocare", "brasiliano": "brasiliano", "brasiliana": "brasiliano",
  "specifici": "specifico", "tingere": "tingere", "tingendosi": "tingere",
  "istanti": "istante", "spazzando": "spazzare", "temporale": "temporale",
  "temporali": "temporale", "stavano": "stare", "scatenare": "scatenare",
  "scatenò": "scatenare", "colpo": "colpo", "impeto": "impeto", "carichi": "carico",
  "dominare": "dominare", "dominato": "dominare", "dallo": "da", "attimo": "attimo",
  "brevissimo": "breve", "quell'invasione": "invasione", "rischiarato": "rischiarare",
  "godere": "godere", "godeva": "godere", "numerare": "numerare", "numerate": "numerare",
  "tempi": "tempo", "ventisette": "ventisette", "anziché": "anziché", "curva": "curva",
  "teorico": "teorico", "teorica": "teorico", "minuscolo": "minuscolo", "minuscola": "minuscolo",
  "nervoso": "nervoso", "nervosi": "nervoso", "allentare": "allentare", "allentò": "allentare",
  "millimetro": "millimetro", "lavata": "lavare", "piogge": "pioggia", "attirare": "attirare",
  "attirando": "attirare", "ospitare": "ospitare", "ospitava": "ospitare", "porte": "porta",
  "aperte": "aperto", "informale": "informale", "abitanti": "abitante", "armoniosa": "armonioso",
  "nate": "nascere", "interamente": "interamente", "ceramiche": "ceramica", "fornire": "fornire",
  "fornito": "fornire", "eleganti": "elegante", "finiti": "finire", "fresche": "fresco",
  "chiara": "chiara", "sanpietrini": "sanpietrino", "sanpietrino": "sanpietrino",
  "d'olivo": "olivo", "d'api": "ape", "nell'ottobre": "ottobre", "dell'ottobre": "ottobre",
  "all'orlo": "orlo", "all'ingresso": "ingresso", "dall'altro": "altro", "dell'espresso": "espresso",
  "dell'aria": "aria", "dell'albero": "albero", "all'angolo": "angolo", "dall'esterno": "esterno",
  "dall'acqua": "acqua", "dell'acqua": "acqua", "nell'acqua": "acqua", "all'opera": "opera",
  "dall'effetto": "effetto", "dell'iniziativa": "iniziativa", "dall'illusione": "illusione",
  "nell'entusiasmo": "entusiasmo", "nell'imporre": "imporre", "nell'ascoltare": "ascoltare",
  "nell'avere": "avere", "nell'accogliere": "accogliere", "un'invasione": "invasione",
  "un'ondata": "ondata", "un'umidità": "umidità", "un'acidità": "acidità", "un'estrazione": "estrazione",
  "un'esposizione": "esposizione", "un'offerta": "offerta", "un'emozione": "emozione",
  "un'occasione": "occasione", "un'armonia": "armonia", "quell'espresso": "espresso",
  "quell'estrazione": "estrazione", "quell'invasione": "invasione",
  "quell'antico": "antico", "quell'inverno": "inverno",
  "quell'imperfezione": "imperfezione", "nell'ottobre": "ottobre",
  "millenovecentottantadue": "millenovecentottantadue",
  "cinquant'anni": "cinquanta"
};

// Add missing lemmas to core lexicon
const newLemmas = [
  { lemmaId: 'dissolvere', italian: 'dissolvere', english: 'to dissolve', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 61, inflections: ['dissolvere', 'dissolto', 'dissolta', 'dissolse'] },
  { lemmaId: 'dimensione', italian: 'dimensione', english: 'dimension / scale', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 61, inflections: ['dimensione', 'dimensioni'] },
  { lemmaId: 'quiete', italian: 'quiete', english: 'quiet / stillness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 61, inflections: ['quiete'] },
  { lemmaId: 'rettangolo', italian: 'rettangolo', english: 'rectangle', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['rettangolo', 'rettangoli'] },
  { lemmaId: 'cotto', italian: 'cotto', english: 'terracotta / cooked', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['cotto'] },
  { lemmaId: 'meticoloso', italian: 'meticoloso', english: 'meticulous', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 61, inflections: ['meticoloso', 'meticolosa', 'meticolosi', 'meticolose'] },
  { lemmaId: 'riparato', italian: 'riparato', english: 'sheltered / repaired', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 61, inflections: ['riparato', 'riparata', 'riparati', 'riparate'] },
  { lemmaId: 'situare', italian: 'situare', english: 'to situate / locate', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 61, inflections: ['situare', 'situato', 'situata', 'situati', 'situate'] },
  { lemmaId: 'collegare', italian: 'collegare', english: 'to connect / plug in', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 61, inflections: ['collegare', 'collega', 'collegava', 'collegò', 'collegato'] },
  { lemmaId: 'cavo', italian: 'cavo', english: 'cable / wire', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['cavo', 'cavi'] },
  { lemmaId: 'alimentazione', italian: 'alimentazione', english: 'power supply / diet', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 61, inflections: ['alimentazione'] },
  { lemmaId: 'protetto', italian: 'protetto', english: 'protected', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['protetto', 'protetta', 'protetti', 'protette'] },
  { lemmaId: 'paio', italian: 'paio', english: 'pair', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 61, inflections: ['paio', 'paia'] },
  { lemmaId: 'esporre', italian: 'esporre', english: 'to display / exhibit', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 61, inflections: ['esporre', 'espone', 'esponeva', 'esposto', 'esposta', 'esposti'] },
  { lemmaId: 'vestito', italian: 'vestito', english: 'clothes / dress / suit', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['vestito', 'vestiti'] },
  { lemmaId: 'falegname', italian: 'falegname', english: 'carpenter / woodworker', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['falegname', 'falegnami'] },
  { lemmaId: 'sacco', italian: 'sacco', english: 'sack / bag', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['sacco', 'sacchi', 'sacchetto'] },
  { lemmaId: 'corda', italian: 'corda', english: 'rope / cord', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['corda', 'corde'] },
  { lemmaId: 'gestire', italian: 'gestire', english: 'to manage / run', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['gestire', 'gestisce', 'gestiva', 'gestito'] },
  { lemmaId: 'orvieto', italian: 'Orvieto', english: 'Orvieto (Italian town)', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'medium', introducedChapter: 62, inflections: ['orvieto', 'Orvieto'] },
  { lemmaId: 'esaminare', italian: 'esaminare', english: 'to examine', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['esaminare', 'esamina', 'esaminava', 'esaminarne', 'esaminato'] },
  { lemmaId: 'esteriore', italian: 'esteriore', english: 'exterior / outer', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 62, inflections: ['esteriore', 'esteriori'] },
  { lemmaId: 'sviluppo', italian: 'sviluppo', english: 'development', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['sviluppo', 'sviluppi'] },
  { lemmaId: 'bourbon', italian: 'Bourbon', english: 'Bourbon coffee variety', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'low', introducedChapter: 62, inflections: ['bourbon', 'Bourbon'] },
  { lemmaId: 'guatemala', italian: 'Guatemala', english: 'Guatemala', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'medium', introducedChapter: 62, inflections: ['guatemala', 'Guatemala'] },
  { lemmaId: 'provocare', italian: 'provocare', english: 'to cause / provoke', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['provocare', 'provoca', 'provocava', 'provocato', 'provocata'] },
  { lemmaId: 'brasiliano', italian: 'brasiliano', english: 'Brazilian', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['brasiliano', 'brasiliana', 'brasiliani', 'brasiliane'] },
  { lemmaId: 'specifico', italian: 'specifico', english: 'specific', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['specifico', 'specifica', 'specifici', 'specifiche'] },
  { lemmaId: 'tingere', italian: 'tingere', english: 'to dye / tint', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 63, inflections: ['tingere', 'tinge', 'tingeva', 'tingendosi', 'tinto'] },
  { lemmaId: 'istante', italian: 'istante', english: 'instant / moment', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['istante', 'istanti'] },
  { lemmaId: 'spazzare', italian: 'spazzare', english: 'to sweep', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['spazzare', 'spazza', 'spazzava', 'spazzando', 'spazzato'] },
  { lemmaId: 'temporale', italian: 'temporale', english: 'thunderstorm / storm', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['temporale', 'temporali'] },
  { lemmaId: 'scatenare', italian: 'scatenare', english: 'to unleash / trigger', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['scatenare', 'scatena', 'scatenava', 'scatenò', 'scatenato'] },
  { lemmaId: 'colpo', italian: 'colpo', english: 'blow / shot / thud', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['colpo', 'colpi'] },
  { lemmaId: 'impeto', italian: 'impeto', english: 'impetus / rush / momentum', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 63, inflections: ['impeto'] },
  { lemmaId: 'carico', italian: 'carico', english: 'loaded / laden', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['carico', 'carica', 'carichi', 'cariche'] },
  { lemmaId: 'dominare', italian: 'dominare', english: 'to dominate / drown out', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['dominare', 'domina', 'dominava', 'dominato'] },
  { lemmaId: 'attimo', italian: 'attimo', english: 'moment / second', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['attimo', 'attimi'] },
  { lemmaId: 'rischiarare', italian: 'rischiarare', english: 'to brighten / illuminate', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 64, inflections: ['rischiarare', 'rischiara', 'rischiarava', 'rischiarato', 'rischiarata'] },
  { lemmaId: 'godere', italian: 'godere', english: 'to enjoy', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['godere', 'gode', 'godeva', 'goduto'] },
  { lemmaId: 'numerare', italian: 'numerare', english: 'to number', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['numerare', 'numera', 'numerava', 'numerato', 'numerate'] },
  { lemmaId: 'ventisette', italian: 'ventisette', english: 'twenty-seven', partOfSpeech: 'number', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['ventisette'] },
  { lemmaId: 'anziche', italian: 'anziché', english: 'instead of / rather than', partOfSpeech: 'conjunction', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['anziché', 'anziche'] },
  { lemmaId: 'curva', italian: 'curva', english: 'curve', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['curva', 'curve'] },
  { lemmaId: 'teorico', italian: 'teorico', english: 'theoretical', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['teorico', 'teorica', 'teorici', 'teoriche'] },
  { lemmaId: 'minuscolo', italian: 'minuscolo', english: 'tiny / minuscule', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['minuscolo', 'minuscola', 'minuscoli', 'minuscole'] },
  { lemmaId: 'nervoso', italian: 'nervoso', english: 'nervous', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['nervoso', 'nervosa', 'nervosi', 'nervose'] },
  { lemmaId: 'allentare', italian: 'allentare', english: 'to loosen / relax', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['allentare', 'allenta', 'allentava', 'allentò', 'allentato'] },
  { lemmaId: 'millimetro', italian: 'millimetro', english: 'millimeter', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['millimetro', 'millimetri'] },
  { lemmaId: 'abitante', italian: 'abitante', english: 'inhabitant / resident', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['abitante', 'abitanti'] },
  { lemmaId: 'armonioso', italian: 'armonioso', english: 'harmonious', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['armonioso', 'armoniosa', 'armoniosi', 'armoniose'] },
  { lemmaId: 'interamente', italian: 'interamente', english: 'entirely / completely', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['interamente'] },
  { lemmaId: 'fornire', italian: 'fornire', english: 'to provide / supply', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['fornire', 'fornisce', 'forniva', 'fornito'] },
  { lemmaId: 'elegante', italian: 'elegante', english: 'elegant', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['elegante', 'eleganti'] },
  { lemmaId: 'sanpietrino', italian: 'sanpietrino', english: 'Roman basalt cobblestone', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['sanpietrino', 'sanpietrini'] },
  { lemmaId: 'millenovecentottantadue', italian: 'millenovecentottantadue', english: 'nineteen eighty-two (1982)', partOfSpeech: 'number', difficulty: 2, frequency: 'low', introducedChapter: 63, inflections: ['millenovecentottantadue'] }
];

for (const entry of newLemmas) {
  const existing = core.lexicon.find((e) => e.lemmaId === entry.lemmaId);
  if (!existing) {
    core.lexicon.push(entry);
    coreMap.set(entry.lemmaId.toLowerCase(), entry);
  } else {
    existing.inflections = [...new Set([...(existing.inflections || []), ...(entry.inflections || [])])];
    coreMap.set(entry.lemmaId.toLowerCase(), existing);
  }
}

fs.writeFileSync(corePath, JSON.stringify(core, null, 2), 'utf8');
console.log('Synchronized italian-core.json with new Batch B lemmas.');
