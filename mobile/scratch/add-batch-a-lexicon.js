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

// Batch A new core lemmas
const batchALemmas = [
  // Ch 58
  { lemmaId: 'consapevolezza', italian: 'consapevolezza', english: 'awareness / conscious understanding', partOfSpeech: 'noun', gender: 'feminine', difficulty: 3, frequency: 'high', introducedChapter: 58, inflections: ['consapevolezza'] },
  { lemmaId: 'consiglio', italian: 'consiglio', english: 'advice / counsel', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['consiglio', 'consigli'] },
  { lemmaId: 'abitudine', italian: 'abitudine', english: 'habit', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['abitudine', 'abitudini'] },
  { lemmaId: 'clientela', italian: 'clientela', english: 'clientele / customer base', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['clientela'] },
  { lemmaId: 'accoglienza', italian: 'accoglienza', english: 'hospitality / welcome', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['accoglienza'] },
  { lemmaId: 'frequentare', italian: 'frequentare', english: 'to frequent / visit often', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['frequentare', 'frequenta', 'frequentava', 'frequentato'] },
  { lemmaId: 'sopravvivere', italian: 'sopravvivere', english: 'to survive', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['sopravvivere', 'sopravvive', 'sopravviveva', 'sopravvissuto'] },
  { lemmaId: 'illusione', italian: 'illusione', english: 'illusion', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['illusione', 'illusioni'] },
  { lemmaId: 'romantico', italian: 'romantico', english: 'romantic', partOfSpeech: 'adjective', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['romantico', 'romantica', 'romantici', 'romantiche'] },
  { lemmaId: 'scadente', italian: 'scadente', english: 'poor quality / substandard', partOfSpeech: 'adjective', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['scadente', 'scadenti'] },
  { lemmaId: 'distributore', italian: 'distributore', english: 'distributor / dispenser', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['distributore', 'distributori'] },
  { lemmaId: 'ricercatore', italian: 'ricercatore', english: 'researcher', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['ricercatore', 'ricercatori', 'ricercatrice', 'ricercatrici'] },
  { lemmaId: 'professionista', italian: 'professionista', english: 'professional', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['professionista', 'professionisti', 'professioniste'] },
  { lemmaId: 'taccuino', italian: 'taccuino', english: 'notebook / notepad', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['taccuino', 'taccuini'] },
  { lemmaId: 'risorsa', italian: 'risorsa', english: 'resource / asset', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 58, inflections: ['risorsa', 'risorse'] },
  { lemmaId: 'redditizio', italian: 'redditizio', english: 'profitable / lucrative', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 58, inflections: ['redditizio', 'redditizia', 'redditizi', 'redditizie'] },
  { lemmaId: 'scorciatoia', italian: 'scorciatoia', english: 'shortcut', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 58, inflections: ['scorciatoia', 'scorciatoie'] },
  { lemmaId: 'maestria', italian: 'maestria', english: 'mastery / craftsmanship', partOfSpeech: 'noun', gender: 'feminine', difficulty: 3, frequency: 'medium', introducedChapter: 58, inflections: ['maestria'] },
  { lemmaId: 'mercato', italian: 'mercato', english: 'market', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 58, inflections: ['mercato', 'mercati'] },

  // Ch 59
  { lemmaId: 'guasto', italian: 'guasto', english: 'breakdown / fault / failure', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['guasto', 'guasti'] },
  { lemmaId: 'emergenza', italian: 'emergenza', english: 'emergency', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['emergenza', 'emergenze'] },
  { lemmaId: 'risolvere', italian: 'risolvere', english: 'to solve / resolve', partOfSpeech: 'verb', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['risolvere', 'risolve', 'risolto', 'risolto', 'risolveva'] },
  { lemmaId: 'valvola', italian: 'valvola', english: 'valve', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['valvola', 'valvole'] },
  { lemmaId: 'guarnizione', italian: 'guarnizione', english: 'gasket / seal', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['guarnizione', 'guarnizioni'] },
  { lemmaId: 'manutenzione', italian: 'manutenzione', english: 'maintenance', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['manutenzione', 'manutenzioni'] },
  { lemmaId: 'sibilo', italian: 'sibilo', english: 'hiss / whistling sound', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'low', introducedChapter: 59, inflections: ['sibilo', 'sibili'] },
  { lemmaId: 'anomalo', italian: 'anomalo', english: 'anomalous / unusual', partOfSpeech: 'adjective', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['anomalo', 'anomala', 'anomali', 'anomale'] },
  { lemmaId: 'erogazione', italian: 'erogazione', english: 'brewing / dispensing', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['erogazione', 'erogazioni'] },
  { lemmaId: 'fuoriuscire', italian: 'fuoriuscire', english: 'to leak out / burst forth', partOfSpeech: 'verb', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['fuoriuscire', 'fuoriesce', 'fuoriuscii', 'fuoriuscì', 'fuoriusciva', 'fuoriuscito'] },
  { lemmaId: 'colare', italian: 'colare', english: 'to drip / trickle / flow', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['colare', 'cola', 'colava', 'colato'] },
  { lemmaId: 'interruttore', italian: 'interruttore', english: 'switch / breaker', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['interruttore', 'interruttori'] },
  { lemmaId: 'resistenza', italian: 'resistenza', english: 'heating element / resistance', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['resistenza', 'resistenze'] },
  { lemmaId: 'torcia', italian: 'torcia', english: 'flashlight / torch', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['torcia', 'torce'] },
  { lemmaId: 'silicone', italian: 'silicone', english: 'silicone', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['silicone'] },
  { lemmaId: 'scorta', italian: 'scorta', english: 'supply / stock', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['scorta', 'scorte'] },
  { lemmaId: 'ricambio', italian: 'ricambio', english: 'spare part / replacement', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 59, inflections: ['ricambio', 'ricambi'] },
  { lemmaId: 'cacciavite', italian: 'cacciavite', english: 'screwdriver', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['cacciavite'] },
  { lemmaId: 'pinza', italian: 'pinza', english: 'pliers', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['pinza', 'pinze'] },
  { lemmaId: 'frammento', italian: 'frammento', english: 'fragment / piece', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['frammento', 'frammenti'] },
  { lemmaId: 'spazzolino', italian: 'spazzolino', english: 'small brush', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 59, inflections: ['spazzolino', 'spazzolini'] },
  { lemmaId: 'calcare', italian: 'calcare', english: 'limescale', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 59, inflections: ['calcare'] },
  { lemmaId: 'scanalatura', italian: 'scanalatura', english: 'groove / slot', partOfSpeech: 'noun', gender: 'feminine', difficulty: 3, frequency: 'low', introducedChapter: 59, inflections: ['scanalatura', 'scanalature'] },
  { lemmaId: 'collaudare', italian: 'collaudare', english: 'to test / road-test', partOfSpeech: 'verb', difficulty: 3, frequency: 'medium', introducedChapter: 59, inflections: ['collaudare', 'collauda', 'collaudava', 'collaudato'] },
  { lemmaId: 'resilienza', italian: 'resilienza', english: 'resilience', partOfSpeech: 'noun', gender: 'feminine', difficulty: 3, frequency: 'high', introducedChapter: 59, inflections: ['resilienza'] },

  // Ch 60
  { lemmaId: 'accordo', italian: 'accordo', english: 'agreement / accord', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['accordo', 'accordi'] },
  { lemmaId: 'collaborazione', italian: 'collaborazione', english: 'collaboration / partnership', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['collaborazione', 'collaborazioni'] },
  { lemmaId: 'disposizione', italian: 'disposizione', english: 'layout / arrangement', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['disposizione', 'disposizioni'] },
  { lemmaId: 'equilibrio', italian: 'equilibrio', english: 'balance / equilibrium', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['equilibrio', 'equilibri'] },
  { lemmaId: 'suddivisione', italian: 'suddivisione', english: 'subdivision / partition', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 60, inflections: ['suddivisione', 'suddivisioni'] },
  { lemmaId: 'convivenza', italian: 'convivenza', english: 'cohabitation / living together', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 60, inflections: ['convivenza'] },
  { lemmaId: 'patto', italian: 'patto', english: 'pact / agreement', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['patto', 'patti'] },
  { lemmaId: 'lampione', italian: 'lampione', english: 'streetlamp', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['lampione', 'lampioni'] },
  { lemmaId: 'piantina', italian: 'piantina', english: 'floor plan / small map', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 60, inflections: ['piantina', 'piantine'] },
  { lemmaId: 'righello', italian: 'righello', english: 'ruler', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['righello', 'righelli'] },
  { lemmaId: 'rifugio', italian: 'rifugio', english: 'refuge / haven', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['rifugio', 'rifugi'] },
  { lemmaId: 'presa', italian: 'presa', english: 'electrical outlet / grip', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['presa', 'prese'] },
  { lemmaId: 'mensola', italian: 'mensola', english: 'shelf', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['mensola', 'mensole'] },
  { lemmaId: 'rivista', italian: 'rivista', english: 'magazine', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['rivista', 'riviste'] },
  { lemmaId: 'caraffa', italian: 'caraffa', english: 'carafe / pitcher', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['caraffa', 'caraffe'] },
  { lemmaId: 'scheda', italian: 'scheda', english: 'card / fact sheet', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['scheda', 'schede'] },
  { lemmaId: 'altitudine', italian: 'altitudine', english: 'altitude', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 60, inflections: ['altitudine', 'altitudini'] },
  { lemmaId: 'raccolto', italian: 'raccolto', english: 'harvest / crop', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['raccolto', 'raccolti'] },
  { lemmaId: 'lino', italian: 'lino', english: 'linen', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 60, inflections: ['lino'] },
  { lemmaId: 'modellazione', italian: 'modellazione', english: 'modeling / shaping', partOfSpeech: 'noun', gender: 'feminine', difficulty: 2, frequency: 'medium', introducedChapter: 60, inflections: ['modellazione'] },
  { lemmaId: 'tornio', italian: 'tornio', english: 'pottery wheel / lathe', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'medium', introducedChapter: 60, inflections: ['tornio', 'torni'] },
  { lemmaId: 'ciotola', italian: 'ciotola', english: 'bowl', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['ciotola', 'ciotole'] },
  { lemmaId: 'smaltare', italian: 'smaltare', english: 'to glaze / enamel', partOfSpeech: 'verb', difficulty: 3, frequency: 'low', introducedChapter: 60, inflections: ['smaltare', 'smalta', 'smaltava', 'smaltato', 'smaltati', 'smaltata', 'smaltate'] },
  { lemmaId: 'gocciolio', italian: 'gocciolio', english: 'dripping sound', partOfSpeech: 'noun', gender: 'masculine', difficulty: 3, frequency: 'low', introducedChapter: 60, inflections: ['gocciolio'] },
  { lemmaId: 'cono', italian: 'cono', english: 'cone', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['cono', 'coni'] },
  { lemmaId: 'specchio', italian: 'specchio', english: 'mirror', partOfSpeech: 'noun', gender: 'masculine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['specchio', 'specchi'] },
  { lemmaId: 'levigare', italian: 'levigare', english: 'to sand / smooth out', partOfSpeech: 'verb', difficulty: 3, frequency: 'medium', introducedChapter: 60, inflections: ['levigare', 'leviga', 'levigava', 'levigato', 'levigata', 'levigati'] },
  { lemmaId: 'cornice', italian: 'cornice', english: 'frame', partOfSpeech: 'noun', gender: 'feminine', difficulty: 1, frequency: 'high', introducedChapter: 60, inflections: ['cornice', 'cornici'] },
  { lemmaId: 'inaugurare', italian: 'inaugurare', english: 'to inaugurate / open', partOfSpeech: 'verb', difficulty: 2, frequency: 'medium', introducedChapter: 60, inflections: ['inaugurare', 'inaugura', 'inaugurava', 'inaugurato'] },
  { lemmaId: 'ostacolo', italian: 'ostacolo', english: 'obstacle / hurdle', partOfSpeech: 'noun', gender: 'masculine', difficulty: 2, frequency: 'high', introducedChapter: 60, inflections: ['ostacolo', 'ostacoli'] },
];

for (const entry of batchALemmas) {
  if (!core.lexicon.some((e) => e.lemmaId === entry.lemmaId)) {
    core.lexicon.push(entry);
    console.log('Added entry:', entry.lemmaId);
  }
}

fs.writeFileSync(corePath, JSON.stringify(core, null, 2), 'utf8');
console.log('Batch A lexicon entries merged into italian-core.json');
