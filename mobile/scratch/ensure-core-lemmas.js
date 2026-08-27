const fs = require('fs');

const corePath = 'c:/Users/aksch/Code/storia/mobile/content/lexicon/italian-core.json';
const core = JSON.parse(fs.readFileSync(corePath, 'utf8'));

const requiredInCore = [
  { lemmaId: 'onesto', italian: 'onesto', english: 'honest', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['onesto', 'onesta', 'onesti', 'oneste'] },
  { lemmaId: 'autunnale', italian: 'autunnale', english: 'autumnal / autumn', partOfSpeech: 'adjective', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['autunnale', 'autunnali'] },
  { lemmaId: 'esperto', italian: 'esperto', english: 'expert / experienced', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['esperto', 'esperta', 'esperti', 'esperte'] },
  { lemmaId: 'tamburellare', italian: 'tamburellare', english: 'to drum / tap (fingers)', partOfSpeech: 'verb', difficulty: 3, frequency: 'low', introducedChapter: 58, inflections: ['tamburellare', 'tamburella', 'tamburellava', 'tamburellato'] },
  { lemmaId: 'nodoso', italian: 'nodoso', english: 'gnarled / knotty', partOfSpeech: 'adjective', difficulty: 3, frequency: 'low', introducedChapter: 58, inflections: ['nodoso', 'nodosa', 'nodosi', 'nodose'] },
  { lemmaId: 'severita', italian: 'severità', english: 'severity / strictness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['severità', 'severita'] },
  { lemmaId: 'opporre', italian: 'opporre', english: 'to oppose / set against', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['opporre', 'oppone', 'opponeva', 'opposto', 'opposta', 'opposti'] },
  { lemmaId: 'distruggere', italian: 'distruggere', english: 'to destroy', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['distruggere', 'distrugge', 'distruggeva', 'distruggerebbe', 'distrutto'] },
  { lemmaId: 'riprendere', italian: 'riprendere', english: 'to resume / regain', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['riprendere', 'riprende', 'riprese', 'riprendeva', 'ripreso'] },
  { lemmaId: 'riguardare', italian: 'riguardare', english: 'to concern / regard', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['riguardare', 'riguarda', 'riguardava', 'riguardato'] },
  { lemmaId: 'avventura', italian: 'avventura', english: 'adventure', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['avventura', 'avventure'] },
  { lemmaId: 'assorbire', italian: 'assorbire', english: 'to absorb', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['assorbire', 'assorbe', 'assorbiva', 'assorbendo', 'assorbito'] },
  { lemmaId: 'velocita', italian: 'velocità', english: 'speed', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['velocità', 'velocita'] },
  { lemmaId: 'correre', italian: 'correre', english: 'to run', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['correre', 'corre', 'correva', 'corso'] },
  { lemmaId: 'piuttosto', italian: 'piuttosto', english: 'rather / instead', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['piuttosto'] },
  { lemmaId: 'visualizzare', italian: 'visualizzare', english: 'to visualize / display', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['visualizzare', 'visualizza', 'visualizzava', 'visualizzato'] },
  { lemmaId: 'organizzazione', italian: 'organizzazione', english: 'organization / layout', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['organizzazione', 'organizzazioni'] },
  { lemmaId: 'interessato', italian: 'interessato', english: 'interested', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['interessato', 'interessata', 'interessati', 'interessate'] },
  { lemmaId: 'visibile', italian: 'visibile', english: 'visible', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['visibile', 'visibili'] },
  { lemmaId: 'frigorifero', italian: 'frigorifero', english: 'refrigerator', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['frigorifero', 'frigoriferi'] },
  { lemmaId: 'dosatore', italian: 'dosatore', english: 'doser / dispenser', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['dosatore', 'dosatori'] },
  { lemmaId: 'acuto', italian: 'acuto', english: 'acute / sharp / high-pitched', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['acuto', 'acuta', 'acuti', 'acute'] },
  { lemmaId: 'bruscamente', italian: 'bruscamente', english: 'abruptly / suddenly', partOfSpeech: 'adverb', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['bruscamente'] },
  { lemmaId: 'sinistro', italian: 'sinistro', english: 'left (direction)', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['sinistro', 'sinistra', 'sinistri', 'sinistre'] },
  { lemmaId: 'riversare', italian: 'riversare', english: 'to spill / pour out', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['riversare', 'riversa', 'riversava', 'riversò', 'riversato'] },
  { lemmaId: 'minacciare', italian: 'minacciare', english: 'to threaten', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['minacciare', 'minaccia', 'minacciava', 'minacciando', 'minacciato'] },
  { lemmaId: 'impazzata', italian: 'impazzata', english: 'madly (all\'impazzata)', partOfSpeech: 'noun', gender: 'feminine', difficulty: 3, frequency: 'low', introducedChapter: 59, inflections: ['impazzata'] },
  { lemmaId: 'deludere', italian: 'deludere', english: 'to disappoint', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['deludere', 'delude', 'deludeva', 'deludendo', 'deluso'] },
  { lemmaId: 'inutilmente', italian: 'inutilmente', english: 'in vain / uselessly', partOfSpeech: 'adverb', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['inutilmente'] },
  { lemmaId: 'chinare', italian: 'chinare', english: 'to bend / bow down', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['chinare', 'china', 'chinava', 'chinò', 'chinato'] },
  { lemmaId: 'consentire', italian: 'consentire', english: 'to allow / permit', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['consentire', 'consente', 'consentiva', 'consentito'] },
  { lemmaId: 'progressivamente', italian: 'progressivamente', english: 'gradually / progressively', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['progressivamente'] },
  { lemmaId: 'profumare', italian: 'profumare', english: 'to smell fragrant / scent', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['profumare', 'profuma', 'profumava', 'profumavano', 'profumato', 'profumata'] },
  { lemmaId: 'diagnosticare', italian: 'diagnosticare', english: 'to diagnose', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['diagnosticare', 'diagnostica', 'diagnosticava', 'diagnosticato'] },
  { lemmaId: 'nemmeno', italian: 'nemmeno', english: 'not even', partOfSpeech: 'adverb', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['nemmeno'] },
  { lemmaId: 'ridisegnare', italian: 'ridisegnare', english: 'to redesign', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 60, inflections: ['ridisegnare', 'ridisegna', 'ridisegnava', 'ridisegnato'] },
  { lemmaId: 'lontananza', italian: 'lontananza', english: 'distance / remoteness', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['lontananza'] },
  { lemmaId: 'disegnare', italian: 'disegnare', english: 'to draw / design', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['disegnare', 'disegna', 'disegnava', 'disegnato', 'disegnata'] },
  { lemmaId: 'conversazione', italian: 'conversazione', english: 'conversation', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['conversazione', 'conversazioni'] },
  { lemmaId: 'riparazione', italian: 'riparazione', english: 'repair', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['riparazione', 'riparazioni'] },
  { lemmaId: 'difensivo', italian: 'difensivo', english: 'defensive', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 60, inflections: ['difensivo', 'difensiva', 'difensivi', 'difensive'] },
  { lemmaId: 'costruzione', italian: 'costruzione', english: 'construction / building', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['costruzione', 'costruzioni'] },
  { lemmaId: 'scopo', italian: 'scopo', english: 'purpose / aim / goal', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['scopo', 'scopi'] },
  { lemmaId: 'spostare', italian: 'spostare', english: 'to move / shift', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['spostare', 'sposta', 'spostava', 'spostato'] },
  { lemmaId: 'catturare', italian: 'catturare', english: 'to capture / catch', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['catturare', 'cattura', 'catturava', 'catturato'] },
  { lemmaId: 'elettrico', italian: 'elettrico', english: 'electric / electrical', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['elettrico', 'elettrica', 'elettrici', 'elettriche'] },
  { lemmaId: 'dedicato', italian: 'dedicato', english: 'dedicated', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['dedicato', 'dedicata', 'dedicati', 'dedicate'] },
  { lemmaId: 'definire', italian: 'definire', english: 'to define / outline', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['definire', 'definisce', 'definiva', 'definirono', 'definito'] },
  { lemmaId: 'minimo', italian: 'minimo', english: 'minimum / smallest', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['minimo', 'minima', 'minimi', 'minime'] },
  { lemmaId: 'andarsene', italian: 'andarsene', english: 'to leave / go away', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['andarsene', 'va via', 'se ne va'] },
  { lemmaId: 'unire', italian: 'unire', english: 'to unite / join', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['unire', 'unisce', 'uniamo', 'univa', 'unito'] },
  { lemmaId: 'contemporaneamente', italian: 'contemporaneamente', english: 'simultaneously / at the same time', partOfSpeech: 'adverb', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['contemporaneamente'] },
  { lemmaId: 'sentire', italian: 'sentire', english: 'to hear / feel', partOfSpeech: 'verb', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['sentire', 'sente', 'sentiva', 'sentivano', 'sentito'] }
];

for (const entry of requiredInCore) {
  const existing = core.lexicon.find((e) => e.lemmaId === entry.lemmaId);
  if (!existing) {
    core.lexicon.push(entry);
  } else {
    // Merge inflections
    existing.inflections = [...new Set([...(existing.inflections || []), ...(entry.inflections || [])])];
  }
}

fs.writeFileSync(corePath, JSON.stringify(core, null, 2), 'utf8');
console.log('Saved required core lemmas');
