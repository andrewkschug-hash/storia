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

// Extra base lemmas to add
const extraLemmas = [
  { lemmaId: 'moda', italian: 'moda', english: 'fashion / trend', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['moda', 'mode'] },
  { lemmaId: 'moderno', italian: 'moderno', english: 'modern', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['moderno', 'moderna', 'moderni', 'moderne'] },
  { lemmaId: 'giudicare', italian: 'giudicare', english: 'to judge', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['giudicare', 'giudica', 'giudicava', 'giudicato'] },
  { lemmaId: 'intensita', italian: 'intensità', english: 'intensity', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['intensità', 'intensita'] },
  { lemmaId: 'largo', italian: 'largo', english: 'wide / broad', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['largo', 'larga', 'larghi', 'larghe'] },
  { lemmaId: 'scala', italian: 'scala', english: 'scale / stairs', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['scala', 'scale'] },
  { lemmaId: 'solidita', italian: 'solidità', english: 'solidity / strength', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['solidità', 'solidita'] },
  { lemmaId: 'graduale', italian: 'graduale', english: 'gradual', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['graduale', 'graduali'] },
  { lemmaId: 'sano', italian: 'sano', english: 'healthy / sound', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['sano', 'sana', 'sani', 'sane'] },
  { lemmaId: 'bravo', italian: 'bravo', english: 'good / skilled', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['bravo', 'brava', 'bravi', 'brave'] },
  { lemmaId: 'familiarita', italian: 'familiarità', english: 'familiarity', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['familiarità', 'familiarita'] },
  { lemmaId: 'fluire', italian: 'fluire', english: 'to flow', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['fluire', 'fluisce', 'fluiva', 'fluivano', 'fluito'] },
  { lemmaId: 'bruno', italian: 'bruno', english: 'dark brown / Bruno', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['bruno', 'bruna', 'bruni', 'brune'] },
  { lemmaId: 'necessita', italian: 'necessità', english: 'necessity / need', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['necessità', 'necessita'] },
  { lemmaId: 'difficolta', italian: 'difficoltà', english: 'difficulty', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['difficoltà', 'difficolta'] }
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

// Collect all unique missing surfaces across 66-70
const missingMap = new Map();

for (let i = 66; i <= 70; i++) {
  const filePath = `./content/stories/luca-a-roma/chapters/chapter-${i}.json`;
  const ch = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const para of ch.paragraphs) {
    for (const s of para.sentences) {
      const tokens = tokenizeItalian(s.text);
      for (const t of tokens) {
        let clean = t.surface.replace(/^[«"“”'‘]+|[»"“”'’]+$/gu, '').toLowerCase();
        if (clean === '') clean = t.surface.toLowerCase();
        let lem = dict.get(clean);
        if (!lem || !coreSet.has(lem)) {
          missingMap.set(clean, t.surface);
        }
      }
    }
  }
}

console.log(`Unique missing surfaces: ${missingMap.size}`);
console.log(Array.from(missingMap.keys()));

// Let's resolve each missing surface by heuristic or manual lookup
const autoRules = {
  "lasciavano": "lasciare", "decise": "decidere", "cancellata": "cancellare",
  "sostituita": "sostituire", "mondi": "mondo", "studiata": "studiare",
  "unito": "unire", "brasiliano": "brasiliano", "tostati": "tostare",
  "donare": "donare", "fondente": "fondente", "sentore": "sentore",
  "rinunciare": "rinunciare", "meticolosa": "meticoloso", "fine": "fine",
  "stretto": "stringere", "scaldato": "scaldare", "scaldò": "scaldare",
  "calmi": "calmo", "sicuri": "sicuro", "pensata": "pensare",
  "porgendogli": "porgere", "densa": "denso", "compatta": "compatto",
  "soffiato": "soffiare", "soffiava": "soffiare", "trattenne": "trattenere",
  "trattenuto": "trattenere", "segnato": "segnare", "sommesso": "sommesso",
  "tovagliolo": "tovagliolo", "inaspettato": "inaspettato", "illuminato": "illuminare",
  "chiari": "chiaro", "ammise": "ammettere", "distesa": "distendere",
  "lasciato": "lasciare", "convivenza": "convivenza", "armoniosa": "armonioso",
  "differenti": "differente", "leggevano": "leggere", "traducevano": "tradurre",
  "caraffe": "caraffa", "preparate": "preparare", "scambiavano": "scambiare",
  "sorseggiando": "sorseggiare", "separati": "separare", "distanza": "distanza",
  "ciotole": "ciotola", "uscite": "uscire", "scaffali": "scaffale",
  "gremita": "gremire", "affettuosa": "affettuoso", "notato": "notare",
  "cambiata": "cambiare", "smesso": "smettere", "preoccuparti": "preoccupare",
  "dimostrare": "dimostrare", "bravura": "bravura", "costi": "costo",
  "chiese": "chiedere", "bassa": "basso", "asciugava": "asciugare",
  "professore": "professore", "correggere": "correggere", "errori": "errore",
  "accogliente": "accogliente", "percepisce": "percepire", "annuito": "annuire",
  "trasformato": "trasformare", "interiore": "interiore", "grigio": "grigio",
  "coperto": "coprire", "segatura": "segatura", "riflessione": "riflessione",
  "comune": "comune", "persone": "persona", "antico": "antico",
  "funzionano": "funzionare", "forzarli": "forzare", "cambiare": "cambiare",
  "direzione": "direzione", "presunzione": "presunzione", "appoggiandosi": "appoggiare",
  "resistenze": "resistenza", "proporre": "proporre", "spezzare": "spezzare",
  "insieme": "insieme", "parole": "parola", "confermato": "confermare",
  "dialogo": "dialogo", "umano": "umano", "esercizio": "esercizio",
  "solitario": "solitario", "perfezionismo": "perfezionismo", "mezza": "mezzo",
  "dorati": "dorato", "pulire": "pulire", "lavato": "lavare",
  "portafiltri": "portafiltro", "asciugato": "asciugare", "superfici": "superficie",
  "strofinaccio": "strofinaccio", "pulito": "pulito", "registro": "registro",
  "confermavano": "confermare", "pregiudizi": "pregiudizio", "portando": "portare",
  "finanziaria": "finanziario", "affezionati": "affezionato", "reciproca": "reciproco",
  "cresceva": "crescere", "esperimento": "esperimento", "fragile": "fragile",
  "incerto": "incerto", "riferimento": "riferimento", "riconosciuto": "riconoscere",
  "scendevano": "scendere", "dolcemente": "dolcemente", "basilica": "basilica",
  "provato": "provare", "senso": "senso", "limpido": "limpido",
  "gratitudine": "gratitudine", "profonda": "profondo", "timido": "timido",
  "spaventato": "spaventato", "valigia": "valigia", "timore": "timore",
  "costante": "costante", "fallire": "fallire", "metropoli": "metropoli",
  "certezza": "certezza", "integrarsi": "integrare", "significava": "significare",
  "radici": "radice", "piegarsi": "piegare", "compromesso": "compromesso",
  "saggezza": "saggezza", "coraggio": "coraggio", "futuro": "futuro",
  "pronto": "pronto", "affrontare": "affrontare", "freddi": "freddo",
  "consapevolezza": "consapevolezza", "matura": "maturo", "trovato": "trovare",
  "mondo": "mondo", "aumentati": "aumentare", "controllando": "controllare",
  "accumulati": "accumulare", "lasciarci": "lasciare", "chiuderci": "chiudere",
  "fossimo": "essere", "guidate": "guidare", "pratici": "pratico",
  "piccole": "piccolo", "dimostrazioni": "dimostrazione", "ripulendo": "ripulire",
  "banco": "banco", "scopa": "scopa", "voltò": "voltare",
  "occhi": "occhio", "illuminati": "illuminare", "creare": "creare",
  "corsi": "corso", "brevi": "breve", "piccoli": "piccolo",
  "gruppi": "gruppo", "insegno": "insegnare", "lavorare": "lavorare",
  "oggetti": "oggetto", "legno": "legno", "mostra": "mostrare",
  "basi": "base", "argilla": "argilla", "guida": "guidare",
  "dolci": "dolce", "tradizionali": "tradizionale", "prese": "prendere",
  "forma": "forma", "successivi": "successivo", "entusiasmo": "entusiasmo",
  "contagioso": "contagioso", "scacciò": "scacciare", "decisero": "decidere",
  "chiamare": "chiamare", "sabati": "sabato", "stampando": "stampare",
  "semplici": "semplice", "cartoncini": "cartoncino", "informativi": "informativo",
  "carta": "carta", "riciclata": "riciclato", "distribuire": "distribuire",
  "negozi": "negozio", "librerie": "libreria", "vicine": "vicino",
  "proposta": "proposta", "accessibile": "accessibile", "tardo": "tardo",
  "imparare": "imparare", "manuale": "manuale", "chiacchierare": "chiacchierare",
  "bevanda": "bevanda", "profumata": "profumato", "condividere": "condividere",
  "autentica": "autentico", "quarantotto": "quarantotto", "annuncio": "annuncio",
  "posti": "posto", "disponibili": "disponibile", "appuntamenti": "appuntamento",
  "andarono": "andare", "completamente": "completamente", "esauriti": "esaurito",
  "sabato": "sabato", "batteva": "battere", "vetri": "vetro",
  "finestre": "finestra", "trasformò": "trasformare", "luminoso": "luminoso",
  "dodici": "dodici", "partecipanti": "partecipante", "diverse": "diverso",
  "residenti": "residente", "giovani": "giovane", "insegnanti": "insegnante",
  "studenti": "studente", "coppia": "coppia", "pensione": "pensione",
  "raccolsero": "raccogliere", "intorno": "intorno", "massiccio": "massiccio",
  "distribuì": "distribuire", "ciascuno": "ciascuno", "panetto": "panetto",
  "fresca": "fresco", "spiegò": "spiegare", "pazienza": "pazienza",
  "modellare": "modellare", "ciotola": "ciotola", "guidando": "guidare",
  "dita": "dito", "inesperte": "inesperto", "dolcezza": "dolcezza",
  "risate": "risata", "commenti": "commento", "spontanei": "spontaneo",
  "riempirono": "riempire", "stanza": "stanza", "sciogliendo": "sciogliere",
  "imbarazzo": "imbarazzo", "iniziale": "iniziale", "clima": "clima",
  "tavoletta": "tavoletta", "vetrata": "vetrata", "valorizzare": "valorizzare",
  "venature": "venatura", "fibra": "fibra", "ascoltavano": "ascoltare",
  "affascinati": "affascinare", "toccando": "toccare", "ruvide": "ruvido",
  "diventavano": "diventare", "lisce": "liscio", "tatto": "tatto",
  "osservava": "osservare", "scena": "scena", "preparando": "preparare",
  "frattempo": "frattempo", "proveniente": "provenire", "raccolti": "raccolto",
  "sostenibili": "sostenibile", "america": "america", "centrale": "centrale",
  "africa": "africa", "torta": "torta", "casalinga": "casalingo",
  "mele": "mela", "cannella": "cannella", "profumo": "profumo",
  "mescolava": "mescolare", "aroma": "aroma", "tagliato": "tagliare",
  "terra": "terra", "assaggio": "assaggio", "guidato": "guidare",
  "usò": "usare", "difficili": "difficile", "formule": "formula",
  "parlò": "parlare", "semplicità": "semplicita", "passione": "passione",
  "sincera": "sincero", "influenza": "influenzare", "frutto": "frutto",
  "perché": "perche", "raccolto": "raccogliere", "abbia": "avere",
  "ricca": "ricco", "estragga": "estrarre", "aromi": "aroma",
  "diversi": "diverso", "seconda": "secondo", "contatto": "contatto",
  "assaggiavano": "assaggiare", "curiosità": "curiosita", "confrontando": "confrontare",
  "impressioni": "impressione", "naturalezza": "naturalezza", "sentiva": "sentire",
  "note": "nota", "cioccolato": "cioccolato", "fiori": "fiore",
  "freschezza": "freschezza", "agrumi": "agrume", "capito": "capire",
  "sfumature": "sfumatura", "commentò": "commentare", "signora": "signora",
  "anziana": "anziano", "meraviglia": "meraviglia", "sembrava": "sembrare",
  "fretta": "fretta", "rivestirsi": "rivestire", "tornare": "tornare",
  "acquistarono": "acquistare", "sacchetto": "sacchetto", "chicchi": "chicco",
  "macinati": "macinare", "freschi": "fresco", "ordinarono": "ordinare",
  "set": "set", "tazze": "tazza", "regalare": "regalare",
  "natale": "natale", "chiesero": "chiedere", "iscriversi": "iscrivere",
  "successivo": "successivo", "ultimo": "ultimo", "ospite": "ospite",
  "uscì": "uscire", "salutando": "salutare", "calorosamente": "calorosamente",
  "amici": "amico", "guardarono": "guardare", "disordinato": "disordinato",
  "colmo": "colmo", "energia": "energia", "positiva": "positivo",
  "soluzione": "soluzione", "temporanea": "temporaneo", "pagare": "pagare",
  "bollette": "bolletta", "avanzato": "avanzare", "sedendosi": "sedere",
  "sgabello": "sgabello", "migliore": "migliore", "capire": "capire",
  "facciamo": "fare", "vendiamo": "vendere", "bevande": "bevanda",
  "offriamo": "offrire", "competenza": "competenza", "stare": "stare",
  "bene": "bene", "annuì": "annuire", "convinzione": "convinzione",
  "sistemando": "sistemare", "attrezzi": "attrezzo", "ganci": "gancio",
  "parete": "parete", "costretti": "costringere", "superare": "superare",
  "pigrizia": "pigrizia", "inventare": "inventare", "avremmo": "avere",
  "fatto": "fare", "fossero": "essere", "state": "essere",
  "facili": "facile", "comode": "comodo", "ripensò": "ripensare",
  "lucidità": "lucidita", "accaduto": "accadere", "comprese": "comprendere",
  "operative": "operativo", "incidenti": "incidente", "percorso": "percorso",
  "temere": "temere", "lezioni": "lezione", "preziose": "prezioso",
  "rafforzare": "rafforzare", "struttura": "struttura", "progetto": "progetto",
  "autunno": "autunno", "stata": "essere", "gestire": "gestire",
  "rapido": "rapido", "clienti": "cliente", "insegnato": "insegnare",
  "dipendere": "dipendere", "fortuna": "fortuna", "meteorologica": "meteorologico",
  "abitudini": "abitudine", "passive": "passivo", "resilienza": "resilienza",
  "artigianale": "artigianale", "nasceva": "nascere", "capacità": "capacita",
  "valore": "valore", "relazioni": "relazione", "umane": "umano",
  "durature": "duraturo", "capaci": "capace", "resistere": "resistere",
  "gelo": "gelo", "vendite": "vendita", "negozio": "negozio",
  "dettaglio": "dettaglio", "laboratorio": "laboratorio", "vivo": "vivo",
  "sapeva": "sapere", "reinventarsi": "reinventare", "continuamente": "continuamente",
  "risposta": "risposta", "sfide": "sfida", "precedettero": "precedere",
  "diventarono": "diventare", "appuntamento": "appuntamento", "fisso": "fisso",
  "desiderato": "desiderare", "decine": "decina", "infrasettimanali": "infrasettimanale",
  "piovosi": "piovoso", "entravano": "entrare", "cercare": "cercare",
  "chiacchiere": "chiacchiera", "fermarsi": "fermare", "leggere": "leggere",
  "capitolo": "capitolo", "libro": "libro", "registratore": "registratore",
  "cassa": "cassa", "rifletteva": "riflettere", "salute": "salute",
  "stabile": "stabile", "robusta": "robusto", "sufficienti": "sufficiente",
  "garantire": "garantire", "serenità": "serenita", "invernali": "invernale",
  "venire": "venire", "cooperazione": "cooperazione", "mestieri": "mestiere",
  "diventata": "diventare", "competitiva": "competitivo", "vigilia": "vigilia",
  "chiudendo": "chiudere", "giornata": "giornata", "piena": "pieno",
  "sorrisi": "sorriso", "auguri": "augurio", "sinceri": "sincero",
  "regali": "regalo", "scambiati": "scambiare", "vicini": "vicino",
  "fermò": "fermare", "istanti": "istante", "luna": "luna",
  "vicoli": "vicolo", "illuminati": "illuminare", "festa": "festa",
  "ghirlande": "ghirlanda", "verdi": "verde", "portoni": "portone",
  "addobbate": "addobbare", "riflettevano": "riflettere", "sanpietrini": "sanpietrino",
  "bagnati": "bagnato", "calma": "calmo", "solida": "solido",
  "nata": "nascere", "superato": "superare", "compagni": "compagno",
  "fidati": "fidato", "generosi": "generoso", "guardò": "guardare",
  "sorrise": "sorridere", "sapendo": "sapere", "anno": "anno",
  "nuovo": "nuovo", "avrebbe": "avere", "portato": "portare",
  "nuove": "nuovo", "nessuna": "nessuno", "tempesta": "tempesta",
  "potuto": "potere", "spegnere": "spegnere", "fuoco": "fuoco",
  "acceso": "accendere", "cuore": "cuore",
  // Ch 68
  "parlarti": "parlare", "versandolo": "versare", "realizzata": "realizzare",
  "finisse": "finire", "voler": "volere", "farti": "fare",
  "disposti": "disposto", "finanziare": "finanziare", "due": "due",
  "punti": "punto", "vendita": "vendita", "fornirti": "fornire",
  "macchinari": "macchinario", "ultima": "ultimo", "generazione": "generazione",
  "garantire": "garantire", "vasta": "vasto", "marchio": "marchio",
  "commerciale": "commerciale", "cambio": "cambio", "offrirebbero": "offrire",
  "contratto": "contratto", "direttore": "direttore", "tecnico": "tecnico",
  "stipendio": "stipendio", "garantito": "garantito", "elevato": "elevato",
  "percentuale": "percentuale", "complessivi": "complessivo", "gruppo": "gruppo",
  "rimase": "rimanere", "immersa": "immerso", "denso": "denso",
  "profondo": "profondo", "secondi": "secondo", "rotto": "rompere",
  "sibilo": "sibilo", "leggero": "leggero", "bollitore": "bollitore",
  "apprendista": "apprendista", "preoccupato": "preoccupato", "avvenire": "avvenire",
  "simile": "simile", "sembrata": "sembrare", "sogno": "sogno",
  "straordinario": "straordinario", "generoso": "generoso", "industriale": "industriale",
  "possibilità": "possibilita", "diffuso": "diffuso", "tutta": "tutto",
  "città": "citta", "rischiare": "rischiare", "capitale": "capitale",
  "eppure": "eppure", "ascoltava": "ascoltare", "alcun": "alcuno",
  "strana": "strano", "sensazione": "sensazione", "distacco": "distacco",
  "comporterebbe": "comportare", "esattamente": "esattamente", "collaborazione": "collaborazione",
  "delegare": "delegare", "parametri": "parametro", "tostatura": "tostatura",
  "decisioni": "decisione", "comitato": "comitato", "aziendale": "aziendale",
  "dovremmo": "dovere", "ricette": "ricetta", "produrre": "produrre",
  "grandi": "grande", "volumi": "volume", "industriali": "industriale",
  "uniformare": "uniformare", "arredamento": "arredamento", "secondo": "secondo",
  "linee": "linea", "catena": "catena", "rispose": "rispondere",
  "fissò": "fissare", "lungo": "lungo", "vuota": "vuoto",
  "sollevò": "sollevare", "onestà": "onesta", "disarmante": "disarmante",
  "rivelava": "rivelare", "affetto": "affetto", "paterno": "paterno",
  "sai": "sapere", "risposta": "risposta", "bassa": "basso",
  "sospiro": "sospiro", "pesante": "pesante", "accetti": "accettare",
  "soldi": "soldo", "scala": "scala", "decidere": "decidere",
  "tempi": "tempo", "valori": "valore", "qualità": "qualita",
  "diventi": "diventare", "efficiente": "efficiente", "molto": "molto",
  "trimestrali": "trimestrale", "contano": "contare", "sempre": "sempre",
  "bellezza": "bellezza", "dovere": "dovere", "professionale": "professionale",
  "portarti": "portare", "offerta": "offerta", "tangibile": "tangibile",
  "volevo": "volere", "vedere": "vedere", "avresti": "avere",
  "reagito": "reagire", "testa": "testa", "scaffali": "scaffale",
  "uniche": "unico", "ceramiche": "ceramica", "intagliati": "intagliare",
  "entrava": "entrare", "ringrazio": "ringraziare", "pensato": "pensare",
  "portato": "portare", "tanta": "tanto", "trasparenza": "trasparenza",
  "ferma": "fermo", "priva": "privo", "dubbio": "dubbio",
  "sicurezza": "sicurezza", "lavorato": "lavorare", "giorno": "giorno",
  "notte": "notte", "dipendente": "dipendente", "scelto": "scegliere",
  "strada": "strada", "difficile": "difficile", "libero": "libero",
  "mettere": "mettere", "nome": "nome", "rispetto": "rispetto",
  "profondamente": "profondamente", "forza": "forza", "espansione": "espansione",
  "rapida": "rapido", "dimensione": "dimensione", "umana": "umano",
  "dettaglio": "dettaglio", "indipendenza": "indipendenza", "parlava": "parlare",
  "volto": "volto", "severo": "severo", "disteso": "distendere",
  "raro": "raro", "orgoglio": "orgoglio", "commosso": "commosso",
  "maestro": "maestro", "battuto": "battere", "aperta": "aperto",
  "colpo": "colpo", "sonoro": "sonoro", "piena": "pieno",
  "approvazione": "approvazione", "esattamente": "esattamente", "speravo": "sperare",
  "lucidi": "lucido", "confondono": "confondere", "successo": "successo",
  "grandezza": "grandezza", "finiscono": "finire", "vendere": "vendere",
  "anima": "anima", "illusione": "illusione", "dura": "durare",
  "poco": "poco", "vero": "vero", "sbagliare": "sbagliare",
  "fare": "fare", "cose": "cosa", "amore": "amore",
  "vale": "valere", "infinitamente": "infinitamente", "uomini": "uomo",
  "rimasti": "rimanere", "parlare": "parlare", "altra": "altro",
  "seconda": "secondo", "ricordando": "ricordare", "tirocinio": "tirocinio",
  "errori": "errore", "gioventù": "gioventu", "tante": "tanto",
  "apprese": "apprendere", "alzato": "alzare", "andarsene": "andarsene",
  "stretto": "stringere", "straordinaria": "straordinario", "bisogno": "bisogno",
  "consigli": "consiglio", "diventato": "diventare", "titolo": "titolo",
  "ottime": "ottimo", "salutato": "salutare", "cordiale": "cordiale",
  "capo": "capo", "camminando": "camminare", "fiero": "fiero",
  "lungo": "lungo", "illuminata": "illuminato", "rimasto": "rimanere",
  "solo": "solo", "notte": "notte", "scendeva": "scendere",
  "respirato": "respirare", "rifiutare": "rifiutare", "allettante": "allettante",
  "rimpianto": "rimpianto", "indescrivibile": "indescrivibile", "leggerezza": "leggerezza",
  "maturità": "maturita", "consapevolmente": "consapevolmente", "autonomia": "autonomia",
  "misura": "misura", "scelta": "scelta", "rinnovata": "rinnovare",
  "sigillo": "sigillo", "definitivo": "definitivo", "lavoratore": "lavoratore",
  "cercava": "cercare", "posto": "posto", "uomo": "uomo",
  "costruiva": "costruire", "destino": "destino", "proprie": "proprio",
  // Ch 69
  "sostituirle": "sostituire", "permette": "permettere", "analisi": "analisi",
  "dati": "dato", "affitto": "affitto", "fornitori": "fornitore",
  "verde": "verde", "generato": "generare", "netto": "netto",
  "crescita": "crescita", "fondo": "fondo", "riserva": "riserva",
  "emergenze": "emergenza", "contava": "contare", "coprire": "coprire",
  "oltre": "oltre", "entrate": "entrata", "garantendo": "garantire",
  "protezione": "protezione", "totale": "totale", "contro": "contro",
  "creativo": "creativo", "micro-impresa": "impresa", "sana": "sano",
  "immerso": "immerso", "calcoli": "calcolo", "interna": "interno",
  "aperta": "aperto", "cartellina": "cartellina", "disegni": "disegno",
  "fumante": "fumante", "vanno": "andare", "capo": "capo",
  "sedeva": "sedere", "dicono": "dire", "bravi": "bravo",
  "pensassimo": "pensare", "momenti": "momento", "rispose": "rispondere",
  "mostrandole": "mostrare", "riepilogo": "riepilogo", "annuale": "annuale",
  "peggiori": "peggiore", "senza": "senza", "debiti": "debito",
  "margine": "margine", "continua": "continuare", "dimostrarci": "dimostrare",
  "soddisfazione": "soddisfazione", "evidente": "evidente", "aperto": "aperto",
  "banca": "banca", "servono": "servire", "dormire": "dormire",
  "tranquilli": "tranquillo", "bello": "bello", "creazioni": "creazione",
  "perso": "perdere", "piacere": "piacere", "lavorare": "lavorare",
  "sorriso": "sorriso", "dimostrato": "dimostrare", "basato": "basare",
  "teamwork": "teamwork", "funzionare": "funzionare", "unito": "unire",
  "loro": "loro", "tagliere": "tagliere", "pezzo": "pezzo",
  "pane": "pane", "casereccio": "casereccio", "merenda": "merenda",
  "improvvisata": "improvvisato", "ripercorrere": "ripercorrere", "divertenti": "divertente",
  "significativi": "significativo", "trascorso": "trascorrere", "ricordato": "ricordare",
  "rifugio": "rifugio", "facce": "faccia", "entusiaste": "entusiasta",
  "visita": "visita", "solenne": "solenne", "poche": "poco",
  "accorti": "accorgersi", "stupore": "stupore", "vite": "vita",
  "intrecciate": "intrecciare", "collaborazione": "collaborazione", "amicizia": "amicizia",
  "confidò": "confidare", "goccio": "goccio", "paure": "paura",
  "diffidente": "diffidente", "convinto": "convinto", "difendermi": "difendere",
  "circostante": "circostante", "pensavo": "pensare", "skill": "skill",
  "contasse": "contare", "ammettere": "ammettere", "limite": "limite",
  "chiedere": "chiedere", "aiuto": "aiuto", "segno": "segno",
  "imperdonabile": "imperdonabile", "debolezza": "debolezza", "spezzando": "spezzare",
  "robuste": "robusto", "piene": "pieno", "graffi": "graffio",
  "toglie": "togliere", "mani": "mano", "costringe": "costringere",
  "realmente": "realmente", "finché": "finche", "credi": "credere",
  "sapere": "sapere", "smentiscono": "smentire", "fanno": "fare",
  "umiltà": "umilta", "comincia": "cominciare", "facilità": "facilita",
  "servizio": "servizio", "tolto": "togliere", "certezze": "certezza",
  "costretto": "costringere", "alzato": "alzare", "brindisi": "brindisi",
  "allegro": "allegro", "resi": "rendere", "forti": "forte",
  "brindato": "brindare", "diradarsi": "diradarsi", "spazio": "spazio",
  "stellato": "stellato", "tornare": "tornare", "soffusa": "soffuso",
  "lampade": "lampada", "richiuso": "richiudere", "riposto": "riporre",
  "faldoni": "faldone", "rimesso": "rimettere", "ordine": "ordine",
  "lenti": "lento", "rispettosi": "rispettoso", "chiarezza": "chiarezza",
  "cristallina": "cristallino", "verifica": "verifica", "trasformazione": "trasformazione",
  "irreversibile": "irreversibile", "imparato": "imparare", "arte": "arte",
  "dinamico": "dinamico", "ricerca": "ricerca", "velocità": "velocita",
  "rigore": "rigore", "gestione": "gestione", "generosità": "generosita",
  "accoglienza": "accoglienza", "bisogni": "bisogno", "altri": "altro",
  "frattura": "frattura", "personale": "personale", "espressione": "espressione",
  "integra": "integro", "armoniosa": "armonioso", "identità": "identita",
  "poteva": "potere", "guardare": "guardare", "sopravvissuto": "sopravvissuto",
  "fiducia": "fiducia", "poggiare": "poggiare", "fondamenta": "fondamenta",
  "incrollabili": "incrollabile", "spegnere": "spegnere", "chiudere": "chiudere",
  "chiave": "chiave", "porta": "porta", "vetrata": "vetrata",
  "accarezzato": "accarezzare", "pressino": "pressino", "bronzo": "bronzo",
  "donatogli": "donare", "metallo": "metallo", "levigato": "levigare",
  "rispondeva": "rispondere", "tocco": "tocco", "rassicurante": "rassicurante",
  "sapeva": "sapere", "iniziata": "iniziare", "servire": "servire",
  "storie": "storia", "ascoltare": "ascoltare", "affrontare": "affrontare",
  "comunità": "comunita", "polmoni": "polmone", "eterna": "eterno",
  "sentendosi": "sentire", "finalmente": "finalmente", "prima": "primo",
  "volta": "volta", "completo": "completo", "felice": "felice",
  // Ch 70
  "darle": "dare", "carica": "carica", "fluivano": "fluire",
  "freschi": "fresco", "agganciò": "agganciare", "bruna": "bruno",
  "vellutata": "vellutato", "servendo": "servire", "bicchierino": "bicchierino",
  "tovagliolino": "tovagliolino", "bevve": "bere", "visibile": "visibile",
  "scambiò": "scambiare", "allegre": "allegro", "notizie": "notizia",
  "stretta": "stretta", "proseguire": "proseguire", "mattutina": "mattutino",
  "corso": "corso", "ora": "ora", "varia": "vario",
  "vivace": "vivace", "ricchezza": "ricchezza", "sociale": "sociale",
  "entrarono": "entrare", "impiegati": "impiegato", "comunali": "comunale",
  "architetti": "architetto", "computer": "computer", "portatili": "portatile",
  "consiglio": "consiglio", "spesa": "spesa", "serviva": "servire",
  "adattando": "adattare", "esigenze": "esigenza", "perdere": "perdere",
  "tensione": "tensione", "funzionava": "funzionare", "organismo": "organismo",
  "perfettamente": "perfettamente", "integrato": "integrato", "tessuto": "tessuto",
  "nove": "nove", "arrivarono": "arrivare", "portava": "portare",
  "scatola": "scatola", "biscotti": "biscotto", "aveva": "avere",
  "tavola": "tavola", "recuperata": "recuperare", "villa": "villa",
  "colli": "colle", "salutarono": "salutare", "abbraccio": "abbraccio",
  "piedi": "piede", "commentando": "commentare", "programmi": "programma",
  "complicità": "complicita", "motore": "motore", "trasmetteva": "trasmettere",
  "chiunque": "chiunque", "varcasse": "varcare", "soglia": "soglia",
  "mattinata": "mattinata", "proseguiva": "proseguire", "figura": "figura",
  "imponente": "imponente", "apparve": "apparire", "illuminata": "illuminato",
  "passeggiava": "passeggiare", "schiena": "schiena", "godendosi": "godere",
  "commissione": "commissione", "interno": "interno", "incrociò": "incrociare",
  "vetro": "vetro", "entrò": "entrare", "interrompere": "interrompere",
  "sollevò": "sollevare", "destra": "destro", "cenno": "cenno",
  "lento": "lento", "solenne": "solenne", "carico": "carico",
  "rispose": "rispondere", "inchino": "inchino", "leggero": "leggero",
  "ondata": "ondata", "commozione": "commozione", "riempirgli": "riempire",
  "petto": "petto", "debito": "debito", "grande": "grande",
  "vecchio": "vecchio", "conoscenza": "conoscenza", "dono": "dono",
  "trasmesso": "trasmettere", "esempio": "esempio", "vivente": "vivente",
  "altissima": "alto", "dignità": "dignita", "generoso": "generoso",
  "fedeltà": "fedelta", "morali": "morale", "eredità": "eredita",
  "spirituale": "spirituale", "custodita": "custodire", "pronta": "pronto",
  "tramandata": "tramandare", "desiderio": "desiderio", "imparare": "imparare",
  "mezzogiorno": "mezzogiorno", "breve": "breve", "pausa": "pausa",
  "comanda": "comanda", "versò": "versare", "mise": "mettere",
  "parte": "parte", "osservare": "osservare", "sala": "sala",
  "stranieri": "straniero", "stavano": "stare", "studiando": "studiare",
  "grammatica": "grammatica", "italiana": "italiano", "aiutati": "aiutare",
  "spiegava": "spiegare", "differenze": "differenza", "tempi": "tempo",
  "verbali": "verbale", "passato": "passato", "fondo": "fondo",
  "mostrava": "mostrare", "bambina": "bambino", "modellare": "modellare",
  "uccellino": "uccellino", "tagliava": "tagliare", "listello": "listello",
  "diffondendo": "diffondere", "gradevole": "gradevole", "resina": "resina",
  "sognato": "sognare", "desiderato": "desiderare", "difeso": "difendere",
  "bui": "buio", "reale": "reale", "fecondo": "fecondo",
  "compiere": "compiere", "comodità": "comodita", "dipendenza": "dipendenza",
  "rischio": "rischio", "coraggioso": "coraggioso", "libertà": "liberta",
  "compie": "compiere", "cammino": "cammino", "rendita": "rendita",
  "ricordi": "ricordo", "consolidate": "consolidato", "rinnova": "rinnovare",
  "singola": "singolo", "accendi": "accendere", "accogli": "accogliere",
  "primo": "primo", "decidi": "decidere", "cedere": "cedere",
  "pigrizia": "pigrizia", "compromesso": "compromesso", "facile": "facile",
  "atto": "atto", "riponevano": "riporre", "cercava": "cercare",
  "disperatamente": "disperatamente", "conferme": "conferma", "colmare": "colmare",
  "insicurezze": "insicurezza", "diventato": "diventare", "maestro": "maestro",
  "completo": "completo", "fermo": "fermo", "guida": "guida",
  "autorevole": "autorevole", "rispettata": "rispettare", "viaggio": "viaggio",
  "contadini": "contadino", "modestia": "modestia", "unite": "unire",
  "indissolubilmente": "indissolubilmente", "inconciliabili": "inconciliabile",
  "sintesi": "sintesi", "perfetta": "perfetto", "definitiva": "definitivo",
  "angolo": "angolo", "chiama": "chiamare", "campana": "campana",
  "chiesa": "chiesa", "scandiva": "scandire", "rintocchi": "rintocco",
  "diffondendo": "diffondere", "suono": "suono", "bronzeo": "bronzeo",
  "solenne": "solenne", "riprese": "riprendere", "fermezza": "fermezza",
  "spalancata": "spalancato", "ventata": "ventata", "prepararle": "preparare",
  "buono": "buono", "padrone": "padrone", "gioia": "gioia",
  "pura": "puro", "meraviglioso": "meraviglioso", "storia": "storia"
};

for (const [k, v] of Object.entries(autoRules)) {
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
for (let i = 66; i <= 70; i++) {
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
console.log(`Total missing across Batch C: ${totalMissing}`);
