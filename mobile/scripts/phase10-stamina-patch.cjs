/**
 * Curriculum stamina patch: Ch 25–29 length + Ch 25 soft PP ramp + outliers.
 * Does NOT touch lessons / Speak / recaps.
 * Run: node mobile/scripts/phase10-stamina-patch.cjs
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
for (const ex of pe.exercises) {
  if (ex.chapterId === 'luca-a-roma-25' && ex.expectedIt === 'Luca è arrivato presto.') {
    ex.sourceSentenceId = 's02';
  }
}

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
      s.speakerId = speakerId;
      s.kind = kind;
      s.lemmas = lemmasFor(lemmaMap, text, `${ch.id}:${id}`);
      if (english) en[`${ch.id}:${id}`] = english;
      return;
    }
  }
  throw new Error(`Missing ${ch.id}:${id}`);
}
function hasId(ch, id) {
  return ch.paragraphs.some((p) => p.sentences.some((s) => s.id === id));
}
function append(ch, afterId, sentences) {
  for (const s of sentences) {
    if (hasId(ch, s.id)) {
      set(ch, s.id, s.text, s.speakerId ?? null, s.kind ?? 'narration', s.english);
    }
  }
  const fresh = sentences.filter((s) => !hasId(ch, s.id));
  if (fresh.length === 0) return;
  for (const p of ch.paragraphs) {
    let idx = p.sentences.findIndex((s) => s.id === afterId);
    if (idx < 0) continue;
    // Insert after any already-present siblings from this batch / same stem.
    for (let i = idx + 1; i < p.sentences.length; i++) {
      const id = p.sentences[i].id;
      if (id === afterId || id.startsWith(afterId) || sentences.some((s) => s.id === id)) {
        idx = i;
        continue;
      }
      break;
    }
    const built = fresh.map(({ id, text, speakerId, kind, english }) => {
      const row = {
        id,
        text,
        speakerId: speakerId ?? null,
        kind: kind ?? 'narration',
        lemmas: lemmasFor(lemmaMap, text, `${ch.id}:${id}`),
      };
      en[`${ch.id}:${id}`] = english;
      return row;
    });
    p.sentences.splice(idx + 1, 0, ...built);
    return;
  }
  throw new Error(`afterId ${afterId} not found in ${ch.id}`);
}
function wordCount(ch) {
  let n = 0;
  for (const p of ch.paragraphs) {
    for (const s of p.sentences) {
      n += s.text
        .normalize('NFC')
        .replace(/[“”«»]/g, '')
        .split(/\s+/)
        .filter(Boolean).length;
    }
  }
  return n;
}

// --- Ch 25: soft PP ramp + length ---
{
  const { file, ch } = load(25);
  // Short PP first (recognize pattern), then lengthen.
  set(ch, 's01', 'Lunedì mattina Luca è tornato al caffè.', null, 'narration', 'On Monday morning Luca went back to the café.');
  set(ch, 's02', 'Luca è arrivato presto.', null, 'narration', 'Luca arrived early.');
  set(ch, 's03', 'Ha aperto la porta.', null, 'narration', 'He opened the door.');
  set(ch, 's04', 'Ha preparato i tavoli.', null, 'narration', 'He prepared the tables.');
  set(ch, 's05', 'Sono entrati pochi clienti.', null, 'narration', 'Few customers came in.');
  set(ch, 's06', 'Luca ha servito un caffè.', null, 'narration', 'Luca served a coffee.');
  set(ch, 's07', 'Ha portato acqua a un tavolo.', null, 'narration', 'He brought water to a table.');
  set(ch, 's08', 'Giulia ha guardato i tavoli.', null, 'narration', 'Giulia looked at the tables.');
  set(ch, 's09', 'Non ha sorriso.', null, 'narration', 'She did not smile.');
  set(ch, 's10', 'Ci sono meno clienti. I tavoli sono pronti, ma sono vuoti.', null, 'narration', 'There are fewer customers. The tables are ready, but they are empty.');
  set(
    ch,
    's11',
    'Quasi nessuno è entrato dopo. Luca ha ascoltato la strada fuori.',
    null,
    'narration',
    'Almost nobody came in after that. Luca listened to the street outside.',
  );
  // Keep s12+ meaning; refresh a few mid-chapter recycled beats
  set(
    ch,
    's18',
    'Luca ha servito i pochi clienti. Ha portato caffè e acqua con calma.',
    null,
    'narration',
    'Luca served the few customers. He brought coffee and water calmly.',
  );
  set(
    ch,
    's21',
    'Nel pomeriggio la sala è ancora quasi vuota. Luca ha pulito un tavolo e ha aspettato.',
    null,
    'narration',
    'In the afternoon the room is still almost empty. Luca cleaned a table and waited.',
  );
  // "ha aspettato" is PP - good. Avoid imperfect.
  append(ch, 's26', [
    {
      id: 's26b',
      text: 'Ha guardato i tavoli vuoti un’altra volta.',
      english: 'He looked at the empty tables one more time.',
    },
    {
      id: 's26c',
      text: 'Ha portato un piatto in cucina e ha lavorato con calma.',
      english: 'He brought a plate to the kitchen and worked calmly.',
    },
    {
      id: 's26d',
      text: 'Ha preparato ancora acqua e ha aspettato vicino alla porta.',
      english: 'He prepared more water and waited near the door.',
    },
  ]);
  append(ch, 's34', [
    {
      id: 's34b',
      text: 'Ha messo i soldi sul tavolo e ha contato di nuovo.',
      english: 'He put the money on the table and counted again.',
    },
    {
      id: 's34c',
      text: 'Poi ha pensato al caffè del quartiere e ai clienti di oggi.',
      english: 'Then he thought about the neighborhood café and today’s customers.',
    },
    {
      id: 's34d',
      text: 'Ha guardato fuori dalla finestra e ha visto la strada tranquilla.',
      english: 'He looked out the window and saw the quiet street.',
    },
  ]);
  append(ch, 's38', [
    {
      id: 's39',
      text: 'Ha chiuso la luce e ha aspettato il giorno dopo.',
      english: 'He turned off the light and waited for the next day.',
    },
    {
      id: 's40',
      text: 'Ha pensato di nuovo ai tavoli vuoti e al messaggio di Sofia.',
      english: 'He thought again about the empty tables and Sofia’s message.',
    },
    {
      id: 's41',
      text: 'Ha messo il telefono sul tavolo e ha aspettato la mattina.',
      english: 'He put the phone on the table and waited for the morning.',
    },
  ]);
  console.log('25 words', wordCount(ch));
  save(file, ch);
}

// --- Ch 26: PP sequencing only; no se; no imperfect ---
{
  const { file, ch } = load(26);
  set(
    ch,
    's05',
    'Ci sono ancora pochi clienti, meno di lunedì. Luca ha contato i tavoli vuoti.',
    null,
    'narration',
    'There are still few customers, fewer than Monday. Luca counted the empty tables.',
  );
  set(
    ch,
    's27',
    'Poi ha servito i pochi clienti con calma. Ha portato caffè e ha ascoltato.',
    null,
    'narration',
    'Then he served the few customers calmly. He brought coffee and listened.',
  );
  set(
    ch,
    's28',
    'Dopo ha pulito i tavoli e ha preparato la sala di nuovo.',
    null,
    'narration',
    'After that he cleaned the tables and prepared the room again.',
  );
  append(ch, 's30', [
    {
      id: 's30b',
      text: 'Hanno portato acqua a un altro tavolo e hanno lavorato insieme.',
      english: 'They brought water to another table and worked together.',
    },
  ]);
  append(ch, 's33', [
    {
      id: 's33b',
      text: 'Luca ha chiuso un momento la porta e ha guardato la strada.',
      english: 'Luca closed the door for a moment and looked at the street.',
    },
  ]);
  append(ch, 's42', [
    {
      id: 's43',
      text: 'Ha messo il telefono sul tavolo e ha aspettato la sera.',
      english: 'He put the phone on the table and waited for the evening.',
    },
  ]);
  console.log('26 words', wordCount(ch));
  save(file, ch);
}

// --- Ch 27: keep ≤2 imperfect (ascoltava + era) ---
{
  const { file, ch } = load(27);
  set(
    ch,
    's09',
    'Luca ha detto tutto del caffè con calma. Ha parlato dei clienti e del lavoro.',
    null,
    'narration',
    'Luca said everything about the café calmly. He talked about the customers and the job.',
  );
  set(
    ch,
    's19',
    'Luca ha guardato la strada e ha pensato. Poi ha ascoltato Sofia di nuovo.',
    null,
    'narration',
    'Luca looked at the street and thought. Then he listened to Sofia again.',
  );
  append(ch, 's32', [
    {
      id: 's32b',
      text: 'Hanno camminato ancora un poco e hanno guardato la piazza.',
      english: 'They walked a little more and looked at the square.',
    },
  ]);
  append(ch, 's38', [
    {
      id: 's38b',
      text: 'Ha scritto due parole sul telefono e ha letto di nuovo il messaggio.',
      english: 'He wrote two words on the phone and read the message again.',
    },
  ]);
  console.log('27 words', wordCount(ch));
  save(file, ch);
}

// --- Ch 28 ---
{
  const { file, ch } = load(28);
  set(
    ch,
    's09',
    'Marco si è seduto e ha guardato i tavoli vuoti. Ha preso l’acqua con calma.',
    null,
    'narration',
    'Marco sat down and looked at the empty tables. He took the water calmly.',
  );
  set(
    ch,
    's19',
    'Luca ha ascoltato Marco con calma e senza fretta. Poi ha portato pane al tavolo.',
    null,
    'narration',
    'Luca listened to Marco calmly and without hurry. Then he brought bread to the table.',
  );
  append(ch, 's30', [
    {
      id: 's30b',
      text: 'Luca ha preparato un altro caffè e ha lavorato vicino alla porta.',
      english: 'Luca prepared another coffee and worked near the door.',
    },
  ]);
  console.log('28 words', wordCount(ch));
  save(file, ch);
}

// --- Ch 29 ---
{
  const { file, ch } = load(29);
  set(
    ch,
    's08',
    'Nonna Rosa ha ascoltato con calma e senza fretta. Ha portato pane al tavolo.',
    null,
    'narration',
    'Nonna Rosa listened calmly and without hurry. She brought bread to the table.',
  );
  set(
    ch,
    's09',
    'Marco guardava il tavolo e non parlava molto. Ha bevuto un poco d’acqua.',
    null,
    'narration',
    'Marco was looking at the table and was not talking much. He drank a little water.',
  );
  append(ch, 's18', [
    {
      id: 's18b',
      text: 'Luca ha ascoltato l’idea e ha guardato Sofia.',
      english: 'Luca listened to the idea and looked at Sofia.',
    },
  ]);
  console.log('29 words', wordCount(ch));
  save(file, ch);
}

// --- Ch 32: split 26-word outlier ---
{
  const { file, ch } = load(32);
  set(
    ch,
    's24',
    'Il padrone è tornato in cucina senza altre parole.',
    null,
    'narration',
    'The owner went back to the kitchen without other words.',
  );
  // Insert follow-ons after s24
  append(ch, 's24', [
    {
      id: 's24b',
      text: 'Luca ha pensato all’affitto e alle ore di Giulia.',
      english: 'Luca thought about the rent and about Giulia’s hours.',
    },
    {
      id: 's24c',
      text: 'Giulia ha accettato, ma per lei era importante.',
      english: 'Giulia accepted, but for her it was important.',
    },
  ]);
  console.log('32 words', wordCount(ch));
  save(file, ch);
}

// --- Ch 36: split supporting setup before speech (not the speech itself) ---
{
  const { file, ch } = load(36);
  set(
    ch,
    's01',
    'Più tardi, quando la sala era piena, Luca ha guardato le persone.',
    null,
    'narration',
    'Later, when the room was full, Luca looked at the people.',
  );
  append(ch, 's01', [
    {
      id: 's01b',
      text: 'Alcune erano entrate grazie alla festa.',
      english: 'Some had come in because of the celebration.',
    },
    {
      id: 's01c',
      text: 'Lui voleva la gente di nuovo.',
      english: 'He wanted the people again.',
    },
  ]);
  console.log('36 words', wordCount(ch));
  save(file, ch);
}

fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`);
fs.writeFileSync(pePath, `${JSON.stringify(pe, null, 2)}\n`);
console.log('EN written. Done.');
