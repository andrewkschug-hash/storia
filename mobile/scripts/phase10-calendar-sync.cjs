const fs = require('fs');
const path = require('path');
const { buildLemmaMap, lemmasFor } = require('./a2/lemma-map');

const root = path.join(__dirname, '..');
const lex = JSON.parse(fs.readFileSync(path.join(root, 'content/lexicon/italian-core.json'), 'utf8'));
const lemmaMap = buildLemmaMap(lex.lexicon);
const enPath = path.join(root, 'content/stories/luca-a-roma/sentence-english.json');
const avPath = path.join(root, 'content/stories/luca-a-roma/adaptive-variants.json');

function fixLiteralTrailing(file) {
  let t = fs.readFileSync(file, 'utf8');
  if (t.endsWith('}\\n')) t = `${t.slice(0, -3)}}\n`;
  else if (t.endsWith(']\\n')) t = `${t.slice(0, -3)}]\n`;
  else if (t.endsWith('\\n')) t = `${t.slice(0, -2)}\n`;
  fs.writeFileSync(file, t);
  JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log('fixed', path.basename(file));
}

for (const rel of [
  'content/stories/luca-a-roma/chapters/chapter-30.json',
  'content/stories/luca-a-roma/chapters/chapter-31.json',
  'content/stories/luca-a-roma/adaptive-variants.json',
  'content/stories/luca-a-roma/sentence-english.json',
]) {
  fixLiteralTrailing(path.join(root, rel));
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function load(n) {
  const file = path.join(root, 'content/stories/luca-a-roma/chapters', `chapter-${String(n).padStart(2, '0')}.json`);
  return { file, ch: JSON.parse(fs.readFileSync(file, 'utf8')) };
}
function set(ch, id, text, speakerId, kind, english) {
  for (const p of ch.paragraphs) {
    for (const s of p.sentences) {
      if (s.id !== id) continue;
      s.text = text;
      s.speakerId = speakerId;
      s.kind = kind;
      s.lemmas = lemmasFor(lemmaMap, text, `${ch.id}:${id}`);
      en[`${ch.id}:${id}`] = english;
      return;
    }
  }
  throw new Error(`${ch.id}:${id}`);
}

{
  const { file, ch } = load(30);
  set(
    ch,
    's01',
    'Quel pomeriggio Luca e Sofia erano al caffè, e Giulia li ha visti.',
    null,
    'narration',
    'That afternoon Luca and Sofia were at the café, and Giulia saw them.',
  );
  fs.writeFileSync(file, `${JSON.stringify(ch, null, 2)}\n`);
  console.log('30 s01 ok');
}
{
  const { file, ch } = load(31);
  set(
    ch,
    's02',
    'Più tardi Luca, Sofia, Marco e Giulia si sono incontrati al caffè.',
    null,
    'narration',
    'Later Luca, Sofia, Marco, and Giulia met at the café.',
  );
  fs.writeFileSync(file, `${JSON.stringify(ch, null, 2)}\n`);
  console.log('31 s02 ok');
}

const av = JSON.parse(fs.readFileSync(avPath, 'utf8'));
const extText =
  'Quel pomeriggio Luca e Sofia erano al caffè con Giulia. Dovevano chiedere il sì del padrone.';
av.sentences['luca-a-roma-30:s01'] = {
  reinforces: ['pomeriggio'],
  variants: [
    {
      id: 'extended',
      text: extText,
      lemmas: lemmasFor(lemmaMap, extText, 'luca-a-roma-30:s01:extended'),
      reinforces: ['pomeriggio'],
    },
  ],
};
en['luca-a-roma-30:s01:extended'] =
  'That afternoon Luca and Sofia were at the café with Giulia. They had to ask for the owner’s yes.';

fs.writeFileSync(avPath, `${JSON.stringify(av, null, 2)}\n`);
fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`);
console.log('adaptive + EN ok');
