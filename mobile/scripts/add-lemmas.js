const fs = require('fs');
const p = 'content/lexicon/italian-core.json';
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
const extra = [
  {
    lemmaId: 'ce',
    italian: "c'è",
    english: 'there is / there are',
    partOfSpeech: 'expression',
    difficulty: 1,
    frequency: 'high',
    introducedChapter: 1,
    notes: 'Contrazione di ci + è; un solo token nel testo.',
  },
  {
    lemmaId: 'opportunita',
    italian: 'opportunità',
    english: 'opportunity',
    partOfSpeech: 'noun',
    difficulty: 2,
    frequency: 'medium',
    introducedChapter: 9,
  },
  {
    lemmaId: 'idea',
    italian: 'idea',
    english: 'idea',
    partOfSpeech: 'noun',
    difficulty: 1,
    frequency: 'high',
    introducedChapter: 15,
  },
  {
    lemmaId: 'valigia',
    italian: 'valigia',
    english: 'suitcase',
    partOfSpeech: 'noun',
    difficulty: 2,
    frequency: 'medium',
    introducedChapter: 16,
  },
  {
    lemmaId: 'sorpresa',
    italian: 'sorpresa',
    english: 'surprise',
    partOfSpeech: 'noun',
    difficulty: 2,
    frequency: 'medium',
    introducedChapter: 18,
  },
  {
    lemmaId: 'risolvere',
    italian: 'risolvere',
    english: 'to solve',
    partOfSpeech: 'verb',
    difficulty: 2,
    frequency: 'medium',
    introducedChapter: 19,
    inflections: ['risolvo', 'risolvi', 'risolve', 'risolviamo'],
  },
  {
    lemmaId: 'gruppo',
    italian: 'gruppo',
    english: 'group',
    partOfSpeech: 'noun',
    difficulty: 2,
    frequency: 'medium',
    introducedChapter: 13,
  },
];
const have = new Set(data.lexicon.map((x) => x.lemmaId));
for (const e of extra) {
  if (!have.has(e.lemmaId)) {
    data.lexicon.push(e);
    have.add(e.lemmaId);
  }
}
fs.writeFileSync(p, JSON.stringify(data, null, 2));
console.log('lexicon size', data.lexicon.length);
