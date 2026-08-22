/**
 * Calendar repair + small Italian/causality polish (post-readthrough).
 * No arc rewrite. No audio.
 * Run: node mobile/scripts/phase10-calendar-polish.cjs
 */
const fs = require('fs');
const path = require('path');
const { buildLemmaMap, lemmasFor } = require('./a2/lemma-map');

const root = path.join(__dirname, '..');
const chaptersDir = path.join(root, 'content', 'stories', 'luca-a-roma', 'chapters');
const enPath = path.join(root, 'content', 'stories', 'luca-a-roma', 'sentence-english.json');
const pePath = path.join(root, 'content', 'stories', 'luca-a-roma', 'production-exercises.json');
const lexicon = JSON.parse(fs.readFileSync(path.join(root, 'content', 'lexicon', 'italian-core.json'), 'utf8'));
const lemmaMap = buildLemmaMap(lexicon.lexicon);
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const pe = JSON.parse(fs.readFileSync(pePath, 'utf8'));

function load(n) {
  const file = path.join(chaptersDir, `chapter-${String(n).padStart(2, '0')}.json`);
  return { file, ch: JSON.parse(fs.readFileSync(file, 'utf8')) };
}
function save(file, ch) {
  fs.writeFileSync(file, `${JSON.stringify(ch, null, 2)}\n`);
}
function set(ch, id, text, speakerId, kind, english) {
  for (const p of ch.paragraphs) {
    for (const s of p.sentences) {
      if (s.id !== id) continue;
      s.text = text;
      if (speakerId !== undefined) s.speakerId = speakerId;
      if (kind !== undefined) s.kind = kind;
      if (!('speakerId' in s) || s.speakerId === undefined) s.speakerId = speakerId ?? null;
      s.lemmas = lemmasFor(lemmaMap, text, `${ch.id}:${id}`);
      if (english) en[`${ch.id}:${id}`] = english;
      return;
    }
  }
  throw new Error(`Missing ${ch.id}:${id}`);
}
function syncExercise(chapterId, sourceSentenceId, expectedIt, promptEn) {
  for (const e of pe.exercises) {
    if (e.chapterId === chapterId && e.sourceSentenceId === sourceSentenceId) {
      if (expectedIt) e.expectedIt = expectedIt;
      if (promptEn) e.promptEn = promptEn;
    }
  }
}

// Ch25 — weather logic
{
  const { file, ch } = load(25);
  set(ch, 's13', 'Forse è solo lunedì.', 'luca', 'dialogue', 'Maybe it’s only Monday.');
  set(
    ch,
    's14',
    'Fuori il tempo è bello, ma al caffè ci sono pochi clienti.',
    null,
    'narration',
    'Outside the weather is nice, but at the café there are few customers.',
  );
  save(file, ch);
  console.log('25');
}

// Ch29 — agreement + same-day ask
{
  const { file, ch } = load(29);
  set(
    ch,
    's03',
    'Nonna Rosa li ha visti alla porta e ha sorriso.',
    null,
    'narration',
    'Nonna Rosa saw them at the door and smiled.',
  );
  set(
    ch,
    's42',
    'Quella sera dovevano chiedere il sì del padrone.',
    null,
    'narration',
    'That evening they had to ask for the owner’s yes.',
  );
  save(file, ch);
  console.log('29');
}

// Ch30 — Friday evening only; no morning duplicate
{
  const { file, ch } = load(30);
  set(
    ch,
    's01',
    'Venerdì sera Luca e Sofia erano al caffè, e Giulia li ha visti.',
    null,
    'narration',
    'Friday evening Luca and Sofia were at the café, and Giulia saw them.',
  );
  set(
    ch,
    's02',
    'Hanno parlato piano vicino ai tavoli vuoti.',
    null,
    'narration',
    'They spoke quietly near the empty tables.',
  );
  set(
    ch,
    's10',
    'Luca e Sofia lo hanno visto e non hanno parlato subito.',
    null,
    'narration',
    'Luca and Sofia saw him and did not speak right away.',
  );
  set(
    ch,
    's36',
    'Adesso lavoriamo su questo. Oggi abbiamo chiesto.',
    'sofia',
    'dialogue',
    'Now we work on this. Today we asked.',
  );
  set(
    ch,
    's37',
    'Dopo un poco qualche cliente è entrato al caffè.',
    null,
    'narration',
    'After a little while a few customers came into the café.',
  );
  save(file, ch);
  console.log('30');
}

// Ch31 — still Friday after the yes
{
  const { file, ch } = load(31);
  set(
    ch,
    's01',
    'Dopo il sì del padrone, ancora venerdì, il gruppo aveva cose da fare.',
    null,
    'narration',
    'After the owner’s yes, still on Friday, the group had things to do.',
  );
  set(
    ch,
    's02',
    'Si sono incontrati al caffè, ancora venerdì, dopo il sì.',
    null,
    'narration',
    'They met at the café, still on Friday, after the yes.',
  );
  set(
    ch,
    's39',
    'Continuiamo. Oggi abbiamo organizzato insieme.',
    'luca',
    'dialogue',
    'Let’s continue. Today we organized together.',
  );
  save(file, ch);
  console.log('31');
}

// Ch32 — Friday evening; no “two days later” / afternoon clash
{
  const { file, ch } = load(32);
  set(
    ch,
    's01',
    'Venerdì sera la festa era più vicina.',
    null,
    'narration',
    'Friday evening the celebration was closer.',
  );
  set(
    ch,
    's14',
    'Al caffè Giulia ha parlato chiaro vicino ai tavoli.',
    null,
    'narration',
    'At the café Giulia spoke clearly near the tables.',
  );
  set(
    ch,
    's33',
    'Allora io e Marco andiamo di nuovo nel quartiere.',
    'sofia',
    'dialogue',
    'Then Marco and I go into the neighborhood again.',
  );
  save(file, ch);
  console.log('32');
}

// Ch33 — explicit Friday evening
{
  const { file, ch } = load(33);
  set(
    ch,
    's01',
    'Venerdì sera, prima di sabato, Sofia e Marco avevano un appuntamento in piazza.',
    null,
    'narration',
    'Friday evening, before Saturday, Sofia and Marco had a meeting in the square.',
  );
  save(file, ch);
  console.log('33');
}

// Ch34 — keep tense simple/natural
{
  const { file, ch } = load(34);
  set(
    ch,
    's02',
    'Non sapeva se veniva gente, e non sapeva di Marco.',
    null,
    'narration',
    'He did not know if people were coming, and he did not know about Marco.',
  );
  save(file, ch);
  console.log('34');
}

// Ch35 — Sofia messaging payoff
{
  const { file, ch } = load(35);
  set(
    ch,
    's11',
    'Dopo Nonna Rosa sono arrivate tre persone del quartiere, poi una famiglia. Alcune persone erano lì perché Sofia aveva scritto loro.',
    null,
    'narration',
    'After Nonna Rosa three people from the neighborhood arrived, then a family. Some people were there because Sofia had written to them.',
  );
  save(file, ch);
  console.log('35');
}

// Ch40 — Friday decision explicit; Monday epilogue (not Saturday)
{
  const { file, ch } = load(40);
  set(
    ch,
    's01',
    'Venerdì pomeriggio la mamma ha chiamato Luca a casa.',
    null,
    'narration',
    'Friday afternoon mom called Luca at home.',
  );
  set(
    ch,
    's43',
    'Lunedì mattina ha aperto il caffè con Giulia, come ogni mattina di lavoro.',
    null,
    'narration',
    'Monday morning he opened the café with Giulia, like every work morning.',
  );
  set(
    ch,
    's44',
    'Marco non c’era, perché non era un giorno pieno. La sala era piccola, come sempre.',
    null,
    'narration',
    'Marco was not there, because it was not a busy day. The room was small, as always.',
  );
  save(file, ch);
  console.log('40');
}

// Sync production exercises tied to edited source lines
syncExercise(
  'luca-a-roma-25',
  's13',
  'Forse è solo lunedì.',
  'Maybe it’s only Monday.',
);
syncExercise(
  'luca-a-roma-29',
  's03',
  'Nonna Rosa li ha visti alla porta e ha sorriso.',
  null,
);
syncExercise(
  'luca-a-roma-30',
  's02',
  'Hanno parlato piano vicino ai tavoli vuoti.',
  'They spoke quietly near the empty tables.',
);
syncExercise(
  'luca-a-roma-40',
  's43',
  'Lunedì mattina ha aperto il caffè con Giulia, come ogni mattina di lavoro.',
  'Monday morning he opened the café with Giulia, like every work morning.',
);

fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`);
fs.writeFileSync(pePath, `${JSON.stringify(pe, null, 2)}\n`);
console.log('EN + production exercises updated.');
