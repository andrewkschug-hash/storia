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

const paragraphs61 = require('./draft-ch61.js');
const paragraphs62 = require('./draft-ch62.js');
const paragraphs63 = require('./draft-ch63.js');
const paragraphs64 = require('./draft-ch64.js');
const paragraphs65 = require('./draft-ch65.js');

function mapParas(paras) {
  return paras.map((p, idx) => ({
    id: `p${idx + 1}`,
    order: idx + 1,
    sentences: p.map((s) => ({
      id: s.id,
      text: s.text,
      speakerId: s.speakerId,
      kind: s.kind,
      lemmas: []
    }))
  }));
}

// Chapter 61 JSON
const chapter61 = {
  id: 'luca-a-roma-61',
  storyId: 'luca-a-roma',
  number: 61,
  title: 'The Back Table',
  titleIt: 'Il tavolo in fondo',
  difficultyLevel: 3,
  locationIds: ['quartiere', 'centro', 'strada'],
  characterIds: ['luca'],
  events: [
    {
      id: 'ev-61-back-table',
      summary: 'Chiara arrives at Spazio Monti with an urgent translation deadline and sits at the back table. Luca serves an Ethiopian filter coffee and learns to respect her concentration and silent focus without imposing unnecessary explanations.',
      characterIds: ['luca'],
      locationIds: ['quartiere', 'centro', 'strada'],
      rememberedFacts: [
        'On Friday morning, Chiara visits Spazio Monti with laptop and dictionaries to work on an urgent translation deadline',
        'Chiara orders a washed Ethiopian filter coffee for its floral notes and light body during long study sessions',
        'Luca is tempted to deliver an exhaustive explanation of the coffee origin, but recognizes Chiara’s intense concentration',
        'Chiara thanks Luca for the quiet sanctuary, noting how rare respectful work spaces are in central Rome',
        'Luca learns that hospitality means reading customer priorities and creating space rather than demanding validation'
      ]
    }
  ],
  paragraphs: mapParas(paragraphs61),
  questions: [
    {
      id: 'ch61_q01',
      type: 'event',
      question: 'Why does Chiara choose the table at the back of Spazio Monti?',
      questionIt: 'Perché Chiara sceglie il tavolo in fondo allo Spazio Monti?',
      choices: [
        'She needs three hours of absolute quiet to meet an urgent translation deadline',
        'She is waiting for a group of tourists from Paris',
        'The other tables in the shop are broken'
      ],
      correctChoice: 0,
      explanation: 'Chiara explains that she has an urgent editorial deadline at four o’clock and chose the quiet back table to concentrate without distractions.',
      chapterId: 'luca-a-roma-61',
      difficulty: 3
    },
    {
      id: 'ch61_q02',
      type: 'inference',
      question: 'What fundamental lesson about hospitality does Luca realize when serving Chiara?',
      questionIt: 'Quale lezione fondamentale sull’accoglienza comprende Luca servendo Chiara?',
      choices: [
        'True hospitality means respecting the customer’s priorities and silence rather than imposing one’s own passion',
        'Baristas should always play loud background music to entertain customers',
        'Every customer must take an exam on coffee processing methods'
      ],
      correctChoice: 0,
      explanation: 'Luca realizes that authentic hospitality consists in reading the customer’s real needs and providing quiet respect rather than demanding attention for his technical craft.',
      chapterId: 'luca-a-roma-61',
      difficulty: 3
    }
  ]
};

// Chapter 62 JSON
const chapter62 = {
  id: 'luca-a-roma-62',
  storyId: 'luca-a-roma',
  number: 62,
  title: "Marco's Roast",
  titleIt: 'La tostatura di Marco',
  difficultyLevel: 3,
  locationIds: ['quartiere', 'centro', 'strada'],
  characterIds: ['luca', 'marco'],
  events: [
    {
      id: 'ev-62-marcos-roast',
      summary: 'Marco brings a test roast of Guatemalan Bourbon that developed high acidity due to rainy weather. Marco shares the carpenter’s wisdom on wood shifting with the sirocco, and together they recalibrate water temperature to 91°C to extract a sweet, balanced cup.',
      characterIds: ['luca', 'marco'],
      locationIds: ['quartiere', 'centro', 'strada'],
      rememberedFacts: [
        'Marco brings a test batch of Guatemalan Bourbon roasted with a micro-roaster friend near Orvieto',
        'During technical cupping, Luca detects sharp acidity caused by high atmospheric humidity during roasting',
        'Marco draws a carpenter’s parallel: timber swells and shifts with the sirocco, so craftsmen must adapt rather than force rigid perfection',
        'Luca adjusts the brew by lowering water temperature to 91°C and lengthening extraction time to extract sweet caramel notes',
        'Luca realizes that craftsmanship is an active dialogue with material constraints rather than sterile theoretical control'
      ]
    }
  ],
  paragraphs: mapParas(paragraphs62),
  questions: [
    {
      id: 'ch62_q01',
      type: 'event',
      question: 'What caused the Guatemalan test batch to develop higher acidity than expected?',
      questionIt: 'Cosa ha causato una maggiore acidità nel lotto di prova guatemalteco?',
      choices: [
        'High atmospheric humidity from rain prevented heat from penetrating the beans fast enough to caramelize sugars fully',
        'The coffee beans were contaminated with salt during transport',
        'Marco roasted the beans inside an open fireplace'
      ],
      correctChoice: 0,
      explanation: 'Marco explains that high humidity from the rainy night slowed heat penetration in the roaster drum, leading to higher malic acidity.',
      chapterId: 'luca-a-roma-62',
      difficulty: 3
    },
    {
      id: 'ch62_q02',
      type: 'inference',
      question: 'How do Marco’s woodworking insights help Luca solve the brewing challenge?',
      questionIt: 'In che modo le riflessioni di falegnameria di Marco aiutano Luca a risolvere la sfida dell’estrazione?',
      choices: [
        'They inspire Luca to adapt water temperature and contact time to the raw material rather than discarding the batch',
        'They convince Luca to sell wood furniture instead of coffee',
        'They show Luca that coffee machines should be built entirely out of oak'
      ],
      correctChoice: 0,
      explanation: 'Marco explains that just as wood swells with the sirocco, natural materials must be respected; adapting the brewing parameters reveals the beans’ hidden sweetness.',
      chapterId: 'luca-a-roma-62',
      difficulty: 3
    }
  ]
};

// Chapter 63 JSON
const chapter63 = {
  id: 'luca-a-roma-63',
  storyId: 'luca-a-roma',
  number: 63,
  title: 'A Storm in Monti',
  titleIt: 'Un temporale a Monti',
  difficultyLevel: 3,
  locationIds: ['quartiere', 'centro', 'strada'],
  characterIds: ['luca'],
  events: [
    {
      id: 'ev-63-storm-monti',
      summary: 'A sudden torrential autumn storm drives couriers, passersby, and signora Teresa inside Spazio Monti. Luca and Claudia welcome everyone with dry towels, warm spiced tea, and batch brew coffee, turning the shop into a warm civic haven.',
      characterIds: ['luca'],
      locationIds: ['quartiere', 'centro', 'strada'],
      rememberedFacts: [
        'A violent autumn downpour turns Via dei Serpenti into a rushing torrent on Tuesday late afternoon',
        'Passersby, couriers, and neighborhood residents seek shelter inside Spazio Monti from the torrential rain',
        'Claudia distributes clean towels and coat racks, while Chiara helps signora Teresa find a warm seat',
        'Luca brews large pots of filter coffee and spiced herbal tea with cinnamon and orange peel for all guests',
        'Strangers converse warmly across tables, showing that shared vulnerability and generosity create true community'
      ]
    }
  ],
  paragraphs: mapParas(paragraphs63),
  questions: [
    {
      id: 'ch63_q01',
      type: 'event',
      question: 'How do Luca and Claudia respond when a dozen soaked people rush inside to escape the storm?',
      questionIt: 'Come reagiscono Luca e Claudia quando una decina di persone bagnate entra per sfuggire al temporale?',
      choices: [
        'They hand out dry towels, make room at the table, and offer hot filter coffee and spiced tea to everyone',
        'They lock the door and ask everyone to leave immediately',
        'They demand an entrance fee before letting people stand inside'
      ],
      correctChoice: 0,
      explanation: 'Claudia brings out dry towels and makes room at the central table, while Luca brews warm carafes of coffee and spiced tea to comfort everyone.',
      chapterId: 'luca-a-roma-63',
      difficulty: 3
    },
    {
      id: 'ch63_q02',
      type: 'inference',
      question: 'What transformation occurs inside Spazio Monti during the violent downpour?',
      questionIt: 'Quale trasformazione avviene dentro lo Spazio Monti durante il violento temporale?',
      choices: [
        'The barrier of mistrust between strangers dissolves as the shop transforms into a warm civic haven',
        'The roof collapses under the weight of the water',
        'The espresso machine stops working permanently'
      ],
      correctChoice: 0,
      explanation: 'The cozy warmth, shared vulnerability, and steaming drinks dissolve urban isolation, turning the shop into a welcoming neighborhood sanctuary.',
      chapterId: 'luca-a-roma-63',
      difficulty: 3
    }
  ]
};

// Chapter 64 JSON
const chapter64 = {
  id: 'luca-a-roma-64',
  storyId: 'luca-a-roma',
  number: 64,
  title: 'The Illusion of Control',
  titleIt: "L'illusione del controllo",
  difficultyLevel: 3,
  locationIds: ['quartiere', 'centro', 'strada'],
  characterIds: ['luca', 'marco'],
  events: [
    {
      id: 'ev-64-illusion-control',
      summary: 'Luca obsesses over micrometric grinder adjustments after an extraction runs 2.5 seconds slower than his target curve. Chiara and Marco help him realize that perfectionism is merely anxiety in disguise, and that the espresso was already delicious, balanced, and alive.',
      characterIds: ['luca', 'marco'],
      locationIds: ['quartiere', 'centro', 'strada'],
      rememberedFacts: [
        'Luca obsesses over 2.5 seconds of extraction variance after post-storm humidity shifts his grinder calibration',
        'Chiara compares over-engineering espresso to translating word-for-word, which kills a text’s natural voice and rhythm',
        'Marco explains that planing away all natural knots in olive wood destroys its structural soul and history',
        'Luca tastes the supposedly imperfect 27.5-second extraction and finds rich notes of plum, cocoa, and chestnut honey',
        'Luca realizes that artisanal mastery is not rigid control over every variable, but letting reality breathe'
      ]
    }
  ],
  paragraphs: mapParas(paragraphs64),
  questions: [
    {
      id: 'ch64_q01',
      type: 'event',
      question: 'What comparison does Chiara draw between coffee calibration and literary translation?',
      questionIt: 'Quale confronto traccia Chiara tra la calibrazione del caffè e la traduzione letteraria?',
      choices: [
        'Obsessing over rigid word-for-word precision suffocates the soul of a text, just as hyper-controlling coffee variables suffocates the craft',
        'Both translation and coffee brewing require using dictionaries at all times',
        'Neither translation nor coffee has any rules whatsoever'
      ],
      correctChoice: 0,
      explanation: 'Chiara explains that pursuing the illusion of absolute mathematical precision destroys the rhythm and living voice of both writing and coffee.',
      chapterId: 'luca-a-roma-64',
      difficulty: 3
    },
    {
      id: 'ch64_q02',
      type: 'inference',
      question: 'What does Luca discover when he finally tastes the 27.5-second extraction he had considered flawed?',
      questionIt: 'Cosa scopre Luca quando assaggia l’estrazione di 27,5 secondi che considerava difettosa?',
      choices: [
        'The coffee is rich, sweet, and delicious; the perceived flaw was only an abstract deviation from an arbitrary number',
        'The coffee was completely undrinkable and burned',
        'The water was cold and unextracted'
      ],
      correctChoice: 0,
      explanation: 'Upon tasting, Luca discovers a velvety, balanced cup with notes of ripe plum and cocoa, proving that his anxiety was merely the illusion of total control.',
      chapterId: 'luca-a-roma-64',
      difficulty: 3
    }
  ]
};

// Chapter 65 JSON
const chapter65 = {
  id: 'luca-a-roma-65',
  storyId: 'luca-a-roma',
  number: 65,
  title: 'A Different Point of View',
  titleIt: 'Un punto di vista diverso',
  difficultyLevel: 3,
  locationIds: ['quartiere', 'centro', 'strada'],
  characterIds: ['luca', 'padrone', 'marco'],
  events: [
    {
      id: 'ev-65-different-view',
      summary: 'Spazio Monti hosts a neighborhood open-studio evening celebrating coffee, ceramics, woodwork, and graphic design. Bruno stops by to give a solemn nod of approval, and Luca steps outside to see that he has built a place of genuine belonging in Rome.',
      characterIds: ['luca', 'padrone', 'marco'],
      locationIds: ['quartiere', 'centro', 'strada'],
      rememberedFacts: [
        'Spazio Monti hosts its first open-studio evening with ceramics by Claudia, woodwork by Marco, design by Chiara, and coffee by Luca',
        'Neighbors, artisans, and students fill the room with lively conversation and mutual appreciation',
        'Bruno stops by on his way back to San Lorenzo, tasting the Guatemalan brew and giving Luca a solemn nod of full approval',
        'Bruno tells Luca that true success in Rome is creating a place where people desire to stay, talk, and belong',
        'Luca looks through the warm window from the street, realizing he is no longer an isolated apprentice but part of a living community'
      ]
    }
  ],
  paragraphs: mapParas(paragraphs65),
  questions: [
    {
      id: 'ch65_q01',
      type: 'event',
      question: 'What message does Bruno share with Luca during the open-studio evening at Spazio Monti?',
      questionIt: 'Quale messaggio condivide Bruno con Luca durante la serata a porte aperte allo Spazio Monti?',
      choices: [
        'That lasting success in Rome is creating a place where people desire to stay, talk, and belong',
        'That Luca should sell Spazio Monti and return to Bar Centrale immediately',
        'That coffee should only be served in paper cups'
      ],
      correctChoice: 0,
      explanation: 'Bruno explains that the most important achievement is not just in the cup, but in creating a living space where people feel they belong.',
      chapterId: 'luca-a-roma-65',
      difficulty: 3
    },
    {
      id: 'ch65_q02',
      type: 'inference',
      question: 'What realization does Luca come to when he observes Spazio Monti from the street outside at the end of Movement 2?',
      questionIt: 'Quale consapevolezza raggiunge Luca osservando lo Spazio Monti dalla strada alla fine del secondo movimento?',
      choices: [
        'He is no longer a lonely apprentice defending an isolated island, but part of an authentic, interconnected community',
        'He realizes he forgot to lock the back door',
        'He decides to move back to Pietralba the following morning'
      ],
      correctChoice: 0,
      explanation: 'Stepping outside onto the cobblestones, Luca sees the warm, thriving scene and understands that his craft is a lasting bridge to community.',
      chapterId: 'luca-a-roma-65',
      difficulty: 3
    }
  ]
};

// Write chapter JSON files
fs.writeFileSync('./content/stories/luca-a-roma/chapters/chapter-61.json', JSON.stringify(chapter61, null, 2), 'utf8');
fs.writeFileSync('./content/stories/luca-a-roma/chapters/chapter-62.json', JSON.stringify(chapter62, null, 2), 'utf8');
fs.writeFileSync('./content/stories/luca-a-roma/chapters/chapter-63.json', JSON.stringify(chapter63, null, 2), 'utf8');
fs.writeFileSync('./content/stories/luca-a-roma/chapters/chapter-64.json', JSON.stringify(chapter64, null, 2), 'utf8');
fs.writeFileSync('./content/stories/luca-a-roma/chapters/chapter-65.json', JSON.stringify(chapter65, null, 2), 'utf8');
console.log('Wrote chapter-61.json through chapter-65.json');

// Update sentence-english.json
const trPath = './content/stories/luca-a-roma/sentence-english.json';
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

for (const p of paragraphs61) for (const s of p) tr[`luca-a-roma-61:${s.id}`] = s.en;
for (const p of paragraphs62) for (const s of p) tr[`luca-a-roma-62:${s.id}`] = s.en;
for (const p of paragraphs63) for (const s of p) tr[`luca-a-roma-63:${s.id}`] = s.en;
for (const p of paragraphs64) for (const s of p) tr[`luca-a-roma-64:${s.id}`] = s.en;
for (const p of paragraphs65) for (const s of p) tr[`luca-a-roma-65:${s.id}`] = s.en;

fs.writeFileSync(trPath, JSON.stringify(tr, null, 2), 'utf8');
console.log('Updated sentence-english.json for Chapters 61-65');

// Update manifest.json
const manifestPath = './content/stories/luca-a-roma/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const batchBEntries = [
  { id: 'luca-a-roma-61', number: 61, title: 'The Back Table', titleIt: 'Il tavolo in fondo', difficultyLevel: 3, file: 'chapter-61.json' },
  { id: 'luca-a-roma-62', number: 62, title: "Marco's Roast", titleIt: 'La tostatura di Marco', difficultyLevel: 3, file: 'chapter-62.json' },
  { id: 'luca-a-roma-63', number: 63, title: 'A Storm in Monti', titleIt: 'Un temporale a Monti', difficultyLevel: 3, file: 'chapter-63.json' },
  { id: 'luca-a-roma-64', number: 64, title: 'The Illusion of Control', titleIt: "L'illusione del controllo", difficultyLevel: 3, file: 'chapter-64.json' },
  { id: 'luca-a-roma-65', number: 65, title: 'A Different Point of View', titleIt: 'Un punto di vista diverso', difficultyLevel: 3, file: 'chapter-65.json' }
];

for (const entry of batchBEntries) {
  if (!manifest.chapters.some((c) => c.id === entry.id)) {
    manifest.chapters.push(entry);
    console.log('Registered in manifest:', entry.id);
  }
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
