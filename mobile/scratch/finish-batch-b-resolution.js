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
const addBases = [
  { lemmaId: 'cancellare', italian: 'cancellare', english: 'to erase / cancel', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['cancellare', 'cancella', 'cancellava', 'cancellò', 'cancellato'] },
  { lemmaId: 'sistemare', italian: 'sistemare', english: 'to arrange / put in order', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['sistemare', 'sistema', 'sistemava', 'sistemando', 'sistemato'] },
  { lemmaId: 'trasformare', italian: 'trasformare', english: 'to transform', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['trasformare', 'trasforma', 'trasformava', 'trasformò', 'trasformato'] },
  { lemmaId: 'stringere', italian: 'stringere', english: 'to grip / clutch / shake hand', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['stringere', 'stringe', 'stringeva', 'stringendo', 'stretto'] },
  { lemmaId: 'riempire', italian: 'riempire', english: 'to fill', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['riempire', 'riempie', 'riempiva', 'riempì', 'riempito'] },
  { lemmaId: 'colare', italian: 'colare', english: 'to drip / trickle / flow', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 63, inflections: ['colare', 'cola', 'colava', 'colavano', 'colato'] },
  { lemmaId: 'puro', italian: 'puro', english: 'pure', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['puro', 'pura', 'puri', 'pure'] },
  { lemmaId: 'reagire', italian: 'reagire', english: 'to react', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['reagire', 'reagisce', 'reagiva', 'reagì', 'reagito'] },
  { lemmaId: 'portare', italian: 'portare', english: 'to bring / carry', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['portare', 'porta', 'portava', 'portò', 'portato'] },
  { lemmaId: 'sospirare', italian: 'sospirare', english: 'to sigh', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['sospirare', 'sospira', 'sospirava', 'sospirando', 'sospirato'] },
  { lemmaId: 'mettere', italian: 'mettere', english: 'to put / place', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['mettere', 'mette', 'metteva', 'mise', 'messo'] },
  { lemmaId: 'diffondere', italian: 'diffondere', english: 'to spread / diffuse', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['diffondere', 'diffonde', 'diffondeva', 'diffuse', 'diffuso'] },
  { lemmaId: 'annunciare', italian: 'annunciare', english: 'to announce', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['annunciare', 'annuncia', 'annunciava', 'annunciò', 'annunciato'] },
  { lemmaId: 'contare', italian: 'contare', english: 'to count / matter', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['contare', 'conta', 'contava', 'contato'] },
  { lemmaId: 'spiegare', italian: 'spiegare', english: 'to explain', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['spiegare', 'spiega', 'spiegava', 'spiegando', 'spiegato'] },
  { lemmaId: 'scoprire', italian: 'scoprire', english: 'to discover', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['scoprire', 'scopre', 'scopriva', 'scoprendo', 'scoperto'] },
  { lemmaId: 'fragile', italian: 'fragile', english: 'fragile', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 63, inflections: ['fragile', 'fragili'] },
  { lemmaId: 'imprevedibile', italian: 'imprevedibile', english: 'unpredictable', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 63, inflections: ['imprevedibile', 'imprevedibili'] },
  { lemmaId: 'distribuire', italian: 'distribuire', english: 'to distribute / dispense', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['distribuire', 'distribuisce', 'distribuiva', 'distribuì', 'distribuito'] },
  { lemmaId: 'pressare', italian: 'pressare', english: 'to tamp / press', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 64, inflections: ['pressare', 'pressa', 'pressava', 'pressò', 'pressato'] },
  { lemmaId: 'applicare', italian: 'applicare', english: 'to apply', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 64, inflections: ['applicare', 'applica', 'applicava', 'applicando', 'applicato'] },
  { lemmaId: 'emettere', italian: 'emettere', english: 'to emit / utter / let out', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 64, inflections: ['emettere', 'emette', 'emetteva', 'emise', 'emesso'] },
  { lemmaId: 'attirare', italian: 'attirare', english: 'to attract / draw', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['attirare', 'attira', 'attirava', 'attirando', 'attirata', 'attirato'] },
  { lemmaId: 'ospitare', italian: 'ospitare', english: 'to host / accommodate', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['ospitare', 'ospita', 'ospitava', 'ospitato'] },
  { lemmaId: 'festeggiare', italian: 'festeggiare', english: 'to celebrate', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['festeggiare', 'festeggia', 'festeggiava', 'festeggiando', 'festeggiamo', 'festeggiato'] },
  { lemmaId: 'iniziativa', italian: 'iniziativa', english: 'initiative', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 65, inflections: ['iniziativa', 'iniziative'] },
  { lemmaId: 'scena', italian: 'scena', english: 'scene', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 65, inflections: ['scena', 'scene'] },
  { lemmaId: 'nemico', italian: 'nemico', english: 'enemy', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 62, inflections: ['nemico', 'nemici'] },
  { lemmaId: 'mancanza', italian: 'mancanza', english: 'lack', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 62, inflections: ['mancanza'] }
];

for (const entry of addBases) {
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

const finalManualMap = {
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
  "frazione": "frazione", "comprese": "comprendere", "nessun": "nessuno",
  "insegnargli": "insegnare", "nell'esigere": "esigere", "saper": "sapere",
  "rispettando": "rispettare", "priorità": "priorita", "silenziosamente": "silenziosamente",
  "atteggiamento": "atteggiamento", "rinnovato": "rinnovare", "ritmico": "ritmico",
  "udiva": "udire", "linguistiche": "linguistico", "file": "file", "tolse": "togliere",
  "appoggiandole": "appoggiare", "equilibrato": "equilibrato", "pace": "pace",
  "diventata": "diventare", "colpa": "colpa", "traduzione": "traduzione",
  "perfezione": "perfezione", "provenienza": "provenienza", "necessari": "necessario",
  "altissima": "alto", "cupping": "cupping", "purificata": "purificare",
  "novantatré": "novantatre", "gradi": "grado", "centigradi": "centigrado",
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
  "sedere": "sedere", "spostò": "spostare", "liberare": "liberare", "andò": "andare",
  "aiutandola": "aiutare", "facendola": "fare", "accomodare": "accomodare",
  "gentilezza": "gentilezza", "sfregava": "sfregare", "intirizzite": "intirizzito",
  "capienti": "capiente", "fuoco": "fuoco", "tisana": "tisana", "fresco": "fresco",
  "biologica": "biologico", "disponibili": "disponibile", "vassoi": "vassoio",
  "profumato": "profumato", "cordiale": "cordiale", "all'interno": "interno",
  "tremavano": "tremare", "accettarono": "accettare", "spinto": "spingere",
  "comune": "comune", "continuava": "continuare", "violenza": "violenza",
  "sanpietrini": "sanpietrino", "azzurri": "azzurro", "improvvisi": "improvviso",
  "trasformazione": "trasformazione", "miracolosa": "miracoloso", "spontanea": "spontaneo",
  "diffidenza": "diffidenza", "sconosciuti": "sconosciuto", "tepore": "tepore",
  "condiviso": "condiviso", "raccontare": "raccontare", "allagato": "allagare",
  "rise": "ridere", "peruviano": "peruviano", "lima": "lima", "viaggi": "viaggio",
  "parigi": "parigi", "piovosi": "piovoso", "allargarglisi": "allargare",
  "petto": "petto", "incertezze": "incertezza", "paure": "paura", "logistici": "logistico",
  "contemporanea": "contemporaneo", "rifugio": "rifugio", "civico": "civico",
  "porto": "porto", "fragilità": "fragilita", "umana": "umano", "ascolto": "ascolto",
  "dimostrare": "dimostrare", "placarsi": "placare", "gradualmente": "gradualmente",
  "ridusse": "ridurre", "strappate": "strappare", "comparve": "comparire",
  "socchiusa": "socchiudere", "inconfondibile": "inconfondibile", "lavato": "lavare",
  "prepararsi": "preparare", "asciutti": "asciutto", "rilassati": "rilassato",
  "spontaneamente": "spontaneamente", "offerta": "offerta", "generosa": "generoso",
  "ricambiare": "ricambiare", "calda": "caldo", "ricevuta": "ricevere",
  "dimenticheremo": "dimenticare", "stringendo": "stringere", "passeremo": "passare",
  "lampioni": "lampione", "serali": "serale", "tranquilla": "tranquillo",
  "armonia": "armonia", "leggerezza": "leggerezza", "lucida": "lucido",
  "scelta": "scelta", "proteggersi": "proteggere", "fortezza": "fortezza",
  "inespugnabile": "inespugnabile", "abbracciando": "abbracciare",
  "disinteressata": "disinteressato", "fondamento": "fondamento", "solido": "solido",
  "duraturo": "duraturo", "tempi": "tempo", "grana": "grana", "grossa": "grosso",
  "matematicamente": "matematicamente", "rossi": "rosso", "netti": "netto",
  "frustrato": "frustrato", "buttò": "buttare", "densità": "densita",
  "decimali": "decimale", "scatola": "scatola", "metallo": "metallo",
  "avvicinata": "avvicinare", "rabbocco": "rabbocco", "muscoli": "muscolo",
  "cifre": "cifra", "controllare": "controllare", "manda": "mandare",
  "cerato": "cerato", "sgabelli": "sgabello", "accade": "accadere",
  "fenomeno": "fenomeno", "sorprendentemente": "sorprendentemente", "simile": "simile",
  "significasse": "significare", "sinonimo": "sinonimo", "verificare": "verificare",
  "producesse": "produrre", "soffocato": "soffocare", "scosse": "scuotere",
  "risata": "risata", "intervenne": "intervenire", "battendo": "battere",
  "robusta": "robusto", "elettrica": "elettrico", "eliminare": "eliminare",
  "variazioni": "variazione", "cromatiche": "cromatico", "distruggerei": "distruggere",
  "resistito": "resistere", "allineate": "allineare", "severità": "severita",
  "inflessibile": "inflessibile", "difettosa": "difettoso", "estremamente": "estremamente",
  "tratteneva": "trattenere", "prugna": "prugna", "amarezza": "amarezza",
  "bruciata": "bruciare", "sfumature": "sfumatura", "espressive": "espressivo",
  "riflettevano": "riflettere", "fedelmente": "fedelmente", "presunta": "presunto",
  "mandato": "mandare", "crisi": "crisi", "percepibile": "percepibile",
  "imposto": "imporre", "favore": "favore", "totale": "totale", "sincerità": "sincerita",
  "serenità": "serenita", "confermò": "confermare", "vigore": "vigore",
  "capo": "capo", "spero": "sperare", "continui": "continuare", "scoppiò": "scoppiare",
  "costruito": "costruire", "tracciò": "tracciare", "allegro": "allegro",
  "scrivendo": "scrivere", "ottima": "ottimo", "toccare": "toccare",
  "indispensabile": "indispensabile", "evitare": "evitare", "sciolti": "sciolto",
  "contrazione": "contrazione", "intaglio": "intaglio", "lino": "lino",
  "piegarle": "piegare", "volontà": "volonta", "umiltà": "umilta",
  "accogliere": "accogliere", "punto": "punto", "vista": "vista",
  "circonda": "circondare", "imparando": "imparare", "realtà": "realta",
  "porte": "porta", "aperte": "aperto", "informale": "informale",
  "organizzato": "organizzare", "inaugurare": "inaugurare", "stagione": "stagione",
  "ringraziare": "ringraziare", "disposto": "disporre", "ordine": "ordine",
  "serie": "serie", "tonalità": "tonalita", "terrose": "terroso",
  "blu": "blu", "ceramiche": "ceramica", "lucide": "lucido",
  "geometriche": "geometrico", "essenziali": "essenziale", "levigati": "levigare",
  "legnoso": "legnoso", "progettate": "progettare", "graficamente": "graficamente",
  "stampate": "stampare", "sicurezza": "sicurezza", "lente": "lento",
  "continue": "continuo", "assaggi": "assaggio", "fuggire": "fuggire",
  "gremito": "gremire", "frequentavano": "frequentare", "velluto": "velluto",
  "creativo": "creativo", "funzionamento": "funzionamento", "gruppo": "gruppo",
  "curiosi": "curioso", "ricercatrice": "ricercatore", "universitaria": "universitario",
  "terreno": "terreno", "dava": "dare", "visiva": "visivo", "ingresso": "ingresso",
  "calzata": "calzare", "rientrava": "rientrare", "sosta": "sosta",
  "autobus": "autobus", "tram": "tram", "fermo": "fermo", "vaso": "vaso",
  "incrociarono": "incrociare", "mento": "mento", "inequivocabile": "inequivocabile",
  "asciutto": "asciutto", "corso": "corso", "fermata": "fermata",
  "vino": "vino", "bianco": "bianco", "unione": "unione", "talenti": "talento",
  "infinitamente": "infinitamente", "posando": "posare", "riferimento": "riferimento",
  "percorso": "percorso", "gradino": "gradino", "strofinacci": "strofinaccio",
  "significato": "significato", "ripensò": "ripensare", "tirocinio": "tirocinio",
  "capitale": "capitale", "fidarsi": "fidare", "competenze": "competenza",
  "altrui": "altrui", "tweed": "tweed", "cinque": "cinque", "sette": "sette",
  "diciotto": "diciotto", "ventiquattro": "ventiquattro", "ventisette": "ventisette",
  "annotate": "annotare", "dovrebbe": "dovere", "guardandolo": "guardare",
  "esatta": "esatto", "pretendessi": "pretendere", "estratta": "estrarre",
  "bevve": "bere", "delicata": "delicato", "ricca": "ricco", "natura": "natura",
  "porse": "porgere", "assaggiate": "assaggiare", "ditemi": "dire",
  "riempie": "riempire", "voglia": "volere", "privi": "privo",
  "accompagnato": "accompagnare", "strumenti": "strumento", "lavata": "lavare",
  "piogge": "pioggia", "attirando": "attirare", "tornavano": "tornare",
  "ospitava": "ospitare", "nate": "nascere", "olivo": "olivo", "forme": "forma",
  "spiccavano": "spiccare", "servendo": "servire", "proponeva": "proporre",
  "profili": "profilo", "fermavano": "fermare", "entusiaste": "entusiasta",
  "vicine": "vicino", "comodamente": "comodamente", "sorseggiando": "sorseggiare",
  "chiacchierando": "chiacchierare", "boschetto": "boschetto", "avvertiva": "avvertire",
  "valorizzava": "valorizzare", "venezia": "venezia", "vide": "vedere",
  "sorridevano": "sorridere", "calmi": "calmo", "salutarlo": "salutare",
  "buonasera": "buonasera", "felicissimo": "felice", "trovarci": "trovare",
  "colma": "colmo", "calme": "calmo", "scaldasse": "scaldare", "desiderano": "desiderare",
  "segreto": "segreto", "festeggiare": "festeggiare", "finivano": "finire",
  "ridevano": "ridere", "sistemava": "sistemare", "scena": "scena",
  "disperatamente": "disperatamente", "difendere": "difendere",
  "dimostrazione": "dimostrazione", "comunità": "comunita", "sollevò": "sollevare",
  "regolo": "regolare", "panisperna": "panisperna", "pietralba": "pietralba",
  "castelli": "castelli", "romani": "romano", "delizioso": "delizioso",
  "sgradevole": "sgradevole", "plastica": "plastica", "preda": "preda",
  "imbarazzato": "imbarazzato", "narrazione": "narrazione", "correggere": "correggere",
  "cancellò": "cancellare", "secche": "secco", "sistemando": "sistemare",
  "fecero": "fare", "trasformò": "trasformare", "stringeva": "stringere",
  "riempì": "riempire", "colavano": "colare", "dallo": "da", "pura": "puro",
  "reagì": "reagire", "portò": "portare", "riscaldarvi": "riscaldare",
  "accomodatevi": "accomodare", "sospirando": "sospirare", "perse": "perdere",
  "caldissimo": "caldo", "corposa": "corposo", "aromatiche": "aromatico",
  "mise": "mettere", "diffuse": "diffondere", "disponendole": "disporre",
  "riprendervi": "riprendere", "gelo": "gelo", "annunciò": "annunciare",
  "trovasse": "trovare", "stupore": "stupore", "contava": "contare",
  "prendersi": "prendere", "neri": "nero", "trasformazione": "trasformazione",
  "spiegando": "spiegare", "pioveva": "piovere", "intervenendo": "intervenire",
  "condividendo": "condividere", "inverni": "inverno", "nato": "nascere",
  "personali": "personale", "dover": "dovere", "terra": "terra",
  "rimettendosi": "rimettere", "volle": "volere", "torneremo": "tornare",
  "ospite": "ospite", "imprevedibile": "imprevedibile", "fragile": "fragile",
  "scoprendo": "scoprire", "distribuì": "distribuire", "pressò": "pressare",
  "applicando": "applicare", "emise": "emettere", "rigidità": "rigidita",
  "prendessi": "prendere", "dell'albero": "albero", "ricca": "ricco",
  "natura": "natura", "meraviglioso": "meraviglioso", "attirata": "attirare",
  "riempiva": "riempire", "festeggiando": "festeggiare", "appoggiandosi": "appoggiare",
  "festeggiamo": "festeggiare", "nemico": "nemico", "adatti": "adattare",
  "mestieri": "mestiere", "clima": "clima", "nasceva": "nascere",
  "guardò": "guardare", "appoggiò": "appoggiare", "scelse": "scegliere",
  "indossò": "indossare", "chiara": "chiara"
};

for (const [k, v] of Object.entries(finalManualMap)) {
  dict.set(k.toLowerCase(), v);
}

function resolveToken(surface) {
  const lower = surface.toLowerCase();
  let lem = dict.get(lower);
  if (lem) return lem;

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
      if (matched) return matched;
    }
  }

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
