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

// New natural B1+ vocabulary for Movement 3
const batchCBaseLemmas = [
  { lemmaId: 'frizzante', italian: 'frizzante', english: 'brisk / crisp / sparkling', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['frizzante', 'frizzanti'] },
  { lemmaId: 'radicato', italian: 'radicato', english: 'deeply rooted', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['radicato', 'radicata', 'radicati', 'radicate'] },
  { lemmaId: 'consolidato', italian: 'consolidato', english: 'consolidated / well-established', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['consolidato', 'consolidata', 'consolidati', 'consolidate'] },
  { lemmaId: 'pensionato', italian: 'pensionato', english: 'retiree / pensioner', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['pensionato', 'pensionata', 'pensionati', 'pensionate'] },
  { lemmaId: 'tipografia', italian: 'tipografia', english: 'print shop / typography', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 66, inflections: ['tipografia', 'tipografie'] },
  { lemmaId: 'tipografo', italian: 'tipografo', english: 'printer (craftsperson)', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 66, inflections: ['tipografo', 'tipografi'] },
  { lemmaId: 'abitudinario', italian: 'abitudinario', english: 'creature of habit / habitual', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['abitudinario', 'abitudinaria', 'abitudinari', 'abitudinarie'] },
  { lemmaId: 'schietto', italian: 'schietto', english: 'straightforward / candid / pure', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['schietto', 'schietta', 'schietti', 'schiette'] },
  { lemmaId: 'sostanza', italian: 'sostanza', english: 'substance', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['sostanza', 'sostanze'] },
  { lemmaId: 'miscela', italian: 'miscela', english: 'blend / mixture', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['miscela', 'miscele'] },
  { lemmaId: 'rotondita', italian: 'rotondità', english: 'roundness / smoothness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['rotondità', 'rotondita'] },
  { lemmaId: 'avvolgente', italian: 'avvolgente', english: 'enveloping / smooth', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['avvolgente', 'avvolgenti'] },
  { lemmaId: 'nocciola', italian: 'nocciola', english: 'hazelnut', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['nocciola', 'nocciole'] },
  { lemmaId: 'oste', italian: 'oste', english: 'host / innkeeper', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['oste', 'osti'] },
  { lemmaId: 'falegnameria', italian: 'falegnameria', english: 'woodworking / carpentry workshop', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 66, inflections: ['falegnameria', 'falegnamerie'] },
  { lemmaId: 'ventilato', italian: 'ventilato', english: 'breezy / airy', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 66, inflections: ['ventilato', 'ventilata', 'ventilati', 'ventilate'] },
  { lemmaId: 'incolmabile', italian: 'incolmabile', english: 'unbridgeable / insurmountable', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 66, inflections: ['incolmabile', 'incolmabili'] },
  { lemmaId: 'acciottolato', italian: 'acciottolato', english: 'cobblestone pavement', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 66, inflections: ['acciottolato', 'acciottolati'] },
  { lemmaId: 'pungente', italian: 'pungente', english: 'biting / sharp / pungent', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['pungente', 'pungenti'] },
  { lemmaId: 'diminuire', italian: 'diminuire', english: 'to decrease / diminish', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['diminuire', 'diminuisce', 'diminuiva', 'diminuiscono', 'diminuito'] },
  { lemmaId: 'panico', italian: 'panico', english: 'panic', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['panico'] },
  { lemmaId: 'vittima', italian: 'vittima', english: 'victim', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['vittima', 'vittime'] },
  { lemmaId: 'nido', italian: 'nido', english: 'nest / haven', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['nido', 'nidi'] },
  { lemmaId: 'operoso', italian: 'operoso', english: 'hardworking / industrious / active', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['operoso', 'operosa', 'operosi', 'operose'] },
  { lemmaId: 'fraterno', italian: 'fraterno', english: 'brotherly / fraternal', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 67, inflections: ['fraterno', 'fraterna', 'fraterni', 'fraterne'] },
  { lemmaId: 'levigare', italian: 'levigare', english: 'to sand / smooth / polish', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['levigare', 'leviga', 'levigava', 'levigato'] },
  { lemmaId: 'setoso', italian: 'setoso', english: 'silky', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['setoso', 'setosa', 'setosi', 'setose'] },
  { lemmaId: 'maturazione', italian: 'maturazione', english: 'ripening / maturation', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['maturazione'] },
  { lemmaId: 'indistruttibile', italian: 'indistruttibile', english: 'indestructible', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 67, inflections: ['indistruttibile', 'indistruttibili'] },
  { lemmaId: 'consorzio', italian: 'consorzio', english: 'consortium / alliance', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 68, inflections: ['consorzio', 'consorzi'] },
  { lemmaId: 'distribuzione', italian: 'distribuzione', english: 'distribution', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['distribuzione', 'distribuzioni'] },
  { lemmaId: 'profitto', italian: 'profitto', english: 'profit', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['profitto', 'profitti'] },
  { lemmaId: 'standardizzare', italian: 'standardizzare', english: 'to standardize', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 68, inflections: ['standardizzare', 'standardizza', 'standardizzava', 'standardizzato'] },
  { lemmaId: 'ingranaggio', italian: 'ingranaggio', english: 'gear / cog', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 68, inflections: ['ingranaggio', 'ingranaggi'] },
  { lemmaId: 'conferma', italian: 'conferma', english: 'confirmation / validation', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 68, inflections: ['conferma', 'conferme'] },
  { lemmaId: 'sigillo', italian: 'sigillo', english: 'seal / hallmark', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 68, inflections: ['sigillo', 'sigilli'] },
  { lemmaId: 'copertina', italian: 'copertina', english: 'cover (of a book/notebook)', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['copertina', 'copertine'] },
  { lemmaId: 'catastrofe', italian: 'catastrofe', english: 'catastrophe / disaster', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['catastrofe', 'catastrofi'] },
  { lemmaId: 'smantellare', italian: 'smantellare', english: 'to dismantle', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['smantellare', 'smantella', 'smantellava', 'smantellato'] },
  { lemmaId: 'imposta', italian: 'imposta', english: 'tax / duty', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['imposta', 'imposte'] },
  { lemmaId: 'utile', italian: 'utile', english: 'useful / net profit', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['utile', 'utili'] },
  { lemmaId: 'contabile', italian: 'contabile', english: 'accountant / accounting', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['contabile', 'contabili'] },
  { lemmaId: 'pecorino', italian: 'pecorino', english: 'pecorino cheese', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 69, inflections: ['pecorino'] },
  { lemmaId: 'smentire', italian: 'smentire', english: 'to refute / disprove / contradict', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['smentire', 'smentisce', 'smentiva', 'smentiscono', 'smentito'] },
  { lemmaId: 'faldone', italian: 'faldone', english: 'file folder / binder', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['faldone', 'faldoni'] },
  { lemmaId: 'consacrazione', italian: 'consacrazione', english: 'consecration / crowning confirmation', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['consacrazione'] },
  { lemmaId: 'irreversibile', italian: 'irreversibile', english: 'irreversible', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['irreversibile', 'irreversibili'] },
  { lemmaId: 'costruttore', italian: 'costruttore', english: 'builder / maker', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['costruttore', 'costruttori'] },
  { lemmaId: 'incrollabile', italian: 'incrollabile', english: 'unshakeable / steadfast', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 69, inflections: ['incrollabile', 'incrollabili'] },
  { lemmaId: 'precoce', italian: 'precoce', english: 'early / precocious', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['precoce', 'precoci'] },
  { lemmaId: 'toppa', italian: 'toppa', english: 'keyhole / patch', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 70, inflections: ['toppa', 'toppe'] },
  { lemmaId: 'spago', italian: 'spago', english: 'twine / string', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['spago', 'spaghi'] },
  { lemmaId: 'provinciale', italian: 'provinciale', english: 'provincial / from a small town', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['provinciale', 'provinciali'] },
  { lemmaId: 'ciliegio', italian: 'ciliegio', english: 'cherry tree / cherrywood', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 70, inflections: ['ciliegio', 'ciliegi'] },
  { lemmaId: 'inchino', italian: 'inchino', english: 'bow / nod of respect', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['inchino', 'inchini'] },
  { lemmaId: 'eredita', italian: 'eredità', english: 'heritage / legacy', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['eredità', 'eredita'] },
  { lemmaId: 'fecondo', italian: 'fecondo', english: 'fruitful / fertile', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['fecondo', 'feconda', 'fecondi', 'feconde'] },
  { lemmaId: 'autorevole', italian: 'autorevole', english: 'authoritative / respected', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['autorevole', 'autorevoli'] },
  { lemmaId: 'sintesi', italian: 'sintesi', english: 'synthesis / summary', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 70, inflections: ['sintesi'] },
  { lemmaId: 'rintocco', italian: 'rintocco', english: 'chime / tolling of a bell', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 70, inflections: ['rintocco', 'rintocchi'] }
];

for (const entry of batchCBaseLemmas) {
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
