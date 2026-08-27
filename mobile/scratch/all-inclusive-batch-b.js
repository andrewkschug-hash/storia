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

// Additional base lemmas
const missingBase = [
  { lemmaId: 'aiutare', italian: 'aiutare', english: 'to help', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['aiutare', 'aiuta', 'aiutava', 'aiutandola', 'aiutato'] },
  { lemmaId: 'fare', italian: 'fare', english: 'to do / make', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['fare', 'fa', 'faceva', 'facendola', 'fecero', 'fatto'] },
  { lemmaId: 'perdere', italian: 'perdere', english: 'to lose', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['perdere', 'perde', 'perdeva', 'perse', 'perso', 'perdersi'] },
  { lemmaId: 'piovere', italian: 'piovere', english: 'to rain', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['piovere', 'piove', 'pioveva', 'piovuto'] },
  { lemmaId: 'intervenire', italian: 'intervenire', english: 'to speak up / intervene', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['intervenire', 'interviene', 'interveniva', 'intervenendo', 'intervenuto'] },
  { lemmaId: 'condividere', italian: 'condividere', english: 'to share', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['condividere', 'condivide', 'condivideva', 'condividendo', 'condiviso'] },
  { lemmaId: 'inverno', italian: 'inverno', english: 'winter', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['inverno', 'inverni'] },
  { lemmaId: 'nascere', italian: 'nascere', english: 'to be born / arise', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['nascere', 'nasce', 'nasceva', 'nato', 'nate'] },
  { lemmaId: 'personale', italian: 'personale', english: 'personal', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['personale', 'personali'] },
  { lemmaId: 'dovere', italian: 'dovere', english: 'must / duty / have to', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['dovere', 'deve', 'doveva', 'dovrebbe', 'dover', 'dovuto'] },
  { lemmaId: 'ridurre', italian: 'ridurre', english: 'to reduce / subside', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['ridurre', 'riduce', 'riduceva', 'ridusse', 'ridotto', 'ridotta'] },
  { lemmaId: 'diventare', italian: 'diventare', english: 'to become', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['diventare', 'diventa', 'diventava', 'diventato', 'diventata'] },
  { lemmaId: 'rimettere', italian: 'rimettere', english: 'to put back on', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['rimettere', 'rimette', 'rimetteva', 'rimesso', 'rimettendosi'] },
  { lemmaId: 'volere', italian: 'volere', english: 'to want', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['volere', 'vuole', 'voleva', 'volle', 'volevamo', 'voglia', 'voluto'] },
  { lemmaId: 'tornare', italian: 'tornare', english: 'to return', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['tornare', 'torna', 'tornava', 'tornavano', 'tornerò', 'torneremo', 'tornato'] },
  { lemmaId: 'passare', italian: 'passare', english: 'to pass / pass by', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['passare', 'passa', 'passava', 'passeremo', 'passato'] },
  { lemmaId: 'comprendere', italian: 'comprendere', english: 'to understand', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['comprendere', 'comprende', 'comprendeva', 'comprese', 'comprendesse', 'compreso'] },
  { lemmaId: 'porta', italian: 'porta', english: 'door', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['porta', 'porte'] },
  { lemmaId: 'annotare', italian: 'annotare', english: 'to write down / note', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['annotare', 'annota', 'annotava', 'annotate', 'annotato'] },
  { lemmaId: 'guardare', italian: 'guardare', english: 'to look at', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['guardare', 'guarda', 'guardava', 'guardò', 'guardandolo', 'guardato'] },
  { lemmaId: 'esatto', italian: 'esatto', english: 'exact', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['esatto', 'esatta', 'esatti', 'esatte'] },
  { lemmaId: 'pretendere', italian: 'pretendere', english: 'to demand / expect', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['pretendere', 'pretende', 'pretendeva', 'pretendessi', 'preteso'] },
  { lemmaId: 'estrarre', italian: 'estrarre', english: 'to extract / brew', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['estrarre', 'estrae', 'estraeva', 'estratto', 'estratta'] },
  { lemmaId: 'delicato', italian: 'delicato', english: 'delicate', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['delicato', 'delicata', 'delicati', 'delicate'] },
  { lemmaId: 'ricco', italian: 'ricco', english: 'rich', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['ricco', 'ricca', 'ricchi', 'ricche'] },
  { lemmaId: 'porgere', italian: 'porgere', english: 'to hand / offer', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['porgere', 'porge', 'porgeva', 'porse', 'porto'] },
  { lemmaId: 'assaggiare', italian: 'assaggiare', english: 'to taste', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['assaggiare', 'assaggia', 'assaggiava', 'assaggiate', 'assaggiò', 'assaggiato'] },
  { lemmaId: 'dire', italian: 'dire', english: 'to say / tell', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['dire', 'dice', 'diceva', 'ditemi', 'detto'] },
  { lemmaId: 'privo', italian: 'privo', english: 'devoid of / free from', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['privo', 'priva', 'privi', 'prive'] },
  { lemmaId: 'accompagnare', italian: 'accompagnare', english: 'to accompany', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['accompagnare', 'accompagna', 'accompagnava', 'accompagnato', 'accompagnasse'] },
  { lemmaId: 'strumento', italian: 'strumento', english: 'tool / instrument', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['strumento', 'strumenti'] },
  { lemmaId: 'piegare', italian: 'piegare', english: 'to bend (piegarle = to bend them)', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['piegare', 'piega', 'piegava', 'piegato', 'piegarle'] },
  { lemmaId: 'lavare', italian: 'lavare', english: 'to wash', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['lavare', 'lava', 'lavava', 'lavato', 'lavata'] },
  { lemmaId: 'pioggia', italian: 'pioggia', english: 'rain', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['pioggia', 'piogge'] },
  { lemmaId: 'aperto', italian: 'aperto', english: 'open', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['aperto', 'aperta', 'aperti', 'aperte'] },
  { lemmaId: 'ceramica', italian: 'ceramica', english: 'ceramics / pottery', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['ceramica', 'ceramiche'] },
  { lemmaId: 'forma', italian: 'forma', english: 'shape / form', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['forma', 'forme'] },
  { lemmaId: 'spiccare', italian: 'spiccare', english: 'to stand out', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['spiccare', 'spicca', 'spiccava', 'spiccavano', 'spiccato'] },
  { lemmaId: 'servire', italian: 'servire', english: 'to serve', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['servire', 'serve', 'serviva', 'servendo', 'servì', 'servito'] },
  { lemmaId: 'proporre', italian: 'proporre', english: 'to propose / offer', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['proporre', 'propone', 'proponeva', 'propose', 'proposto'] },
  { lemmaId: 'profilo', italian: 'profilo', english: 'profile', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['profilo', 'profili'] },
  { lemmaId: 'fermare', italian: 'fermare', english: 'to stop', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['fermare', 'ferma', 'fermava', 'fermavano', 'fermato'] },
  { lemmaId: 'vicino', italian: 'vicino', english: 'nearby / close', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['vicino', 'vicina', 'vicini', 'vicine'] },
  { lemmaId: 'sorseggiare', italian: 'sorseggiare', english: 'to sip', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['sorseggiare', 'sorseggia', 'sorseggiava', 'sorseggiando', 'sorseggiato'] },
  { lemmaId: 'avvertire', italian: 'avvertire', english: 'to feel / sense / warn', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['avvertire', 'avverte', 'avvertiva', 'avvertito'] },
  { lemmaId: 'valorizzare', italian: 'valorizzare', english: 'to enhance / value', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['valorizzare', 'valorizza', 'valorizzava', 'valorizzato', 'valorizzarla'] },
  { lemmaId: 'vedere', italian: 'vedere', english: 'to see', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['vedere', 'vede', 'vedeva', 'vide', 'visto'] },
  { lemmaId: 'sorridere', italian: 'sorridere', english: 'to smile', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['sorridere', 'sorride', 'sorrideva', 'sorridevano', 'sorriso'] },
  { lemmaId: 'calmo', italian: 'calmo', english: 'calm', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['calmo', 'calma', 'calmi', 'calme'] },
  { lemmaId: 'salutare', italian: 'salutare', english: 'to greet / say goodbye (salutarlo = to greet him)', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['salutare', 'saluta', 'salutava', 'salutarlo', 'salutato'] },
  { lemmaId: 'felice', italian: 'felice', english: 'happy (felicissimo = very happy)', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['felice', 'felici', 'felicissimo', 'felicissima'] },
  { lemmaId: 'trovare', italian: 'trovare', english: 'to find / visit (trovarci = to visit us)', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['trovare', 'trova', 'trovava', 'trovarci', 'trovato'] },
  { lemmaId: 'scaldare', italian: 'scaldare', english: 'to warm up', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['scaldare', 'scalda', 'scaldava', 'scaldasse', 'scaldando', 'scaldato'] },
  { lemmaId: 'desiderare', italian: 'desiderare', english: 'to desire / wish', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['desiderare', 'desidera', 'desiderava', 'desiderano', 'desiderato'] },
  { lemmaId: 'finire', italian: 'finire', english: 'to finish', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['finire', 'finisce', 'finiva', 'finivano', 'finito'] },
  { lemmaId: 'sollevare', italian: 'sollevare', english: 'to raise / lift', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['sollevare', 'solleva', 'sollevava', 'sollevò', 'sollevato'] },
  { lemmaId: 'regolare', italian: 'regolare', english: 'to adjust / regular', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 64, inflections: ['regolare', 'regola', 'regolava', 'regolo', 'regolò', 'regolato'] }
];

for (const entry of missingBase) {
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

// Exhaustive word-to-lemma dictionary
const masterMap = {
  "aiutandola": "aiutare", "facendola": "fare", "perse": "perdere", "caldissimo": "caldo",
  "corposa": "corposo", "aromatiche": "aromatico", "disponendole": "disporre",
  "riprendervi": "riprendere", "trovasse": "trovare", "prendersi": "prendere",
  "neri": "nero", "trasformazione": "trasformazione", "pioveva": "piovere",
  "intervenendo": "intervenire", "condividendo": "condividere", "inverni": "inverno",
  "allargarglisi": "allargare", "nato": "nascere", "personali": "personale",
  "dover": "dovere", "ridusse": "ridurre", "diventata": "diventare",
  "rimettendosi": "rimettere", "volle": "volere", "torneremo": "tornare",
  "passeremo": "passare", "comprese": "comprendere", "porte": "porta",
  "comunità": "comunita", "rigidità": "rigidita", "sollevò": "sollevare",
  "annotate": "annotare", "dovrebbe": "dovere", "regolo": "regolare",
  "guardandolo": "guardare", "esatta": "esatto", "prendessi": "prendere",
  "pretendessi": "pretendere", "dell'albero": "albero", "estratta": "estrarre",
  "bevve": "bere", "delicata": "delicato", "ricca": "ricco", "porse": "porgere",
  "assaggiate": "assaggiare", "ditemi": "dire", "voglia": "volere", "privi": "privo",
  "accompagnato": "accompagnare", "strumenti": "strumento", "piegarle": "piegare",
  "lavata": "lavare", "piogge": "pioggia", "tornavano": "tornare", "aperte": "aperto",
  "nate": "nascere", "ceramiche": "ceramica", "forme": "forma", "spiccavano": "spiccare",
  "servendo": "servire", "proponeva": "proporre", "profili": "profilo", "fermavano": "fermare",
  "vicine": "vicino", "sorseggiando": "sorseggiare", "chiacchierando": "chiacchierare",
  "avvertiva": "avvertire", "valorizzava": "valorizzare", "vide": "vedere",
  "sorridevano": "sorridevere", "sorridevano": "sorridere", "calmi": "calmo",
  "salutarlo": "salutare", "felicissimo": "felice", "trovarci": "trovare",
  "calme": "calmo", "scaldasse": "scaldare", "desiderano": "desiderare",
  "finivano": "finire", "ridevano": "ridere", "attirando": "attirare",
  "ospitava": "ospitare", "provenienza": "provenienza", "festeggiare": "festeggiare",
  "dell'iniziativa": "iniziativa", "scena": "scena", "difendere": "difendere",
  "alzò": "alzare", "lesse": "leggere", "consiglia": "consigliare", "sussulto": "sussulto",
  "caratteristiche": "caratteristica", "prendendo": "prendere", "regione": "regione",
  "sidamo": "sidamo", "acidità": "acidita", "agrumata": "agrumato", "prolungato": "prolungato",
  "ascoltò": "ascoltare", "promise": "promettere", "cerchi": "cerchio", "uniformi": "uniforme",
  "tentazione": "tentazione", "dedizione": "dedizione", "nascoste": "nascondere",
  "resistente": "resistere", "modellate": "modellare", "schermo": "schermo",
  "circondata": "circondare", "stampati": "stampare", "annotazioni": "annotazione",
  "rosse": "rosso", "dizionari": "dizionario", "lingua": "lingua", "francese": "francese",
  "concentrato": "concentrato", "esterne": "esterno", "d'olivo": "olivo",
  "traducendo": "tradurre", "brevemente": "breve", "ringraziamento": "ringraziamento",
  "frazione": "frazione", "nessun": "nessuno", "insegnargli": "insegnare",
  "nell'esigere": "esigere", "saper": "sapere", "rispettando": "rispettare",
  "priorità": "priorita", "silenziosamente": "silenziosamente", "atteggiamento": "atteggiamento",
  "rinnovato": "rinnovare", "ritmico": "ritmico", "udiva": "udire",
  "linguistiche": "linguistico", "file": "file", "tolse": "togliere",
  "appoggiandole": "appoggiare", "equilibrato": "equilibrato", "pace": "pace",
  "colpa": "colpa", "traduzione": "traduzione", "perfezione": "perfezione",
  "necessari": "necessario", "altissima": "alto", "cupping": "cupping",
  "purificata": "purificare", "novantatré": "novantatre", "gradi": "grado",
  "centigradi": "centigrado", "rigorosi": "rigoroso", "dorso": "dorso",
  "schiuma": "schiuma", "aspirò": "aspirare", "analizzando": "analizzare",
  "aggrottata": "aggrottare", "l'acidità": "acidita", "velocemente": "veloce",
  "esterna": "esterno", "legata": "legare", "imperfezioni": "imperfezione",
  "continuò": "continuare", "venature": "venatura", "soffia": "soffiare",
  "sud": "sud", "rimanga": "rimanere", "spaccate": "spaccare", "rovinate": "rovinare",
  "deviazione": "deviazione", "sviluppato": "sviluppare", "novantuno": "novantuno",
  "aggressiva": "aggressivo", "rotonde": "rotondo", "grana": "grana",
  "impostò": "impostare", "ridotta": "ridurre", "distinti": "distinto",
  "controllati": "controllato", "concedendo": "concedere", "versamento": "versamento",
  "quarantacinque": "quarantacinque", "mutato": "mutare", "l'asprezza": "asprezza",
  "create": "creare", "socchiusi": "socchiudere", "straordinario": "straordinario",
  "integrata": "integrato", "nascosta": "nascondere", "profondo": "profondo",
  "isolato": "isolato", "interpretando": "interpretare", "armonia": "armonia",
  "polvere": "polvere", "argilla": "argilla", "fumante": "fumare",
  "scoperta": "scoperta", "combattere": "combattere", "guida": "guida",
  "approvazione": "approvazione", "costringi": "costringere", "chiacchierare": "chiacchierare",
  "sfide": "sfida", "rispettivi": "rispettivo", "stima": "stima",
  "reciproca": "reciproco", "raccolse": "raccogliere", "guatemalteco": "guatemalteco",
  "speciali": "speciale", "ripuliva": "ripulire", "riponeva": "riporre",
  "saggezza": "saggezza", "paziente": "paziente", "occasione": "occasione",
  "preziosa": "prezioso", "crescita": "crescita", "confronto": "confronto",
  "maestria": "maestria", "stavano": "stare", "brevissimo": "breve",
  "quell'invasione": "invasione", "volti": "volto", "riconoscenti": "riconoscente",
  "formule": "formula", "vulnerabilità": "vulnerabilita", "puliti": "pulito",
  "cotone": "cotone", "cappotti": "cappotto", "giacche": "giacca",
  "rassicurante": "rassicurante", "sorridente": "sorridere", "presenti": "presente",
  "sedere": "sedere", "spostò": "spostare", "liberare": "liberare",
  "andò": "andare", "accomodare": "accomodare", "gentilezza": "gentilezza",
  "sfregava": "sfregare", "intirizzite": "intirizzito", "capienti": "capiente",
  "fuoco": "fuoco", "tisana": "tisana", "fresco": "fresco", "biologica": "biologico",
  "disponibili": "disponibile", "vassoi": "vassoio", "profumato": "profumato",
  "cordiale": "cordiale", "all'interno": "interno", "tremavano": "tremare",
  "accettarono": "accettare", "spinto": "spingere", "comune": "comune",
  "continuava": "continuare", "violenza": "violenza", "sanpietrini": "sanpietrino",
  "azzurri": "azzurro", "improvvisi": "improvviso", "trasformazione": "trasformazione",
  "miracolosa": "miracoloso", "spontanea": "spontaneo", "diffidenza": "diffidenza",
  "sconosciuti": "sconosciuto", "tepore": "tepore", "condiviso": "condiviso",
  "raccontare": "raccontare", "allagato": "allagare", "rise": "ridere",
  "peruviano": "peruviano", "lima": "lima", "viaggi": "viaggio",
  "parigi": "parigi", "piovosi": "piovoso", "allargarglisi": "allargare",
  "petto": "petto", "incertezze": "incertezza", "paure": "paura",
  "logistici": "logistico", "contemporanea": "contemporaneo", "rifugio": "rifugio",
  "civico": "civico", "porto": "porto", "fragilità": "fragilita",
  "umana": "umano", "ascolto": "ascolto", "dimostrare": "dimostrare",
  "placarsi": "placare", "gradualmente": "gradualmente", "strappate": "strappare",
  "comparve": "comparire", "socchiusa": "socchiudere", "inconfondibile": "inconfondibile",
  "lavato": "lavare", "prepararsi": "preparare", "asciutti": "asciutto",
  "rilassati": "rilassato", "spontaneamente": "spontaneamente", "offerta": "offerta",
  "generosa": "generoso", "ricambiare": "ricambiare", "calda": "caldo",
  "ricevuta": "ricevere", "dimenticheremo": "dimenticare", "stringendo": "stringere",
  "lampioni": "lampione", "serali": "serale", "tranquilla": "tranquillo",
  "leggerezza": "leggerezza", "lucida": "lucido", "scelta": "scelta",
  "proteggersi": "proteggere", "fortezza": "fortezza", "inespugnabile": "inespugnabile",
  "abbracciando": "abbracciare", "disinteressata": "disinteressato",
  "fondamento": "fondamento", "solido": "solido", "duraturo": "duraturo",
  "tempi": "tempo", "grana": "grana", "grossa": "grosso", "matematicamente": "matematicamente",
  "rossi": "rosso", "netti": "netto", "frustrato": "frustrato", "buttò": "buttare",
  "densità": "densita", "decimali": "decimale", "scatola": "scatola",
  "metallo": "metallo", "avvicinata": "avvicinare", "rabbocco": "rabbocco",
  "muscoli": "muscolo", "cifre": "cifra", "controllare": "controllare",
  "manda": "mandare", "cerato": "cerato", "sgabelli": "sgabello",
  "accade": "accadere", "fenomeno": "fenomeno", "sorprendentemente": "sorprendentemente",
  "simile": "simile", "significasse": "significare", "sinonimo": "sinonimo",
  "verificare": "verificare", "producesse": "produrre", "soffocato": "soffocare",
  "scosse": "scuotere", "risata": "risata", "intervenne": "intervenire",
  "battendo": "battere", "robusta": "robusto", "elettrica": "elettrico",
  "eliminare": "eliminare", "variazioni": "variazione", "cromatiche": "cromatico",
  "distruggerei": "distruggere", "resistito": "resistere", "allineate": "allineare",
  "severità": "severita", "inflessibile": "inflessibile", "difettosa": "difettoso",
  "estremamente": "estremamente", "tratteneva": "trattenere", "prugna": "prugna",
  "amarezza": "amarezza", "bruciata": "bruciare", "sfumature": "sfumatura",
  "espressive": "espressivo", "riflettevano": "riflettere", "fedelmente": "fedelmente",
  "presunta": "presunto", "mandato": "mandare", "crisi": "crisi",
  "percepibile": "percepibile", "imposto": "imporre", "favore": "favore",
  "totale": "totale", "sincerità": "sincerita", "serenità": "serenita",
  "confermò": "confermare", "vigore": "vigore", "capo": "capo",
  "spero": "sperare", "continui": "continuare", "scoppiò": "scoppiare",
  "costruito": "costruire", "tracciò": "tracciare", "allegro": "allegro",
  "scrivendo": "scrivere", "ottima": "ottimo", "toccare": "toccare",
  "indispensabile": "indispensabile", "evitare": "evitare", "sciolti": "sciolto",
  "contrazione": "contrazione", "intaglio": "intaglio", "lino": "lino",
  "volontà": "volonta", "umiltà": "umilta", "accogliere": "accogliere",
  "punto": "punto", "vista": "vista", "circonda": "circondare",
  "imparando": "imparare", "realtà": "realta", "organizzato": "organizzare",
  "inaugurare": "inaugurare", "stagione": "stagione", "ringraziare": "ringraziare",
  "disposto": "disporre", "ordine": "ordine", "serie": "serie",
  "tonalità": "tonalita", "terrose": "terroso", "blu": "blu",
  "lucide": "lucido", "geometriche": "geometrico", "essenziali": "essenziale",
  "levigati": "levigare", "legnoso": "legnoso", "progettate": "progettare",
  "graficamente": "graficamente", "stampate": "stampare", "sicurezza": "sicurezza",
  "lente": "lento", "continue": "continuo", "assaggi": "assaggio",
  "fuggire": "fuggire", "gremito": "gremire", "frequentavano": "frequentare",
  "velluto": "velluto", "creativo": "creativo", "funzionamento": "funzionamento",
  "gruppo": "gruppo", "curiosi": "curioso", "ricercatrice": "ricercatore",
  "universitaria": "universitario", "terreno": "terreno", "dava": "dare",
  "visiva": "visivo", "ingresso": "ingresso", "calzata": "calzare",
  "rientrava": "rientrare", "sosta": "sosta", "autobus": "autobus",
  "tram": "tram", "fermo": "fermo", "vaso": "vaso", "incrociarono": "incrociare",
  "mento": "mento", "inequivocabile": "inequivocabile", "asciutto": "asciutto",
  "corso": "corso", "fermata": "fermata", "vino": "vino", "bianco": "bianco",
  "unione": "unione", "talenti": "talento", "infinitamente": "infinitamente",
  "posando": "posare", "riferimento": "riferimento", "percorso": "percorso",
  "gradino": "gradino", "strofinacci": "strofinaccio", "significato": "significato",
  "ripensò": "ripensare", "tirocinio": "tirocinio", "capitale": "capitale",
  "fidarsi": "fidare", "competenze": "competenza", "altrui": "altrui",
  "tweed": "tweed", "cinque": "cinque", "sette": "sette", "diciotto": "diciotto",
  "ventiquattro": "ventiquattro", "ventisette": "ventisette", "panisperna": "panisperna",
  "pietralba": "pietralba", "castelli": "castelli", "romani": "romano",
  "delizioso": "delizioso", "sgradevole": "sgradevole", "plastica": "plastica",
  "preda": "preda", "imbarazzato": "imbarazzato", "narrazione": "narrazione",
  "correggere": "correggere", "cancellò": "cancellare", "secche": "secco",
  "sistemando": "sistemare", "fecero": "fare", "trasformò": "trasformare",
  "stringeva": "stringere", "riempì": "riempire", "colavano": "colare",
  "dallo": "da", "pura": "puro", "reagì": "reagire", "portò": "portare",
  "riscaldarvi": "riscaldare", "accomodatevi": "accomodare", "sospirando": "sospirare",
  "mise": "mettere", "diffuse": "diffondere", "annunciò": "annunciare",
  "spiegando": "spiegare", "distribuì": "distribuire", "pressò": "pressare",
  "applicando": "applicare", "emise": "emettere", "attirata": "attirare",
  "riempiva": "riempire", "festeggiando": "festeggiare", "appoggiandosi": "appoggiare",
  "festeggiamo": "festeggiare", "nemico": "nemico", "adatti": "adattare",
  "mestieri": "mestiere", "clima": "clima", "nasceva": "nascere",
  "guardò": "guardare", "appoggiò": "appoggiare", "scelse": "scegliere",
  "indossò": "indossare", "chiara": "chiara", "bruni": "bruno",
  "presentavano": "presentare", "attese": "attendere", "aspirando": "aspirare",
  "residua": "residuo", "nebulizzarlo": "nebulizzare", "diagnosticò": "diagnosticare",
  "complessi": "complesso", "aspetterebbe": "aspettare", "annuendo": "annuire",
  "mostrarsi": "mostrare", "volevamo": "volere", "matematica": "matematico",
  "lavorata": "lavorare", "perdersi": "perdere", "muovono": "muovere",
  "pretende": "pretendere", "ritrova": "ritrovare", "tavole": "tavola",
  "valorizzarla": "valorizzare", "aprirono": "aprire", "parametri": "parametro",
  "getti": "getto", "servì": "servire", "assaporando": "assaporare",
  "commentò": "commentare", "morbida": "morbido", "esisteva": "esistere",
  "creata": "creare", "astratti": "astratto", "immutabili": "immutabile",
  "l'abilità": "abilita", "dialogare": "dialogare", "impolverate": "impolverare",
  "meraviglioso": "meraviglioso", "natura": "natura", "gentilezza": "gentilezza",
  "gelo": "gelo", "stupore": "stupore", "terra": "terra", "ospite": "ospite"
};

for (const [k, v] of Object.entries(masterMap)) {
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
      const matched = dict.get(rest);
      if (matched && coreSet.has(matched)) return matched;
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
