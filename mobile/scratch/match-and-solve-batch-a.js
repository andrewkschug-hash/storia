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

// Harvest core lemmas and inflections
const coreLemmaMap = new Map();
for (const e of core.lexicon) {
  coreLemmaMap.set(e.lemmaId.toLowerCase(), e.lemmaId);
  coreLemmaMap.set(e.italian.toLowerCase(), e.lemmaId);
  if (e.inflections) {
    for (const inf of e.inflections) {
      coreLemmaMap.set(inf.toLowerCase(), e.lemmaId);
    }
  }
}

// Add any missing base lemmas to core if they are completely missing
const newBaseLemmas = [
  { lemmaId: 'apparire', italian: 'apparire', english: 'to appear', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['apparire', 'appare', 'appariva', 'apparivano', 'apparve', 'apparso'] },
  { lemmaId: 'accogliere', italian: 'accogliere', english: 'to welcome / receive', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['accogliere', 'accoglie', 'accoglieva', 'accolse', 'accolsero', 'accolto'] },
  { lemmaId: 'sonno', italian: 'sonno', english: 'sleep', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['sonno', 'sonni'] },
  { lemmaId: 'spendere', italian: 'spendere', english: 'to spend (money)', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['spendere', 'spende', 'spendi', 'spendeva', 'speso'] },
  { lemmaId: 'succedere', italian: 'succedere', english: 'to happen / occur', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['succedere', 'succede', 'succedeva', 'successo'] },
  { lemmaId: 'inquietudine', italian: 'inquietudine', english: 'unease / restlessness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 3, frequency: 'medium', introducedChapter: 58, inflections: ['inquietudine'] },
  { lemmaId: 'praticamente', italian: 'praticamente', english: 'practically / virtually', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['praticamente'] },
  { lemmaId: 'fascia', italian: 'fascia', english: 'bracket / band / window (time)', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['fascia', 'fasce'] },
  { lemmaId: 'vigore', italian: 'vigore', english: 'vigor / energy', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['vigore'] },
  { lemmaId: 'diecimila', italian: 'diecimila', english: 'ten thousand', partOfSpeech: 'number', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['diecimila'] },
  { lemmaId: 'morire', italian: 'morire', english: 'to die', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['morire', 'muore', 'moriva', 'morto'] },
  { lemmaId: 'competere', italian: 'competere', english: 'to compete', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['competere', 'compete', 'competeva', 'competuto'] },
  { lemmaId: 'umilta', italian: 'umiltà', english: 'humility', partOfSpeech: 'noun', gender: 'feminine', difficulty: 3, frequency: 'medium', introducedChapter: 58, inflections: ['umiltà', 'umilta'] },
  { lemmaId: 'novanta', italian: 'novanta', english: 'ninety', partOfSpeech: 'number', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['novanta'] },
  { lemmaId: 'altrove', italian: 'altrove', english: 'elsewhere', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['altrove'] },
  { lemmaId: 'concretamente', italian: 'concretamente', english: 'concretely / practically', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['concretamente'] },
  { lemmaId: 'piantagione', italian: 'piantagione', english: 'plantation / farm', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['piantagione', 'piantagioni'] },
  { lemmaId: 'titolare', italian: 'titolare', english: 'owner / proprietor / titular', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['titolare', 'titolari'] },
  { lemmaId: 'schietto', italian: 'schietto', english: 'frank / outspoken / genuine', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 58, inflections: ['schietto', 'schietta', 'schietti', 'schiette'] },
  { lemmaId: 'piazza', italian: 'piazza', english: 'square / plaza', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['piazza', 'piazze'] },
  { lemmaId: 'finestrino', italian: 'finestrino', english: 'window (of train/bus)', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['finestrino', 'finestrini'] },
  { lemmaId: 'lavorativo', italian: 'lavorativo', english: 'working / work-related', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['lavorativo', 'lavorativa', 'lavorativi', 'lavorative'] },
  { lemmaId: 'geometrico', italian: 'geometrico', english: 'geometric', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['geometrico', 'geometrica', 'geometrici', 'geometriche'] },
  { lemmaId: 'interminabile', italian: 'interminabile', english: 'endless / interminable', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['interminabile', 'interminabili'] },
  { lemmaId: 'impaziente', italian: 'impaziente', english: 'impatient', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['impaziente', 'impazienti'] },
  { lemmaId: 'travolgere', italian: 'travolgere', english: 'to overwhelm / sweep away', partOfSpeech: 'verb', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['travolgere', 'travolge', 'travolgeva', 'travolto'] },
  { lemmaId: 'sorte', italian: 'sorte', english: 'fate / luck / destiny', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['sorte', 'sorti'] },
  { lemmaId: 'inequivocabile', italian: 'inequivocabile', english: 'unmistakable / unambiguous', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['inequivocabile', 'inequivocabili'] },
  { lemmaId: 'termico', italian: 'termico', english: 'thermal', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['termico', 'termica', 'termici', 'termiche'] },
  { lemmaId: 'originale', italian: 'originale', english: 'original / genuine', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['originale', 'originali'] },
  { lemmaId: 'tirocinio', italian: 'tirocinio', english: 'apprenticeship / internship', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['tirocinio', 'tirocini'] },
  { lemmaId: 'meccanico', italian: 'meccanico', english: 'mechanical', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['meccanico', 'meccanica', 'meccanici', 'meccaniche'] },
  { lemmaId: 'logoramento', italian: 'logoramento', english: 'wear and tear / attrition', partOfSpeech: 'noun', gender: 'masculine', difficulty: 3, frequency: 'low', introducedChapter: 59, inflections: ['logoramento'] },
  { lemmaId: 'inserimento', italian: 'inserimento', english: 'insertion / placement', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['inserimento'] },
  { lemmaId: 'fabbrica', italian: 'fabbrica', english: 'factory', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['fabbrica', 'fabbriche'] },
  { lemmaId: 'flessibile', italian: 'flessibile', english: 'flexible', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['flessibile', 'flessibili'] },
  { lemmaId: 'aderire', italian: 'aderire', english: 'to adhere / fit tightly', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['aderire', 'aderisce', 'aderiva', 'aderito'] },
  { lemmaId: 'elastico', italian: 'elastico', english: 'elastic / resilient', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['elastico', 'elastica', 'elastici', 'elastiche'] },
  { lemmaId: 'crescente', italian: 'crescente', english: 'increasing / growing', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['crescente', 'crescenti'] },
  { lemmaId: 'remotamente', italian: 'remotamente', english: 'remotely', partOfSpeech: 'adverb', difficulty: 3, frequency: 'low', introducedChapter: 59, inflections: ['remotamente'] },
  { lemmaId: 'ingenuamente', italian: 'ingenuamente', english: 'naively', partOfSpeech: 'adverb', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['ingenuamente'] },
  { lemmaId: 'prontezza', italian: 'prontezza', english: 'readiness / promptness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['prontezza'] },
  { lemmaId: 'differenziare', italian: 'differenziare', english: 'to differentiate / diversify', partOfSpeech: 'verb', difficulty: 3, frequency: 'medium', introducedChapter: 60, inflections: ['differenziare', 'differenzia', 'differenziava', 'differenziato', 'differenziata'] },
  { lemmaId: 'visivo', italian: 'visivo', english: 'visual', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['visivo', 'visiva', 'visivi', 'visive'] },
  { lemmaId: 'proteggere', italian: 'proteggere', english: 'to protect', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['proteggere', 'protegge', 'proteggeva', 'protetto', 'protetta', 'protetti'] },
  { lemmaId: 'architettura', italian: 'architettura', english: 'architecture', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['architettura', 'architetture'] },
  { lemmaId: 'botanico', italian: 'botanico', english: 'botanical', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 60, inflections: ['botanico', 'botanica', 'botanici', 'botaniche'] },
  { lemmaId: 'allievo', italian: 'allievo', english: 'student / pupil', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['allievo', 'allieva', 'allievi', 'allieve'] },
  { lemmaId: 'comunale', italian: 'comunale', english: 'communal / municipal', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['comunale', 'comunali'] },
  { lemmaId: 'esame', italian: 'esame', english: 'exam / examination', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['esame', 'esami'] },
  { lemmaId: 'tradurre', italian: 'tradurre', english: 'to translate', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['tradurre', 'traduce', 'traduceva', 'tradotto', 'tradotta'] },
  { lemmaId: 'sommesso', italian: 'sommesso', english: 'subdued / quiet', partOfSpeech: 'adjective', difficulty: 3, frequency: 'low', introducedChapter: 60, inflections: ['sommesso', 'sommessa', 'sommessi', 'sommesse'] },
  { lemmaId: 'tornare', italian: 'tornare', english: 'to return', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['tornare', 'torna', 'tornava', 'tornato', 'tornò'] },
  { lemmaId: 'tangibile', italian: 'tangibile', english: 'tangible', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 60, inflections: ['tangibile', 'tangibili'] },
];

for (const entry of newBaseLemmas) {
  if (!core.lexicon.some((e) => e.lemmaId === entry.lemmaId)) {
    core.lexicon.push(entry);
  }
}
fs.writeFileSync(corePath, JSON.stringify(core, null, 2), 'utf8');

// Build master empirical mapping
const updatedCore = JSON.parse(fs.readFileSync(corePath, 'utf8'));
const coreSet = new Set(updatedCore.lexicon.map((e) => e.lemmaId));
const empirical = new Map();

for (const e of updatedCore.lexicon) {
  empirical.set(e.lemmaId.toLowerCase(), e.lemmaId);
  empirical.set(e.italian.toLowerCase(), e.lemmaId);
  if (e.inflections) {
    for (const inf of e.inflections) {
      empirical.set(inf.toLowerCase(), e.lemmaId);
    }
  }
}

// Harvest all previous chapters
for (let i = 1; i <= 57; i++) {
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

// Master Batch A word-to-lemma dictionary
const masterBatchAMap = {
  "appariva": "apparire", "accolsero": "accogliere", "asciugando": "asciugare",
  "rivede": "rivedere", "sollevando": "sollevare", "tirò": "tirare", "onesto": "onesto",
  "generazioni": "generazione", "ammise": "ammettere", "preparò": "preparare", "totali": "totale",
  "esperti": "esperto", "scorsero": "scorrere", "condivisa": "condividere", "tamburellare": "tamburellare",
  "nodose": "nodoso", "sonni": "sonno", "severità": "severita", "spendi": "spendere",
  "succede": "succedere", "sospirò": "sospirare", "raccontò": "raccontare", "l'inquietudine": "inquietudine",
  "accompagnava": "accompagnare", "praticamente": "praticamente", "fascia": "fascia", "comprando": "comprare",
  "opposta": "opporre", "distruggerebbe": "distruggere", "vigore": "vigore", "batté": "battere",
  "cominci": "cominciare", "diventi": "diventare", "diecimila": "diecimila", "muore": "morire",
  "competere": "competere", "prezzi": "prezzo", "riprese": "riprendere", "riguarda": "riguardare",
  "romantica": "romantico", "avventura": "avventura", "pensavi": "pensare", "bastasse": "bastare",
  "facesse": "fare", "assorbendo": "assorbire", "umiltà": "umilta", "rinnovata": "rinnovare",
  "velocità": "velocita", "spiegò": "spiegare", "tracciando": "tracciare", "novanta": "novanta",
  "correre": "correre", "altrove": "altrove", "dovrei": "dovere", "concretamente": "concretamente",
  "domandò": "domandare", "fossi": "essere", "rispose": "rispondere", "toccherei": "toccare",
  "piuttosto": "piuttosto", "organizzerei": "organizzare", "universitari": "universitario", "professionisti": "professionista",
  "ricordò": "ricordare", "pregiate": "pregiato", "propose": "proporre", "visualizzare": "visualizzare",
  "organizzazione": "organizzazione", "pomeridiani": "pomeridiano", "piantagioni": "piantagione", "interessati": "interessato",
  "annuì": "annuire", "visibile": "visibile", "approvazione": "approvazione", "vuote": "vuoto",
  "trasformarle": "trasformare", "distintiva": "distintivo", "sopravvive": "sopravvivere", "titolare": "titolare",
  "scopo": "scopo", "terminò": "terminare", "chiuse": "chiudere", "ringraziò": "ringraziare",
  "conversazione": "conversazione", "schietta": "schietto", "maestro": "maestro", "restituito": "restituire",
  "mentale": "mentale", "piazze": "piazza", "veloci": "veloce", "finestrino": "finestrino",
  "chiarezza": "chiarezza", "esigenze": "esigenza", "l'eccellenza": "eccellenza", "sostenibilità": "sostenibilita",
  "immersa": "immergere", "ultime": "ultimo", "scaldarsi": "scaldare", "emettendo": "emettere",
  "lavorativa": "lavorativo", "sostenuto": "sostenere", "impilate": "impilare", "geometrico": "geometrico",
  "stridente": "stridente", "ruppe": "rompere", "bruscamente": "bruscamente", "fuoriuscì": "fuoriuscire",
  "mista": "misto", "riversò": "riversare", "bagnando": "bagnare", "minacciando": "minacciare",
  "colare": "colare", "interminabile": "interminabile", "petto": "petto", "mancavano": "mancare",
  "impaziente": "impaziente", "abituali": "abituale", "fosse": "essere", "deludendo": "deludere",
  "farsi": "fare", "travolgere": "travolgere", "imprecare": "imprecare", "inutilmente": "inutilmente",
  "cattiva": "cattivo", "sorte": "sorte", "pratici": "pratico", "fondamentale": "fondamentale",
  "irreparabile": "irreparabile", "chinò": "chinare", "consentire": "consentire", "diminuì": "diminuire",
  "progressivamente": "progressivamente", "spegnersi": "spegnere", "volte": "volta", "soffitto": "soffitto",
  "prezioso": "prezioso", "caldissima": "caldo", "macchiasse": "macchiare", "superficie": "superficie",
  "diagnosticare": "diagnosticare", "nemmeno": "nemmeno", "tasca": "tasca", "grembiule": "grembiule",
  "massiccio": "massiccio", "inequivocabile": "inequivocabile", "spaccata": "spaccare", "lateralmente": "lateralmente",
  "termica": "termico", "anello": "anello", "apparentemente": "apparentemente", "insignificante": "insignificante",
  "tenuta": "tenuta", "stagna": "stagno", "ideale": "ideale", "fatto": "fare",
  "originali": "originale", "sarei": "essere", "disperata": "disperato", "conservava": "conservare",
  "prudente": "prudente", "tirocinio": "tirocinio", "meccanico": "meccanico", "ceda": "cedere",
  "improvvisamente": "improvvisamente", "procurarsi": "procurarsi", "necessario": "necessario", "materiali": "materiale",
  "trasformi": "trasformare", "dolorosa": "doloroso", "interruzione": "interruzione", "delicatezza": "delicatezza",
  "pazienza": "pazienza", "frammenti": "frammento", "indurita": "indurire", "deformata": "deformare",
  "spazzolino": "spazzolino", "rame": "rame", "morbido": "morbido", "rimuovere": "rimuovere",
  "muovevano": "muovere", "convulsa": "convulso", "allineamento": "allineamento", "inserimento": "inserimento",
  "compromesso": "compromettere", "irreparabilmente": "irreparabilmente", "fabbrica": "fabbrica", "infilò": "infilare",
  "flessibile": "flessibile", "scanalatura": "scanalatura", "spingendola": "spingere", "aderenza": "aderenza",
  "elastica": "elastico", "riavvitò": "riavvitare", "attentamente": "attentamente", "disallineamenti": "disallineamento",
  "superfici": "superficie", "parete": "parete", "restavano": "restare", "riaprì": "riaprire",
  "riaccese": "riaccendere", "complessiva": "complessivo", "crescente": "crescente", "sordo": "sordo",
  "stabili": "stabile", "collaudare": "collaudare", "riparazione": "riparazione", "operative": "operativo",
  "reali": "reale", "avviò": "avviare", "porcellana": "porcellana", "scese": "scendere",
  "fluido": "fluido", "crema": "crema", "compatta": "compatto", "dorati": "dorato",
  "freddezza": "freddezza", "esatte": "esatto", "squillante": "squillante", "entrò": "entrare",
  "lana": "lana", "remotamente": "remotamente", "immaginare": "immaginare", "entrati": "entrare",
  "allagato": "allagare", "ingenuamente": "ingenuamente", "rompessero": "rompere", "accadessero": "accadere",
  "consisteva": "consistere", "prontezza": "prontezza", "d'azione": "azione", "compagne": "compagna",
  "silenziose": "silenzioso", "ridisegnare": "ridisegnare", "complessiva": "complessivo", "lampioni": "lampione",
  "storici": "storico", "proiettavano": "proiettare", "ombre": "ombra", "calde": "caldo",
  "pareti": "parete", "scorreva": "scorrere", "lontananza": "lontananza", "pianta": "pianta",
  "dettagliata": "dettagliato", "disegnata": "disegnato", "matite": "matita", "colorate": "colorato",
  "righello": "righello", "chiarificatrice": "chiarificatore", "tempestiva": "tempestivo", "difensiva": "difensivo",
  "costruzione": "costruzione", "futuro": "futuro", "esordì": "esordire", "differenziato": "differenziato",
  "presto": "presto", "continueremo": "continuare", "rigore": "rigore", "trasformarsi": "trasformare",
  "rifugio": "rifugio", "senza": "senza", "intesa": "intesa", "profonda": "profondo",
  "patto": "patto", "operativo": "operativo", "visione": "visione", "stabiliamo": "stabilire",
  "regole": "regola", "chiare": "chiaro", "corretta": "corretto", "suddivisione": "suddivisione",
  "comune": "comune", "ceramica": "ceramica", "spostare": "spostare", "mobili": "mobile",
  "insieme": "insieme", "campo": "campo", "visiva": "visivo", "avvicinarono": "avvicinare",
  "catturare": "catturare", "scendeva": "scendere", "storiche": "storico", "aggiunsero": "aggiungere",
  "lettura": "lettura", "prese": "presa", "protette": "protetto", "computer": "computer",
  "portatili": "portatile", "mensola": "mensola", "chiaro": "chiaro", "esporre": "esporre",
  "riviste": "rivista", "d'arte": "arte", "architettura": "architettura", "testi": "testo",
  "dedicati": "dedicato", "barriera": "barriera", "rigida": "rigido", "diventava": "diventare",
  "aperto": "aperto", "incontro": "incontro", "dialogo": "dialogo", "definirono": "definire",
  "minimi": "minimo", "dettagli": "dettaglio", "oraria": "orario", "pomeridiana": "pomeridiano",
  "proporrebbe": "proporre", "proporrebbe": "proporre", "avrebbe": "avere", "proposto": "proporre",
  "spiegavano": "spiegare", "lavorazione": "lavorazione", "botanica": "botanico", "equo": "equo",
  "durava": "durare", "garantendo": "garantire", "costringere": "costringere", "andarsene": "andarsene",
  "sorsi": "sorso", "separata": "separato", "tenda": "tenda", "lino": "lino",
  "attutiva": "attutire", "rumori": "rumore", "avrebbe": "avere", "tenuto": "tenere",
  "modellazione": "modellazione", "due": "due", "energie": "energia", "competenze": "competenza",
  "osservò": "osservare", "bozza": "bozza", "allievi": "allievo", "assaggeranno": "assaggiare",
  "pause": "pausa", "vedranno": "vedere", "nascere": "nascere", "vivo": "vivo",
  "tazzine": "tazzina", "serviamo": "servire", "bevande": "bevanda", "nostre": "nostro",
  "stabilirono": "stabilire", "chiarissime": "chiaro", "amministrativa": "amministrativo", "condivise": "condividere",
  "sarebbero": "essere", "stati": "essere", "divisi": "dividere", "contemporaneamente": "contemporaneamente",
  "forno": "forno", "rappresentava": "rappresentare", "affatto": "affatto", "rinuncia": "rinuncia",
  "individuale": "individuale", "strumento": "strumento", "proteggerla": "proteggere", "renderla": "rendere",
  "duratura": "duraturo", "primissima": "primo", "obliqua": "obliquo", "smaltati": "smaltare",
  "esposti": "esporre", "pietra": "pietra", "studentesse": "studentessa", "d'esame": "esame",
  "aperti": "aprire", "ricercatrice": "ricercatore", "traduceva": "tradurre", "manoscritto": "manoscritto",
  "cuffie": "cuffia", "orecchie": "orecchio", "ciascuna": "ciascuno", "modellata": "modellare",
  "regnava": "regnare", "rilassante": "rilassante", "produttiva": "produttivo", "interrotta": "interrompere",
  "fruscio": "fruscio", "sommesso": "sommesso", "sfogliate": "sfogliare", "gocciolio": "gocciolio",
  "controllato": "controllare", "cono": "cono", "giungeva": "giungere", "lieve": "lieve",
  "ipnotico": "ipnotico", "tornio": "tornio", "modellava": "modellare", "serie": "serie",
  "ciotole": "ciotola", "osservava": "osservare", "intima": "intimo", "gratitudine": "gratitudine",
  "percorso": "percorso", "fatto": "fare", "condanna": "condanna", "pulsante": "pulsante",
  "entravano": "entrare", "fuggire": "fuggire", "metropolitana": "metropolitana", "appartenere": "appartenere",
  "rispettava": "rispettare", "ritmi": "ritmo", "offriva": "offrire", "autentica": "autentico",
  "portando": "portare", "braccio": "braccio", "cornice": "cornice", "grezzo": "grezzo",
  "levigata": "levigare", "specchio": "specchio", "fermò": "fermare", "soglia": "soglia",
  "guardò": "guardare", "sorpresa": "sorpresa", "mormorò": "mormorare", "trovato": "trovare",
  "perfetta": "perfetto", "viva": "vivo", "respira": "respirare", "affanno": "affanno",
  "confusione": "confusione", "pressino": "pressino", "sorridendo": "sorridere", "totale": "totale",
  "interiore": "interiore", "inaugurato": "inaugurare", "tetti": "tetto", "tallò": "tallare",
  "caramelle": "caramella", "estrazione": "estrazione", "lenta": "lento", "tisane": "tisana",
  "biologiche": "biologico", "corso": "corso", "coperto": "coprire", "ampiamente": "ampiamente",
  "generato": "generare", "rispettabile": "rispettabile", "materia": "materia", "prima": "primo",
  "scadenti": "scadente", "ripensare": "ripensare", "intelligenza": "intelligenza", "ripuliva": "ripulire",
  "brillava": "brillare", "accogliente": "accogliente", "ostacolo": "ostacolo", "superato": "superare",
  "successo": "successo", "risposta": "risposta", "verificata": "verificare", "condivisa": "condividere",
  "vittoria": "vittoria", "definitiva": "definitivo", "prova": "prova", "tangibile": "tangibile",
  "equilibrio": "equilibrio", "dialogo": "dialogo", "continuo": "continuo", "rispetto": "rispetto",
  "reciproco": "reciproco", "casa": "casa", "autentica": "autentico", "mestiere": "mestiere"
};

for (const [k, v] of Object.entries(masterBatchAMap)) {
  empirical.set(k.toLowerCase(), v);
}

// Function to align and write chapter
function alignChapter(filePath, chapterId) {
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

  console.log(`Chapter ${chapterId} missing tokens:`, missing.length);
  if (missing.length > 0) {
    console.log(`Sample missing in ${chapterId}:`, missing);
  } else {
    console.log(`Chapter ${chapterId}: 100% PERFECT 0 missing!`);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

alignChapter('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-58.json', '58');
alignChapter('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-59.json', '59');
alignChapter('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-60.json', '60');
