/**
 * Text-lock polish pass (P0 + P1). No arc redesign. No Ch 1–24. No audio.
 * Run: node mobile/scripts/phase10-textlock-polish.cjs
 */
const fs = require('fs');
const path = require('path');
const { buildLemmaMap, lemmasFor } = require('./a2/lemma-map');

const root = path.join(__dirname, '..');
const chaptersDir = path.join(root, 'content', 'stories', 'luca-a-roma', 'chapters');
const enPath = path.join(root, 'content', 'stories', 'luca-a-roma', 'sentence-english.json');
const lexicon = JSON.parse(fs.readFileSync(path.join(root, 'content', 'lexicon', 'italian-core.json'), 'utf8'));
const lemmaMap = buildLemmaMap(lexicon.lexicon);
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

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

// Ch25
{
  const { file, ch } = load(25);
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

// Ch26
{
  const { file, ch } = load(26);
  set(
    ch,
    's21',
    'Quando il padrone ha finito di parlare, Giulia ha guardato Luca.',
    null,
    'narration',
    'When the owner finished speaking, Giulia looked at Luca.',
  );
  set(
    ch,
    's41',
    'Luca è preoccupato. Domani vuole parlare con Sofia.',
    null,
    'narration',
    'Luca is worried. Tomorrow he wants to talk with Sofia.',
  );
  save(file, ch);
  console.log('26');
}

// Ch27
{
  const { file, ch } = load(27);
  set(
    ch,
    's27',
    'Dobbiamo capire perché, e fare qualcosa prima.',
    'sofia',
    'dialogue',
    'We need to understand why, and do something first.',
  );
  save(file, ch);
  console.log('27');
}

// Ch28 — trim ticket baggage + passato
{
  const { file, ch } = load(28);
  set(
    ch,
    's13',
    'Adesso sono a Roma. Cerco lavoro ogni giorno.',
    'marco',
    'dialogue',
    'Now I am in Rome. I look for work every day.',
  );
  set(
    ch,
    's14',
    'Sì. Sei con noi. Cerchiamo insieme un modo.',
    'luca',
    'dialogue',
    'Yes. You are with us. We’ll look for a way together.',
  );
  set(
    ch,
    's26',
    'Giulia è passata tra i tavoli e ha ascoltato tutto.',
    null,
    'narration',
    'Giulia walked among the tables and listened to everything.',
  );
  save(file, ch);
  console.log('28');
}

// Ch30 — Friday evening + agreement number
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
    's10',
    'Luca e Sofia lo hanno visto e non hanno parlato subito.',
    null,
    'narration',
    'Luca and Sofia saw him and did not speak right away.',
  );
  // Keep s32/s33 (adaptive overlay on s33); lightly sharpen s32 only
  set(
    ch,
    's32',
    'Non avevano ancora gente per sabato.',
    null,
    'narration',
    'They still did not have people for Saturday.',
  );
  save(file, ch);
  console.log('30');
}

// Ch31 — Friday continuity + cut repetition
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
    's38',
    'Il piano c’è. Adesso serve la gente.',
    'giulia',
    'dialogue',
    'The plan is there. Now we need people.',
  );
  remove(ch, ['s07', 's34', 's40', 's42']);
  save(file, ch);
  console.log('31');
}

// Ch32 — Friday evening timeline + Giulia line
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
    's16',
    'Poche ore, o un lavoro vero. Non voglio lavorare qui solo ogni tanto.',
    'giulia',
    'dialogue',
    'A few hours, or real work. I don’t want to work here only now and then.',
  );
  save(file, ch);
  console.log('32');
}

// Ch33 — before Saturday + grammar
{
  const { file, ch } = load(33);
  set(
    ch,
    's01',
    'Prima di sabato Sofia e Marco avevano un appuntamento in piazza.',
    null,
    'narration',
    'Before Saturday Sofia and Marco had a meeting in the square.',
  );
  set(
    ch,
    's33',
    'Sabato abbiamo bisogno di te, Marco. Non solo di “vediamo”.',
    'giulia',
    'dialogue',
    'Saturday we need you, Marco. Not only “we’ll see.”',
  );
  save(file, ch);
  console.log('33');
}

// Ch34
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

// Ch35 — naturalness + Marco busy-day plant
{
  const { file, ch } = load(35);
  set(
    ch,
    's14',
    'Una signora ha chiesto l’orario. Sofia ha risposto con calma.',
    null,
    'narration',
    'A woman asked about the hours. Sofia answered calmly.',
  );
  set(
    ch,
    's16',
    'Sofia parlava con la gente. Giulia serviva. Marco aiutava con i piatti, e due persone aspettavano ancora.',
    null,
    'narration',
    'Sofia was talking with people. Giulia was serving. Marco was helping with the plates, and two people were still waiting.',
  );
  remove(ch, ['s35']);
  save(file, ch);
  console.log('35');
}

// Ch36 — setup + festa almost over
{
  const { file, ch } = load(36);
  set(
    ch,
    's01',
    'Più tardi, quando la sala era piena, Luca ha guardato le persone. Alcune erano entrate grazie alla festa. Lui voleva la gente di nuovo.',
    null,
    'narration',
    'Later, when the room was full, Luca looked at the people. Some had come in because of the celebration. He wanted the people again.',
  );
  // Keep s02 as Giulia Parla - need to check if s02 is still Giulia dialogue
  // Insert Giulia segno before Parla: merge into s01 end or change s02 narrator then shift - keep s02 as dialogue Parla
  set(
    ch,
    's02',
    'Parla. Due parole. Le persone sono qui anche per questo posto.',
    'giulia',
    'dialogue',
    'Speak. Two words. People are here for this place too.',
  );
  set(
    ch,
    's41',
    'Quando la festa era quasi finita, il padrone ha chiuso un poco la musica.',
    null,
    'narration',
    'When the celebration was almost over, the owner turned the music down a little.',
  );
  save(file, ch);
  console.log('36');
}

// Ch37 — business logic + Marco need plant
{
  const { file, ch } = load(37);
  set(
    ch,
    's11',
    'Voi due lavorate di più, se volete. Sabato ho visto che serve più lavoro. Ho bisogno di ore, non di una persona nuova.',
    'padrone',
    'dialogue',
    'You two work more, if you want. On Saturday I saw that more work is needed. I need hours, not a new person.',
  );
  set(
    ch,
    's17',
    'Per Luca era una notizia buona: il lavoro restava, e Giulia aveva ore vere.',
    null,
    'narration',
    'For Luca it was good news: the job was staying, and Giulia had real hours.',
  );
  set(
    ch,
    's21',
    'Qualche ora in più ogni settimana. Sabato abbiamo visto una cosa: c’è domanda. Poi guardiamo i clienti.',
    'padrone',
    'dialogue',
    'A few more hours each week. On Saturday we saw one thing: there is demand. Then we watch the customers.',
  );
  set(
    ch,
    's27',
    'Sofia ha risposto subito. Marco ha risposto dopo: al sabato ha visto tanta gente, e ancora cerca lavoro.',
    null,
    'narration',
    'Sofia answered right away. Marco answered later: on Saturday he saw many people, and he is still looking for work.',
  );
  save(file, ch);
  console.log('37');
}

// Ch38
{
  const { file, ch } = load(38);
  set(
    ch,
    's25',
    'Hanno parlato di questa settimana, non di un anno lungo.',
    null,
    'narration',
    'They talked about this week, not about a long year.',
  );
  save(file, ch);
  console.log('38');
}

// Ch39 — Marco consequence of Saturday
{
  const { file, ch } = load(39);
  set(
    ch,
    's10',
    'Cerco lavoro. Non ho trovato un lavoro. Ma al sabato ho visto che serve aiuto. Posso aiutare qui.',
    'marco',
    'dialogue',
    'I’m looking for work. I haven’t found a job. But on Saturday I saw that help is needed. I can help here.',
  );
  set(
    ch,
    's13',
    'I giorni pieni abbiamo bisogno di una persona in più. Lo abbiamo visto sabato.',
    'giulia',
    'dialogue',
    'On busy days we need one more person. We saw that on Saturday.',
  );
  set(
    ch,
    's14',
    'Poche ore. Pochi soldi. Non è un lavoro grande. Se vuoi, proviamo.',
    'padrone',
    'dialogue',
    'A few hours. Little money. It isn’t a big job. If you want, we’ll try.',
  );
  save(file, ch);
  console.log('39');
}

// Ch40 — decision beat + Marta + wording
{
  const { file, ch } = load(40);
  set(
    ch,
    's08',
    'Un lavoro vero, vicino a casa, vicino alla famiglia, per due mesi.',
    null,
    'narration',
    'A real job, near home, near the family, for two months.',
  );
  set(
    ch,
    's11',
    'Ha pensato al caffè e all’orario nuovo. Poi a Giulia, a Marco e a Sofia.',
    null,
    'narration',
    'He thought about the café and the new schedule. Then about Giulia, Marco, and Sofia.',
  );
  set(
    ch,
    's12',
    'A Roma aveva una casa, un lavoro, e amici. Non era più il primo giorno.',
    null,
    'narration',
    'In Rome he had a home, a job, and friends. It wasn’t the first day anymore.',
  );
  set(
    ch,
    's13',
    'Il lavoro vicino a casa pagava di più. Ma Luca non cercava solo più soldi. Aveva una vita a Roma.',
    null,
    'narration',
    'The job near home paid more. But Luca was not only looking for more money. He had a life in Rome.',
  );
  set(
    ch,
    's18',
    'Non voleva partire proprio quando la sua vita cominciava a essere sua.',
    null,
    'narration',
    'He did not want to leave just when his life was starting to be his own.',
  );
  set(
    ch,
    's19',
    'Ha camminato un poco, poi ha deciso.',
    null,
    'narration',
    'He walked a little, then he decided.',
  );
  set(
    ch,
    's23',
    'La mamma ha ascoltato. Non era felice del tutto, ma ha capito.',
    null,
    'narration',
    'Mom listened. She wasn’t fully happy, but she understood.',
  );
  set(
    ch,
    's24',
    'Capisco. Se un giorno vuoi partire, chiamami. Il posto resta aperto.',
    'marta',
    'dialogue',
    'I understand. If one day you want to leave, call me. The place stays open.',
  );
  save(file, ch);
  console.log('40');
}

fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`);
console.log('EN updated. Done.');
