/** Chapters are grouped into batches of five for grammar notes and recap. */

export const LESSON_BATCH_SIZE = 5;

export type LessonBatchRange = {
  start: number;
  end: number;
};

export function isLessonBatchEnd(chapterNumber: number): boolean {
  return chapterNumber > 0 && chapterNumber % LESSON_BATCH_SIZE === 0;
}

export function batchRangeForChapter(chapterNumber: number): LessonBatchRange {
  const end = chapterNumber;
  const start = Math.max(1, end - LESSON_BATCH_SIZE + 1);
  return { start, end };
}

export type GrammarExample = {
  italian: string;
  english: string;
};

export type GrammarStep = {
  title: string;
  /** Direct explanation of the pattern — what it means and when to use it. */
  explanation: string;
  /** One-line rule the learner can remember. */
  rule: string;
  examples: GrammarExample[];
};

export type GrammarPracticeQuestion = {
  /** English instruction shown to the learner. */
  prompt: string;
  choices: string[];
  correctIndex: number;
  /** Shown after answering — explains why the correct choice works. */
  explanation: string;
};

export type GrammarNote = {
  batchKey: string;
  title: string;
  intro: string;
  steps: GrammarStep[];
  practice: GrammarPracticeQuestion[];
};

const GRAMMAR_BY_BATCH: Record<string, GrammarNote> = {
  '1-5': {
    batchKey: '1-5',
    title: 'Essere and avere',
    intro:
      'Chapters 1–5 lean on two verbs: essere (to be) and avere (to have). Here is exactly how they work in the sentences you read.',
    steps: [
      {
        title: 'Essere tells you who someone is, where they are, or how they feel',
        explanation:
          'Essere is “to be.” In Italian you change the ending of the verb to match the subject — but you often leave out io / tu / lui because the ending already tells you who is speaking.\n\n' +
          '• è = he / she / it is (Luca è stanco → Luca is tired)\n' +
          '• sono = I am (Sono a Roma → I am in Rome)\n' +
          '• sei = you are (informal)\n\n' +
          'When you see è after a name, read it as “is”: Sofia è al bar = Sofia is at the bar.',
        rule: 'Name + è + adjective/place = “[Name] is …”',
        examples: [
          { italian: 'Luca è a Roma.', english: 'Luca is in Rome.' },
          { italian: 'Sofia è stanca.', english: 'Sofia is tired.' },
          { italian: 'È mattina.', english: 'It is morning.' },
        ],
      },
      {
        title: 'Avere tells you what someone has — including feelings',
        explanation:
          'Avere is “to have.” Italian uses it for possession and for many feelings English expresses with “to be.”\n\n' +
          '• ho = I have (Ho fame → literally “I have hunger” = I am hungry)\n' +
          '• ha = he / she has (Luca ha una casa → Luca has a house)\n' +
          '• hai = you have\n\n' +
          'If an English sentence says “I am hungry / thirsty / sleepy,” Italian usually says “I have hunger / thirst / sleep.”',
        rule: 'Ho / ha + noun often = “I am / he is …” in English',
        examples: [
          { italian: 'Ho fame.', english: 'I am hungry. (lit. I have hunger)' },
          { italian: 'Luca ha poco soldi.', english: 'Luca has little money.' },
          { italian: 'Non ho molti soldi.', english: 'I do not have much money.' },
        ],
      },
      {
        title: 'Non goes right before the verb to make a sentence negative',
        explanation:
          'To say “not,” put non immediately before the verb. Nothing else moves.\n\n' +
          'Affirmative: Ho fame. → Negative: Non ho fame.\n' +
          'Affirmative: Luca è stanco. → Negative: Luca non è stanco.\n\n' +
          'Non is one word — do not split it from the verb.',
        rule: 'Non + verb = negative sentence',
        examples: [
          { italian: 'Non ho fame.', english: 'I am not hungry.' },
          { italian: 'Luca non è a casa.', english: 'Luca is not at home.' },
          { italian: 'Non è tardi.', english: 'It is not late.' },
        ],
      },
    ],
    practice: [
      {
        prompt: 'Luca is tired. Which sentence is correct?',
        choices: ['Luca ha stanco.', 'Luca è stanco.', 'Luca sono stanco.'],
        correctIndex: 1,
        explanation:
          'Use essere (è) for “is” + adjective: Luca è stanco. Avere (ha) is for possession, not adjectives like “tired.”',
      },
      {
        prompt: 'How do you say “I am hungry” in Italian?',
        choices: ['Sono fame.', 'Ho fame.', 'Ho affamato.'],
        correctIndex: 1,
        explanation:
          'Italian says “I have hunger”: Ho fame. You need avere (ho), not essere, for this feeling.',
      },
      {
        prompt: 'Which sentence means “Luca does not have much money”?',
        choices: [
          'Luca non ha molti soldi.',
          'Luca ha non molti soldi.',
          'Non Luca ha molti soldi.',
        ],
        correctIndex: 0,
        explanation: 'Non goes directly before the verb: non ha.',
      },
    ],
  },
  '6-10': {
    batchKey: '6-10',
    title: 'Volere and cercare',
    intro:
      'Luca starts making plans in Rome. Two verbs drive that: volere (to want) and cercare (to look for). Here is how to build those sentences.',
    steps: [
      {
        title: 'Volere: voglio / vuole + another verb',
        explanation:
          'Volere means “to want.” To say what you want to do, use volere + an infinitive (the -are / -ere / -ire form):\n\n' +
          '• voglio = I want → Voglio mangiare. (I want to eat.)\n' +
          '• vuole = he / she wants → Luca vuole un lavoro. (Luca wants a job.)\n' +
          '• vuoi = you want\n\n' +
          'You can also want a thing (noun): vuole un caffè = he wants a coffee.',
        rule: 'Volere + infinitive = “want to …”',
        examples: [
          { italian: 'Voglio mangiare.', english: 'I want to eat.' },
          { italian: 'Luca vuole un lavoro.', english: 'Luca wants a job.' },
          { italian: 'Vuole restare a Roma.', english: 'He wants to stay in Rome.' },
        ],
      },
      {
        title: 'Cercare: a regular verb for “to look for”',
        explanation:
          'Cercare ends in -are, so it follows the same pattern as parlare or mangiare:\n\n' +
          '• cerco = I look for / I am looking for\n' +
          '• cerchi = you look for\n' +
          '• cerca = he / she looks for\n\n' +
          'Put what you are searching for right after the verb: Cerco un lavoro. Word order is flexible — Cerco un lavoro al caffè and Al caffè cerco un lavoro both work.',
        rule: 'Cerco / cerca + thing = “I am / he is looking for …”',
        examples: [
          { italian: 'Luca cerca un lavoro.', english: 'Luca is looking for a job.' },
          { italian: 'Cerchi un lavoro?', english: 'Are you looking for a job?' },
          { italian: 'Scusa, cerco un lavoro.', english: 'Excuse me, I am looking for a job.' },
        ],
      },
      {
        title: 'Scusa and per favore soften requests',
        explanation:
          'Scusa (excuse me — informal) and per favore (please) do not change grammar, but they appear constantly when Luca asks strangers for help.\n\n' +
          'Scusa often opens a question: Scusa, cerco un lavoro.\n' +
          'Per favore follows a request: Un caffè, per favore.',
        rule: 'Scusa + question = polite opening',
        examples: [
          { italian: 'Scusa, dov\'è il bar?', english: 'Excuse me, where is the bar?' },
          { italian: 'Un caffè, per favore.', english: 'A coffee, please.' },
          { italian: 'Scusa, cerco un lavoro.', english: 'Excuse me, I am looking for a job.' },
        ],
      },
    ],
    practice: [
      {
        prompt: '“I want to eat.” Which is correct?',
        choices: ['Voglio mangiare.', 'Voglio mangio.', 'Mangio voglio.'],
        correctIndex: 0,
        explanation: 'After volere, use the infinitive mangiare — not the conjugated mangio.',
      },
      {
        prompt: 'Luca is looking for a job. Pick the right sentence.',
        choices: ['Luca cerca un lavoro.', 'Luca cerco un lavoro.', 'Luca cerca lavoro un.'],
        correctIndex: 0,
        explanation: 'Third person uses cerca: Luca cerca un lavoro.',
      },
      {
        prompt: 'Which sentence politely starts a question to a stranger?',
        choices: ['Scusa, dov\'è il bar?', 'Dov\'è scusa il bar?', 'Scusa il bar dov\'è?'],
        correctIndex: 0,
        explanation: 'Scusa comes at the start: Scusa, dov\'è il bar?',
      },
    ],
  },
  '11-15': {
    batchKey: '11-15',
    title: 'Prepositions: a, in, con, per',
    intro:
      'Small words — a, in, con, per — tell you direction, location, company, and purpose. Here is what each one actually does.',
    steps: [
      {
        title: 'A = toward / to (especially cities and people)',
        explanation:
          'Use a before cities and before people when someone goes to them:\n\n' +
          '• a Roma = to Rome / in Rome (when moving or being there)\n' +
          '• a casa = home / to home\n' +
          '• a Marco = to Marco (giving something to someone)\n\n' +
          'Combined with the: a + il = al, a + la = alla. Luca va al caffè = Luca goes to the café.',
        rule: 'Movement toward a place → often a (+ article)',
        examples: [
          { italian: 'Luca va a Roma.', english: 'Luca goes to Rome.' },
          { italian: 'Vado al caffè.', english: 'I am going to the café.' },
          { italian: 'Marco è a Roma.', english: 'Marco is in Rome.' },
        ],
      },
      {
        title: 'In = inside a space',
        explanation:
          'In means “in” or “inside.” Use it for rooms, countries (sometimes), and enclosed places:\n\n' +
          '• in cucina = in the kitchen\n' +
          '• in Italia = in Italy\n' +
          '• nel caffè = in the café (in + il = nel)\n\n' +
          'Think: a = direction toward; in = you are inside.',
        rule: 'Being inside → in / nel / nella',
        examples: [
          { italian: 'Sono in casa.', english: 'I am at home. (inside the house)' },
          { italian: 'Sofia è in cucina.', english: 'Sofia is in the kitchen.' },
          { italian: 'Luca lavora nel caffè.', english: 'Luca works in the café.' },
        ],
      },
      {
        title: 'Con = with · Per = for (purpose or recipient)',
        explanation:
          'Con joins people: Luca è con Sofia = Luca is with Sofia.\n\n' +
          'Per explains why or for whom:\n\n' +
          '• Soldi per l\'affitto = money for the rent\n' +
          '• Grazie per l\'aiuto = thanks for the help\n' +
          '• Un caffè per Marco = a coffee for Marco',
        rule: 'Con + person = “with” · Per + noun = “for”',
        examples: [
          { italian: 'Luca è con Sofia.', english: 'Luca is with Sofia.' },
          { italian: 'Soldi per l\'affitto.', english: 'Money for the rent.' },
          { italian: 'Grazie per l\'aiuto.', english: 'Thanks for the help.' },
        ],
      },
    ],
    practice: [
      {
        prompt: 'Luca goes to the café. Which is correct?',
        choices: ['Luca va in caffè.', 'Luca va al caffè.', 'Luca va a il caffè.'],
        correctIndex: 1,
        explanation: 'a + il combines to al: Luca va al caffè.',
      },
      {
        prompt: '“I am in the kitchen.” Pick the right sentence.',
        choices: ['Sono a cucina.', 'Sono in cucina.', 'Sono con cucina.'],
        correctIndex: 1,
        explanation: 'Inside a room uses in: Sono in cucina.',
      },
      {
        prompt: '“Money for the rent.” Which phrase is correct?',
        choices: ['Soldi con l\'affitto.', 'Soldi per l\'affitto.', 'Soldi a l\'affitto.'],
        correctIndex: 1,
        explanation: 'Per expresses purpose or recipient: per l\'affitto = for the rent.',
      },
    ],
  },
  '16-20': {
    batchKey: '16-20',
    title: 'Time words and movement verbs',
    intro:
      'Chapters 16–20 add when things happen (oggi, domani) and how people move (andare, venire, tornare). Here is how those pieces fit together.',
    steps: [
      {
        title: 'Time words usually come first',
        explanation:
          'Italian often opens with when something happens. The verb stays in normal order after that.\n\n' +
          '• oggi = today\n' +
          '• domani = tomorrow\n' +
          '• ieri = yesterday\n\n' +
          'Oggi Luca cerca lavoro. = Today Luca looks for work.\n' +
          'Domani Sofia viene. = Tomorrow Sofia is coming.',
        rule: 'Time word + subject + verb = natural Italian order',
        examples: [
          { italian: 'Oggi è lunedì.', english: 'Today is Monday.' },
          { italian: 'Domani Luca lavora.', english: 'Tomorrow Luca works.' },
          { italian: 'Ieri piove.', english: 'Yesterday it rained.' },
        ],
      },
      {
        title: 'Andare = to go · Venire = to come · Tornare = to return',
        explanation:
          'These three verbs describe movement — and they conjugate differently:\n\n' +
          '• andare: vado / va → Luca va al bar. (Luca goes to the bar.)\n' +
          '• venire: vengo / viene → Sofia viene domani. (Sofia is coming tomorrow.)\n' +
          '• tornare: torno / torna → Luca torna a casa. (Luca returns home.)\n\n' +
          'Pair them with a (direction): tornare a casa, andare a Roma.',
        rule: 'Movement verb + a + place = go/come/return to …',
        examples: [
          { italian: 'Luca va al bar.', english: 'Luca goes to the bar.' },
          { italian: 'Sofia viene domani.', english: 'Sofia is coming tomorrow.' },
          { italian: 'Luca torna a casa.', english: 'Luca returns home.' },
        ],
      },
      {
        title: 'Present tense = happening now or regularly',
        explanation:
          'The story uses present tense for what is happening now and for habits:\n\n' +
          'Luca cerca lavoro. = Luca is looking for work (now / these days).\n' +
          'Luca lavora al bar. = Luca works at the bar (regularly).\n\n' +
          'You do not need a separate “is …-ing” form — context tells you.',
        rule: 'One present tense covers “does” and “is doing”',
        examples: [
          { italian: 'Luca cerca lavoro.', english: 'Luca is looking for work.' },
          { italian: 'Sofia parla italiano.', english: 'Sofia speaks Italian.' },
          { italian: 'Marco lavora molto.', english: 'Marco works a lot.' },
        ],
      },
    ],
    practice: [
      {
        prompt: '“Tomorrow Sofia is coming.” Which is correct?',
        choices: ['Domani Sofia viene.', 'Sofia domani venire.', 'Domani Sofia va.'],
        correctIndex: 0,
        explanation: 'Time first, then subject + verb: Domani Sofia viene. Venire = to come.',
      },
      {
        prompt: 'Luca returns home. Pick the right sentence.',
        choices: ['Luca torna a casa.', 'Luca torna in casa a.', 'Luca va tornare casa.'],
        correctIndex: 0,
        explanation: 'Tornare a casa is the fixed pattern for “return home.”',
      },
      {
        prompt: '“Luca goes to the bar.” Which is correct?',
        choices: ['Luca viene al bar.', 'Luca va al bar.', 'Luca va in bar.'],
        correctIndex: 1,
        explanation: 'Andare (va) = to go. Al bar = to the bar (a + il).',
      },
    ],
  },
};

export function grammarNoteForBatch(start: number, end: number): GrammarNote | null {
  const key = `${start}-${end}`;
  const note = GRAMMAR_BY_BATCH[key];
  if (note) return note;

  return {
    batchKey: key,
    title: 'Patterns from the story',
    intro: `Chapters ${start}–${end} repeat a few sentence shapes. Here is a direct label for what you already saw — then a quick check.`,
    steps: [
      {
        title: 'Look for the verb first',
        explanation:
          'Every sentence has a verb that tells you what happens. Find it, then notice the small words around it — articles (il, la), prepositions (a, in, di), and endings that show who is acting.\n\n' +
          'You do not need every table memorized. If you recognize the pattern in the story, you are learning.',
        rule: 'Find the verb → then who + where + what',
        examples: [
          { italian: 'Luca va al caffè.', english: 'Luca goes to the café.' },
          { italian: 'Sono a Roma.', english: 'I am in Rome.' },
          { italian: 'Ho bisogno di soldi.', english: 'I need money.' },
        ],
      },
    ],
    practice: [
      {
        prompt: 'Which word is the verb in “Luca va al caffè”?',
        choices: ['Luca', 'va', 'caffè'],
        correctIndex: 1,
        explanation: 'Va (goes) is the verb — it tells you the action.',
      },
    ],
  };
}

export function grammarNoteForChapter(chapterNumber: number): GrammarNote | null {
  if (!isLessonBatchEnd(chapterNumber)) return null;
  const { start, end } = batchRangeForChapter(chapterNumber);
  return grammarNoteForBatch(start, end);
}

/** @deprecated Use `steps` on GrammarNote. Kept for any legacy references. */
export type LegacyGrammarPoint = { heading: string; body: string; examples: string[] };
