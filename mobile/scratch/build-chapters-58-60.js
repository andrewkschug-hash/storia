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

// Global overrides
const globalOverrides = {
  "dell'alba": "alba", "dall'alba": "alba", "l'acqua": "acqua", "dell'acqua": "acqua",
  "d'avena": "avena", "all'ingrosso": "ingrosso", "dell'energia": "energia",
  "d'erogazione": "erogazione", "d'acciaio": "acciaio", "d'argilla": "argilla",
  "d'ottone": "ottone", "d'oro": "oro", "d'ingresso": "ingresso",
  "ed": "e", "sui": "su", "dello": "in", "fece": "fare", "fissi": "fisso", "prime": "primo",
  "verde": "verde", "destra": "destra", "san": "san", "lorenzo": "lorenzo",
  "via": "via", "serpenti": "serpente", "spazio": "spazio", "monti": "monti",
  "termini": "termini", "nazionale": "nazionale", "roma": "roma", "italiana": "italiano",
  "bruno": "bruno", "luca": "luca", "claudia": "claudia", "marco": "marco", "teresa": "teresa",
  "l'uno": "uno", "all'altra": "altro", "all'apertura": "apertura", "all'impazzata": "impazzata",
  "dall'ansia": "ansia", "dall'inizio": "inizio", "dall'alto": "alto", "dall'interno": "interno",
  "nell'aria": "aria", "nell'acqua": "acqua", "sull'autobus": "autobus", "sull'ultimo": "ultimo",
  "un'abitudine": "abitudine", "un'accoglienza": "accoglienza", "un'emergenza": "emergenza",
  "un'interruzione": "interruzione", "un'ora": "ora", "un'illusione": "illusione",
  "un'ombra": "ombra", "un'anima": "anima", "l'orologio": "orologio", "l'inchiostro": "inchiostro",
  "l'uscita": "uscita", "l'entrata": "entrata", "l'aria": "aria", "l'idea": "idea",
  "l'identità": "identita", "l'equilibrio": "equilibrio", "l'accordo": "accordo",
  "l'errore": "errore", "l'origine": "origine", "l'esperienza": "esperienza",
  "l'imprevisto": "imprevisto", "l'incertezza": "incertezza", "l'efficienza": "efficienza",
  "l'entusiasmo": "entusiasmo", "l'attività": "attivita", "l'argilla": "argilla",
  "l'autonomia": "autonomia", "l'autunno": "autunno", "l'officina": "officina",
  "l'artigiano": "artigiano", "l'impiegato": "impiegato", "l'odore": "odore",
  "l'umidità": "umidita", "l'espresso": "espresso", "l'ultimo": "ultimo",
  "l'unica": "unico", "l'interruttore": "interruttore"
};

for (const [k, v] of Object.entries(globalOverrides)) {
  empirical.set(k.toLowerCase(), v);
}

function resolveLemmas(sentences) {
  let missing = [];
  const result = sentences.map((s) => {
    const tokens = tokenizeItalian(s.text);
    const lemmas = tokens.map((t) => {
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
      if (!coreSet.has(lem)) {
        missing.push({ surface: t.surface, lemma: lem, sentence: s.id });
      }
      return lem;
    });
    return {
      id: s.id,
      text: s.text,
      speakerId: s.speakerId,
      kind: s.kind,
      lemmas,
    };
  });
  return { sentences: result, missing };
}

// Load drafts
const paragraphs58 = require('./draft-ch58.js');
const paragraphs59 = require('./draft-ch59.js');
const paragraphs60 = require('./draft-ch60.js');

console.log('Building Batch A JSON chapters...');

// Process Chapter 58
let ch58Missing = [];
const p58 = paragraphs58.map((para, idx) => {
  const { sentences, missing } = resolveLemmas(para);
  ch58Missing.push(...missing);
  return { id: `p${idx + 1}`, order: idx + 1, sentences };
});
console.log('Ch 58 Missing tokens:', ch58Missing.length);
if (ch58Missing.length > 0) console.log('Ch 58 missing sample:', ch58Missing.slice(0, 10));

// Process Chapter 59
let ch59Missing = [];
const p59 = paragraphs59.map((para, idx) => {
  const { sentences, missing } = resolveLemmas(para);
  ch59Missing.push(...missing);
  return { id: `p${idx + 1}`, order: idx + 1, sentences };
});
console.log('Ch 59 Missing tokens:', ch59Missing.length);
if (ch59Missing.length > 0) console.log('Ch 59 missing sample:', ch59Missing.slice(0, 10));

// Process Chapter 60
let ch60Missing = [];
const p60 = paragraphs60.map((para, idx) => {
  const { sentences, missing } = resolveLemmas(para);
  ch60Missing.push(...missing);
  return { id: `p${idx + 1}`, order: idx + 1, sentences };
});
console.log('Ch 60 Missing tokens:', ch60Missing.length);
if (ch60Missing.length > 0) console.log('Ch 60 missing sample:', ch60Missing.slice(0, 10));

// Create chapter 58
const chapter58 = {
  id: 'luca-a-roma-58',
  storyId: 'luca-a-roma',
  number: 58,
  title: "Bruno's Counsel",
  titleIt: 'Il consiglio di Bruno',
  difficultyLevel: 3,
  locationIds: ['quartiere', 'centro', 'strada'],
  characterIds: ['luca', 'bruno'],
  events: [
    {
      id: 'ev-58-bruno-advice',
      summary: 'Luca visits Bruno at Bar Centrale in San Lorenzo with the October ledger. Bruno explains that while morning transit buys speed, afternoon customers seek quiet space and hospitality, urging Luca not to lower quality but to activate the empty hours.',
      characterIds: ['luca', 'bruno'],
      locationIds: ['quartiere', 'centro', 'strada'],
      rememberedFacts: [
        'Luca travels to San Lorenzo on Monday afternoon to ask Bruno for honest business advice',
        'Bruno reviews the October numbers and confirms that razor-thin margins threaten the shop’s survival',
        'Bruno strongly warns Luca against lowering coffee quality, which would turn Spazio Monti into just another generic bar',
        'Bruno explains the commercial distinction between morning commuter speed and afternoon calm hospitality',
        'Luca realizes that quiet afternoon hours can be transformed into slow filter tasting and pottery workshops'
      ]
    }
  ],
  paragraphs: p58,
  questions: [
    {
      id: 'ch58_q01',
      type: 'event',
      question: 'What crucial difference between morning and afternoon customers does Bruno explain to Luca?',
      questionIt: 'Quale differenza fondamentale tra i clienti del mattino e del pomeriggio spiega Bruno a Luca?',
      choices: [
        'Morning customers buy speed and time, while afternoon customers seek space, silence, and hospitality',
        'Morning customers prefer commercial blends, while afternoon customers only drink herbal tea',
        'Morning customers pay in cash, while afternoon customers only use bank cards'
      ],
      correctChoice: 0,
      explanation: 'Bruno explains that morning commuters need a quick 90-second espresso, whereas afternoon visitors want a calm space to sit, concentrate, and read.',
      chapterId: 'luca-a-roma-58',
      difficulty: 3
    },
    {
      id: 'ch58_q02',
      type: 'inference',
      question: 'Why does Bruno warn Luca so strongly against buying cheaper commercial coffee beans?',
      questionIt: 'Perché Bruno mette in guardia Luca così duramente dal comprare caffè commerciale economico?',
      choices: [
        'Lowering quality would make Spazio Monti just another generic bar unable to compete with large distributors',
        'Bruno owns shares in the Colombian specialty coffee plantation',
        'The espresso machine cannot brew commercial dark roast blends'
      ],
      correctChoice: 0,
      explanation: 'Bruno points out that generic bars in Monti fail quickly against commercial distributors; Spazio Monti’s only edge is its distinctive artisanal quality.',
      chapterId: 'luca-a-roma-58',
      difficulty: 3
    }
  ]
};

// Create chapter 59
const chapter59 = {
  id: 'luca-a-roma-59',
  storyId: 'luca-a-roma',
  number: 59,
  title: 'The Water Breakdown',
  titleIt: "L'imprevisto dell'acqua",
  difficultyLevel: 3,
  locationIds: ['quartiere', 'centro', 'strada'],
  characterIds: ['luca'],
  events: [
    {
      id: 'ev-59-water-breakdown',
      summary: 'At 6:45 AM, a worn group gasket ruptures on the espresso machine, spraying boiling water across the counter. Luca calmly shuts off the water valve, disassembles the group, replaces the seal with a spare from his toolkit, and retests the pressure to open smoothly at 7:30 AM.',
      characterIds: ['luca'],
      locationIds: ['quartiere', 'centro', 'strada'],
      rememberedFacts: [
        'At 6:45 AM on Wednesday, a worn grouphead gasket ruptures and sprays boiling water across the counter',
        'With 40 minutes until opening, Luca resists panic and follows Bruno’s training to isolate the water line',
        'Luca uses flathead tools to remove the charred seal, cleans the brass housing, and installs a fresh silicone gasket',
        'Luca reassembles the shower screen and verifies that boiler pressure stabilizes perfectly at 9 bar',
        'The shop opens on time at 7:30 AM with full composure, proving that technical resilience is part of craft autonomy'
      ]
    }
  ],
  paragraphs: p59,
  questions: [
    {
      id: 'ch59_q01',
      type: 'event',
      question: 'What immediate action does Luca take when the espresso machine starts leaking boiling water?',
      questionIt: 'Quale azione immediata compie Luca quando la macchina comincia a perdere acqua bollente?',
      choices: [
        'He shuts off the main water valve under the counter and turns off the heating element to lower pressure',
        'He calls an emergency technician in Rome and cancels the morning service',
        'He leaves the shop to ask Marco for help in the carpentry workshop'
      ],
      correctChoice: 0,
      explanation: 'Luca remembers Bruno’s safety rule: shut off the main water valve and heating element to isolate the failure and prevent boiler damage.',
      chapterId: 'luca-a-roma-59',
      difficulty: 3
    },
    {
      id: 'ch59_q02',
      type: 'inference',
      question: 'What allows Luca to resolve the mechanical emergency in less than twenty-five minutes?',
      questionIt: 'Che cosa permette a Luca di risolvere l’emergenza meccanica in meno di venticinque minuti?',
      choices: [
        'He had stocked up on genuine spare gaskets in advance and kept his operational composure',
        'Claudia arrived with a brand-new backup espresso machine',
        'The water leak stopped spontaneously when the room warmed up'
      ],
      correctChoice: 0,
      explanation: 'Following Bruno’s advice, Luca had bought spare silicone gaskets in advance, allowing him to replace the cracked part and test the seal before opening.',
      chapterId: 'luca-a-roma-59',
      difficulty: 3
    }
  ]
};

// Create chapter 60
const chapter60 = {
  id: 'luca-a-roma-60',
  storyId: 'luca-a-roma',
  number: 60,
  title: 'A Pact for the Afternoon',
  titleIt: 'Un patto per il pomeriggio',
  difficultyLevel: 3,
  locationIds: ['quartiere', 'centro', 'strada'],
  characterIds: ['luca', 'claudia', 'marco'],
  events: [
    {
      id: 'ev-60-afternoon-pact',
      summary: 'Luca and Claudia reorganize Spazio Monti with a shared operational pact: morning espresso rush, slow filter tasting and co-working in the afternoon, and pottery classes in the back. The space becomes solvent, peaceful, and balanced.',
      characterIds: ['luca', 'claudia', 'marco'],
      locationIds: ['quartiere', 'centro', 'strada'],
      rememberedFacts: [
        'Luca and Claudia meet on Thursday evening to redesign the room layout and establish clear cohabitation rules',
        'The front room is converted to quiet co-working with reading lamps, power outlets, and slow filter coffee service',
        'Claudia hosts afternoon pottery classes in the back room, creating synergy with coffee tasters',
        'Shared utility expenses and rent are split evenly with a dedicated maintenance reserve fund',
        'On Friday afternoon, students and researchers work in calm comfort, proving that Spazio Monti is sustainable'
      ]
    }
  ],
  paragraphs: p60,
  questions: [
    {
      id: 'ch60_q01',
      type: 'event',
      question: 'How do Luca and Claudia transform Spazio Monti’s afternoon hours?',
      questionIt: 'Come trasformano Luca e Claudia le ore pomeridiane dello Spazio Monti?',
      choices: [
        'They introduce slow-drip filter coffee, quiet study tables, and afternoon pottery modeling classes',
        'They convert the front room into a loud evening cocktail bar',
        'They sublet the entire space to a commercial bakery chain'
      ],
      correctChoice: 0,
      explanation: 'They rearrange tables for quiet reading and slow brew tasting in front while Claudia runs pottery workshops in back, turning empty hours into productive value.',
      chapterId: 'luca-a-roma-60',
      difficulty: 3
    },
    {
      id: 'ch60_q02',
      type: 'inference',
      question: 'What does the successful Friday afternoon test prove to Luca about his choice of independence?',
      questionIt: 'Cosa dimostra a Luca la prova riuscita del venerdì pomeriggio sulla sua scelta di indipendenza?',
      choices: [
        'That with patience, balance, and dialogue, artisanal quality can become economically sustainable without compromising identity',
        'That he should expand to three more locations across Rome immediately',
        'That he no longer needs Bruno’s advice or friendship'
      ],
      correctChoice: 0,
      explanation: 'The test proves that independent craft thrives when practitioners align with real human rhythms and collaborate constructively, answering “Funziona davvero?” with a resounding yes.',
      chapterId: 'luca-a-roma-60',
      difficulty: 3
    }
  ]
};

// Write chapters
fs.writeFileSync('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-58.json', JSON.stringify(chapter58, null, 2), 'utf8');
fs.writeFileSync('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-59.json', JSON.stringify(chapter59, null, 2), 'utf8');
fs.writeFileSync('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-60.json', JSON.stringify(chapter60, null, 2), 'utf8');
console.log('Wrote chapter-58.json, chapter-59.json, chapter-60.json');

// Update sentence-english.json
const trPath = 'c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/sentence-english.json';
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

for (const para of paragraphs58) {
  for (const s of para) tr[`luca-a-roma-58:${s.id}`] = s.en;
}
for (const para of paragraphs59) {
  for (const s of para) tr[`luca-a-roma-59:${s.id}`] = s.en;
}
for (const para of paragraphs60) {
  for (const s of para) tr[`luca-a-roma-60:${s.id}`] = s.en;
}

fs.writeFileSync(trPath, JSON.stringify(tr, null, 2), 'utf8');
console.log('Updated sentence-english.json for Chapters 58, 59, 60');

// Update manifest.json
const manifestPath = 'c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const batchAEntries = [
  { id: 'luca-a-roma-58', number: 58, title: "Bruno's Counsel", titleIt: 'Il consiglio di Bruno', difficultyLevel: 3, file: 'chapter-58.json' },
  { id: 'luca-a-roma-59', number: 59, title: 'The Water Breakdown', titleIt: "L'imprevisto dell'acqua", difficultyLevel: 3, file: 'chapter-59.json' },
  { id: 'luca-a-roma-60', number: 60, title: 'A Pact for the Afternoon', titleIt: 'Un patto per il pomeriggio', difficultyLevel: 3, file: 'chapter-60.json' }
];

for (const entry of batchAEntries) {
  if (!manifest.chapters.some((c) => c.id === entry.id)) {
    manifest.chapters.push(entry);
    console.log('Registered in manifest:', entry.id);
  }
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
