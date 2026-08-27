const fs = require('fs');

const corePath = 'c:/Users/aksch/Code/storia/mobile/content/lexicon/italian-core.json';
const core = JSON.parse(fs.readFileSync(corePath, 'utf8'));

const final35 = [
  { lemmaId: 'approvazione', italian: 'approvazione', english: 'approval', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['approvazione'] },
  { lemmaId: 'distintivo', italian: 'distintivo', english: 'distinctive / badge', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['distintivo', 'distintiva', 'distintivi', 'distintive'] },
  { lemmaId: 'maestro', italian: 'maestro', english: 'master / teacher', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['maestro', 'maestri', 'maestra', 'maestre'] },
  { lemmaId: 'restituire', italian: 'restituire', english: 'to restore / return', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['restituire', 'restituisce', 'restituiva', 'restituito'] },
  { lemmaId: 'mentale', italian: 'mentale', english: 'mental', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['mentale', 'mentali'] },
  { lemmaId: 'chiarezza', italian: 'chiarezza', english: 'clarity', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['chiarezza'] },
  { lemmaId: 'esigenza', italian: 'esigenza', english: 'requirement / need', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['esigenza', 'esigenze'] },
  { lemmaId: 'eccellenza', italian: 'eccellenza', english: 'excellence', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['eccellenza'] },
  { lemmaId: 'causa', italian: 'causa', english: 'cause / reason (a causa di)', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['causa', 'cause'] },
  { lemmaId: 'conservare', italian: 'conservare', english: 'to keep / preserve / store', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['conservare', 'conserva', 'conservava', 'conservato'] },
  { lemmaId: 'procurare', italian: 'procurare', english: 'to obtain / procure', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['procurare', 'procura', 'procurava', 'procurarsi', 'procurato'] },
  { lemmaId: 'interruzione', italian: 'interruzione', english: 'interruption', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['interruzione', 'interruzioni'] },
  { lemmaId: 'deformare', italian: 'deformare', english: 'to deform / warp', partOfSpeech: 'verb', difficulty: 3, frequency: 'low', introducedChapter: 59, inflections: ['deformare', 'deforma', 'deformava', 'deformato', 'deformata'] },
  { lemmaId: 'rimuovere', italian: 'rimuovere', english: 'to remove', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['rimuovere', 'rimuove', 'rimuoveva', 'rimosso'] },
  { lemmaId: 'carbonizzare', italian: 'carbonizzare', english: 'to char / carbonize', partOfSpeech: 'verb', difficulty: 3, frequency: 'low', introducedChapter: 59, inflections: ['carbonizzare', 'carbonizza', 'carbonizzava', 'carbonizzato', 'carbonizzata'] },
  { lemmaId: 'riavvitare', italian: 'riavvitare', english: 'to screw back on', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['riavvitare', 'riavvita', 'riavvitava', 'riavvitò', 'riavvitato'] },
  { lemmaId: 'attentamente', italian: 'attentamente', english: 'attentively / carefully', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['attentamente'] },
  { lemmaId: 'riaccendere', italian: 'riaccendere', english: 'to switch back on', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['riaccendere', 'riaccende', 'riaccese', 'riaccendeva', 'riacceso'] },
  { lemmaId: 'sordo', italian: 'sordo', english: 'dull (sound) / deaf', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['sordo', 'sorda', 'sordi', 'sorde'] },
  { lemmaId: 'impiegato', italian: 'impiegato', english: 'employee / clerk', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['impiegato', 'impiegata', 'impiegati', 'impiegate'] },
  { lemmaId: 'allagare', italian: 'allagare', english: 'to flood', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['allagare', 'allaga', 'allagava', 'allagato'] },
  { lemmaId: 'misurato', italian: 'misurato', english: 'measured / deliberate', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['misurato', 'misurata', 'misurati', 'misurate'] },
  { lemmaId: 'azione', italian: 'azione', english: 'action', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['azione', 'azioni'] },
  { lemmaId: 'orecchio', italian: 'orecchio', english: 'ear', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['orecchio', 'orecchi', 'orecchie'] },
  { lemmaId: 'modellare', italian: 'modellare', english: 'to shape / model', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['modellare', 'modella', 'modellava', 'modellato', 'modellata'] },
  { lemmaId: 'generare', italian: 'generare', english: 'to generate / yield', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['generare', 'genera', 'generava', 'generato'] },
  { lemmaId: 'scaldare', italian: 'scaldare', english: 'to heat / warm up', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['scaldare', 'scalda', 'scaldava', 'scaldarsi', 'scaldato'] },
  { lemmaId: 'emettere', italian: 'emettere', english: 'to emit / give off', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['emettere', 'emette', 'emetteva', 'emettendo', 'emesso'] },
];

for (const entry of final35) {
  const existing = core.lexicon.find((e) => e.lemmaId === entry.lemmaId);
  if (!existing) {
    core.lexicon.push(entry);
  } else {
    existing.inflections = [...new Set([...(existing.inflections || []), ...(entry.inflections || [])])];
  }
}

fs.writeFileSync(corePath, JSON.stringify(core, null, 2), 'utf8');
console.log('Synchronized final 35 lexicon entries.');
