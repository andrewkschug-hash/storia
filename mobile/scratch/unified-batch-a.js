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

// Harvest all previous chapters 1-57
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

// Comprehensive Batch A overrides
const unifiedMap = {
  // Verbs
  "appariva": "apparire", "accolsero": "accogliere", "asciugando": "asciugare", "asciugò": "asciugare",
  "rivede": "rivedere", "sollevando": "sollevare", "tirò": "tirare", "ammise": "ammettere",
  "preparò": "preparare", "scorsero": "scorrere", "scorreva": "scorrere", "tamburellare": "tamburellare",
  "spendi": "spendere", "succede": "succedere", "sospirò": "sospirare", "raccontò": "raccontare",
  "accompagnava": "accompagnare", "accompagnate": "accompagnare", "comprando": "comprare", "comprate": "comprare",
  "opposta": "opporre", "distruggerebbe": "distruggere", "batté": "battere", "cominci": "cominciare",
  "diventi": "diventare", "diventava": "diventare", "muore": "morire", "competere": "competere",
  "riprese": "riprendere", "riguarda": "riguardare", "pensavi": "pensare", "pensò": "pensare",
  "bastasse": "bastare", "facesse": "fare", "farsi": "fare", "fatto": "fare", "assorbendo": "assorbire",
  "rinnovata": "rinnovare", "spiegò": "spiegare", "spiegavano": "spiegare", "tracciando": "tracciare",
  "tracciava": "tracciare", "correre": "correre", "dovrei": "dovere", "domandò": "domandare",
  "fossi": "essere", "fosse": "essere", "sarei": "essere", "sarebbero": "essere", "stati": "essere",
  "sia": "essere", "rispose": "rispondere", "toccherei": "toccare", "organizzerei": "organizzare",
  "ricordò": "ricordare", "propose": "proporre", "proposto": "proporre", "visualizzare": "visualizzare",
  "annuì": "annuire", "trasformarle": "trasformare", "trasformi": "trasformare", "trasformarsi": "trasformare",
  "trasformato": "trasformare", "sopravvive": "sopravvivere", "terminò": "terminare", "chiuse": "chiudere",
  "ringraziò": "ringraziare", "restituito": "restituire", "immersa": "immergere", "scaldarsi": "scaldare",
  "emettendo": "emettere", "impilate": "impilare", "raggiunse": "raggiungere", "ruppe": "rompere",
  "rompessero": "rompere", "fuoriuscì": "fuoriuscire", "riversò": "riversare", "bagnando": "bagnare",
  "minacciando": "minacciare", "colare": "colare", "mancavano": "mancare", "deludendo": "deludere",
  "travolgere": "travolgere", "imprecare": "imprecare", "chinò": "chinare", "spense": "spegnere",
  "consentire": "consentire", "diminuì": "diminuire", "spegnersi": "spegnere", "salendo": "salire",
  "saliva": "salire", "macchiasse": "macchiare", "diagnosticare": "diagnosticare", "illuminò": "illuminare",
  "sigillava": "sigillare", "spaccata": "spaccare", "avessi": "avere", "avrebbe": "avere",
  "conservava": "conservare", "seguendo": "seguire", "ceda": "cedere", "procurarsi": "procurarsi",
  "prevede": "prevedere", "estrasse": "estrarre", "indurita": "indurire", "indurito": "indurire",
  "deformata": "deformare", "pulì": "pulire", "rimuovere": "rimuovere", "carbonizzata": "carbonizzare",
  "muovevano": "muovere", "compromesso": "compromettere", "infilò": "infilare", "spingendola": "spingere",
  "riavvitò": "riavvitare", "verificò": "verificare", "segnava": "segnare", "riaprì": "riaprire",
  "riaccese": "riaccendere", "fermarsi": "fermare", "fermò": "fermare", "collaudare": "collaudare",
  "macinò": "macinare", "avviò": "avviare", "scese": "scendere", "formando": "formare",
  "risolto": "risolvere", "suonò": "suonare", "entrò": "entrare", "entrati": "entrare",
  "entravano": "entrare", "immaginare": "immaginare", "allagato": "allagare", "serviva": "servire",
  "serviamo": "servire", "accadessero": "accadere", "consisteva": "consistere", "sapendo": "sapere",
  "rimasero": "rimanere", "ridisegnare": "ridisegnare", "proiettavano": "proiettare", "esordì": "esordire",
  "continueremo": "continuare", "annotare": "annotare", "stabiliamo": "stabilire", "stabilirono": "stabilire",
  "spostare": "spostare", "testare": "testare", "avvicinarono": "avvicinare", "catturare": "catturare",
  "scendeva": "scendere", "aggiunsero": "aggiungere", "esporre": "esporre", "esposti": "esporre",
  "definirono": "definire", "garantendo": "garantire", "costringere": "costringere", "andarsene": "andarsene",
  "sedeva": "sedere", "separata": "separare", "attutiva": "attutire", "tenuto": "tenere",
  "uniamo": "unire", "rileggeva": "rileggere", "assaggeranno": "assaggiare", "vedranno": "vedere",
  "nascere": "nascere", "divisi": "dividere", "rappresentava": "rappresentare", "proteggerla": "proteggere",
  "renderla": "rendere", "traduceva": "tradurre", "modellata": "modellare", "modellava": "modellare",
  "regnava": "regnare", "interrotta": "interrompere", "sfogliate": "sfogliare", "controllato": "controllare",
  "giungeva": "giungere", "osservava": "osservare", "osservò": "osservare", "fuggire": "fuggire",
  "rispettava": "rispettare", "offriva": "offrire", "portando": "portare", "levigata": "levigare",
  "guardò": "guardare", "mormorò": "mormorare", "trovato": "trovare", "respira": "respirare",
  "sorridendo": "sorridere", "inaugurato": "inaugurare", "coperto": "coprire", "generato": "generare",
  "ripensare": "ripensare", "ripuliva": "ripulire", "brillava": "brillare", "superato": "superare",
  "annullare": "annullare", "sprecando": "sprecare", "isolare": "isolare", "sigillare": "sigillare",
  "spaccare": "spaccare", "illudere": "illudere",

  // Nouns / Adjectives / Adverbs
  "onesto": "onesto", "generazioni": "generazione", "totali": "totale", "esperti": "esperto",
  "condivisa": "condividere", "condivise": "condividere", "nodose": "nodoso", "sonni": "sonno",
  "severità": "severita", "praticamente": "praticamente", "fascia": "fascia", "vigore": "vigore",
  "diecimila": "diecimila", "prezzi": "prezzo", "romantica": "romantico", "avventura": "avventura",
  "umiltà": "umilta", "velocità": "velocita", "novanta": "novanta", "altrove": "altrove",
  "concretamente": "concretamente", "piuttosto": "piuttosto", "universitari": "universitario",
  "universitarie": "universitario", "professionisti": "professionista", "pregiate": "pregiato",
  "pomeridiani": "pomeridiano", "pomeridiana": "pomeridiano", "piantagioni": "piantagione",
  "interessati": "interessato", "visibile": "visibile", "approvazione": "approvazione", "vuote": "vuoto",
  "distintiva": "distintivo", "titolare": "titolare", "scopo": "scopo", "schietta": "schietto",
  "maestro": "maestro", "mentale": "mentale", "piazze": "piazza", "veloci": "veloce",
  "finestrino": "finestrino", "chiarezza": "chiarezza", "esigenze": "esigenza", "sostenibilità": "sostenibilita",
  "lavorativa": "lavorativo", "sostenuto": "sostenere", "geometrico": "geometrico", "stridente": "stridente",
  "bruscamente": "bruscamente", "sinistro": "sinistro", "mista": "misto", "interminabile": "interminabile",
  "petto": "petto", "impaziente": "impaziente", "abituali": "abituale", "inutilmente": "inutilmente",
  "cattiva": "cattivo", "sorte": "sorte", "pratici": "pratico", "fondamentale": "fondamentale",
  "fondamentali": "fondamentale", "irreparabile": "irreparabile", "progressivamente": "progressivamente",
  "volte": "volta", "soffitto": "soffitto", "prezioso": "prezioso", "caldissima": "caldo",
  "superficie": "superficie", "superfici": "superficie", "nemmeno": "nemmeno", "tasca": "tasca",
  "grembiule": "grembiule", "massiccio": "massiccio", "inequivocabile": "inequivocabile",
  "lateralmente": "lateralmente", "termica": "termico", "anello": "anello", "apparentemente": "apparentemente",
  "insignificante": "insignificante", "tenuta": "tenuta", "stagna": "stagno", "ideale": "ideale",
  "originali": "originale", "disperata": "disperato", "prudente": "prudente", "tirocinio": "tirocinio",
  "meccanico": "meccanico", "improvvisamente": "improvvisamente", "necessario": "necessario",
  "materiali": "materiale", "dolorosa": "doloroso", "interruzione": "interruzione", "delicatezza": "delicatezza",
  "pazienza": "pazienza", "frammenti": "frammento", "rame": "rame", "morbido": "morbido",
  "convulsa": "convulso", "allineamento": "allineamento", "inserimento": "inserimento",
  "irreparabilmente": "irreparabilmente", "fabbrica": "fabbrica", "flessibile": "flessibile",
  "scanalatura": "scanalatura", "aderenza": "aderenza", "elastica": "elastico", "attentamente": "attentamente",
  "disallineamenti": "disallineamento", "parete": "parete", "pareti": "parete", "restavano": "restare",
  "complessiva": "complessivo", "crescente": "crescente", "sordo": "sordo", "stabili": "stabile",
  "riparazione": "riparazione", "operative": "operativo", "reali": "reale", "porcellana": "porcellana",
  "fluido": "fluido", "crema": "crema", "compatta": "compatto", "dorati": "dorato",
  "freddezza": "freddezza", "esatte": "esatto", "esatti": "esatto", "squillante": "squillante",
  "lana": "lana", "remotamente": "remotamente", "ingenuamente": "ingenuamente", "prontezza": "prontezza",
  "compagne": "compagna", "silenziose": "silenzioso", "lampioni": "lampione", "storici": "storico",
  "ombre": "ombra", "calde": "caldo", "lontananza": "lontananza", "pianta": "pianta",
  "dettagliata": "dettagliato", "matite": "matita", "colorate": "colorato", "righello": "righello",
  "chiarificatrice": "chiarificatore", "tempestiva": "tempestivo", "difensiva": "difensivo",
  "costruzione": "costruzione", "futuro": "futuro", "future": "futuro", "differenziato": "differenziato",
  "presto": "presto", "rigore": "rigore", "rifugio": "rifugio", "senza": "senza", "intesa": "intesa",
  "profonda": "profondo", "patto": "patto", "operativo": "operativo", "visione": "visione",
  "regole": "regola", "chiare": "chiaro", "chiaro": "chiaro", "chiarissime": "chiaro",
  "corretta": "corretto", "suddivisione": "suddivisione", "comune": "comune", "comuni": "comune",
  "ceramica": "ceramica", "mobili": "mobile", "insieme": "insieme", "campo": "campo", "visiva": "visivo",
  "storiche": "storico", "lettura": "lettura", "prese": "presa", "protette": "protetto",
  "computer": "computer", "portatili": "portatile", "mensola": "mensola", "mensole": "mensola",
  "riviste": "rivista", "architettura": "architettura", "testi": "testo", "dedicati": "dedicato",
  "barriera": "barriera", "rigida": "rigido", "aperto": "aperto", "incontro": "incontro",
  "dialogo": "dialogo", "minimi": "minimo", "dettagli": "dettaglio", "oraria": "orario",
  "orari": "orario", "lavorazione": "lavorazione", "botanica": "botanico", "equo": "equo",
  "dignitoso": "dignitoso", "sorsi": "sorso", "lino": "lino", "rumori": "rumore",
  "modellazione": "modellazione", "due": "due", "energie": "energia", "competenze": "competenza",
  "bozza": "bozza", "allievi": "allievo", "pause": "pausa", "vivo": "vivo", "tazzine": "tazzina",
  "bevande": "bevanda", "nostre": "nostro", "amministrativa": "amministrativo", "energetiche": "energetico",
  "contemporaneamente": "contemporaneamente", "forno": "forno", "affatto": "affatto", "rinuncia": "rinuncia",
  "individuale": "individuale", "strumento": "strumento", "duratura": "duraturo", "primissima": "primo",
  "obliqua": "obliquo", "smaltati": "smaltare", "pietra": "pietra", "studentesse": "studentessa",
  "aperti": "aprire", "ricercatrice": "ricercatore", "manoscritto": "manoscritto", "cuffie": "cuffia",
  "orecchie": "orecchio", "ciascuna": "ciascuno", "regnava": "regnare", "rilassante": "rilassante",
  "produttiva": "produttivo", "fruscio": "fruscio", "sommesso": "sommesso", "gocciolio": "gocciolio",
  "cono": "cono", "lieve": "lieve", "ipnotico": "ipnotico", "tornio": "tornio", "serie": "serie",
  "ciotole": "ciotola", "intima": "intimo", "gratitudine": "gratitudine", "percorso": "percorso",
  "condanna": "condanna", "pulsante": "pulsante", "metropolitana": "metropolitana",
  "appartenere": "appartenere", "ritmi": "ritmo", "autentica": "autentico", "autentico": "autentico",
  "braccio": "braccio", "cornice": "cornice", "grezzo": "grezzo", "specchio": "specchio",
  "soglia": "soglia", "sorpresa": "sorpresa", "perfetta": "perfetto", "affanno": "affanno",
  "confusione": "confusione", "pressino": "pressino", "totale": "totale", "interiore": "interiore",
  "tetti": "tetto", "estrazione": "estrazione", "lenta": "lento", "tisane": "tisana",
  "biologiche": "biologico", "corso": "corso", "ampiamente": "ampiamente", "rispettabile": "rispettabile",
  "materia": "materia", "prima": "primo", "scadenti": "scadente", "intelligenza": "intelligenza",
  "accogliente": "accogliente", "ostacolo": "ostacolo", "successo": "successo", "risposta": "risposta",
  "verificata": "verificare", "vittoria": "vittoria", "definitiva": "definitivo", "prova": "prova",
  "tangibile": "tangibile", "equilibrio": "equilibrio", "continuo": "continuo", "rispetto": "rispetto",
  "reciproco": "reciproco", "casa": "casa", "mestiere": "mestiere", "panni": "panno",
  "panico": "panico", "insegnamenti": "insegnamento", "fonte": "fonte", "danni": "danno",
  "nuvola": "nuvola", "profumato": "profumare", "straccio": "straccio", "diagnosi": "diagnosi",
  "anello": "anello", "attrezzi": "attrezzo", "scorsa": "scorso", "situazione": "situazione",
  "piatta": "piatto", "sottili": "sottile", "preventiva": "preventivo", "impiegato": "impiegato",
  "uffici": "ufficio", "distinte": "distinto", "affinché": "affinche", "descrittive": "descrittivo",
  "tenda": "tenda", "manutenzioni": "manutenzione", "organizzazione": "organizzazione", "bisogni": "bisogno",
  "conversazione": "conversazione", "approvazione": "approvazione", "distintivo": "distintivo", 
  "distintiva": "distintivo", "maestro": "maestro", "restituito": "restituire", "mentale": "mentale",
  "chiarezza": "chiarezza", "esigenza": "esigenza", "esigenze": "esigenza",
  "eccellenza": "eccellenza", "l'eccellenza": "eccellenza", "sostenibilità": "sostenibilita",
  "ultime": "ultimo", "scaldarsi": "scaldare", "emettendo": "emettere",
  "causa": "causa", "conservava": "conservare", "procurarsi": "procurare",
  "interruzione": "interruzione", "deformata": "deformare", "rimuovere": "rimuovere",
  "carbonizzata": "carbonizzare", "riavvitò": "riavvitare", "attentamente": "attentamente",
  "metalliche": "metallico", "riaccese": "riaccendere", "sordo": "sordo",
  "perfetti": "perfetto", "impiegato": "impiegato", "allagato": "allagare",
  "misurati": "misurato", "d'azione": "azione", "orecchie": "orecchio", "compagne": "compagno",
  "modellata": "modellare", "modellava": "modellare", "generato": "generare",

  // Elisions / Clitics / Phrases
  "l'inquietudine": "inquietudine", "l'eccellenza": "eccellenza", "all'impazzata": "impazzata",
  "dell'usura": "usura", "mezz'ora": "mezzora", "nell'illudersi": "illudere", "d'azione": "azione",
  "d'arte": "arte", "d'esame": "esame", "ed": "e", "sui": "su", "dello": "in", "san": "san",
  "lorenzo": "lorenzo", "via": "via", "serpenti": "serpente", "spazio": "spazio", "monti": "monti",
  "termini": "termini", "nazionale": "nazionale", "roma": "roma", "italiana": "italiano",
  "bruno": "bruno", "luca": "luca", "claudia": "claudia", "marco": "marco", "teresa": "teresa"
};

for (const [k, v] of Object.entries(unifiedMap)) {
  empirical.set(k.toLowerCase(), v);
}

function alignChapterUnified(filePath, chId) {
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

  console.log(`Chapter ${chId} missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log(`Sample missing in ${chId}:`, missing.slice(0, 20));
  } else {
    console.log(`🎉 Chapter ${chId}: 100% PERFECT 0 MISSING!`);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

alignChapterUnified('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-58.json', '58');
alignChapterUnified('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-59.json', '59');
alignChapterUnified('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-60.json', '60');
