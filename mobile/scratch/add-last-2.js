const fs = require('fs');

const corePath = 'c:/Users/aksch/Code/storia/mobile/content/lexicon/italian-core.json';
const core = JSON.parse(fs.readFileSync(corePath, 'utf8'));

const add2 = [
  { lemmaId: 'sostenibilita', italian: 'sostenibilità', english: 'sustainability', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['sostenibilità', 'sostenibilita'] },
  { lemmaId: 'compagno', italian: 'compagno', english: 'companion / partner', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['compagno', 'compagna', 'compagni', 'compagne'] }
];

for (const entry of add2) {
  if (!core.lexicon.some((e) => e.lemmaId === entry.lemmaId)) {
    core.lexicon.push(entry);
  }
}

fs.writeFileSync(corePath, JSON.stringify(core, null, 2), 'utf8');
console.log('Added sostenibilita and compagno.');
