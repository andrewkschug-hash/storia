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

const finalMissingLemmas = [
  { lemmaId: 'annullare', italian: 'annullare', english: 'to cancel', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['annullare', 'annulla', 'annullava', 'annullato'] },
  { lemmaId: 'panico', italian: 'panico', english: 'panic', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['panico'] },
  { lemmaId: 'insegnamento', italian: 'insegnamento', english: 'teaching / lesson', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['insegnamento', 'insegnamenti'] },
  { lemmaId: 'isolare', italian: 'isolare', english: 'to isolate', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['isolare', 'isola', 'isolava', 'isolato'] },
  { lemmaId: 'fonte', italian: 'fonte', english: 'source / spring', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['fonte', 'fonti'] },
  { lemmaId: 'danno', italian: 'danno', english: 'damage / harm', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['danno', 'danni'] },
  { lemmaId: 'nuvola', italian: 'nuvola', english: 'cloud', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['nuvola', 'nuvole'] },
  { lemmaId: 'straccio', italian: 'straccio', english: 'rag / cloth', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['straccio', 'stracci'] },
  { lemmaId: 'diagnosi', italian: 'diagnosi', english: 'diagnosis', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['diagnosi'] },
  { lemmaId: 'sigillare', italian: 'sigillare', english: 'to seal', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['sigillare', 'sigilla', 'sigillava', 'sigillato'] },
  { lemmaId: 'spaccare', italian: 'spaccare', english: 'to split / crack', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['spaccare', 'spacca', 'spaccava', 'spaccato', 'spaccata'] },
  { lemmaId: 'lateralmente', italian: 'lateralmente', english: 'laterally / on the side', partOfSpeech: 'adverb', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['lateralmente'] },
  { lemmaId: 'usura', italian: 'usura', english: 'wear / wear-and-tear', partOfSpeech: 'noun', gender: 'feminine', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['usura'] },
  { lemmaId: 'anello', italian: 'anello', english: 'ring', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['anello', 'anelli'] },
  { lemmaId: 'apparentemente', italian: 'apparentemente', english: 'apparently / seemingly', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['apparentemente'] },
  { lemmaId: 'insignificante', italian: 'insignificante', english: 'insignificant', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['insignificante', 'insignificanti'] },
  { lemmaId: 'situazione', italian: 'situazione', english: 'situation', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['situazione', 'situazioni'] },
  { lemmaId: 'ufficio', italian: 'ufficio', english: 'office', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['ufficio', 'uffici'] },
  { lemmaId: 'mezzora', italian: "mezz'ora", english: 'half an hour', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ["mezz'ora", 'mezzora'] },
  { lemmaId: 'illudere', italian: 'illudere', english: 'to delude / mislead', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['illudere', 'illude', 'illudeva', 'illuso', 'illudersi'] },
  { lemmaId: 'fondamentale', italian: 'fondamentale', english: 'fundamental / essential', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['fondamentale', 'fondamentali'] },
  { lemmaId: 'distinto', italian: 'distinto', english: 'distinct / distinguished', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['distinto', 'distinta', 'distinti', 'distinte'] },
  { lemmaId: 'affinche', italian: 'affinché', english: 'in order that / so that', partOfSpeech: 'conjunction', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['affinché', 'affinche'] },
  { lemmaId: 'orario', italian: 'orario', english: 'schedule / timetable / hourly', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['orario', 'orari'] },
  { lemmaId: 'descrittivo', italian: 'descrittivo', english: 'descriptive', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['descrittivo', 'descrittiva', 'descrittivi', 'descrittive'] },
  { lemmaId: 'tenda', italian: 'tenda', english: 'curtain / tent', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['tenda', 'tende'] },
  { lemmaId: 'comune', italian: 'comune', english: 'shared / common', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['comune', 'comuni'] },
  { lemmaId: 'duraturo', italian: 'duraturo', english: 'lasting / durable', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 60, inflections: ['duraturo', 'duratura', 'duraturi', 'durature'] },
];

for (const entry of finalMissingLemmas) {
  if (!core.lexicon.some((e) => e.lemmaId === entry.lemmaId)) {
    core.lexicon.push(entry);
  }
}
fs.writeFileSync(corePath, JSON.stringify(core, null, 2), 'utf8');

// Build master empirical dictionary
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

// Harvest chapters 1-57
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

const batchAExplicitMap = {
  "panni": "panno", "sprecando": "sprecare", "deludendo": "deludere", "inutilmente": "inutilmente",
  "insegnamenti": "insegnamento", "danni": "danno", "chinò": "chinare", "spense": "spegnere",
  "progressivamente": "progressivamente", "profumato": "profumare", "asciugò": "asciugare",
  "straccio": "straccio", "diagnosticare": "diagnosticare", "nemmeno": "nemmeno",
  "illuminò": "illuminare", "diagnosi": "diagnosi", "sigillava": "sigillare", "spaccata": "spaccare",
  "lateralmente": "lateralmente", "dell'usura": "usura", "anello": "anello", "apparentemente": "apparentemente",
  "insignificante": "insignificante", "avessi": "avere", "scorsa": "scorso", "situazione": "situazione",
  "pensò": "pensare", "attrezzi": "attrezzo", "conservava": "conservare", "comprate": "comprare",
  "seguendo": "seguire", "procurarsi": "procurarsi", "prevede": "prevedere", "interruzione": "interruzione",
  "piatta": "piatto", "estrasse": "estrarre", "deformata": "deformare", "pulì": "pulire",
  "rimuovere": "rimuovere", "indurito": "indurire", "carbonizzata": "carbonizzare",
  "riavvitò": "riavvitare", "verificò": "verificare", "attentamente": "attentamente",
  "metalliche": "metallico", "segnava": "segnare", "riaccese": "riaccendere", "sordo": "sordo",
  "riprese": "riprendere", "fermarsi": "fermare", "perfetti": "perfetto", "riparazione": "riparazione",
  "macinò": "macinare", "esatti": "esatto", "formando": "formare", "sottili": "sottile",
  "preventiva": "preventivo", "suonò": "suonare", "impiegato": "impiegato", "uffici": "ufficio",
  "mezz'ora": "mezzora", "allagato": "allagare", "misurati": "misurare", "nell'illudersi": "illudere",
  "piuttosto": "piuttosto", "sapendo": "sapere", "d'azione": "azione", "compagne": "compagna",
  "rimasero": "rimanere", "ridisegnare": "ridisegnare", "lontananza": "lontananza", "disegnata": "disegnare",
  "conversazione": "conversazione", "difensiva": "difensivo", "costruzione": "costruzione",
  "scopo": "scopo", "velocità": "velocita", "fondamentali": "fondamentale", "distinte": "distinto",
  "affinché": "affinche", "orari": "orario", "spostare": "spostare", "catturare": "catturare",
  "elettriche": "elettrico", "dedicati": "dedicato", "definirono": "definire", "minimi": "minimo",
  "accompagnate": "accompagnare", "descrittive": "descrittivo", "sedeva": "sedere", "andarsene": "andarsene",
  "separata": "separare", "tenda": "tenda", "uniamo": "unire", "rileggeva": "rileggere",
  "comuni": "comune", "contemporaneamente": "contemporaneamente", "future": "futuro",
  "manutenzioni": "manutenzione", "sentivano": "sentire", "duratura": "duraturo",
  "organizzazione": "organizzazione", "mensole": "mensola", "universitarie": "universitario",
  "orecchie": "orecchio", "modellata": "modellare", "modellava": "modellare", "trasformato": "trasformare",
  "approvazione": "approvazione", "generato": "generare", "bisogni": "bisogno"
};

for (const [k, v] of Object.entries(batchAExplicitMap)) {
  empirical.set(k.toLowerCase(), v);
}

function alignChapterFinal(filePath, chId) {
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
    console.log(`Sample missing in ${chId}:`, missing);
  } else {
    console.log(`🎉 Chapter ${chId}: 100% PERFECT 0 MISSING!`);
  }
  fs.writeFileSync(filePath, JSON.stringify(ch, null, 2), 'utf8');
}

alignChapterFinal('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-58.json', '58');
alignChapterFinal('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-59.json', '59');
alignChapterFinal('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-60.json', '60');
