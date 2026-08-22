/**
 * Ch36–39 naturalness/trim + Ch40 Friday body + Monday epilogue.
 * No arc rewrite. No audio.
 * Run: node mobile/scripts/phase10-ending-polish.cjs
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
      s.speakerId = speakerId;
      s.kind = kind;
      s.lemmas = lemmasFor(lemmaMap, text, `${ch.id}:${id}`);
      if (english) en[`${ch.id}:${id}`] = english;
      return;
    }
  }
  throw new Error(`Missing ${ch.id}:${id}`);
}
function remove(ch, ids) {
  const drop = new Set(ids);
  for (const p of ch.paragraphs) {
    p.sentences = p.sentences.filter((s) => !drop.has(s.id));
  }
  for (const id of drop) delete en[`${ch.id}:${id}`];
}
function syncExercise(chapterId, sourceSentenceId, expectedIt, promptEn) {
  for (const e of pe.exercises) {
    if (e.chapterId === chapterId && e.sourceSentenceId === sourceSentenceId) {
      if (expectedIt) e.expectedIt = expectedIt;
      if (promptEn) e.promptEn = promptEn;
    }
  }
}

// --- Ch36: keep speech; cut explicit future/today motif ---
{
  const { file, ch } = load(36);
  set(
    ch,
    's28',
    'Luca ha ascoltato. Il padrone parlava di oggi, non di lunedì.',
    null,
    'narration',
    'Luca listened. The owner was talking about today, not about Monday.',
  );
  set(
    ch,
    's44',
    'Il padrone aveva detto sì per oggi. Il resto poteva aspettare.',
    null,
    'narration',
    'The owner had said yes for today. The rest could wait.',
  );
  remove(ch, ['s48']); // "Oggi conta..." — redundant with s45/s46
  save(file, ch);
  console.log('36');
}

// --- Ch37: trim uncertainty restatement ---
{
  const { file, ch } = load(37);
  set(
    ch,
    's18',
    'Un mese non è tutto. Ma era un inizio vero.',
    null,
    'narration',
    'A month is not everything. But it was a real start.',
  );
  set(
    ch,
    's47',
    'Il caffè restava. Ora c’erano più ore. Luca doveva ancora scegliere le ore.',
    null,
    'narration',
    'The café was staying. Now there were more hours. Luca still had to choose the hours.',
  );
  remove(ch, ['s35', 's36', 's40', 's46']);
  save(file, ch);
  console.log('37');
}

// --- Ch38: naturalness ---
{
  const { file, ch } = load(38);
  set(
    ch,
    's18',
    'Allora non è un sì o un no. È una domanda di orario.',
    'sofia',
    'dialogue',
    'So it’s not a yes or a no. It’s a question of schedule.',
  );
  set(
    ch,
    's39',
    'Non hanno deciso tutto. Hanno deciso cosa fare il giorno dopo.',
    null,
    'narration',
    'They did not decide everything. They decided what to do the next day.',
  );
  remove(ch, ['s48']); // "questa sera, questo era abbastanza" motif
  save(file, ch);
  console.log('38');
}

// --- Ch39: light naturalness ---
{
  const { file, ch } = load(39);
  set(
    ch,
    's43',
    'Luca ha ascoltato. Il gruppo stava meglio, ma niente era finito.',
    null,
    'narration',
    'Luca listened. The group was doing better, but nothing was finished.',
  );
  set(
    ch,
    's51',
    'Poi ha chiuso la luce. Il caffè restava. Domani c’era la chiamata.',
    null,
    'narration',
    'Then he turned off the light. The café was staying. Tomorrow there was the call.',
  );
  save(file, ch);
  console.log('39');
}

// --- Ch40: Friday body + short Monday epilogue; final present-tense line ---
{
  const { file, ch } = load(40);
  set(
    ch,
    's07',
    'La proposta era chiara. Luca doveva scegliere con calma.',
    null,
    'narration',
    'The offer was clear. Luca had to choose calmly.',
  );
  set(
    ch,
    's36',
    'Gli amici erano lì. Non c’era una festa, solo una scelta.',
    null,
    'narration',
    'His friends were there. There was no celebration, only a choice.',
  );
  set(
    ch,
    's39',
    'Luca restava con il gruppo. Il lavoro al caffè continuava.',
    null,
    'narration',
    'Luca was staying with the group. Work at the café continued.',
  );
  set(
    ch,
    's42',
    'Ha preparato le cose per la mattina e ha guardato l’orario una volta ancora.',
    null,
    'narration',
    'He prepared his things for the morning and looked at the schedule once more.',
  );

  // Monday epilogue (compressed) — keep s47 for production exercise
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
    'Marco non c’era, perché non era un giorno pieno.',
    null,
    'narration',
    'Marco was not there, because it was not a busy day.',
  );
  set(
    ch,
    's45',
    'Due clienti sono entrati. Luca ha portato caffè e acqua.',
    null,
    'narration',
    'Two customers came in. Luca brought coffee and water.',
  );
  set(
    ch,
    's46',
    'Giulia ha guardato i tavoli e ha parlato piano.',
    null,
    'narration',
    'Giulia looked at the tables and spoke quietly.',
  );
  set(
    ch,
    's47',
    'Oggi lavoriamo. Domani anche. Questo è il lavoro, per adesso.',
    'giulia',
    'dialogue',
    'Today we work. Tomorrow too. This is the job, for now.',
  );
  set(
    ch,
    's48',
    'Sì. Per adesso.',
    'luca',
    'dialogue',
    'Yes. For now.',
  );
  set(
    ch,
    's49',
    'Luca guarda i tavoli e pensa: per adesso questa è casa.',
    null,
    'narration',
    'Luca looks at the tables and thinks: for now this is home.',
  );
  remove(ch, ['s50', 's51', 's52', 's53']);
  save(file, ch);
  console.log('40');
}

fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`);
fs.writeFileSync(pePath, `${JSON.stringify(pe, null, 2)}\n`);
console.log('EN/PE written');
