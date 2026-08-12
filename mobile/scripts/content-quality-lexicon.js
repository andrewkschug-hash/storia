const fs = require('fs');
const path = require('path');

const charactersPath = path.join(__dirname, '..', 'content', 'characters.json');
const lexiconPath = path.join(__dirname, '..', 'content', 'lexicon', 'italian-core.json');

const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
if (!characters.characters.find((c) => c.id === 'padrone')) {
  characters.characters.push({
    id: 'padrone',
    name: 'Il padrone',
    gender: 'male',
    ageDescription: 'middle-aged',
    description: 'Owner of the café where Luca finds work.',
    storyRole: 'employer',
    relationships: ['Employs Luca and Giulia'],
    knownLocationIds: ['lavoro-caffe'],
    voice: {
      provider: null,
      voiceId: null,
      language: 'it-IT',
      speakingStyle: 'middle-aged Italian male, direct',
    },
  });
  fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2) + '\n');
  console.log('Added character: padrone');
}

const lexicon = JSON.parse(fs.readFileSync(lexiconPath, 'utf8'));
const extra = [
  {
    lemmaId: 'momento',
    italian: 'momento',
    english: 'moment',
    partOfSpeech: 'noun',
    difficulty: 1,
    frequency: 'high',
    introducedChapter: 8,
  },
  {
    lemmaId: 'dove_e',
    italian: "dov'è",
    english: 'where is',
    partOfSpeech: 'expression',
    difficulty: 1,
    frequency: 'high',
    introducedChapter: 18,
    notes: 'Contraction of dove + è; one token in text.',
  },
  {
    lemmaId: 'iniziare',
    italian: 'iniziare',
    english: 'to begin / to start',
    partOfSpeech: 'verb',
    difficulty: 2,
    frequency: 'medium',
    introducedChapter: 16,
    inflections: ['inizio', 'inizi', 'inizia', 'iniziamo'],
  },
  {
    lemmaId: 'passare',
    italian: 'passare',
    english: 'to pass / to go by',
    partOfSpeech: 'verb',
    difficulty: 2,
    frequency: 'medium',
    introducedChapter: 17,
    inflections: ['passo', 'passi', 'passa', 'passiamo'],
  },
];

// Lexicon quality fixes
const byId = new Map(lexicon.lexicon.map((e) => [e.lemmaId, e]));
for (const e of extra) {
  if (!byId.has(e.lemmaId)) {
    lexicon.lexicon.push(e);
    byId.set(e.lemmaId, e);
  }
}

const fixes = {
  fame: { english: 'hunger (in “avere fame” = to be hungry)' },
  sete: { english: 'thirst (in “avere sete” = to be thirsty)' },
  bene: { english: 'well; okay (also in “va bene” = all right)' },
  ora: { english: 'now', partOfSpeech: 'adverb', notes: 'Also a noun meaning “hour”; story uses adverb sense.' },
  amico: { english: 'friend', notes: 'Used for male singular and mixed plural amici.' },
  ce: { english: 'there is / there are (c’è)', notes: 'Written c’è; plural often ci sono (not separate lemma yet).' },
  si_yes: { english: 'yes (sì)', italian: 'sì' },
  si: { english: 'oneself / himself / herself (reflexive pronoun)' },
  scusa: { english: 'sorry / excuse me (informal)' },
  sapere: { english: 'to know (facts)', notes: 'Contrast with conoscere (to know people/places).' },
  conoscere: { english: 'to know / to meet (people, places)' },
  stare: { english: 'to stay / to be (health/state; Come stai?)' },
  potere: { english: 'to be able to / can' },
  dovere: { english: 'to have to / must' },
  volere: { english: 'to want' },
};

let fixCount = 0;
for (const [id, patch] of Object.entries(fixes)) {
  const entry = byId.get(id);
  if (!entry) continue;
  for (const [k, v] of Object.entries(patch)) {
    if (entry[k] !== v) {
      entry[k] = v;
      fixCount += 1;
    }
  }
}

fs.writeFileSync(lexiconPath, JSON.stringify(lexicon, null, 2) + '\n');
console.log('Lexicon size', lexicon.lexicon.length, 'field fixes', fixCount);
