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

// Additional lemmas to make sure everything exists in core
const batchAExtra = [
  { lemmaId: 'approfittare', italian: 'approfittare', english: 'to take advantage of / make use of', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['approfittare', 'approfitta', 'approfittava', 'approfittando', 'approfittato'] },
  { lemmaId: 'schiarire', italian: 'schiarire', english: 'to clear up / brighten', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['schiarire', 'schiarisce', 'schiariva', 'schiarendo', 'schiarito', 'schiarirsi'] },
  { lemmaId: 'strofinaccio', italian: 'strofinaccio', english: 'dishcloth / tea towel', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['strofinaccio', 'strofinacci'] },
  { lemmaId: 'decente', italian: 'decente', english: 'decent', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['decente', 'decenti'] },
  { lemmaId: 'franchezza', italian: 'franchezza', english: 'frankness / candor', partOfSpeech: 'noun', gender: 'feminine', difficulty: 3, frequency: 'medium', introducedChapter: 58, inflections: ['franchezza'] },
  { lemmaId: 'disinteressato', italian: 'disinteressato', english: 'unbiased / selfless', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 58, inflections: ['disinteressato', 'disinteressata', 'disinteressati', 'disinteressate'] },
  { lemmaId: 'riassuntivo', italian: 'riassuntivo', english: 'summary / summarizing', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 58, inflections: ['riassuntivo', 'riassuntiva', 'riassuntivi', 'riassuntive'] },
  { lemmaId: 'spicciolo', italian: 'spicciolo', english: 'small change / pennies', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['spicciolo', 'spiccioli'] },
  { lemmaId: 'soffocare', italian: 'soffocare', english: 'to suffocate / choke', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['soffocare', 'soffoca', 'soffocava', 'soffocato'] },
  { lemmaId: 'industriale', italian: 'industriale', english: 'industrial', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['industriale', 'industriali'] },
  { lemmaId: 'pedagogico', italian: 'pedagogico', english: 'pedagogical / educational', partOfSpeech: 'adjective', difficulty: 3, frequency: 'low', introducedChapter: 58, inflections: ['pedagogico', 'pedagogica', 'pedagogici', 'pedagogiche'] },
  { lemmaId: 'ministero', italian: 'ministero', english: 'ministry (government)', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['ministero', 'ministeri'] },
  { lemmaId: 'frastuono', italian: 'frastuono', english: 'clamor / din / noise', partOfSpeech: 'noun', gender: 'masculine', difficulty: 3, frequency: 'medium', introducedChapter: 58, inflections: ['frastuono'] },
  { lemmaId: 'sfinimento', italian: 'sfinimento', english: 'exhaustion', partOfSpeech: 'noun', gender: 'masculine', difficulty: 3, frequency: 'low', introducedChapter: 58, inflections: ['sfinimento'] },
  { lemmaId: 'tormentare', italian: 'tormentare', english: 'to torment / plague', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['tormentare', 'tormenta', 'tormentava', 'tormentato'] },
  { lemmaId: 'pungente', italian: 'pungente', english: 'sharp / biting (cold)', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['pungente', 'pungenti'] },
  { lemmaId: 'stridente', italian: 'stridente', english: 'screeching / shrill', partOfSpeech: 'adjective', difficulty: 3, frequency: 'low', introducedChapter: 59, inflections: ['stridente', 'stridenti'] },
  { lemmaId: 'raccordo', italian: 'raccordo', english: 'fitting / connection / pipe joint', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['raccordo', 'raccordi'] },
  { lemmaId: 'peto', italian: 'petto', english: 'chest', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['petto', 'petti'] },
  { lemmaId: 'petto', italian: 'petto', english: 'chest', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['petto', 'petti'] },
  { lemmaId: 'imprecare', italian: 'imprecare', english: 'to curse / swear', partOfSpeech: 'verb', difficulty: 3, frequency: 'low', introducedChapter: 59, inflections: ['imprecare', 'impreca', 'imprecava', 'imprecato'] },
  { lemmaId: 'irreparabile', italian: 'irreparabile', english: 'irreparable', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['irreparabile', 'irreparabili'] },
  { lemmaId: 'disperato', italian: 'disperato', english: 'desperate', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['disperato', 'disperata', 'disperati', 'disperate'] },
  { lemmaId: 'cedere', italian: 'cedere', english: 'to give way / fail / yield', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['cedere', 'cede', 'cedeva', 'cedette', 'ceduto'] },
  { lemmaId: 'becco', italian: 'becco', english: 'beak / needle nose', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['becco', 'becchi'] },
  { lemmaId: 'aderenza', italian: 'aderenza', english: 'adhesion / grip / fit', partOfSpeech: 'noun', gender: 'feminine', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['aderenza', 'aderenze'] },
  { lemmaId: 'disallineamento', italian: 'disallineamento', english: 'misalignment', partOfSpeech: 'noun', gender: 'masculine', difficulty: 3, frequency: 'low', introducedChapter: 59, inflections: ['disallineamento', 'disallineamenti'] },
  { lemmaId: 'freddezza', italian: 'freddezza', english: 'coolness / cool-headedness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['freddezza'] },
  { lemmaId: 'squillante', italian: 'squillante', english: 'ringing / clear-sounding', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['squillante', 'squillanti'] },
  { lemmaId: 'lana', italian: 'lana', english: 'wool', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['lana'] },
  { lemmaId: 'proiettare', italian: 'proiettare', english: 'to cast / project', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['proiettare', 'proietta', 'proiettava', 'proiettavano', 'proiettato'] },
  { lemmaId: 'esordire', italian: 'esordire', english: 'to begin speaking / open', partOfSpeech: 'verb', difficulty: 3, frequency: 'medium', introducedChapter: 60, inflections: ['esordire', 'esordisce', 'esordì', 'esordiva', 'esordito'] },
  { lemmaId: 'trasparente', italian: 'trasparente', english: 'transparent / clear', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['trasparente', 'trasparenti'] },
  { lemmaId: 'sorso', italian: 'sorso', english: 'sip', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['sorso', 'sorsi'] },
  { lemmaId: 'attutire', italian: 'attutire', english: 'to dampen / muffle', partOfSpeech: 'verb', difficulty: 3, frequency: 'low', introducedChapter: 60, inflections: ['attutire', 'attutisce', 'attutiva', 'attutito'] },
  { lemmaId: 'bozza', italian: 'bozza', english: 'draft', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['bozza', 'bozze'] },
  { lemmaId: 'individuale', italian: 'individuale', english: 'individual / personal', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['individuale', 'individuali'] },
  { lemmaId: 'manoscritto', italian: 'manoscritto', english: 'manuscript', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['manoscritto', 'manoscritti'] },
  { lemmaId: 'cuffia', italian: 'cuffia', english: 'headphone / cap', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['cuffia', 'cuffie'] },
  { lemmaId: 'sfogliare', italian: 'sfogliare', english: 'to flip through / leaf through', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['sfogliare', 'sfoglia', 'sfogliava', 'sfogliato', 'sfogliata', 'sfogliati', 'sfogliate'] },
  { lemmaId: 'verificare', italian: 'verificare', english: 'to verify / check', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['verificare', 'verifica', 'verificava', 'verificato', 'verificata'] },
];

for (const entry of batchAExtra) {
  if (!core.lexicon.some((e) => e.lemmaId === entry.lemmaId)) {
    core.lexicon.push(entry);
    console.log('Added extra:', entry.lemmaId);
  }
}

fs.writeFileSync(corePath, JSON.stringify(core, null, 2), 'utf8');

// Build complete dictionary
const updatedCore = JSON.parse(fs.readFileSync(corePath, 'utf8'));
const coreLemmaSet = new Set(updatedCore.lexicon.map((e) => e.lemmaId));
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

// Complete surface overrides for B1+ Batch A
const batchAOverrides = {
  // Verbs
  "prese": "prendere", "appariva": "apparire", "spinse": "spingere", "accolsero": "accogliere",
  "asciugando": "asciugare", "rivede": "rivedere", "tirò": "tirare", "ammise": "ammettere",
  "scorsero": "scorrere", "tamburellare": "tamburellare", "sospirò": "sospirare",
  "raccontò": "raccontare", "opposta": "opporre", "batté": "battere", "muore": "morire",
  "tracciando": "tracciare", "domandò": "domandare", "rispose": "rispondere",
  "organizzerei": "organizzare", "propose": "proporre", "annuì": "annuire",
  "posando": "posare", "mancava": "mancare", "trasformi": "trasformare", "terminò": "terminare",
  "ringraziò": "ringraziare", "tormentava": "tormentare", "dissolto": "dissolvere",
  "restituito": "restituire", "saliva": "salire", "scaldarsi": "scaldare",
  "emettendo": "emettere", "segnava": "segnare", "raggiunse": "raggiungere",
  "ruppe": "rompere", "fuoriuscì": "fuoriuscire", "riversò": "riversare", "bagnando": "bagnare",
  "minacciando": "minacciare", "colare": "colare", "imprecare": "imprecare",
  "chinò": "chinare", "chiuse": "chiudere", "diminuì": "diminuire", "spegnersi": "spegnere",
  "salendo": "salire", "asciugò": "asciugare", "macchiasse": "macchiare", "spaccata": "spaccare",
  "sigillava": "sigillare", "conservava": "conservare", "ceda": "cedere", "estrasse": "estrarre",
  "indurita": "indurire", "deformata": "deformare", "pulì": "pulire", "infilò": "infilare",
  "spingendola": "spingere", "riavvitò": "riavvitare", "riaprì": "riaprire", "riaccese": "riaccendere",
  "fermandosi": "fermare", "macinò": "macinare", "avviò": "avviare", "scese": "scendere",
  "risolto": "risolvere", "allagato": "allagare", "serviva": "servire", "rompessero": "rompere",
  "accadessero": "accadere", "rimasero": "rimanere", "ridisegnare": "ridisegnare",
  "proiettavano": "proiettare", "scorreva": "scorrere", "esordì": "esordire", "annotare": "annotare",
  "tracciava": "tracciare", "stabiliamo": "stabilire", "spostare": "spostare", "avvicinarono": "avvicinare",
  "catturare": "catturare", "aggiunsero": "aggiungere", "esporre": "esporre", "spiegavano": "spiegare",
  "durava": "durare", "costringere": "costringere", "andarsene": "andarsene", "tenuto": "tenere",
  "tenesse": "tenere", "tenne": "tenere", "uniamo": "unire", "osservò": "osservare", "rileggeva": "rileggere",
  "vedranno": "vedere", "assaggeranno": "assaggiare", "nascono": "nascere", "stabilirono": "stabilire",
  "creando": "creare", "rappresentava": "rappresentare", "entravano": "entrare", "sfogliate": "sfogliare",
  "giungeva": "giungere", "modellava": "modellare", "osservava": "osservare", "fuggire": "fuggire",
  "levigata": "levigare", "tallò": "tallare", "coperto": "coprire", "ripuliva": "ripulire",
  "superato": "superare", "trovato": "trovare", "diventare": "diventare",

  // Nouns / Adjectives / Others
  "vetri": "vetro", "tazzine": "tazzina", "orario": "orario", "consueta": "consueto",
  "disordinato": "disordinato", "metallico": "metallico", "chiarificatrice": "chiarificatore",
  "paterna": "paterno", "inquieta": "inquieto", "deserto": "deserto", "scadente": "scadente",
  "spiccioli": "spicciolo", "pedagogico": "pedagogico", "pomeridiana": "pomeridiano",
  "ininterrotta": "ininterrotto", "caldaia": "caldaia", "gruppo": "gruppo", "tubo": "tubo",
  "manometro": "manometro", "guarnizione": "guarnizione", "ricambio": "ricambio",
  "valvola": "valvola", "chiave": "chiave", "attrezzi": "attrezzo", "cacciavite": "cacciavite",
  "pinza": "pinza", "spazzolino": "spazzolino", "piantina": "piantina", "righello": "righello",
  "lino": "lino", "ciotola": "ciotola", "tornio": "tornio", "cornice": "cornice", "specchio": "specchio",
  "cuffie": "cuffia", "manoscritto": "manoscritto", "mensola": "mensola", "caraffa": "caraffa",
  "scheda": "scheda", "raccolto": "raccolto", "lampioni": "lampione", "pareti": "parete",
  "tessuto": "tessuto", "lontananza": "lontananza", "autunnale": "autunnale",
  "d'acciaio": "acciaio", "d'argilla": "argilla", "d'oro": "oro", "d'ottone": "ottone",
  "d'ingresso": "ingresso", "dell'energia": "energia", "d'erogazione": "erogazione",
  "all'impazzata": "impazzata", "all'apertura": "apertura", "all'inizio": "inizio",
  "dall'ansia": "ansia", "dall'alto": "alto", "dall'inizio": "inizio",
  "nell'aria": "aria", "sull'autobus": "autobus", "sull'ultimo": "ultimo",
  "un'abitudine": "abitudine", "un'accoglienza": "accoglienza", "un'emergenza": "emergenza",
  "un'illusione": "illusione", "un'ombra": "ombra", "un'anima": "anima", "un'ora": "ora",
  "l'orologio": "orologio", "l'inchiostro": "inchiostro", "l'uscita": "uscita",
  "l'entrata": "entrata", "l'aria": "aria", "l'idea": "idea", "l'identità": "identita",
  "l'equilibrio": "equilibrio", "l'accordo": "accordo", "l'errore": "errore",
  "l'origine": "origine", "l'imprevisto": "imprevisto", "l'incertezza": "incertezza",
  "l'efficienza": "efficienza", "l'entusiasmo": "entusiasmo", "l'attività": "attivita",
  "l'argilla": "argilla", "l'autonomia": "autonomia", "l'autunno": "autunno",
  "l'impiegato": "impiegato", "l'odore": "odore", "l'umidità": "umidita",
  "l'espresso": "espresso", "l'ultimo": "ultimo", "l'unica": "unico",
  "l'interruttore": "interruttore", "ed": "e", "sui": "su", "dello": "in",
  "fece": "fare", "fissi": "fisso", "prime": "primo", "verde": "verde",
  "destra": "destra", "san": "san", "lorenzo": "lorenzo", "via": "via",
  "serpenti": "serpente", "spazio": "spazio", "monti": "monti", "termini": "termini",
  "nazionale": "nazionale", "roma": "roma", "italiana": "italiano", "bruno": "bruno",
  "luca": "luca", "claudia": "claudia", "marco": "marco", "teresa": "teresa",
  "l'uno": "uno", "all'altra": "altro", "l'acqua": "acqua", "dell'acqua": "acqua",
  "dell'alba": "alba", "dall'alba": "alba"
};

for (const [k, v] of Object.entries(batchAOverrides)) {
  empirical.set(k.toLowerCase(), v);
}

// Function to process and write a chapter
function processChapter(filePath, chapterId) {
  const ch = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let missing = [];

  for (const para of ch.paragraphs) {
    for (const s of para.sentences) {
      const tokens = tokenizeItalian(s.text);
      s.lemmas = tokens.map((t) => {
        const lower = t.surface.toLowerCase();
        let lem = empirical.get(lower);
        if (!lem) {
          if (lower.startsWith("l'") || lower.startsWith("l’")) {
            lem = empirical.get(lower.slice(2));
          } else if (lower.startsWith("un'") || lower.startsWith("un’")) {
            lem = empirical.get(lower.slice(3));
          } else if (lower.startsWith("d'") || lower.startsWith("d’")) {
            lem = empirical.get(lower.slice(2));
          } else if (lower.startsWith("dell'") || lower.startsWith("dell’")) {
            lem = empirical.get(lower.slice(5));
          } else if (lower.startsWith("all'") || lower.startsWith("all’")) {
            lem = empirical.get(lower.slice(4));
          } else if (lower.startsWith("dall'") || lower.startsWith("dall’")) {
            lem = empirical.get(lower.slice(5));
          } else if (lower.startsWith("nell'") || lower.startsWith("nell’")) {
            lem = empirical.get(lower.slice(5));
          } else if (lower.startsWith("sull'") || lower.startsWith("sull’")) {
            lem = empirical.get(lower.slice(5));
          }
        }
        if (!lem) lem = lower;
        if (!coreLemmaSet.has(lem)) {
          missing.push({ surface: t.surface, lemma: lem, sentence: s.id });
        }
        return lem;
      });
    }
  }

  console.log(`Chapter ${chapterId} missing tokens:`, missing.length);
  if (missing.length > 0) {
    console.log(`Sample missing in ${chapterId}:`, missing.slice(0, 15));
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
  return missing;
}

const m58 = processChapter('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-58.json', '58');
const m59 = processChapter('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-59.json', '59');
const m60 = processChapter('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-60.json', '60');
