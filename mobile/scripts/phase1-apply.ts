/**
 * Phase 1 — targeted Luca A2 cleanup (Ch 25–40).
 * Run: npx tsx scripts/phase1-apply.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { buildLemmaMap, lemmasFor } from './a2/lemma-map';

const root = join(__dirname, '..');
const storyDir = join(root, 'content', 'stories', 'luca-a-roma');
const chaptersDir = join(storyDir, 'chapters');
const englishPath = join(storyDir, 'sentence-english.json');

type Sentence = {
  id: string;
  text: string;
  speakerId: string | null;
  kind: string;
  lemmas: string[];
  phrases?: unknown[];
};

type Chapter = {
  id: string;
  paragraphs: { id: string; order: number; sentences: Sentence[] }[];
  questions: {
    id: string;
    question: string;
    questionIt?: string;
    [key: string]: unknown;
  }[];
  [key: string]: unknown;
};

const lexicon = JSON.parse(
  readFileSync(join(root, 'content', 'lexicon', 'italian-core.json'), 'utf8'),
).lexicon;
const lemmaMap = buildLemmaMap(lexicon);
const english: Record<string, string> = JSON.parse(readFileSync(englishPath, 'utf8'));

function chapterFile(n: number) {
  return join(chaptersDir, `chapter-${String(n).padStart(2, '0')}.json`);
}

function loadChapter(n: number): Chapter {
  return JSON.parse(readFileSync(chapterFile(n), 'utf8'));
}

function saveChapter(n: number, chapter: Chapter) {
  writeFileSync(chapterFile(n), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
}

function chapterKey(n: number) {
  return `luca-a-roma-${String(n).padStart(2, '0')}`;
}

function setSentence(chapter: Chapter, chapterNum: number, id: string, text: string, en: string) {
  const key = `${chapterKey(chapterNum)}:${id}`;
  for (const p of chapter.paragraphs) {
    const sentence = p.sentences.find((s) => s.id === id);
    if (!sentence) continue;
    sentence.text = text;
    sentence.lemmas = lemmasFor(lemmaMap, text, key, null);
    english[key] = en;
    return;
  }
  throw new Error(`Sentence ${id} not found in chapter ${chapterNum}`);
}

function removeSentences(chapter: Chapter, chapterNum: number, ids: string[]) {
  for (const id of ids) {
    delete english[`${chapterKey(chapterNum)}:${id}`];
  }
  for (const p of chapter.paragraphs) {
    p.sentences = p.sentences.filter((s) => !ids.includes(s.id));
  }
}

function addQuestionIt(chapter: Chapter, rules: { id: string; questionIt: string }[]) {
  for (const rule of rules) {
    const q = chapter.questions.find((row) => row.id === rule.id);
    if (!q) throw new Error(`Question ${rule.id} missing`);
    q.questionIt = rule.questionIt;
  }
}

// --- Chapter 25: smooth vocabulary spike ---
const ch25 = loadChapter(25);
removeSentences(ch25, 25, ['s14', 's16', 's21', 's31', 's38']);
setSentence(
  ch25,
  25,
  's05',
  'Poi ha aperto la porta e ha preparato i tavoli con calma.',
  'Then he opened the door and prepared the tables calmly.',
);
setSentence(ch25, 25, 's07', 'La mattina sono entrati pochi clienti.', 'That morning only a few customers came in.');
setSentence(ch25, 25, 's11', 'Fuori non faceva freddo.', 'Outside it was not cold.');
setSentence(ch25, 25, 's13', 'Il padrone è arrivato tardi.', 'The owner arrived late.');
setSentence(
  ch25,
  25,
  's15',
  'Non ha detto niente a Giulia e a Luca.',
  'He said nothing to Giulia and Luca.',
);
setSentence(ch25, 25, 's17', 'Lavoriamo. Vediamo come va oggi.', 'Let’s work. We’ll see how today goes.');
setSentence(ch25, 25, 's18', 'Luca ha servito i pochi clienti.', 'Luca served the few customers.');
setSentence(
  ch25,
  25,
  's19',
  'Ha portato caffè e ha ascoltato i clienti.',
  'He brought coffee and listened to the customers.',
);
setSentence(ch25, 25, 's20', 'Ogni cliente era importante.', 'Every customer was important.');
setSentence(
  ch25,
  25,
  's24',
  'Anch’io. Il caffè non va bene, e il mio lavoro non va bene.',
  'Me too. The café is not going well, and my job is not going well.',
);
setSentence(
  ch25,
  25,
  's27',
  'Perché ci sono pochi clienti adesso?',
  'Why are there so few customers now?',
);
setSentence(
  ch25,
  25,
  's33',
  'Aveva soldi per l’affitto di questo mese, ma il mese dopo era difficile.',
  'He had money for this month’s rent, but the next month looked difficult.',
);
setSentence(
  ch25,
  25,
  's34',
  'Luca è vicino alla finestra e pensa al caffè.',
  'Luca is near the window and thinks about the café.',
);
setSentence(
  ch25,
  25,
  's35',
  'Poi ha scritto un messaggio a Sofia.',
  'Then he wrote a message to Sofia.',
);
addQuestionIt(ch25, [
  { id: 'ch25_q01', questionIt: 'Cosa è diverso al caffè?' },
]);
saveChapter(25, ch25);

// --- Chapter 26: light difficulty staircase (recover) ---
const ch26 = loadChapter(26);
removeSentences(ch26, 26, ['s05']);
setSentence(
  ch26,
  26,
  's04',
  'Luca ha aperto la porta e ha guardato la sala, perché c’erano ancora pochi clienti, come ieri.',
  'Luca opened the door and looked at the room, because there were still few customers, like yesterday.',
);
setSentence(
  ch26,
  26,
  's11',
  'Prima i clienti entravano ogni giorno, ma adesso i soldi del caffè non sono abbastanza per il lavoro.',
  'Before, customers came in every day, but now the café’s money is not enough for the work.',
);
removeSentences(ch26, 26, ['s12']);
setSentence(
  ch26,
  26,
  's15',
  'La sala era tranquilla quando il padrone parlava, e Luca ascoltava senza dire niente.',
  'The room was quiet while the owner spoke, and Luca listened without saying anything.',
);
removeSentences(ch26, 26, ['s16']);
addQuestionIt(ch26, [{ id: 'ch26_q03', questionIt: 'Con chi parlerà Luca domani?' }]);
saveChapter(26, ch26);

// --- Chapter 27: slightly more connected ---
const ch27 = loadChapter(27);
removeSentences(ch27, 27, ['s07']);
setSentence(
  ch27,
  27,
  's06',
  'Sofia ha ascoltato e non ha detto niente per un momento, poi hanno camminato con le persone della sera.',
  'Sofia listened and said nothing for a moment, then they walked with the evening crowd.',
);
removeSentences(ch27, 27, ['s18']);
setSentence(
  ch27,
  27,
  's17',
  'Sofia non stava solo aiutando Luca a Roma, ma pensava con lui, da amica, con la sua idea.',
  'Sofia was not only helping Luca in Rome, but thinking with him, as a friend, with her own idea.',
);
addQuestionIt(ch27, [{ id: 'ch27_q01', questionIt: 'Cosa dice Luca a Sofia?' }]);
saveChapter(27, ch27);

// --- Chapter 28: slightly denser ---
const ch28 = loadChapter(28);
removeSentences(ch28, 28, ['s02']);
setSentence(
  ch28,
  28,
  's01',
  'Giovedì Marco è arrivato al caffè nel pomeriggio, quando c’erano pochi clienti e la sala era tranquilla.',
  'On Thursday Marco arrived at the café in the afternoon, when there were few customers and the room was quiet.',
);
removeSentences(ch28, 28, ['s09']);
setSentence(
  ch28,
  28,
  's08',
  'Giulia ha portato l’acqua senza dire il prezzo, e Marco ha capito.',
  'Giulia brought water without saying the price, and Marco understood.',
);
addQuestionIt(ch28, [{ id: 'ch28_q02', questionIt: 'Cosa offre Luca a Marco?' }]);
saveChapter(28, ch28);

// --- Chapter 29: slightly denser / inferential ---
const ch29 = loadChapter(29);
removeSentences(ch29, 29, ['s02']);
setSentence(
  ch29,
  29,
  's01',
  'Venerdì Luca, Sofia e Marco sono andati da Nonna Rosa, in una casa piccola e calda, con cose vecchie e belle.',
  'On Friday Luca, Sofia and Marco went to Nonna Rosa’s, in a small warm house with old beautiful things.',
);
addQuestionIt(ch29, [
  { id: 'ch29_q01', questionIt: 'Che idea suggerisce Nonna Rosa?' },
  { id: 'ch29_q02', questionIt: 'Come può aiutare Marco?' },
]);
saveChapter(29, ch29);

// --- Chapter 30: bridge into 31–40 ---
const ch30 = loadChapter(30);
removeSentences(ch30, 30, ['s09', 's10']);
setSentence(
  ch30,
  30,
  's08',
  'Il padrone era vicino alla porta della cucina: ascoltava, non sembrava contento, solo stanco e poco sicuro.',
  'The owner was near the kitchen door: he listened, did not seem happy, only tired and a little unsure.',
);
removeSentences(ch30, 30, ['s02']);
setSentence(
  ch30,
  30,
  's01',
  'Il giorno dopo, sabato non era ancora arrivato, ma Luca e Sofia erano già al caffè la mattina presto.',
  'The next day, Saturday had not arrived yet, but Luca and Sofia were already at the café early in the morning.',
);
addQuestionIt(ch30, [
  { id: 'ch30_q01', questionIt: 'Cosa decide il padrone?' },
  { id: 'ch30_q03', questionIt: 'Che tipo di incontro vogliono?' },
]);
saveChapter(30, ch30);

// --- Chapters 31–40: questionIt progression ---
const questionItByChapter: Record<number, { id: string; questionIt: string }[]> = {
  31: [
    { id: 'ch31_q01', questionIt: 'Cosa iniziano a fare gli amici dopo il sì del padrone?' },
    { id: 'ch31_q02', questionIt: 'Quale limite indica Giulia per il caffè?' },
  ],
  32: [
    { id: 'ch32_q01', questionIt: 'Cosa diventa chiaro sulle risposte?' },
    { id: 'ch32_q03', questionIt: 'Perché Luca è più incerto alla fine?' },
  ],
  33: [
    { id: 'ch33_q01', questionIt: 'Perché Marco è in ritardo?' },
    { id: 'ch33_q03', questionIt: 'Cosa chiarisce Giulia a Marco?' },
  ],
  34: [
    { id: 'ch34_q01', questionIt: 'Cosa preparano sabato mattina?' },
    { id: 'ch34_q02', questionIt: 'Come fa Marco a mostrare che è disponibile?' },
  ],
  35: [
    { id: 'ch35_q01', questionIt: 'Come si riempie la sala?' },
    { id: 'ch35_q02', questionIt: 'Come reagisce il padrone quando la sala si riempie?' },
    { id: 'ch35_q03', questionIt: 'Cosa dimostra per ora la sala piena?' },
  ],
  36: [
    { id: 'ch36_q01', questionIt: 'Cosa chiede Luca?' },
    { id: 'ch36_q02', questionIt: 'Com’è Sofia con Luca in questo capitolo?' },
    { id: 'ch36_q03', questionIt: 'Perché il padrone risponde in modo più aperto?' },
  ],
  37: [
    { id: 'ch37_q01', questionIt: 'Cosa decide il padrone?' },
    { id: 'ch37_q02', questionIt: 'Quale cambiamento concreto c’è per Luca e Giulia?' },
    { id: 'ch37_q03', questionIt: 'Perché la soluzione è buona ma non una certezza permanente?' },
  ],
  38: [
    { id: 'ch38_q01', questionIt: 'Di cosa parlano soprattutto Luca e Sofia a cena?' },
    { id: 'ch38_q02', questionIt: 'Perché più ore sono un problema per Luca?' },
    { id: 'ch38_q03', questionIt: 'Quale scelta pratica Luca vuole portare al padrone?' },
  ],
  39: [
    { id: 'ch39_q01', questionIt: 'Quale opportunità riceve Marco?' },
    { id: 'ch39_q02', questionIt: 'Perché il lavoro di Marco è solo un punto di partenza?' },
    { id: 'ch39_q03', questionIt: 'Come sta cambiando il programma del gruppo?' },
  ],
  40: [
    { id: 'ch40_q01', questionIt: 'Quale offerta concreta riceve Luca?' },
    { id: 'ch40_q02', questionIt: 'Cosa sceglie Luca per adesso?' },
    { id: 'ch40_q03', questionIt: 'Cosa resta vero sulla vita di Luca a Roma dopo la decisione?' },
  ],
};

for (const [num, rules] of Object.entries(questionItByChapter)) {
  const ch = loadChapter(Number(num));
  addQuestionIt(ch, rules);
  saveChapter(Number(num), ch);
}

writeFileSync(englishPath, `${JSON.stringify(english, null, 2)}\n`, 'utf8');
console.log('Phase 1 content edits applied.');
