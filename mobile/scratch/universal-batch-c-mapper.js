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

// More base entries
const newBases3 = [
  { lemmaId: 'delusione', italian: 'delusione', english: 'disappointment', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['delusione', 'delusioni'] },
  { lemmaId: 'invenzione', italian: 'invenzione', english: 'invention', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['invenzione', 'invenzioni'] },
  { lemmaId: 'educare', italian: 'educare', english: 'to educate / teach', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['educare', 'educa', 'educava', 'educato', 'educarle'] },
  { lemmaId: 'peggiore', italian: 'peggiore', english: 'worse / worst', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['peggiore', 'peggiori', 'peggior'] },
  { lemmaId: 'offendersi', italian: 'offendersi', english: 'to take offense', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['offendersi', 'offende', 'offendeva', 'offeso'] },
  { lemmaId: 'antiquato', italian: 'antiquato', english: 'outdated / old-fashioned', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 66, inflections: ['antiquato', 'antiquata', 'antiquati', 'antiquate'] },
  { lemmaId: 'motivo', italian: 'motivo', english: 'motive / reason', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['motivo', 'motivi'] },
  { lemmaId: 'serata', italian: 'serata', english: 'evening / soirée', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['serata', 'serate'] },
  { lemmaId: 'tema', italian: 'tema', english: 'theme / topic', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['tema', 'temi'] },
  { lemmaId: 'strafare', italian: 'strafare', english: 'to overdo / overreach', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 68, inflections: ['strafare', 'strafà', 'strafatto'] },
  { lemmaId: 'avvocato', italian: 'avvocato', english: 'lawyer', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['avvocato', 'avvocati'] },
  { lemmaId: 'rappresentante', italian: 'rappresentante', english: 'representative', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 68, inflections: ['rappresentante', 'rappresentanti'] },
  { lemmaId: 'italia', italian: 'Italia', english: 'Italy', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['italia', 'Italia'] },
  { lemmaId: 'battito', italian: 'battito', english: 'beat / heartbeat', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 68, inflections: ['battito', 'battiti'] },
  { lemmaId: 'fluidita', italian: 'fluidità', english: 'fluidity / smoothness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['fluidità', 'fluidita'] },
  { lemmaId: 'economia', italian: 'economia', english: 'economy / saving', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['economia', 'economie'] },
  { lemmaId: 'importanza', italian: 'importanza', english: 'importance', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['importanza'] },
  { lemmaId: 'dato', italian: 'dato', english: 'data / fact / figure', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['dato', 'dati'] },
  { lemmaId: 'finanziario', italian: 'finanziario', english: 'financial', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['finanziario', 'finanziaria', 'finanziari', 'finanziarie'] },
  { lemmaId: 'sperduto', italian: 'sperduto', english: 'lost / remote', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['sperduto', 'sperduta', 'sperduti', 'sperdute'] },
  { lemmaId: 'paesino', italian: 'paesino', english: 'small village / small town', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['paesino', 'paesini'] },
  { lemmaId: 'tappa', italian: 'tappa', english: 'stage / stop / milestone', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['tappa', 'tappe'] },
  { lemmaId: 'serratura', italian: 'serratura', english: 'lock', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['serratura', 'serrature'] },
  { lemmaId: 'viso', italian: 'viso', english: 'face', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['viso', 'visi'] },
  { lemmaId: 'rugoso', italian: 'rugoso', english: 'wrinkled / lined', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 70, inflections: ['rugoso', 'rugosa', 'rugosi', 'rugose'] }
];

for (const entry of newBases3) {
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

// Direct inflection mapping
const manualOverridesC = {
  "lasciavano": "lasciare", "delusione": "delusione", "necessità": "necessita",
  "educarle": "educare", "peggior": "peggiore", "offendersi": "offendersi",
  "antiquato": "antiquato", "decise": "decidere", "cancellata": "cancellare",
  "sostituita": "sostituire", "volesse": "volere", "potesse": "potere",
  "diventare": "diventare", "dovesse": "dovere", "cercava": "cercare",
  "desiderava": "desiderare", "consisteva": "consistere", "costruire": "costruire",
  "giudicare": "giudicare", "imporre": "imporre", "dedicata": "dedicare",
  "unito": "unire", "brasiliano": "brasiliano", "tostati": "tostare",
  "donare": "donare", "fondente": "fondente", "studiata": "studiare",
  "offrire": "offrire", "qualunque": "qualunque", "sentore": "sentore",
  "rinunciare": "rinunciare", "meticolosa": "meticoloso", "fine": "fine",
  "stretto": "stringere", "scaldato": "scaldare", "calmi": "calmo",
  "sicuri": "sicuro", "pensata": "pensare", "conoscere": "conoscere",
  "porgendogli": "porgere", "densa": "denso", "compatta": "compatto",
  "soffiato": "soffiare", "bevuto": "bere", "trattenne": "trattenere",
  "trattenuto": "trattenere", "segnato": "segnare", "sommesso": "sommesso",
  "posato": "posare", "tovagliolo": "tovagliolo", "inaspettato": "inaspettato",
  "illuminato": "illuminare", "chiari": "chiaro", "ecco": "ecco",
  "sostanza": "sostanza", "ammise": "ammettere", "distesa": "distendere",
  "piace": "piacere", "lasciato": "lasciare", "uscire": "uscire",
  "semplice": "semplice", "riconoscimento": "riconoscimento", "iniziato": "iniziare",
  "convivenza": "convivenza", "armoniosa": "armonioso", "differenti": "differente",
  "leggevano": "leggere", "traducevano": "tradurre", "caraffe": "caraffa",
  "preparate": "preparare", "scambiavano": "scambiare", "sorseggiando": "sorseggiare",
  "separati": "separare", "distanza": "distanza", "incolmabile": "incolmabile",
  "incontro": "incontro", "calore": "calore", "ciotole": "ciotola",
  "uscite": "uscire", "scaffali": "scaffale", "gremita": "gremire",
  "intesa": "intesa", "affettuosa": "affettuoso", "notato": "notare",
  "cambiata": "cambiare", "smesso": "smettere", "preoccuparti": "preoccupare",
  "dimostrare": "dimostrare", "bravura": "bravura", "costi": "costo",
  "chiese": "chiedere", "bassa": "basso", "asciugava": "asciugare",
  "professore": "professore", "correggere": "correggere", "errori": "errore",
  "accogliente": "accogliente", "percepisce": "percepire", "annuito": "annuire",
  "trasformato": "trasformare", "interiore": "interiore", "grigio": "grigio",
  "coperto": "coprire", "segatura": "segatura", "bere": "bere",
  "riflessione": "riflessione", "comune": "comune", "persone": "persona",
  "antico": "antico", "funzionano": "funzionare", "forzarli": "forzare",
  "cambiare": "cambiare", "direzione": "direzione", "presunzione": "presunzione",
  "appoggiandosi": "appoggiare", "resistenze": "resistenza", "naturali": "naturale",
  "proporre": "proporre", "spezzare": "spezzare", "insieme": "insieme",
  "parole": "parola", "confermato": "confermare", "dialogo": "dialogo",
  "umano": "umano", "esercizio": "esercizio", "solitario": "solitario",
  "perfezionismo": "perfezionismo", "mezza": "mezzo", "dorati": "dorato",
  "pulire": "pulire", "lavato": "lavare", "portafiltri": "portafiltro",
  "asciugato": "asciugare", "superfici": "superficie", "strofinaccio": "strofinaccio",
  "pulito": "pulito", "registro": "registro", "confermavano": "confermare",
  "pregiudizi": "pregiudizio", "portando": "portare", "finanziaria": "finanziario",
  "affezionati": "affezionato", "reciproca": "reciproco", "cresceva": "crescere",
  "esperimento": "esperimento", "fragile": "fragile", "incerto": "incerto",
  "riferimento": "riferimento", "riconosciuto": "riconoscere", "vita": "vita",
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
  "mondo": "mondo",
  // Ch 67
  "portò": "portare", "umido": "umido", "pungente": "pungente",
  "scendeva": "scendere", "infilava": "infilarsi", "ombrosi": "ombroso",
  "giornate": "giornata", "accorciate": "accorciare", "cinque": "cinque",
  "pomeriggio": "pomeriggio", "cielo": "cielo", "tetti": "tetto",
  "terracotta": "terracotta", "assumeva": "assumere", "sfumatura": "sfumatura",
  "scura": "scuro", "gelida": "gelido", "arrivo": "arrivo",
  "flusso": "flusso", "continuo": "continuo", "passanti": "passante",
  "visitatori": "visitatore", "occasionali": "occasionale", "riempiva": "riempire",
  "strade": "strada", "ridusse": "ridurre", "piazza": "piazza",
  "deserta": "deserto", "silenziosa": "silenzioso", "svolta": "svolta",
  "stagionale": "stagionale", "rappresentava": "rappresentare", "prova": "prova",
  "resistenza": "resistenza", "economica": "economico", "condiviso": "condiviso",
  "prime": "primo", "due": "due", "settimane": "settimana",
  "mese": "mese", "misero": "mettere", "evidenza": "evidenza",
  "realtà": "realta", "impegnativa": "impegnativo", "preoccupante": "preoccupante",
  "spese": "spesa", "vive": "vivo", "riscaldamento": "riscaldamento",
  "locale": "locale", "bolletta": "bolletta", "elettrica": "elettrico",
  "forni": "forno", "ceramica": "ceramica", "consumi": "consumo",
  "macchina": "macchina", "aumentati": "aumentare", "considerevole": "considerevole",
  "tempo": "tempo", "incassi": "incasso", "giornalieri": "giornaliero",
  "subito": "subire", "calo": "calo", "sensibile": "sensibile",
  "ore": "ora", "centrali": "centrale", "scoraggiava": "scoraggiare",
  "uscire": "uscire", "passeggiata": "passeggiata", "domenica": "domenica",
  "sera": "sera", "controllando": "controllare", "quaderno": "quaderno",
  "conti": "conto", "sentì": "sentire", "riaffiorare": "riaffiorare",
  "ansia": "ansia", "antica": "antico", "tormentato": "tormentare",
  "mesi": "mese", "continuiamo": "continuare", "ritmo": "ritmo",
  "gennaio": "gennaio", "febbraio": "febbraio", "margini": "margine",
  "sicurezza": "sicurezza", "azzereranno": "azzerare", "disse": "dire",
  "voce": "voce", "seria": "serio", "mostrando": "mostrare",
  "colonne": "colonna", "cifre": "cifra", "fisse": "fisso",
  "diminuiscono": "diminuire", "freddo": "freddo", "anzi": "anzi",
  "aumentano": "aumentare", "possiamo": "potere", "permetterci": "permettere",
  "consumare": "consumare", "risparmi": "risparmio", "accumulati": "accumulare",
  "ascoltò": "ascoltare", "attenzione": "attenzione", "osservando": "osservare",
  "numeri": "numero", "sguardo": "sguardo", "calmo": "calmo",
  "riflessivo": "riflessivo", "rispondere": "rispondere", "decisione": "decisione",
  "serena": "sereno", "stagione": "stagione", "difficile": "difficile",
  "artigiani": "artigiano", "dobbiamo": "dovere", "lasciarci": "lasciare",
  "prendere": "prendere", "panico": "panico", "chiuderci": "chiudere",
  "difensiva": "difensiva", "fossimo": "essere", "vittime": "vittima",
  "eventi": "evento", "gente": "gente", "entra": "entrare",
  "spontaneamente": "spontaneamente", "essere": "essere", "offrire": "offrire",
  "motivo": "motivo", "speciale": "speciale", "venire": "venire",
  "trovarci": "trovare", "propose": "proporre", "versando": "versare",
  "tisana": "tisana", "calda": "caldo", "organizziamo": "organizzare",
  "serie": "serie", "serate": "serata", "tema": "tema",
  "fine": "fine", "settimana": "settimana", "combinando": "combinare",
  "degustazioni": "degustazione", "guidate": "guidare", "laboratori": "laboratorio",
  "pratici": "pratico", "piccole": "piccolo", "dimostrazioni": "dimostrazione",
  "falegnameria": "falegnameria", "ripulendo": "ripulire", "banco": "banco",
  "scopa": "scopa", "voltò": "voltare", "occhi": "occhio",
  "illuminati": "illuminare", "idea": "idea", "creare": "creare",
  "corsi": "corso", "brevi": "breve", "piccoli": "piccolo",
  "gruppi": "gruppo", "insegno": "insegnare", "lavorare": "lavorare",
  "oggetti": "oggetto", "legno": "legno", "casa": "casa",
  "mostra": "mostrare", "basi": "base", "modellato": "modellato",
  "argilla": "argilla", "guida": "guidare", "caffè": "caffè",
  "dolci": "dolce", "tradizionali": "tradizionale", "prese": "prendere",
  "forma": "forma", "giorni": "giorno", "successivi": "successivo",
  "entusiasmo": "entusiasmo", "contagioso": "contagioso", "scacciò": "scacciare",
  "scoraggiamento": "scoraggiamento", "decisero": "decidere", "chiamare": "chiamare",
  "iniziativa": "iniziativa", "sabati": "sabato", "stampando": "stampare",
  "semplici": "semplice", "cartoncini": "cartoncino", "informativi": "informativo",
  "carta": "carta", "riciclata": "riciclato", "distribuire": "distribuire",
  "negozi": "negozio", "librerie": "libreria", "vicine": "vicino",
  "proposta": "proposta", "accessibile": "accessibile", "accogliente": "accogliente",
  "tardo": "tardo", "imparare": "imparare", "mestiere": "mestiere",
  "manuale": "manuale", "chiacchierare": "chiacchierare", "bevanda": "bevanda",
  "profumata": "profumato", "condividere": "condividere", "esperienza": "esperienza",
  "autentica": "autentico", "giro": "giro", "quarantotto": "quarantotto",
  "annuncio": "annuncio", "tutti": "tutto", "posti": "posto",
  "disponibili": "disponibile", "tre": "tre", "appuntamenti": "appuntamento",
  "andarono": "andare", "completamente": "completamente", "esauriti": "esaurito",
  "sabato": "sabato", "fuori": "fuori", "pioggia": "pioggia",
  "batteva": "battere", "vetri": "vetro", "finestre": "finestra",
  "trasformò": "trasformare", "nido": "nido", "operoso": "operoso",
  "luminoso": "luminoso", "calore": "calore", "dodici": "dodici",
  "partecipanti": "partecipante", "età": "eta", "diverse": "diverso",
  "residenti": "residente", "giovani": "giovane", "insegnanti": "insegnante",
  "studenti": "studente", "coppia": "coppia", "pensione": "pensione",
  "raccolsero": "raccogliere", "intorno": "intorno", "grande": "grande",
  "tavolo": "tavolo", "massiccio": "massiccio", "distribuì": "distribuire",
  "ciascuno": "ciascuno", "panetto": "panetto", "fresca": "fresco",
  "spiegò": "spiegare", "pazienza": "pazienza", "movimenti": "movimento",
  "modellare": "modellare", "ciotola": "ciotola", "mani": "mano",
  "guidando": "guidare", "dita": "dito", "inesperte": "inesperto",
  "dolcezza": "dolcezza", "risate": "risata", "commenti": "commento",
  "spontanei": "spontaneo", "riempirono": "riempire", "stanza": "stanza",
  "sciogliendo": "sciogliere", "imbarazzo": "imbarazzo", "iniziale": "iniziale",
  "clima": "clima", "fraterno": "fraterno", "sereno": "sereno",
  "parola": "parola", "levigare": "levigare", "tavoletta": "tavoletta",
  "d'ulivo": "olivo", "vetrata": "vetrata", "valorizzare": "valorizzare",
  "venature": "venatura", "fibra": "fibra", "ascoltavano": "ascoltare",
  "affascinati": "affascinare", "toccando": "toccare", "ruvide": "ruvido",
  "diventavano": "diventare", "lisce": "liscio", "setose": "setoso",
  "tatto": "tatto", "osservava": "osservare", "scena": "scena",
  "emozione": "emozione", "preparando": "preparare", "frattempo": "frattempo",
  "caraffe": "caraffa", "filtro": "filtro", "proveniente": "provenire",
  "raccolti": "raccolto", "sostenibili": "sostenibile", "America": "america",
  "Centrale": "centrale", "Africa": "africa", "preparato": "preparare",
  "torta": "torta", "casalinga": "casalingo", "mele": "mela",
  "cannella": "cannella", "profumo": "profumo", "dolce": "dolce",
  "mescolava": "mescolare", "aroma": "aroma", "tagliato": "tagliare",
  "terra": "terra", "arrivò": "arrivare", "momento": "momento",
  "assaggio": "assaggio", "guidato": "guidare", "usò": "usare",
  "difficili": "difficile", "formule": "formula", "manuale": "manuale",
  "parlò": "parlare", "semplicità": "semplicita", "passione": "passione",
  "sincera": "sincero", "influenza": "influenzare", "maturazione": "maturazione",
  "frutto": "frutto", "perché": "perche", "raccolto": "raccogliere",
  "mano": "mano", "abbia": "avere", "ricca": "ricco",
  "estragga": "estrarre", "aromi": "aroma", "diversi": "diverso",
  "seconda": "secondo", "contatto": "contatto", "assaggiavano": "assaggiare",
  "curiosità": "curiosita", "confrontando": "confrontare", "impressioni": "impressione",
  "naturalezza": "naturalezza", "sentiva": "sentire", "note": "nota",
  "cioccolato": "cioccolato", "fiori": "fiore", "d'arancio": "arancio",
  "freschezza": "freschezza", "agrumi": "agrume", "capito": "capire",
  "potesse": "potere", "sfumature": "sfumatura", "commentò": "commentare",
  "signora": "signora", "anziana": "anziano", "meraviglia": "meraviglia",
  "sembrava": "sembrare", "fretta": "fretta", "rivestirsi": "rivestire",
  "tornare": "tornare", "acquistarono": "acquistare", "sacchetto": "sacchetto",
  "chicchi": "chicco", "macinati": "macinare", "freschi": "fresco",
  "ordinarono": "ordinare", "set": "set", "tazze": "tazza",
  "regalare": "regalare", "Natale": "natale", "chiesero": "chiedere",
  "iscriversi": "iscrivere", "successivo": "successivo", "ultimo": "ultimo",
  "ospite": "ospite", "uscì": "uscire", "salutando": "salutare",
  "calorosamente": "calorosamente", "amici": "amico", "guardarono": "guardare",
  "disordinato": "disordinato", "colmo": "colmo", "energia": "energia",
  "positiva": "positivo", "bilancio": "bilancio", "soltanto": "soltanto",
  "soluzione": "soluzione", "temporanea": "temporaneo", "pagare": "pagare",
  "bollette": "bolletta", "avanzato": "avanzare", "sedendosi": "sedere",
  "sgabello": "sgabello", "migliore": "migliore", "capire": "capire",
  "facciamo": "fare", "vendiamo": "vendere", "bevande": "bevanda",
  "offriamo": "offrire", "competenza": "competenza", "spazio": "spazio",
  "stare": "stare", "bene": "bene", "annuì": "annuire",
  "convinzione": "convinzione", "sistemando": "sistemare", "attrezzi": "attrezzo",
  "ganci": "gancio", "parete": "parete", "costretti": "costringere",
  "superare": "superare", "pigrizia": "pigrizia", "inventare": "inventare",
  "avremmo": "avere", "fatto": "fare", "fossero": "essere",
  "state": "essere", "facili": "facile", "comode": "comodo",
  "ripensò": "ripensare", "lucidità": "lucidita", "accaduto": "accadere",
  "comprese": "comprendere", "difficoltà": "difficolta", "operative": "operativo",
  "incidenti": "incidente", "percorso": "percorso", "temere": "temere",
  "lezioni": "lezione", "preziose": "prezioso", "rafforzare": "rafforzare",
  "struttura": "struttura", "progetto": "progetto", "autunno": "autunno",
  "stata": "essere", "gestire": "gestire", "rapido": "rapido",
  "clienti": "cliente", "insegnato": "insegnare", "dipendere": "dipendere",
  "fortuna": "fortuna", "meteorologica": "meteorologico", "abitudini": "abitudine",
  "passive": "passivo", "resilienza": "resilienza", "attività": "attivita",
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
  "fermò": "fermare", "istanti": "istante", "luce": "luce",
  "fredda": "freddo", "luna": "luna", "vicoli": "vicolo",
  "illuminati": "illuminare", "festa": "festa", "ghirlande": "ghirlanda",
  "verdi": "verde", "portoni": "portone", "addobbate": "addobbare",
  "riflettevano": "riflettere", "sanpietrini": "sanpietrino", "bagnati": "bagnato",
  "calma": "calmo", "solida": "solido", "indistruttibile": "indistruttibile",
  "nata": "nascere", "superato": "superare", "compagni": "compagno",
  "fidati": "fidato", "generosi": "generoso", "guardò": "guardare",
  "limpido": "limpido", "sorrise": "sorridere", "sapendo": "sapere",
  "anno": "anno", "nuovo": "nuovo", "avrebbe": "avere",
  "portato": "portare", "nuove": "nuovo", "nessuna": "nessuno",
  "tempesta": "tempesta", "potuto": "potere", "spegnere": "spegnere",
  "fuoco": "fuoco", "acceso": "accendere", "cuore": "cuore"
};

for (const [k, v] of Object.entries(manualOverridesC)) {
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
    console.log(`Remaining in Ch ${i}:`, missing.slice(0, 10));
    totalMissing += missing.length;
  } else {
    console.log(`🎉 Chapter ${i}: 100% PERFECT 0 MISSING!`);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

console.log('====================================');
console.log(`Total missing across Batch C: ${totalMissing}`);
