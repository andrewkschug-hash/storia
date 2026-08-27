const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'content');
const lexiconRaw = JSON.parse(fs.readFileSync(path.join(root, 'lexicon', 'italian-core.json'), 'utf8'));
const lexiconById = new Map(lexiconRaw.lexicon.map((l) => [l.lemmaId, l]));

// Load sentence translations
const translations = JSON.parse(fs.readFileSync(path.join(root, 'stories', 'luca-a-roma', 'sentence-english.json'), 'utf8'));

// Load all chapters for luca-a-roma
const lucaChaptersDir = path.join(root, 'stories', 'luca-a-roma', 'chapters');
const lucaSentences = new Map();
for (let i = 1; i <= 55; i++) {
  const chNum = String(i).padStart(2, '0');
  const chFile = path.join(lucaChaptersDir, `chapter-${chNum}.json`);
  if (!fs.existsSync(chFile)) continue;
  const ch = JSON.parse(fs.readFileSync(chFile, 'utf8'));
  const chId = ch.id || `luca-a-roma-${chNum}`;
  for (const p of ch.paragraphs || []) {
    for (const s of p.sentences || []) {
      const enKey = `${chId}:${s.id}`;
      const english = translations[enKey] || null;
      lucaSentences.set(enKey, {
        ...s,
        chapterId: chId,
        chapterNumber: i,
        english,
      });
    }
  }
}

console.log('Loaded sentences from luca-a-roma:', lucaSentences.size);

// Read luca-a-roma production-exercises.json
const lucaProdPath = path.join(root, 'stories', 'luca-a-roma', 'production-exercises.json');
const lucaProd = JSON.parse(fs.readFileSync(lucaProdPath, 'utf8'));

console.log('Total exercises in luca-a-roma:', lucaProd.exercises.length);

let repairedCount = 0;

const specificFixes = {
  // Chapter 01
  'luca-a-roma-ch01-prod-01': {
    promptEn: 'Luca arrives in Rome.',
    expectedIt: 'Luca arriva a Roma.',
    acceptableAnswers: ['Arriva a Roma.'],
    focus: ['arrivare', 'roma'],
  },
  'luca-a-roma-ch01-prod-02': {
    promptEn: 'Luca is hungry.',
    expectedIt: 'Luca ha fame.',
    acceptableAnswers: ['Ha fame.'],
    focus: ['avere', 'fame'],
  },
  'luca-a-roma-ch01-prod-03': {
    promptEn: 'Luca wants to eat.',
    expectedIt: 'Luca vuole mangiare.',
    acceptableAnswers: ['Vuole mangiare.'],
    focus: ['volere', 'mangiare'],
  },
  // Chapter 02
  'luca-a-roma-ch02-prod-01': {
    promptEn: 'Luca is in Rome.',
    expectedIt: 'Luca è a Roma.',
    acceptableAnswers: ['È a Roma.', 'Sono a Roma.', 'Io sono a Roma.'],
    focus: ['roma', 'location'],
  },
  'luca-a-roma-ch02-prod-02': {
    promptEn: 'Luca walks down the street.',
    expectedIt: 'Luca cammina per la strada.',
    acceptableAnswers: ['Cammina per la strada.', 'Cammino per la strada.', 'Io cammino per la strada.'],
    focus: ['camminare', 'strada'],
  },
  // Chapter 03
  'luca-a-roma-ch03-prod-01': {
    promptEn: 'Luca is looking for a home.',
    expectedIt: 'Luca cerca una casa.',
    acceptableAnswers: ['Cerca una casa.', 'Cerco una casa.', 'Cerca casa.'],
    focus: ['cercare', 'casa'],
  },
  'luca-a-roma-ch03-prod-02': {
    promptEn: 'Luca wants an apartment.',
    expectedIt: 'Luca vuole un appartamento.',
    acceptableAnswers: ['Vuole un appartamento.', 'Voglio un appartamento.'],
    focus: ['volere', 'appartamento'],
  },
  'luca-a-roma-ch03-prod-03': {
    promptEn: "Luca doesn't have much money.",
    expectedIt: 'Luca non ha molti soldi.',
    acceptableAnswers: ['Non ha molti soldi.', 'Non ho molti soldi.'],
    focus: ['soldi', 'avere'],
  },
  // Chapter 04
  'luca-a-roma-ch04-prod-02': {
    promptEn: 'Luca is happy.',
    expectedIt: 'Luca è felice.',
    acceptableAnswers: ['È felice.', 'Sono felice.', 'Luca è contento.'],
    focus: ['felice', 'descriptions'],
  },
  'luca-a-roma-ch04-prod-04': {
    promptEn: 'Luca has a home in Rome.',
    expectedIt: 'Luca ha una casa a Roma.',
    acceptableAnswers: ['Ha una casa a Roma.', 'Ho una casa a Roma.'],
    focus: ['casa', 'roma'],
  },
  // Chapter 06
  'luca-a-roma-ch06-prod-02': {
    promptEn: 'This is the neighborhood.',
    expectedIt: 'Questo è il quartiere.',
    acceptableAnswers: ['Questo è il mio quartiere.', 'Il quartiere.'],
    focus: ['quartiere', 'descriptions'],
  },
  // Chapter 07
  'luca-a-roma-ch07-prod-01': {
    promptEn: 'Luca wants a job.',
    expectedIt: 'Luca vuole un lavoro.',
    acceptableAnswers: ['Vuole un lavoro.', 'Cerco un lavoro.', 'Cerca un lavoro.'],
    focus: ['lavoro', 'volere'],
  },
  'luca-a-roma-ch07-prod-04': {
    promptEn: 'Luca wants to stay in Rome.',
    expectedIt: 'Luca vuole restare a Roma.',
    acceptableAnswers: ['Vuole restare a Roma.', 'Voglio restare a Roma.', 'Luca vuole vivere a Roma.'],
    focus: ['restare', 'roma'],
  },
  // Chapter 08
  'luca-a-roma-ch08-prod-01': {
    sourceSentenceId: 's08',
    promptEn: 'Ask at the café.',
    expectedIt: 'Chiedi al caffè.',
    acceptableAnswers: ['Chiedi al bar.', 'Chiedi al caffe.'],
    focus: ['chiedere', 'caffe'],
  },
  // Chapter 09
  'luca-a-roma-ch09-prod-02': {
    promptEn: 'Luca has a job.',
    expectedIt: 'Luca ha un lavoro.',
    acceptableAnswers: ['Ha un lavoro.', 'Ho un lavoro.'],
    focus: ['lavoro', 'avere'],
  },
  'luca-a-roma-ch09-prod-03': {
    promptEn: 'Tomorrow Luca works.',
    expectedIt: 'Domani Luca lavora.',
    acceptableAnswers: ['Domani lavora.', 'Domani lavoro.', 'Lavora domani.'],
    focus: ['lavorare', 'domani'],
  },
  // Chapter 10
  'luca-a-roma-ch10-prod-01': {
    promptEn: 'Today Luca works.',
    expectedIt: 'Oggi Luca lavora.',
    acceptableAnswers: ['Oggi lavora.', 'Oggi lavoro.', 'Lavora oggi.'],
    focus: ['lavorare', 'oggi'],
  },
  // Chapter 11
  'luca-a-roma-ch11-prod-01': {
    promptEn: 'Luca works in the café.',
    expectedIt: 'Luca lavora nel caffè.',
    acceptableAnswers: ['Lavora nel caffè.', 'Lavoro nel caffè.', 'Lavora al caffè.'],
    focus: ['lavorare', 'caffe'],
  },
  'luca-a-roma-ch11-prod-02': {
    promptEn: "Marco is Sofia's friend.",
    expectedIt: 'Marco è un amico di Sofia.',
    acceptableAnswers: ['È un amico di Sofia.', 'È un mio amico.'],
    focus: ['amico', 'sofia'],
  },
  // Chapter 12
  'luca-a-roma-ch12-prod-01': {
    promptEn: 'Marco has a problem.',
    expectedIt: 'Marco ha un problema.',
    acceptableAnswers: ['Ha un problema.', 'Ho un problema.'],
    focus: ['problema', 'avere'],
  },
  // Chapter 16
  'luca-a-roma-ch16-prod-02': {
    promptEn: 'Marco has the ticket.',
    expectedIt: 'Marco ha il biglietto.',
    acceptableAnswers: ['Ha il biglietto.', 'Ho il biglietto.'],
    focus: ['biglietto', 'avere'],
  },
  // Chapter 17
  'luca-a-roma-ch17-prod-01': {
    promptEn: 'Luca looks outside.',
    expectedIt: 'Luca guarda fuori.',
    acceptableAnswers: ['Guarda fuori.', 'Guardo fuori.'],
    focus: ['guardare', 'fuori'],
  },
  // Chapter 20
  'luca-a-roma-ch20-prod-01': {
    promptEn: 'Luca is home.',
    expectedIt: 'Luca è a casa.',
    acceptableAnswers: ['È a casa.', 'Sono a casa.'],
    focus: ['casa', 'location'],
  },
  'luca-a-roma-ch20-prod-03': {
    promptEn: 'Luca has a home, a job, and friends.',
    expectedIt: 'Luca ha una casa, un lavoro e amici.',
    acceptableAnswers: ['Ha una casa, un lavoro e amici.', 'Ho una casa, un lavoro e amici.'],
    focus: ['casa', 'lavoro', 'amico'],
  },
  'luca-a-roma-ch20-prod-04': {
    promptEn: 'Luca is happy in Rome.',
    expectedIt: 'Luca è felice a Roma.',
    acceptableAnswers: ['È felice a Roma.', 'Sono felice a Roma.', 'Io sono felice a Roma.'],
    focus: ['felice', 'roma'],
  },
  // Chapter 23
  'luca-a-roma-ch23-prod-01': {
    promptEn: "I'd like bread and water.",
    expectedIt: 'Vorrei pane e acqua.',
    acceptableAnswers: ['Pane e acqua, grazie.', "Vorrei del pane e dell'acqua."],
    focus: ['food', 'request', 'conditional'],
  },
  'luca-a-roma-ch23-prod-04': {
    promptEn: 'Luca is happy at the café.',
    expectedIt: 'Luca è felice al caffè.',
    acceptableAnswers: ['È felice al caffè.', 'Sono felice al caffè.', 'Luca è contento al caffè.'],
    focus: ['felice', 'caffe'],
  },
};

for (const ex of lucaProd.exercises) {
  const chMatch = ex.chapterId.match(/luca-a-roma-(\d+)/);
  if (!chMatch) continue;
  const chNum = parseInt(chMatch[1], 10);
  const sentKey = `${ex.chapterId}:${ex.sourceSentenceId}`;
  const sentence = lucaSentences.get(sentKey);

  if (specificFixes[ex.exerciseId]) {
    Object.assign(ex, specificFixes[ex.exerciseId]);
    repairedCount++;
  } else if (chNum >= 21 && chNum <= 40) {
    // Fix A1+ / A2 chapters (21 to 40) where sentence alignment drifted:
    if (sentence && sentence.english && sentence.text) {
      const wordCount = sentence.text.split(/\s+/).length;
      if (wordCount <= 15) {
        ex.expectedIt = sentence.text.trim();
        ex.promptEn = sentence.english.trim();
        repairedCount++;
      }
    }
  }

  // Filter out duplicates in acceptableAnswers
  if (ex.acceptableAnswers) {
    const expectedNorm = ex.expectedIt.trim().toLowerCase().replace(/[.,;:!?…]+/g, '');
    ex.acceptableAnswers = ex.acceptableAnswers.filter((a) => {
      const aNorm = a.trim().toLowerCase().replace(/[.,;:!?…]+/g, '');
      return aNorm !== expectedNorm;
    });
    if (ex.acceptableAnswers.length === 0) {
      delete ex.acceptableAnswers;
    }
  }
}

// Write repaired luca-a-roma production-exercises.json
fs.writeFileSync(lucaProdPath, JSON.stringify(lucaProd, null, 2) + '\n');
console.log(`Repaired ${repairedCount} exercises in luca-a-roma.`);

