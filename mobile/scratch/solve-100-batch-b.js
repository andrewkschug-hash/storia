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

// Harvest core dictionary
const coreSet = new Set(core.lexicon.map((e) => e.lemmaId));
const empirical = new Map();

for (const e of core.lexicon) {
  empirical.set(e.lemmaId.toLowerCase(), e.lemmaId);
  empirical.set(e.italian.toLowerCase(), e.lemmaId);
  if (e.inflections) {
    for (const inf of e.inflections) {
      empirical.set(inf.toLowerCase(), e.lemmaId);
    }
  }
}

// Harvest all previous chapters 1-60
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
              empirical.set(surface, lem);
            }
          }
        }
      }
    }
  }
}

console.log('Harvested dictionary size:', empirical.size);

// Batch B comprehensive surface-to-lemma dictionary
const batchBMap = {
  // Verbs
  "filtrava": "filtrare", "disegnando": "disegnare", "scaldando": "scaldare",
  "riordinando": "riordinare", "pulendo": "pulire", "avvolta": "avvolgere",
  "rivolse": "rivolgere", "dirigersi": "dirigere", "scelse": "scegliere",
  "situata": "situare", "incontrava": "incontrare", "appoggiò": "appoggiare",
  "appoggiandole": "appoggiare", "collegò": "collegare", "indossò": "indossare",
  "osservò": "osservare", "ammirando": "ammirare", "alzò": "alzare", "avvicinò": "avvicinare",
  "lesse": "leggere", "consiglia": "consigliare", "ebbe": "avere", "mostrare": "mostrare",
  "tostati": "tostare", "tostata": "tostare", "coltivato": "coltivare", "appesantisce": "appesantire",
  "ascoltò": "ascoltare", "annuendo": "annuire", "perdersi": "perdere", "sembra": "sembrare",
  "glielo": "glielo", "porto": "portare", "mettendosi": "mettere", "pesò": "pesare",
  "macinò": "macinare", "sciacquò": "sciacquare", "versava": "versare", "versò": "versare",
  "sentiva": "sentire", "sentì": "sentire", "comprendesse": "comprendere", "comprese": "comprendere",
  "desiderava": "desiderare", "attraversò": "attraversare", "correvano": "correre",
  "ammetteva": "ammettere", "illustrare": "illustrare", "notò": "notare",
  "sollevò": "sollevare", "interrompere": "interrompere", "esigere": "esigere",
  "intromettersi": "intromettersi", "tornò": "tornare", "riprendendo": "riprendere",
  "udiva": "udire", "sorseggiava": "sorseggiare", "sorseggiando": "sorseggiare",
  "accompagnasse": "accompagnare", "terminò": "terminare", "rileggere": "rileggere",
  "allungò": "allungare", "sciogliere": "sciogliere", "accumulata": "accumulare",
  "trovato": "trovare", "occupi": "occupare", "mette": "mettere", "tornerò": "tornare",
  "ringraziò": "ringraziare", "salutò": "salutare", "usciva": "uscire", "completato": "completare",
  "riponendo": "riporre", "risiedeva": "risiedere", "potesse": "potere", "spazzava": "spazzare",
  "portando": "portare", "legato": "legare", "brillava": "brillare", "guardò": "guardare",
  "sciogliendo": "sciogliere", "mostravano": "mostrare", "presentavano": "presentare",
  "annusando": "annusare", "sprigionava": "sprigionare", "lottare": "lottare",
  "provocata": "provocare", "posizionando": "posizionare", "attese": "attendere",
  "formava": "formare", "aspirando": "aspirare", "nebulizzarlo": "nebulizzare",
  "rimase": "rimanere", "analizzando": "analizzare", "diagnosticò": "diagnosticare",
  "penetrato": "penetrare", "caramellati": "caramellare", "aspetterebbe": "aspettare",
  "assaggiò": "assaggiare", "mostrarsi": "mostrare", "volevamo": "volere",
  "interrompere": "interrompere", "bruciare": "bruciare", "abbiamo": "avere",
  "ottenuto": "ottenere", "risponde": "rispondere", "lavorata": "lavorare",
  "affrontava": "affrontare", "soffia": "soffiare", "dilatano": "dilatare",
  "muovono": "muovere", "pretende": "pretendere", "ritrova": "ritrovare",
  "ascoltare": "ascoltare", "valorizzarla": "valorizzare", "aprirono": "aprire",
  "vissuto": "vivere", "adattare": "adattare", "propose": "proporre",
  "accendendo": "accendere", "abbassare": "abbassare", "attenuare": "attenuare",
  "prolungare": "prolungare", "regolò": "regolare", "aumentare": "aumentare",
  "impostò": "impostare", "ridotta": "ridurre", "concedendo": "concedere",
  "alzava": "alzare", "mutato": "mutare", "servì": "servire", "porse": "porgere",
  "bevve": "bere", "assaporando": "assaporare", "commentò": "commentare",
  "integrata": "integrare", "nascosta": "nascondere", "esisteva": "esistere",
  "creata": "creare", "uscì": "uscire", "festeggiando": "festeggiare",
  "costringi": "costringere", "aspetti": "aspettare", "adatti": "adattare",
  "chiacchierare": "chiacchierare", "condividendo": "condividere", "raccolse": "raccogliere",
  "lasciò": "lasciare", "ripuliva": "ripulire", "riponeva": "riporre",
  "nasceva": "nascere", "dominare": "dominare", "trasformando": "trasformare",
  "oscurò": "oscurare", "tingendosi": "tingere", "cancellò": "cancellare",
  "scese": "scendere", "preannunciando": "preannunciare", "sistemando": "sistemare",
  "fecero": "fare", "vibrare": "vibrare", "scatenò": "scatenare", "trasformò": "trasformare",
  "stringeva": "stringere", "cercava": "cercare", "proteggere": "proteggere",
  "riempì": "riempire", "colavano": "colare", "dominato": "dominare",
  "riaffiorare": "riaffiorare", "mostrare": "mostrare", "reagì": "reagire",
  "corse": "correre", "portò": "portare", "appendere": "appendere",
  "prendete": "prendere", "accomodatevi": "accomodare", "smette": "smettere",
  "piovere": "piovere", "spostò": "spostare", "liberare": "liberare",
  "andò": "andare", "aiutandola": "aiutare", "facendola": "fare",
  "sfregava": "sfregare", "accese": "accendere", "preparò": "preparare",
  "usando": "usare", "diffuse": "diffondere", "scacciando": "scacciare",
  "disponendole": "disporre", "bevete": "bere", "annunciò": "annunciare",
  "passava": "passare", "offrendo": "offrire", "trovasse": "trovare",
  "tremavano": "tremare", "accettarono": "accettare", "contava": "contare",
  "prendersi": "prendere", "spinto": "spingere", "continuava": "continuare",
  "martellare": "martellare", "illuminavano": "illuminare", "avvenne": "avvenire",
  "separa": "separare", "sciolse": "sciogliere", "raccontare": "raccontare",
  "allagato": "allagare", "rise": "ridere", "poveva": "piovere", "pioveva": "piovere",
  "cadere": "cadere", "ascoltava": "ascoltare", "intervenendo": "intervenire",
  "allargarglisi": "allargare", "placarsi": "placare", "ridusse": "ridurre",
  "comparve": "comparire", "rimettendosi": "rimettere", "volle": "volere",
  "ricambiare": "ricambiare", "ricevuta": "ricevere", "dimenticheremo": "dimenticare",
  "stringendo": "stringere", "passeremo": "passare", "uscì": "uscire",
  "rischiarata": "rischiarare", "godeva": "godere", "immerso": "immergere",
  "durata": "durare", "previsti": "prevedere", "allentò": "allentare",
  "spostando": "spostare", "premette": "premere", "distribuì": "distribuire",
  "pressò": "pressare", "applicando": "applicare", "avviò": "avviare",
  "fissando": "fissare", "emise": "emettere", "buttò": "buttare",
  "imprigionare": "imprigionare", "avvicinata": "avvicinare", "notando": "notare",
  "giustificò": "giustificare", "controllare": "controllare", "manda": "mandare",
  "sedette": "sedere", "accade": "accadere", "significasse": "significare",
  "passavo": "passare", "verificare": "verificare", "soffocato": "soffocare",
  "intagliato": "intagliare", "scosse": "scuotere", "intervenne": "intervenire",
  "battendo": "battere", "prendessi": "prendere", "eliminare": "eliminare",
  "distruggerei": "distruggere", "resistito": "resistere", "bollato": "bollare",
  "tratteneva": "trattenere", "riflettevano": "riflettere", "mandato": "mandare",
  "imposto": "imporre", "sbagliare": "sbagliare", "ditemi": "dire",
  "pensate": "pensare", "riempie": "riempire", "venire": "venire",
  "confermò": "confermare", "continui": "continuare", "scoppiò": "scoppiare",
  "ridere": "ridere", "crollare": "crollare", "costruito": "costruire",
  "tracciò": "tracciare", "scrivendo": "scrivere", "toccare": "toccare",
  "accompagnato": "accompagnare", "mostrare": "mostrare", "ripuliva": "ripulire",
  "piegarle": "piegare", "accogliere": "accogliere", "circonda": "circondare",
  "imparando": "imparare", "far": "fare", "respirare": "respirare",
  "arrostite": "arrostire", "brillavano": "brillare", "spiccava": "spiccare",
  "attirando": "attirare", "tornavano": "tornare", "ospitava": "ospitare",
  "organizzato": "organizzare", "inaugurare": "inaugurare", "ringraziare": "ringraziare",
  "disposto": "disporre", "sfumavano": "sfumare", "modellata": "modellare",
  "fornito": "fornire", "intagliati": "intagliare", "levigati": "levigare",
  "sprigionava": "sprigionare", "spiccavano": "spiccare", "progettate": "progettare",
  "stampate": "stampare", "raccontava": "raccontare", "muoveva": "muovere",
  "servendo": "servire", "proponeva": "proporre", "tostato": "tostare",
  "fermavano": "fermare", "toccare": "toccare", "ascoltare": "ascoltare",
  "era": "essere", "gremito": "gremire", "frequentavano": "frequentare",
  "lavoravano": "lavorare", "mostrava": "mostrare", "spiegava": "spiegare",
  "avvertiva": "avvertire", "valorizzava": "valorizzare", "risaltavano": "risaltare",
  "dava": "dare", "suonò": "suonare", "comparve": "comparire",
  "calzata": "calzare", "rientrava": "rientrare", "deciso": "decidere",
  "prendere": "prendere", "incrociarono": "incrociare", "sollevò": "sollevare",
  "avvicinò": "avvicinare", "sia": "essere", "passato": "passare",
  "trovarci": "trovare", "conosceva": "conoscere", "aperto": "aprire",
  "vendere": "vendere", "creato": "creare", "desiderano": "desiderare",
  "rimanere": "rimanere", "parlare": "parlare", "appartenere": "appartenere",
  "durare": "durare", "avviò": "avviare", "brindando": "brindare",
  "festeggiare": "festeggiare", "dimostrato": "dimostrare", "posando": "posare",
  "aggiunse": "aggiungere", "siamo": "essere", "finivano": "finire",
  "riordinare": "riordinare", "respirare": "respirare", "voltò": "voltare",
  "ridevano": "ridere", "asciugando": "asciugare", "sistemava": "sistemare",
  "appariva": "apparire", "ripensò": "ripensare", "cercava": "cercare",
  "difendere": "difendere", "imparato": "imparare", "fidarsi": "fidare",
  "aprire": "aprire", "illuminava": "illuminare", "rifletteva": "riflettere",

  // Nouns / Adjectives / Others
  "ondata": "ondata", "rettangoli": "rettangolo", "dorati": "dorato",
  "cotto": "cotto", "doccetta": "doccetta", "cuoio": "cuoio",
  "tracolla": "tracolla", "cenno": "cenno", "cordiale": "cordiale",
  "discreto": "discreto", "riparata": "riparato", "cavo": "cavo",
  "alimentazione": "alimentazione", "esitazione": "esitazione", "curiosita": "curiosita",
  "naturalezza": "naturalezza", "possesso": "possesso", "sussulto": "sussulto",
  "entusiasmo": "entusiasmo", "ambrato": "ambrato", "duemila": "duemila",
  "metri": "metro", "produttori": "produttore", "gelsomino": "gelsomino",
  "bergamotto": "bergamotto", "corpo": "corpo", "prolungato": "prolungato",
  "sobrio": "sobrio", "convenevoli": "convenevole", "superflui": "superfluo",
  "consegna": "consegna", "silenzio": "silenzio", "assoluto": "assoluto",
  "bilancia": "bilancia", "digitale": "digitale", "granulometria": "granulometria",
  "cellulosa": "cellulosa", "cigno": "cigno", "cerchi": "cerchio",
  "concentrici": "concentrico", "percolazione": "percolazione", "felpati": "felpato",
  "dizionari": "dizionario", "francese": "francese", "tastiera": "tastiera",
  "distrazioni": "distrazione", "sottobicchiere": "sottobicchiere", "frazione": "frazione",
  "labbra": "labbro", "filo": "filo", "pensiero": "pensiero",
  "manuale": "manuale", "caffetteria": "caffetteria", "costante": "costante",
  "quiete": "quiete", "retro": "retro", "ticchettio": "ticchettio",
  "tasti": "tasto", "scelte": "scelta", "linguistiche": "linguistico",
  "spiegazioni": "spiegazione", "verbali": "verbale", "pagina": "pagina",
  "sollievo": "sollievo", "file": "file", "braccia": "braccio",
  "tensione": "tensione", "spalle": "spalla", "piatti": "piatto",
  "disteso": "disteso", "consumazione": "consumazione", "eccellente": "eccellente",
  "pace": "pace", "rarissima": "raro", "colpa": "colpa",
  "musica": "musica", "assordante": "assordante", "volume": "volume",
  "impegno": "impegno", "provenienza": "provenienza", "canapa": "canapa",
  "resina": "resina", "complice": "complice", "nodo": "nodo",
  "corda": "corda", "lotto": "lotto", "torrefazione": "torrefazione",
  "manciata": "manciata", "bruni": "bruno", "piattino": "piattino",
  "esteriore": "esteriore", "solco": "solco", "sviluppo": "sviluppo",
  "omogeneo": "omogeneo", "fragranza": "fragranza", "secca": "secco",
  "mandorla": "mandorla", "punta": "punta", "aspra": "aspro",
  "mela": "mela", "notte": "notte", "brasiliana": "brasiliano",
  "ciotole": "ciotola", "argento": "argento", "purificata": "purificare",
  "gradi": "grado", "orlo": "orlo", "crosta": "crosta",
  "dorso": "dorso", "schiuma": "schiuma", "residua": "residuo",
  "liquido": "liquido", "palato": "palato", "secondi": "secondo",
  "struttura": "struttura", "sensoriale": "sensoriale", "fronte": "fronte",
  "acidita": "acidita", "pronunciata": "pronunciare", "tagliente": "tagliente",
  "tostatrice": "tostatrice", "zuccheri": "zucchero", "complessi": "complesso",
  "fondente": "fondente", "giudizio": "giudizio", "critico": "critico",
  "previsto": "prevedere", "formula": "formula", "matematica": "matematico",
  "mutevole": "mutevole", "ambiente": "ambiente", "recriminazioni": "recriminazione",
  "venature": "venatura", "scirocco": "scirocco", "assi": "asse",
  "noce": "noce", "quercia": "quercia", "tavole": "tavola",
  "giunture": "giuntura", "limite": "limite", "prospettiva": "prospettiva",
  "deviazione": "deviazione", "parametri": "parametro", "dolci": "dolce",
  "grana": "grana", "fine": "fine", "letto": "letto",
  "getti": "getto", "versamento": "versamento", "asprezza": "asprezza",
  "albicocca": "albicocca", "matura": "maturo", "pane": "pane",
  "socchiusi": "socchiuso", "straordinario": "straordinario", "liberazione": "liberazione",
  "astratti": "astratto", "immutabili": "immutabile", "abilita": "abilita",
  "contingente": "contingente", "clima": "clima", "armonia": "armonia",
  "impolverate": "impolverare", "meraviglioso": "meraviglioso", "vincoli": "vincolo",
  "guida": "guida", "sfide": "sfida", "stima": "stima",
  "meta": "meta", "speciali": "speciale", "saggezza": "saggezza",
  "occasione": "occasione", "cielo": "cielo", "piombo": "piombo",
  "cupo": "cupo", "minaccioso": "minaccioso", "vento": "vento",
  "impetuoso": "impetuoso", "colli": "colle", "foglie": "foglia",
  "secche": "secco", "tuoni": "tuono", "sordi": "sordo",
  "diluvio": "diluvio", "torrenziale": "torrenziale", "incessante": "incessante",
  "lastricato": "lastricato", "torrente": "torrente", "spumeggiante": "spumeggiare",
  "bufera": "bufera", "fradici": "fradicio", "fattorini": "fattorino",
  "bicicletta": "bicicletta", "mantelle": "mantella", "gocciolanti": "gocciolare",
  "residenti": "residente", "buste": "busta", "spesa": "spesa",
  "affannosamente": "affannosamente", "infreddolite": "infreddolito", "gocce": "goccia",
  "vociare": "vociare", "scroscio": "scroscio", "fragoroso": "fragoroso",
  "riflesso": "riflesso", "invasione": "invasione", "caos": "caos",
  "volti": "volto", "stanchi": "stanco", "riconoscenti": "riconoscente",
  "pura": "puro", "semplice": "semplice", "vulnerabilita": "vulnerabilita",
  "retrobottega": "retrobottega", "cesta": "cesta", "canovacci": "canovaccio",
  "stendino": "stendino", "giacche": "giacca", "inzuppate": "inzuppare",
  "teli": "telo", "gentilezza": "gentilezza", "intirizzite": "intirizzito",
  "miscela": "miscela", "corposa": "corposo", "latte": "latte",
  "brocca": "brocca", "speziata": "speziare", "cannella": "cannella",
  "zenzero": "zenzero", "scorze": "scorza", "fresco": "fresco",
  "odore": "odore", "acre": "acre", "fumanti": "fumare",
  "stupore": "stupore", "scontrini": "scontrino", "tempesta": "tempesta",
  "sanpietrini": "sanpietrino", "lampi": "lampo", "azzurri": "azzurro",
  "trasformazione": "trasformazione", "miracolosa": "miracoloso", "spontanea": "spontaneo",
  "diffidenza": "diffidenza", "sconosciuti": "sconosciuto", "metropoli": "metropoli",
  "tepore": "tepore", "seminterrati": "seminterrato", "peruviano": "peruviano",
  "aneddoti": "aneddoto", "viaggi": "viaggio", "inverni": "inverno",
  "piovosi": "piovoso", "emozione": "emozione", "dubbi": "dubbio",
  "logistici": "logistico", "civico": "civico", "porto": "porto",
  "sicuro": "sicuro", "fragilita": "fragilita", "umana": "umano",
  "furia": "furia", "nuvole": "nuvola", "strappate": "strappare",
  "ponente": "ponente", "lembo": "lembo", "indaco": "indaco",
  "arancio": "arancio", "socchiusa": "socchiudere", "pulita": "pulito",
  "terra": "terra", "mance": "mancia", "ospitalita": "ospitalita",
  "ospite": "ospite", "leggerezza": "leggerezza", "fortezza": "fortezza",
  "inespugnabile": "inespugnabile", "generosita": "generosita", "operoso": "operoso",
  "terso": "terso", "febbrile": "febbrile", "ossessiva": "ossessivo",
  "numerate": "numerare", "cronometro": "cronometro", "display": "display",
  "fitta": "fitto", "calcoli": "calcolo", "percentuali": "percentuale",
  "teorica": "teorico", "minuscola": "minuscolo", "discrepanza": "discrepanza",
  "temporale": "temporale", "inaccettabile": "inaccettabile", "chiave": "chiave",
  "brugola": "brugola", "movimenti": "movimento", "nervosi": "nervoso",
  "ghiera": "ghiera", "micrometrica": "micrometrico", "tacca": "tacca",
  "decimi": "decimo", "millimetro": "millimetro", "pulsante": "pulsante",
  "centesimo": "centesimo", "ago": "ago", "forza": "forza",
  "tentativo": "tentativo", "rughe": "ruga", "pastiglia": "pastiglia",
  "esausta": "esausto", "battifiltro": "battifiltro", "colpo": "colpo",
  "secco": "secco", "penna": "penna", "riga": "riga",
  "densita": "densita", "esasperazione": "esasperazione", "scatola": "scatola",
  "ironica": "ironico", "rabbocco": "rabbocco", "rigidita": "rigidita",
  "muscoli": "muscolo", "frenesia": "frenesia", "analitica": "analitico",
  "costante": "costante", "grammatura": "grammatura", "indulgenza": "indulgenza",
  "sgabelli": "sgabello", "letteraria": "letterario", "fenomeno": "fenomeno",
  "sorprendentemente": "sorprendentemente", "corrispondenza": "corrispondenza", "lessicale": "lessicale",
  "sinonimo": "sinonimo", "virgola": "virgola", "artificioso": "artificioso",
  "ostinata": "ostinato", "olivo": "olivo", "ondulate": "ondulato",
  "irregolari": "irregolare", "risata": "risata", "bonaria": "bonario",
  "robusta": "robusto", "pialla": "pialla", "elettrica": "elettrico",
  "plastica": "plastica", "gelo": "gelo", "sole": "sole",
  "cinquant'anni": "cinquanta", "cinquanta": "cinquanta", "difettosa": "difettoso",
  "inadeguata": "inadeguato", "avvolgente": "avvolgente", "prugna": "prugna",
  "cacao": "cacao", "amarezza": "amarezza", "bruciata": "bruciare",
  "sfumature": "sfumatura", "espressive": "espressivo", "scostamento": "scostamento",
  "astratto": "astratto", "favore": "favore", "capo": "capo",
  "gabbia": "gabbia", "invisibile": "invisibile", "prestazione": "prestazione",
  "cerchio": "cerchio", "grossolani": "grossolano", "tirannia": "tirannia",
  "cieca": "cieco", "sciolti": "sciolto", "contrazione": "contrazione",
  "intaglio": "intaglio", "pacificati": "pacificato", "volonta": "volonta",
  "frizzante": "frizzante", "caldarroste": "caldarroste", "festosa": "festoso",
  "chiaroscuro": "chiaroscuro", "evento": "evento", "informale": "informale",
  "stagione": "stagione", "creazioni": "creazione", "gres": "gres",
  "tonalita": "tonalita", "terrose": "terroso", "salvia": "salvia",
  "blu": "blu", "sottotazza": "sottotazza", "essenziali": "essenziale",
  "cera": "cera", "d'api": "ape", "legnoso": "legnoso",
  "postazione": "postazione", "cartoncino": "cartoncino", "ruvido": "ruvido",
  "impaginazione": "impaginazione", "intervenuti": "intervenuto", "gremito": "gremito",
  "poltrona": "poltrona", "velluto": "velluto", "amabilmente": "amabilmente",
  "studio": "studio", "creativo": "creativo", "funzionamento": "funzionamento",
  "tipografiche": "tipografico", "etichette": "etichetta", "forzatura": "forzatura",
  "finzione": "finzione", "promozionale": "promozionale", "contagiosa": "contagioso",
  "terreno": "terreno", "rintocco": "rintocco", "coppola": "coppola",
  "commissione": "commissione", "sosta": "sosta", "fermo": "fermo",
  "dettaglio": "dettaglio", "mento": "mento", "solenne": "solenne",
  "inequivocabile": "inequivocabile", "tono": "tono", "asciutto": "asciutto",
  "stanza": "stanza", "corso": "corso", "fermata": "fermata",
  "tram": "tram", "commozione": "commozione", "orgoglio": "orgoglio",
  "splendida": "splendido", "calice": "calice", "vino": "vino",
  "talenti": "talento", "solitudine": "solitudine", "radioso": "radioso",
  "percorso": "percorso", "gradino": "gradino", "distaccato": "distaccato",
  "nitida": "nitido", "solida": "solido", "significato": "significato",
  "isola": "isola", "certezze": "certezza", "ponte": "ponte",
  "comunita": "comunita", "umana": "umano", "chiara": "chiara",
  "etiopia": "etiopia", "sidamo": "sidamo", "guatemala": "guatemala",
  "bourbon": "bourbon", "orvieto": "orvieto", "parigi": "parigi",
  "lima": "lima", "peruviano": "peruviano", "venezia": "venezia",
  "castelli": "castelli", "romani": "romano", "pietralba": "pietralba",
  "boschetto": "boschetto", "panisperna": "panisperna"
};

for (const [k, v] of Object.entries(batchBMap)) {
  empirical.set(k.toLowerCase(), v);
}

// Function to align and verify a chapter
function alignBatchBChapter(filePath, chNum) {
  const ch = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let missing = [];

  for (const para of ch.paragraphs) {
    for (const s of para.sentences) {
      const tokens = tokenizeItalian(s.text);
      s.lemmas = tokens.map((t) => {
        const lower = t.surface.toLowerCase();
        let lem = empirical.get(lower);
        if (!lem) {
          if (lower.startsWith("l'") || lower.startsWith("l’")) lem = empirical.get(lower.slice(2));
          else if (lower.startsWith("un'") || lower.startsWith("un’")) lem = empirical.get(lower.slice(3));
          else if (lower.startsWith("d'") || lower.startsWith("d’")) lem = empirical.get(lower.slice(2));
          else if (lower.startsWith("dell'") || lower.startsWith("dell’")) lem = empirical.get(lower.slice(5));
          else if (lower.startsWith("all'") || lower.startsWith("all’")) lem = empirical.get(lower.slice(4));
          else if (lower.startsWith("dall'") || lower.startsWith("dall’")) lem = empirical.get(lower.slice(5));
          else if (lower.startsWith("nell'") || lower.startsWith("nell’")) lem = empirical.get(lower.slice(5));
          else if (lower.startsWith("sull'") || lower.startsWith("sull’")) lem = empirical.get(lower.slice(5));
        }
        if (!lem) lem = lower;
        if (!coreSet.has(lem)) {
          missing.push({ surface: t.surface, lemma: lem, sentence: s.id });
        }
        return lem;
      });
    }
  }

  console.log(`Chapter ${chNum} missing tokens:`, missing.length);
  if (missing.length > 0) {
    console.log(`Sample missing in ${chNum}:`, missing.slice(0, 15));
  } else {
    console.log(`🎉 Chapter ${chNum}: 100% PERFECT 0 MISSING!`);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
  return missing;
}

for (let i = 61; i <= 65; i++) {
  alignBatchBChapter(`./content/stories/luca-a-roma/chapters/chapter-${i}.json`, i);
}
