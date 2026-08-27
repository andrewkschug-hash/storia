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

// Harvest all historical mappings from chapters 1-60
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

// Add exhaustive surface mappings for Batch B
const batchBOverrides = {
  // Chapter 61
  "disegnando": "disegnare", "scaldando": "scaldare", "pulendo": "pulire", "avvolta": "avvolgere",
  "rivolse": "rivolgere", "dirigersi": "dirigere", "scelse": "scegliere", "indossò": "indossare",
  "nere": "nero", "ammirando": "ammirare", "consiglia": "consigliare", "ebbe": "avere",
  "mostrare": "mostrare", "tostati": "tostare", "coltivato": "coltivare", "appesantisce": "appesantire",
  "annuendo": "annuire", "perdersi": "perdere", "sembra": "sembrare", "glielo": "glielo",
  "porto": "portare", "mettendosi": "mettere", "pesò": "pesare", "macinò": "macinare",
  "sciacquò": "sciacquare", "versava": "versare", "sentiva": "sentire", "comprendesse": "comprendere",
  "desiderava": "desiderare", "attraversò": "attraversare", "correvano": "correre", "ammetteva": "ammettere",
  "illustrare": "illustrare", "notò": "notare", "sollevò": "sollevare", "interrompere": "interrompere",
  "esigere": "esigere", "intromettersi": "intromettersi", "tornò": "tornare", "riprendendo": "riprendere",
  "udiva": "udire", "sorseggiava": "sorseggiare", "accompagnasse": "accompagnare", "terminò": "terminare",
  "rileggere": "rileggere", "allungò": "allungare", "sciogliere": "sciogliere", "accumulata": "accumulare",
  "occupi": "occupare", "mette": "mettere", "tornerò": "tornare", "ringraziò": "ringraziare",
  "salutò": "salutare", "usciva": "uscire", "completato": "completare", "riponendo": "riporre",
  "risiedeva": "risiedere", "potesse": "potere", "rettangoli": "rettangolo", "cuoio": "cuoio",
  "tracolla": "tracolla", "cenno": "cenno", "cordiale": "cordiale", "discreto": "discreto",
  "cavo": "cavo", "alimentazione": "alimentazione", "esitazione": "esitazione", "naturalezza": "naturalezza",
  "possesso": "possesso", "sussulto": "sussulto", "entusiasmo": "entusiasmo", "ambrato": "ambrato",
  "duemila": "duemila", "metri": "metro", "produttori": "produttore", "gelsomino": "gelsomino",
  "bergamotto": "bergamotto", "corpo": "corpo", "prolungato": "prolungato", "sobrio": "sobrio",
  "convenevoli": "convenevole", "superflui": "superfluo", "consegna": "consegna", "silenzio": "silenzio",
  "assoluto": "assoluto", "bilancia": "bilancia", "digitale": "digitale", "granulometria": "granulometria",
  "cellulosa": "cellulosa", "cigno": "cigno", "cerchi": "cerchio", "concentrici": "concentrico",
  "percolazione": "percolazione", "felpati": "felpato", "dizionari": "dizionario", "francese": "francese",
  "tastiera": "tastiera", "distrazioni": "distrazione", "sottobicchiere": "sottobicchiere", "frazione": "frazione",
  "labbra": "labbro", "filo": "filo", "pensiero": "pensiero", "manuale": "manuale", "caffetteria": "caffetteria",
  "costante": "costante", "quiete": "quiete", "retro": "retro", "ticchettio": "ticchettio", "tasti": "tasto",
  "scelte": "scelta", "linguistiche": "linguistico", "spiegazioni": "spiegazione", "verbali": "verbale",
  "pagina": "pagina", "sollievo": "sollievo", "file": "file", "braccia": "braccio", "tensione": "tensione",
  "spalle": "spalla", "piatti": "piatto", "disteso": "disteso", "consumazione": "consumazione",
  "eccellente": "eccellente", "pace": "pace", "rarissima": "raro", "colpa": "colpa", "musica": "musica",
  "assordante": "assordante", "volume": "volume", "impegno": "impegno", "provenienza": "provenienza",

  // Chapter 62
  "spazzava": "spazzare", "portando": "portare", "legato": "legare", "brillava": "brillare",
  "guardò": "guardare", "sciogliendo": "sciogliere", "versò": "versare", "mostravano": "mostrare",
  "presentavano": "presentare", "annusando": "annusare", "sprigionava": "sprigionare", "lottare": "lottare",
  "posizionando": "posizionare", "attese": "attendere", "formava": "formare", "aspirando": "aspirare",
  "nebulizzarlo": "nebulizzare", "rimase": "rimanere", "analizzando": "analizzare", "diagnosticò": "diagnosticare",
  "penetrato": "penetrare", "caramellati": "caramellare", "aspetterebbe": "aspettare", "assaggiò": "assaggiare",
  "mostrarsi": "mostrare", "volevamo": "volere", "interrompere": "interrompere", "bruciare": "bruciare",
  "abbiamo": "avere", "ottenuto": "ottenere", "risponde": "rispondere", "lavorata": "lavorare",
  "affrontava": "affrontare", "soffia": "soffiare", "dilatano": "dilatare", "muovono": "muovere",
  "pretende": "pretendere", "ritrova": "ritrovare", "ascoltare": "ascoltare", "valorizzarla": "valorizzare",
  "aprirono": "aprire", "vissuto": "vivere", "adattare": "adattare", "propose": "proporre",
  "accendendo": "accendere", "abbassare": "abbassare", "attenuare": "attenuare", "prolungare": "prolungare",
  "regolò": "regolare", "aumentare": "aumentare", "impostò": "impostare", "concedendo": "concedere",
  "alzava": "alzare", "mutato": "mutare", "servì": "servire", "porse": "porgere", "bevve": "bere",
  "assaporando": "assaporare", "commentò": "commentare", "integrata": "integrare", "nascosta": "nascondere",
  "esisteva": "esistere", "uscì": "uscire", "festeggiando": "festeggiare", "costringi": "costringere",
  "aspetti": "aspettare", "adatti": "adattare", "chiacchierare": "chiacchierare", "condividendo": "condividere",
  "raccolse": "raccogliere", "lasciò": "lasciare", "ripuliva": "ripulire", "riponeva": "riporre",
  "nasceva": "nascere", "dominare": "dominare", "trasformando": "trasformare", "canapa": "canapa",
  "resina": "resina", "complice": "complice", "nodo": "nodo", "corda": "corda", "lotto": "lotto",
  "torrefazione": "torrefazione", "manciata": "manciata", "bruni": "bruno", "piattino": "piattino",
  "esteriore": "esteriore", "solco": "solco", "sviluppo": "sviluppo", "omogeneo": "omogeneo",
  "fragranza": "fragranza", "secca": "secco", "mandorla": "mandorla", "punta": "punta", "aspra": "aspro",
  "mela": "mela", "notte": "notte", "brasiliana": "brasiliano", "ciotole": "ciotola", "argento": "argento",
  "purificata": "purificare", "gradi": "grado", "orlo": "orlo", "crosta": "crosta", "dorso": "dorso",
  "schiuma": "schiuma", "residua": "residuo", "liquido": "liquido", "palato": "palato", "secondi": "secondo",
  "struttura": "struttura", "sensoriale": "sensoriale", "fronte": "fronte", "acidita": "acidita",
  "acidità": "acidità", "pronunciata": "pronunciare", "tagliente": "tagliente", "tostatrice": "tostatrice",
  "zuccheri": "zucchero", "complessi": "complesso", "fondente": "fondente", "giudizio": "giudizio",
  "critico": "critico", "previsto": "prevedere", "formula": "formula", "matematica": "matematico",
  "mutevole": "mutevole", "ambiente": "ambiente", "recriminazioni": "recriminazione", "venature": "venatura",
  "scirocco": "scirocco", "assi": "asse", "noce": "noce", "quercia": "quercia", "tavole": "tavola",
  "giunture": "giuntura", "limite": "limite", "prospettiva": "prospettiva", "deviazione": "deviazione",
  "parametri": "parametro", "dolci": "dolce", "grana": "grana", "fine": "fine", "letto": "letto",
  "getti": "getto", "versamento": "versamento", "asprezza": "asprezza", "albicocca": "albicocca",
  "matura": "maturo", "pane": "pane", "socchiusi": "socchiuso", "straordinario": "straordinario",
  "liberazione": "liberazione", "astratti": "astratto", "immutabili": "immutabile", "abilita": "abilita",
  "abilità": "abilità", "contingente": "contingente", "clima": "clima", "armonia": "armonia",
  "impolverate": "impolverare", "meraviglioso": "meraviglioso", "vincoli": "vincolo", "guida": "guida",
  "sfide": "sfida", "stima": "stima", "meta": "meta", "metà": "metà", "speciali": "speciale",
  "saggezza": "saggezza", "occasione": "occasione", "cupping": "cupping", "novantatré": "novantatré",
  "centigradi": "centigrado", "novantuno": "novantuno", "quarantacinque": "quarantacinque",

  // Chapter 63
  "oscurò": "oscurare", "tingendosi": "tingere", "cancellò": "cancellare", "scese": "scendere",
  "preannunciando": "preannunciare", "sistemando": "sistemare", "fecero": "fare", "vibrare": "vibrare",
  "scatenò": "scatenare", "trasformò": "trasformare", "stringeva": "stringere", "cercava": "cercare",
  "proteggere": "proteggere", "riempì": "riempire", "colavano": "colare", "dominato": "dominare",
  "riaffiorare": "riaffiorare", "reagì": "reagire", "corse": "correre", "portò": "portare",
  "appendere": "appendere", "prendete": "prendere", "accomodatevi": "accomodare", "smette": "smettere",
  "piovere": "piovere", "spostò": "spostare", "liberare": "liberare", "andò": "andare",
  "aiutandola": "aiutare", "facendola": "fare", "sfregava": "sfregare", "accese": "accendere",
  "preparò": "preparare", "usando": "usare", "diffuse": "diffondere", "scacciando": "scacciare",
  "disponendole": "disporre", "bevete": "bere", "annunciò": "annunciare", "passava": "passare",
  "offrendo": "offrire", "trovasse": "trovare", "tremavano": "tremare", "accettarono": "accettare",
  "contava": "contare", "prendersi": "prendere", "spinto": "spingere", "continuava": "continuare",
  "martellare": "martellare", "illuminavano": "illuminare", "avvenne": "avvenire", "separa": "separare",
  "sciolse": "sciogliere", "raccontare": "raccontare", "allagato": "allagare", "rise": "ridere",
  "pioveva": "piovere", "cadere": "cadere", "ascoltava": "ascoltare", "intervenendo": "intervenire",
  "allargarglisi": "allargare", "placarsi": "placare", "ridusse": "ridurre", "comparve": "comparire",
  "rimettendosi": "rimettere", "volle": "volere", "ricambiare": "ricambiare", "ricevuta": "ricevere",
  "dimenticheremo": "dimenticare", "stringendo": "stringere", "passeremo": "passare", "cielo": "cielo",
  "piombo": "piombo", "cupo": "cupo", "minaccioso": "minaccioso", "vento": "vento", "impetuoso": "impetuoso",
  "colli": "colle", "foglie": "foglia", "secche": "secco", "tuoni": "tuono", "sordi": "sordo",
  "diluvio": "diluvio", "torrenziale": "torrenziale", "incessante": "incessante", "lastricato": "lastricato",
  "torrente": "torrente", "spumeggiante": "spumeggiare", "bufera": "bufera", "fradici": "fradicio",
  "fattorini": "fattorino", "bicicletta": "bicicletta", "mantelle": "mantella", "gocciolanti": "gocciolare",
  "residenti": "residente", "buste": "busta", "spesa": "spesa", "affannosamente": "affannosamente",
  "infreddolite": "infreddolito", "gocce": "goccia", "vociare": "vociare", "scroscio": "scroscio",
  "fragoroso": "fragoroso", "riflesso": "riflesso", "invasione": "invasione", "caos": "caos",
  "volti": "volto", "stanchi": "stanco", "riconoscenti": "riconoscente", "pura": "puro",
  "semplice": "semplice", "vulnerabilita": "vulnerabilita", "vulnerabilità": "vulnerabilità",
  "retrobottega": "retrobottega", "cesta": "cesta", "canovacci": "canovaccio", "stendino": "stendino",
  "giacche": "giacca", "inzuppate": "inzuppare", "teli": "telo", "gentilezza": "gentilezza",
  "intirizzite": "intirizzito", "miscela": "miscela", "corposa": "corposo", "latte": "latte",
  "brocca": "brocca", "speziata": "speziare", "cannella": "cannella", "zenzero": "zenzero",
  "scorze": "scorza", "fresco": "fresco", "odore": "odore", "acre": "acre", "fumanti": "fumare",
  "stupore": "stupore", "scontrini": "scontrino", "tempesta": "tempesta", "sanpietrini": "sanpietrino",
  "lampi": "lampo", "azzurri": "azzurro", "trasformazione": "trasformazione", "miracolosa": "miracoloso",
  "spontanea": "spontaneo", "diffidenza": "diffidenza", "sconosciuti": "sconosciuto", "metropoli": "metropoli",
  "tepore": "tepore", "seminterrati": "seminterrato", "peruviano": "peruviano", "aneddoti": "aneddoto",
  "viaggi": "viaggio", "inverni": "inverno", "piovosi": "piovoso", "emozione": "emozione",
  "dubbi": "dubbio", "logistici": "logistico", "civico": "civico", "porto": "porto", "sicuro": "sicuro",
  "fragilita": "fragilita", "fragilità": "fragilità", "umana": "umano", "furia": "furia",
  "nuvole": "nuvola", "strappate": "strappare", "ponente": "ponente", "lembo": "lembo",
  "indaco": "indaco", "arancio": "arancio", "socchiusa": "socchiudere", "pulita": "pulito",
  "terra": "terra", "mance": "mancia", "ospitalita": "ospitalita", "ospitalità": "ospitalità",
  "ospite": "ospite", "leggerezza": "leggerezza", "fortezza": "fortezza", "inespugnabile": "inespugnabile",
  "generosita": "generosita", "generosità": "generosità", "cinque": "cinque", "lima": "lima",
  "panisperna": "panisperna", "dallo": "da",

  // Chapter 64
  "rischiarato": "rischiarare", "godeva": "godere", "immerso": "immergere", "durata": "durare",
  "previsti": "prevedere", "allentò": "allentare", "spostando": "spostare", "premette": "premere",
  "distribuì": "distribuire", "pressò": "pressare", "applicando": "applicare", "avviò": "avviare",
  "fissando": "fissare", "emise": "emettere", "buttò": "buttare", "imprigionare": "imprigionare",
  "avvicinata": "avvicinare", "notando": "notare", "giustificò": "giustificare", "controllare": "controllare",
  "manda": "mandare", "sedette": "sedere", "accade": "accadere", "significasse": "significare",
  "passavo": "passare", "verificare": "verificare", "soffocato": "soffocare", "intagliato": "intagliare",
  "scosse": "scuotere", "intervenne": "intervenire", "battendo": "battere", "prendessi": "prendere",
  "eliminare": "eliminare", "distruggerei": "distruggere", "resistito": "resistere", "bollato": "bollare",
  "tratteneva": "trattenere", "riflettevano": "riflettere", "mandato": "mandare", "imposto": "imporre",
  "sbagliare": "sbagliare", "ditemi": "dire", "pensate": "pensare", "riempie": "riempire",
  "venire": "venire", "confermò": "confermare", "continui": "continuare", "scoppiò": "scoppiare",
  "ridere": "ridere", "crollare": "crollare", "costruito": "costruire", "tracciò": "tracciare",
  "scrivendo": "scrivere", "toccare": "toccare", "accompagnato": "accompagnare", "piegarle": "piegare",
  "accogliere": "accogliere", "circonda": "circondare", "imparando": "imparare", "respirare": "respirare",
  "operoso": "operoso", "terso": "terso", "febbrile": "febbrile", "ossessiva": "ossessivo",
  "numerate": "numerare", "cronometro": "cronometro", "display": "display", "fitta": "fitto",
  "calcoli": "calcolo", "percentuali": "percentuale", "teorica": "teorico", "minuscola": "minuscolo",
  "discrepanza": "discrepanza", "temporale": "temporale", "inaccettabile": "inaccettabile",
  "chiave": "chiave", "brugola": "brugola", "movimenti": "movimento", "nervosi": "nervoso",
  "ghiera": "ghiera", "micrometrica": "micrometrico", "tacca": "tacca", "decimi": "decimo",
  "millimetro": "millimetro", "pulsante": "pulsante", "centesimo": "centesimo", "ago": "ago",
  "forza": "forza", "tentativo": "tentativo", "rughe": "ruga", "pastiglia": "pastiglia",
  "esausta": "esausto", "battifiltro": "battifiltro", "colpo": "colpo", "secco": "secco",
  "penna": "penna", "riga": "riga", "densita": "densita", "densità": "densità",
  "esasperazione": "esasperazione", "scatola": "scatola", "ironica": "ironico", "rabbocco": "rabbocco",
  "rigidita": "rigidita", "rigidità": "rigidità", "muscoli": "muscolo", "frenesia": "frenesia",
  "analitica": "analitico", "costante": "costante", "grammatura": "grammatura", "indulgenza": "indulgenza",
  "sgabelli": "sgabello", "letteraria": "letterario", "fenomeno": "fenomeno", "sorprendentemente": "sorprendentemente",
  "corrispondenza": "corrispondenza", "lessicale": "lessicale", "sinonimo": "sinonimo", "virgola": "virgola",
  "artificioso": "artificioso", "ostinata": "ostinato", "olivo": "olivo", "ondulate": "ondulato",
  "irregolari": "irregolare", "risata": "risata", "bonaria": "bonario", "robusta": "robusto",
  "pialla": "pialla", "elettrica": "elettrico", "plastica": "plastica", "gelo": "gelo", "sole": "sole",
  "cinquanta": "cinquanta", "difettosa": "difettoso", "inadeguata": "inadeguato", "avvolgente": "avvolgente",
  "prugna": "prugna", "cacao": "cacao", "amarezza": "amarezza", "bruciata": "bruciare",
  "sfumature": "sfumatura", "espressive": "espressivo", "scostamento": "scostamento", "astratto": "astratto",
  "favore": "favore", "capo": "capo", "gabbia": "gabbia", "invisibile": "invisibile", "prestazione": "prestazione",
  "cerchio": "cerchio", "grossolani": "grossolano", "tirannia": "tirannia", "cieca": "cieco",
  "sciolti": "sciolto", "contrazione": "contrazione", "intaglio": "intaglio", "pacificati": "pacificato",
  "volonta": "volonta", "volontà": "volontà", "diciotto": "diciotto", "ventiquattro": "ventiquattro",

  // Chapter 65
  "arrostite": "arrostire", "brillavano": "brillare", "spiccava": "spiccare", "attirando": "attirare",
  "tornavano": "tornare", "ospitava": "ospitare", "organizzato": "organizzare", "inaugurare": "inaugurare",
  "ringraziare": "ringraziare", "disposto": "disporre", "sfumavano": "sfumare", "modellata": "modellare",
  "fornito": "fornire", "intagliati": "intagliare", "levigati": "levigare", "spiccavano": "spiccare",
  "progettate": "progettare", "stampate": "stampare", "raccontava": "raccontare", "muoveva": "muovere",
  "servendo": "servire", "proponeva": "proporre", "tostato": "tostare", "fermavano": "fermare",
  "gremito": "gremire", "frequentavano": "frequentare", "lavoravano": "lavorare", "mostrava": "mostrare",
  "spiegava": "spiegare", "avvertiva": "avvertire", "valorizzava": "valorizzare", "risaltavano": "risaltare",
  "dava": "dare", "suonò": "suonare", "calzata": "calzare", "rientrava": "rientrare", "deciso": "decidere",
  "incrociarono": "incrociare", "trovarci": "trovare", "conosceva": "conoscere", "aperto": "aprire",
  "vendere": "vendere", "creato": "creare", "desiderano": "desiderare", "rimanere": "rimanere",
  "parlare": "parlare", "appartenere": "appartenere", "durare": "durare", "avviò": "avviare",
  "brindando": "brindare", "festeggiare": "festeggiare", "dimostrato": "dimostrare", "posando": "posare",
  "aggiunse": "aggiungere", "finivano": "finire", "riordinare": "riordinare", "voltò": "voltare",
  "ridevano": "ridere", "asciugando": "asciugare", "sistemava": "sistemare", "appariva": "apparire",
  "ripensò": "ripensare", "difendere": "difendere", "imparato": "imparare", "fidarsi": "fidare",
  "illuminava": "illuminare", "rifletteva": "riflettere", "frizzante": "frizzante", "caldarroste": "caldarroste",
  "festosa": "festoso", "chiaroscuro": "chiaroscuro", "evento": "evento", "informale": "informale",
  "stagione": "stagione", "creazioni": "creazione", "gres": "gres", "tonalita": "tonalita",
  "tonalità": "tonalità", "terrose": "terroso", "salvia": "salvia", "blu": "blu",
  "sottotazza": "sottotazza", "essenziali": "essenziale", "cera": "cera", "legnoso": "legnoso",
  "postazione": "postazione", "cartoncino": "cartoncino", "ruvido": "ruvido", "impaginazione": "impaginazione",
  "intervenuti": "intervenuto", "poltrona": "poltrona", "velluto": "velluto", "amabilmente": "amabilmente",
  "studio": "studio", "creativo": "creativo", "funzionamento": "funzionamento", "tipografiche": "tipografico",
  "etichette": "etichetta", "forzatura": "forzatura", "finzione": "finzione", "promozionale": "promozionale",
  "contagiosa": "contagioso", "terreno": "terreno", "rintocco": "rintocco", "coppola": "coppola",
  "commissione": "commissione", "sosta": "sosta", "fermo": "fermo", "dettaglio": "dettaglio",
  "mento": "mento", "solenne": "solenne", "inequivocabile": "inequivocabile", "tono": "tono",
  "asciutto": "asciutto", "stanza": "stanza", "corso": "corso", "fermata": "fermata", "tram": "tram",
  "commozione": "commozione", "orgoglio": "orgoglio", "splendida": "splendido", "calice": "calice",
  "vino": "vino", "talenti": "talento", "solitudine": "solitudine", "radioso": "radioso",
  "percorso": "percorso", "gradino": "gradino", "distaccato": "distaccato", "nitida": "nitido",
  "solida": "solido", "significato": "significato", "isola": "isola", "certezze": "certezza",
  "ponte": "ponte", "comunita": "comunita", "comunità": "comunità", "umana": "umano", "chiara": "chiara",
  "boschetto": "boschetto", "venezia": "venezia", "castelli": "castelli", "romani": "romano",
  "pietralba": "pietralba", "sette": "sette"
};

for (const [k, v] of Object.entries(batchBOverrides)) {
  dict.set(k.toLowerCase(), v);
}

// Align chapters 61-65
let allMissing = [];
for (let i = 61; i <= 65; i++) {
  const filePath = `./content/stories/luca-a-roma/chapters/chapter-${i}.json`;
  const ch = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let missing = [];

  for (const para of ch.paragraphs) {
    for (const s of para.sentences) {
      const tokens = tokenizeItalian(s.text);
      s.lemmas = tokens.map((t) => {
        const lower = t.surface.toLowerCase();
        let lem = dict.get(lower);
        if (!lem) {
          if (lower.startsWith("l'") || lower.startsWith("l’")) lem = dict.get(lower.slice(2));
          else if (lower.startsWith("un'") || lower.startsWith("un’")) lem = dict.get(lower.slice(3));
          else if (lower.startsWith("d'") || lower.startsWith("d’")) lem = dict.get(lower.slice(2));
          else if (lower.startsWith("dell'") || lower.startsWith("dell’")) lem = dict.get(lower.slice(5));
          else if (lower.startsWith("all'") || lower.startsWith("all’")) lem = dict.get(lower.slice(4));
          else if (lower.startsWith("dall'") || lower.startsWith("dall’")) lem = dict.get(lower.slice(5));
          else if (lower.startsWith("nell'") || lower.startsWith("nell’")) lem = dict.get(lower.slice(5));
          else if (lower.startsWith("sull'") || lower.startsWith("sull’")) lem = dict.get(lower.slice(5));
        }
        if (!lem) lem = lower;
        if (!coreSet.has(lem)) {
          missing.push({ chapter: i, surface: t.surface, lemma: lem, sentence: s.id });
        }
        return lem;
      });
    }
  }

  console.log(`Chapter ${i} missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log(`Sample in ${i}:`, missing.slice(0, 10));
    allMissing = allMissing.concat(missing);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

console.log(`Total remaining missing: ${allMissing.length}`);
if (allMissing.length > 0) {
  const uniq = [...new Set(allMissing.map((m) => m.surface.toLowerCase()))];
  console.log('Unique missing surfaces:', uniq);
}
