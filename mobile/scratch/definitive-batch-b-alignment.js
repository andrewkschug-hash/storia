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

const explicitMapping = {
  "disegnando": "disegnare", "pulendo": "pulire", "avvolta": "avvolgere",
  "rivolse": "rivolgere", "dirigersi": "dirigere", "scelse": "scegliere",
  "indossò": "indossare", "nere": "nero", "ammirando": "ammirare",
  "ebbe": "avere", "prolungato": "prolungato", "mettendosi": "mettere",
  "sciacquò": "sciacquare", "versò": "versare", "attraversò": "attraversare",
  "dizionari": "dizionario", "correvano": "correre", "ammetteva": "ammettere",
  "notò": "notare", "riprendendo": "riprendere", "udiva": "udire",
  "verbali": "verbale", "allungò": "allungare", "accumulata": "accumulare",
  "gradi": "grado", "l'abilità": "abilita", "abilità": "abilita",
  "impolverate": "impolverare", "adatti": "adattare", "corposa": "corposo",
  "trasformazione": "trasformazione", "comunità": "comunita", "rigidità": "rigidita",
  "dell'albero": "albero", "aiutandola": "aiutare", "facendola": "fare",
  "perse": "perdere", "caldissimo": "caldo", "aromatiche": "aromatico",
  "disponendole": "disporre", "riprendervi": "riprendere", "trovasse": "trovare",
  "prendersi": "prendere", "neri": "nero", "pioveva": "piovere",
  "intervenendo": "intervenire", "condividendo": "condividere", "inverni": "inverno",
  "allargarglisi": "allargare", "nato": "nascere", "personali": "personale",
  "dover": "dovere", "ridusse": "ridurre", "diventata": "diventare",
  "rimettendosi": "rimettere", "volle": "volere", "torneremo": "tornare",
  "passeremo": "passare", "comprese": "comprendere", "porte": "porta",
  "sollevò": "sollevare", "annotate": "annotare", "dovrebbe": "dovere",
  "regolo": "regolare", "guardandolo": "guardare", "esatta": "esatto",
  "prendessi": "prendere", "pretendessi": "pretendere", "estratta": "estrarre",
  "bevve": "bere", "delicata": "delicato", "ricca": "ricco", "porse": "porgere",
  "assaggiate": "assaggiare", "ditemi": "dire", "voglia": "volere", "privi": "privo",
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
  "scena": "scena", "difendere": "difendere", "alzò": "alzare", "lesse": "leggere",
  "consiglia": "consigliare", "sussulto": "sussulto", "caratteristiche": "caratteristica",
  "prendendo": "prendere", "regione": "regione", "sidamo": "sidamo",
  "acidità": "acidita", "agrumata": "agrumato", "ascoltò": "ascoltare",
  "promise": "promettere", "cerchi": "cerchio", "uniformi": "uniforme",
  "tentazione": "tentazione", "dedizione": "dedizione", "nascoste": "nascondere",
  "resistente": "resistere", "modellate": "modellare", "schermo": "schermo",
  "circondata": "circondare", "stampati": "stampare", "annotazioni": "annotazione",
  "rosse": "rosso", "dizionari": "dizionario", "lingua": "lingua",
  "francese": "francese", "concentrato": "concentrato", "esterne": "esterno",
  "d'olivo": "olivo", "traducendo": "tradurre", "brevemente": "breve",
  "ringraziamento": "ringraziamento", "frazione": "frazione", "nessun": "nessuno",
  "insegnargli": "insegnare", "nell'esigere": "esigere", "saper": "sapere",
  "rispettando": "rispettare", "priorità": "priorita", "silenziosamente": "silenziosamente",
  "atteggiamento": "atteggiamento", "rinnovato": "rinnovare", "ritmico": "ritmico",
  "linguistiche": "linguistico", "file": "file", "tolse": "togliere",
  "appoggiandole": "appoggiare", "equilibrato": "equilibrato", "pace": "pace",
  "colpa": "colpa", "traduzione": "traduzione", "perfezione": "perfezione",
  "necessari": "necessario", "altissima": "alto", "cupping": "cupping",
  "purificata": "purificare", "novantatré": "novantatre", "centigradi": "centigrado",
  "rigorosi": "rigoroso", "dorso": "dorso", "schiuma": "schiuma", "aspirò": "aspirare",
  "analizzando": "analizzare", "aggrottata": "aggrottare", "l'acidità": "acidita",
  "velocemente": "veloce", "esterna": "esterno", "legata": "legare",
  "imperfezioni": "imperfezione", "continuò": "continuare", "venature": "venatura",
  "soffia": "soffiare", "sud": "sud", "rimanga": "rimanere", "spaccate": "spaccare",
  "rovinate": "rovinare", "deviazione": "deviazione", "sviluppato": "sviluppare",
  "novantuno": "novantuno", "aggressiva": "aggressivo", "rotonde": "rotondo",
  "grana": "grana", "impostò": "impostare", "ridotta": "ridurre",
  "distinti": "distinto", "controllati": "controllato", "concedendo": "concedere",
  "versamento": "versamento", "quarantacinque": "quarantacinque", "mutato": "mutare",
  "l'asprezza": "asprezza", "create": "creare", "socchiusi": "socchiudere",
  "straordinario": "straordinario", "integrata": "integrato", "nascosta": "nascondere",
  "profondo": "profondo", "isolato": "isolato", "interpretando": "interpretare",
  "armonia": "armonia", "polvere": "polvere", "argilla": "argilla",
  "fumante": "fumare", "scoperta": "scoperta", "combattere": "combattere",
  "guida": "guida", "approvazione": "approvazione", "costringi": "costringere",
  "chiacchierare": "chiacchierare", "sfide": "sfida", "rispettivi": "rispettivo",
  "stima": "stima", "reciproca": "reciproco", "raccolse": "raccogliere",
  "guatemalteco": "guatemalteco", "speciali": "speciale", "ripuliva": "ripulire",
  "riponeva": "riporre", "saggezza": "saggezza", "paziente": "paziente",
  "occasione": "occasione", "preziosa": "prezioso", "crescita": "crescita",
  "confronto": "confronto", "maestria": "maestria", "stavano": "stare",
  "brevissimo": "breve", "quell'invasione": "invasione", "volti": "volto",
  "riconoscenti": "riconoscente", "formule": "formula", "vulnerabilità": "vulnerabilita",
  "puliti": "pulito", "cotone": "cotone", "cappotti": "cappotto", "giacche": "giacca",
  "rassicurante": "rassicurante", "sorridente": "sorridere", "presenti": "presente",
  "sedere": "sedere", "spostò": "spostare", "liberare": "liberare",
  "andò": "andare", "accomodare": "accomodare", "gentilezza": "gentilezza",
  "sfregava": "sfregare", "intirizzite": "intirizzito", "capienti": "capiente",
  "fuoco": "fuoco", "tisana": "tisana", "fresco": "fresco", "biologica": "biologico",
  "disponibili": "disponibile", "vassoi": "vassoio", "profumato": "profumato",
  "cordiale": "cordiale", "all'interno": "interno", "tremavano": "tremare",
  "accettarono": "accettare", "spinto": "spingere", "comune": "comune",
  "continuava": "continuare", "violenza": "violenza", "sanpietrini": "sanpietrino",
  "azzurri": "azzurro", "improvvisi": "improvviso", "miracolosa": "miracoloso",
  "spontanea": "spontaneo", "diffidenza": "diffidenza", "sconosciuti": "sconosciuto",
  "tepore": "tepore", "condiviso": "condiviso", "raccontare": "raccontare",
  "allagato": "allagare", "rise": "ridere", "peruviano": "peruviano",
  "lima": "lima", "viaggi": "viaggio", "parigi": "parigi", "piovosi": "piovoso",
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
  "tempi": "tempo", "grossa": "grosso", "matematicamente": "matematicamente",
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

for (const [k, v] of Object.entries(explicitMapping)) {
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
