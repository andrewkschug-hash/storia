/**
 * Build A1+ bridge chapters 21–24.
 * Run from repo root: node mobile/scripts/build-a1plus-bridge.js
 */
const fs = require('fs');
const path = require('path');

const {
  chapter21,
  chapter22,
  chapter23,
  chapter24,
} = require('./chapters-a1plus-21-24');
const { questionsByChapterNumber } = require('./questions-a1plus-21-24');

const root = path.join(__dirname, '..');
const lexiconPath = path.join(root, 'content', 'lexicon', 'italian-core.json');
const chaptersDir = path.join(root, 'content', 'stories', 'luca-a-roma', 'chapters');
const manifestPath = path.join(root, 'content', 'stories', 'luca-a-roma', 'manifest.json');
const englishPath = path.join(root, 'content', 'stories', 'luca-a-roma', 'sentence-english.json');
const adaptivePath = path.join(root, 'content', 'stories', 'luca-a-roma', 'adaptive-variants.json');

const chaptersByNumber = {
  21: chapter21,
  22: chapter22,
  23: chapter23,
  24: chapter24,
};

/** English translation for every sentence in chapters 21–24. */
const englishByKey = {
  'luca-a-roma-21:s01': 'After the trip Luca returns to his life in Rome.',
  'luca-a-roma-21:s02': 'Today is Monday and Luca wakes up early.',
  'luca-a-roma-21:s03': 'Luca has a home and a job at the café.',
  'luca-a-roma-21:s04': 'Every morning Luca goes to work in the neighborhood.',
  'luca-a-roma-21:s05': 'Today Luca goes to work earlier because he must talk with Marco.',
  'luca-a-roma-21:s06': 'Luca prepares something to eat because he is hungry.',
  'luca-a-roma-21:s07': 'Then Luca leaves home and walks down the street.',
  'luca-a-roma-21:s08': 'The neighborhood is quiet in the morning.',
  'luca-a-roma-21:s09': 'Luca knows the square and the shops in the neighborhood.',
  'luca-a-roma-21:s10': 'He walks toward the café where he works every day.',
  'luca-a-roma-21:s11': 'When he arrives, he sees the door of the café.',
  'luca-a-roma-21:s12': 'Giulia is already at work.',
  'luca-a-roma-21:s13': 'Good morning, Giulia.',
  'luca-a-roma-21:s14': 'Good morning, Luca. Today you arrive early.',
  'luca-a-roma-21:s15': 'Yes, I must talk with the owner.',
  'luca-a-roma-21:s16': 'The owner arrives and looks at the room of the café.',
  'luca-a-roma-21:s17': 'Luca, today the café is busy.',
  'luca-a-roma-21:s18': 'All right. I can help.',
  'luca-a-roma-21:s19': 'Giulia and Luca prepare the tables for the customers.',
  'luca-a-roma-21:s20': 'The customers arrive early on Monday.',
  'luca-a-roma-21:s21': 'Luca serves water and coffee to the customers.',
  'luca-a-roma-21:s22': 'Giulia helps Luca when a customer asks for something.',
  'luca-a-roma-21:s23': 'It is not difficult, Luca.',
  'luca-a-roma-21:s24': 'Thank you, Giulia.',
  'luca-a-roma-21:s25': 'The owner watches Luca and says thank you.',
  'luca-a-roma-21:s26': 'Good, Luca. Today you work well.',
  'luca-a-roma-21:s27': 'Luca is happy and not tired.',
  'luca-a-roma-21:s28': 'In the afternoon the café is quieter.',
  'luca-a-roma-21:s29': 'Luca looks at the square from the window of the café.',
  'luca-a-roma-21:s30': 'Rome is beautiful and Luca is happy.',
  'luca-a-roma-21:s31': 'In the evening Luca goes home.',
  'luca-a-roma-21:s32': 'Tomorrow there is work again, but today goes well.',
  'luca-a-roma-21:s33': 'Luca sleeps well at night.',
  'luca-a-roma-21:s34': 'His life in Rome is beautiful.',
  'luca-a-roma-21:s35': 'Luca knows the neighborhood and the job.',
  'luca-a-roma-21:s36': 'After the trip everything is easier.',
  'luca-a-roma-21:s37': 'Luca has friends and an important job.',

  'luca-a-roma-22:s01': 'In the evening Luca finishes work at the café.',
  'luca-a-roma-22:s02': 'He leaves the café and sees Sofia in the square.',
  'luca-a-roma-22:s03': 'Hi, Luca. How are you?',
  'luca-a-roma-22:s04': 'Fine, thanks. And you?',
  'luca-a-roma-22:s05': 'Fine. Shall we walk a little?',
  'luca-a-roma-22:s06': 'Yes, I like to walk in the evening.',
  'luca-a-roma-22:s07': 'Luca and Sofia walk down the street of the neighborhood.',
  'luca-a-roma-22:s08': 'The square is beautiful in the evening.',
  'luca-a-roma-22:s09': 'There are people and lights in the neighborhood.',
  'luca-a-roma-22:s10': 'How is your life in Rome now?',
  'luca-a-roma-22:s11': 'It goes well. I have a home and a job.',
  'luca-a-roma-22:s12': 'I am happy to stay here.',
  'luca-a-roma-22:s13': 'Good. You are important to us.',
  'luca-a-roma-22:s14': 'Thank you, Sofia. You are a good friend.',
  'luca-a-roma-22:s15': 'Luca and Sofia stand near the shop.',
  'luca-a-roma-22:s16': 'They talk about work and friends.',
  'luca-a-roma-22:s17': 'Giulia works well at the café.',
  'luca-a-roma-22:s18': 'Yes, Giulia is kind.',
  'luca-a-roma-22:s19': 'Sofia looks at the square and smiles.',
  'luca-a-roma-22:s20': 'Rome is big, but the neighborhood is small.',
  'luca-a-roma-22:s21': 'I like this neighborhood.',
  'luca-a-roma-22:s22': 'Me too.',
  'luca-a-roma-22:s23': 'They walk a little more and talk about the future.',
  'luca-a-roma-22:s24': 'Luca wants to stay in Rome.',
  'luca-a-roma-22:s25': 'Then Sofia must go home.',
  'luca-a-roma-22:s26': 'See you tomorrow?',
  'luca-a-roma-22:s27': 'Yes, see you.',
  'luca-a-roma-22:s28': 'Luca returns to his apartment.',
  'luca-a-roma-22:s29': 'The evening is quiet and Luca is happy.',
  'luca-a-roma-22:s30': 'Tomorrow there is a new day of work.',
  'luca-a-roma-22:s31': 'Luca thinks about his friends in Rome.',
  'luca-a-roma-22:s32': 'Sofia is important to Luca.',
  'luca-a-roma-22:s33': 'Walking in the evening is nice.',
  'luca-a-roma-22:s34': 'Luca looks at the lights of the neighborhood.',
  'luca-a-roma-22:s35': 'Rome is home for Luca now.',
  'luca-a-roma-22:s36': 'Luca sleeps well and thinks about tomorrow.',
  'luca-a-roma-22:s37': 'The neighborhood in the evening is quiet.',
  'luca-a-roma-22:s38': 'Luca and Sofia talk about work and friends.',
  'luca-a-roma-22:s39': 'Luca is happy to live in Rome.',
  'luca-a-roma-22:s40': 'The evening in the neighborhood is beautiful and quiet.',
  'luca-a-roma-22:s41': 'Luca and Sofia walk and talk about life in Rome.',

  'luca-a-roma-23:s01': 'Today is Wednesday and the café is very busy.',
  'luca-a-roma-23:s02': 'Luca arrives at work and sees many customers.',
  'luca-a-roma-23:s03': 'Giulia prepares the tables quickly.',
  'luca-a-roma-23:s04': 'Good morning, Giulia. Today there is a lot of work.',
  'luca-a-roma-23:s05': 'Yes, many customers today. Help me, Luca.',
  'luca-a-roma-23:s06': 'The owner enters the café.',
  'luca-a-roma-23:s07': 'Luca and Giulia, today work together.',
  'luca-a-roma-23:s08': 'All right.',
  'luca-a-roma-23:s09': 'Luca brings water and coffee to the tables.',
  'luca-a-roma-23:s10': 'Giulia takes the orders of the customers.',
  'luca-a-roma-23:s11': 'A customer asks for bread and water.',
  'luca-a-roma-23:s12': 'Excuse me, where is the bread?',
  'luca-a-roma-23:s13': 'The bread is here, Luca.',
  'luca-a-roma-23:s14': 'Thank you. You are kind.',
  'luca-a-roma-23:s15': 'Giulia helps Luca with every order.',
  'luca-a-roma-23:s16': 'Luca listens to Giulia and learns quickly.',
  'luca-a-roma-23:s17': 'Do not be afraid, Luca.',
  'luca-a-roma-23:s18': 'The café is full of people.',
  'luca-a-roma-23:s19': 'Luca serves the customers and smiles.',
  'luca-a-roma-23:s20': 'Giulia talks with the customers and takes orders.',
  'luca-a-roma-23:s21': 'The owner watches and says: Good, work together.',
  'luca-a-roma-23:s22': 'Luca and Giulia are a good team.',
  'luca-a-roma-23:s23': 'In the afternoon the customers leave the café.',
  'luca-a-roma-23:s24': 'Giulia and Luca prepare the tables again.',
  'luca-a-roma-23:s25': 'Today is difficult, but it goes well.',
  'luca-a-roma-23:s26': 'Thank you for the help, Giulia.',
  'luca-a-roma-23:s27': 'You are welcome. Tomorrow is another day.',
  'luca-a-roma-23:s28': 'Luca leaves the café and walks toward home.',
  'luca-a-roma-23:s29': 'Today he learns a lot at work.',
  'luca-a-roma-23:s30': 'Giulia is a good friend at the café.',
  'luca-a-roma-23:s31': 'Luca serves water and bread to the customers.',
  'luca-a-roma-23:s32': 'The owner is happy with the work.',
  'luca-a-roma-23:s33': 'Luca goes home tired but happy.',
  'luca-a-roma-23:s34': 'Tomorrow the café opens early again.',
  'luca-a-roma-23:s35': 'Giulia and Luca are a good team at the café.',
  'luca-a-roma-23:s36': 'Luca knows the customers of the neighborhood.',
  'luca-a-roma-23:s37': 'The job at the café is important for Luca.',
  'luca-a-roma-23:s38': 'Every day Luca learns something new.',
  'luca-a-roma-23:s39': 'Together Giulia and Luca do good work.',
  'luca-a-roma-23:s40': 'Luca is happy at the café.',

  'luca-a-roma-24:s01': 'Today is Sunday and Luca does not work.',
  'luca-a-roma-24:s02': 'Luca wakes up late and makes coffee at home.',
  'luca-a-roma-24:s03': 'Sunday is quiet in the neighborhood.',
  'luca-a-roma-24:s04': 'Luca looks at the street from the window.',
  'luca-a-roma-24:s05': 'Then Luca thinks about his family and the phone.',
  'luca-a-roma-24:s06': 'Luca calls Nonna Rosa.',
  'luca-a-roma-24:s07': 'Hello?',
  'luca-a-roma-24:s08': 'Hi, Grandma. It is Luca.',
  'luca-a-roma-24:s09': 'Hi, Luca! How are you?',
  'luca-a-roma-24:s10': 'Fine, thanks. I am fine in Rome.',
  'luca-a-roma-24:s11': 'I have a home and a job at the café.',
  'luca-a-roma-24:s12': 'I am happy here.',
  'luca-a-roma-24:s13': 'Good, Luca. I am happy.',
  'luca-a-roma-24:s14': 'Do you have friends in Rome?',
  'luca-a-roma-24:s15': 'Yes, I have Sofia, Giulia, and Marco.',
  'luca-a-roma-24:s16': 'They are kind and they help me.',
  'luca-a-roma-24:s17': 'Nonna Rosa listens and smiles.',
  'luca-a-roma-24:s18': 'I love you, Grandma.',
  'luca-a-roma-24:s19': 'I love you too, Luca.',
  'luca-a-roma-24:s20': 'Good. Your life in Rome is beautiful.',
  'luca-a-roma-24:s21': 'Luca looks at the square from the phone.',
  'luca-a-roma-24:s22': 'Yesterday Luca went to the shop.',
  'luca-a-roma-24:s23': 'Today he stays home and talks with his family.',
  'luca-a-roma-24:s24': 'Sunday is important for Luca.',
  'luca-a-roma-24:s25': 'After the call Luca walks in the neighborhood.',
  'luca-a-roma-24:s26': 'He sees the square and the café where he works.',
  'luca-a-roma-24:s27': 'Rome is home now.',
  'luca-a-roma-24:s28': 'Luca returns to his apartment.',
  'luca-a-roma-24:s29': 'The evening is quiet and Luca is happy.',
  'luca-a-roma-24:s30': 'Tomorrow there is a new Monday of work.',
  'luca-a-roma-24:s31': 'Luca thinks about the week and the café.',
  'luca-a-roma-24:s32': 'His family is far away, but Luca is fine.',
  'luca-a-roma-24:s33': 'Nonna Rosa is happy for Luca.',
  'luca-a-roma-24:s34': 'Luca drinks a coffee and looks at the square.',
  'luca-a-roma-24:s35': 'Sunday in Rome is quiet and beautiful.',
  'luca-a-roma-24:s36': 'Luca reads and drinks coffee at home.',
  'luca-a-roma-24:s37': 'The call with Nonna Rosa is important.',
  'luca-a-roma-24:s38': 'Luca is happy with his life in Rome.',
  'luca-a-roma-24:s39': 'Tomorrow Luca returns to work with his friends.',
  'luca-a-roma-24:s40': 'Sunday helps Luca think and feel well.',
};

function loadLemmaIds() {
  const file = JSON.parse(fs.readFileSync(lexiconPath, 'utf8'));
  return new Set(file.lexicon.map((entry) => entry.lemmaId));
}

function wordCount(chapter) {
  let count = 0;
  for (const paragraph of chapter.paragraphs) {
    for (const sentence of paragraph.sentences) {
      count += sentence.lemmas.length;
    }
  }
  return count;
}

function validateChapter(chapter, lemmaIds) {
  for (const paragraph of chapter.paragraphs) {
    for (const sentence of paragraph.sentences) {
      const key = `${chapter.id}:${sentence.id}`;
      if (!englishByKey[key]) {
        throw new Error(`Missing English for ${key}`);
      }
      for (const lemmaId of sentence.lemmas) {
        if (!lemmaIds.has(lemmaId)) {
          throw new Error(`${key} uses unknown lemmaId: ${lemmaId}`);
        }
      }
    }
  }
}

function buildChapterJson(number) {
  const base = chaptersByNumber[number];
  const questions = questionsByChapterNumber[number];
  if (!base) throw new Error(`Missing chapter ${number}`);
  if (!questions || questions.length !== 3) {
    throw new Error(`Chapter ${number} must have exactly 3 questions`);
  }
  return { ...base, questions };
}

const lemmaIds = loadLemmaIds();
fs.mkdirSync(chaptersDir, { recursive: true });

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
for (const key of Object.keys(english)) {
  const match = key.match(/^luca-a-roma-(2[1-4]):/);
  if (match) delete english[key];
}

const adaptive = JSON.parse(fs.readFileSync(adaptivePath, 'utf8'));
if (adaptive.sentences) {
  for (const key of Object.keys(adaptive.sentences)) {
    if (/^luca-a-roma-(2[1-4]):/.test(key)) {
      delete adaptive.sentences[key];
    }
  }
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.chapters = manifest.chapters.filter((entry) => entry.number < 21 || entry.number > 24);

for (let number = 21; number <= 24; number += 1) {
  const chapterJson = buildChapterJson(number);
  validateChapter(chapterJson, lemmaIds);

  for (const paragraph of chapterJson.paragraphs) {
    for (const sentence of paragraph.sentences) {
      const key = `${chapterJson.id}:${sentence.id}`;
      english[key] = englishByKey[key];
    }
  }

  const file = `chapter-${String(number).padStart(2, '0')}.json`;
  fs.writeFileSync(
    path.join(chaptersDir, file),
    JSON.stringify(chapterJson, null, 2) + '\n',
    'utf8',
  );

  manifest.chapters.push({
    id: chapterJson.id,
    number: chapterJson.number,
    title: chapterJson.title,
    titleIt: chapterJson.titleIt,
    difficultyLevel: chapterJson.difficultyLevel,
    file,
  });

  const wc = wordCount(chapterJson);
  console.log(
    'wrote',
    file,
    chapterJson.titleIt,
    `${wc} words`,
    `(${chapterJson.questions.length} questions)`,
  );
  if (wc < 250) console.warn(`  (below A1+ target: ${wc} < 250)`);
  if (wc > 500) console.warn(`  (above A1+ target: ${wc} > 500)`);
}

manifest.chapters.sort((a, b) => a.number - b.number);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
fs.writeFileSync(englishPath, JSON.stringify(english, null, 2) + '\n', 'utf8');
fs.writeFileSync(adaptivePath, JSON.stringify(adaptive, null, 2) + '\n', 'utf8');
console.log('updated manifest.json, sentence-english.json, and adaptive-variants.json');
