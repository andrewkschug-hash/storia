/** Chapters are grouped into batches of five for grammar notes and recap.
 *
 * LESSON LAYER FROZEN 2026-08-21 — do not reopen architecture or style.
 * Continuity-only / named-defect (bug) repairs only. See docs/PHASE-10.md.
 */

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
      'Chapters 1–5 use two foundation verbs: essere (to be) and avere (to have). Here is how Italian builds sentences with them, and why Italian speakers often leave out words like "I" and "you".',
    steps: [
      {
        title: 'Essere: Who someone is, where they are, or how they feel',
        explanation:
          'What it means:\n' +
          '• sono = I am\n' +
          '• sei = you are (talking to a friend)\n' +
          '• è = he is / she is / it is\n\n' +
          'The pattern:\n' +
          'In English, you always have to say words like "I", "you", or "he". In Italian, the person words are:\n' +
          '• io = I\n' +
          '• tu = you\n' +
          '• lui = he\n' +
          '• lei = she\n' +
          '• noi = we\n' +
          '• voi = you all\n' +
          '• loro = they\n\n' +
          'Because the verb ending already tells us who is speaking (sono = I am, sei = you are), Italian speakers usually drop words like io and tu.\n\n' +
          'When you see è after a person’s name, read it as "is": Sofia è al bar = Sofia is at the café.',
        rule: 'sono = "I am" · [Name] + è = "[Name] is"',
        examples: [
          { italian: 'Luca è a Roma.', english: 'Luca is in Rome.' },
          { italian: 'Sofia è stanca.', english: 'Sofia is tired.' },
          { italian: 'È mattina.', english: 'It is morning.' },
        ],
      },
      {
        title: 'Avere: What someone has — including feelings like hunger',
        explanation:
          'What it means:\n' +
          '• ho = I have\n' +
          '• hai = you have\n' +
          '• ha = he has / she has\n\n' +
          'The pattern:\n' +
          'Avere means "to have." Italian uses it for possessions, but also for physical feelings that English expresses with "to be":\n' +
          '• ho fame = I am hungry (literally: "I have hunger")\n' +
          '• ho sete = I am thirsty (literally: "I have thirst")\n' +
          '• ho sonno = I am sleepy (literally: "I have sleepiness")\n\n' +
          'Just like with essere, you do not need to say io: Ho fame already tells us who is hungry.',
        rule: 'Ho / ha + feeling = "I am / he is [hungry / thirsty / sleepy]"',
        examples: [
          { italian: 'Ho fame.', english: 'I am hungry. (literally: I have hunger)' },
          { italian: 'Luca ha pochi soldi.', english: 'Luca has little money.' },
          { italian: 'Non ho molti soldi.', english: 'I do not have much money.' },
        ],
      },
      {
        title: 'Non: Making sentences negative',
        explanation:
          'What it means:\n' +
          '• non = not / do not\n\n' +
          'The pattern:\n' +
          'To make any Italian sentence negative, put non immediately in front of the verb. Nothing else moves:\n' +
          '• Ho fame. (I am hungry.) → Non ho fame. (I am not hungry.)\n' +
          '• Luca è a casa. (Luca is at home.) → Luca non è a casa. (Luca is not at home.)',
        rule: 'non + verb = negative sentence',
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
        choices: ['Luca è stanco.', 'Luca ha stanco.', 'Luca sono stanco.'],
        correctIndex: 0,
        explanation:
          'Use essere (è) for "is" + a description: Luca è stanco. Avere (ha) means "has."',
      },
      {
        prompt: 'How do you say "I am hungry" in Italian?',
        choices: ['Ho fame.', 'Sono fame.', 'Ho affamato.'],
        correctIndex: 0,
        explanation:
          'Italian uses avere (to have) for feelings: Ho fame (literally "I have hunger").',
      },
      {
        prompt: 'Which sentence means "Luca does not have much money"?',
        choices: [
          'Luca non ha molti soldi.',
          'Luca ha non molti soldi.',
          'Non Luca ha molti soldi.',
        ],
        correctIndex: 0,
        explanation: 'Put non directly in front of the verb ha: Luca non ha molti soldi.',
      },
    ],
  },
  '6-10': {
    batchKey: '6-10',
    title: 'Volere and cercare',
    intro:
      'As Luca arrives in Rome, he needs to express what he wants and search for work. Two verbs drive these sentences: volere (to want) and cercare (to look for).',
    steps: [
      {
        title: 'Volere: Saying what you want to do',
        explanation:
          'What it means:\n' +
          '• voglio = I want\n' +
          '• vuoi = you want\n' +
          '• vuole = he / she wants\n\n' +
          'The pattern:\n' +
          'To say what you want to do, pair volere with a basic action word (ending in -are, -ere, or -ire):\n' +
          '• Voglio mangiare. = I want to eat.\n' +
          '• Luca vuole restare. = Luca wants to stay.\n\n' +
          'You can also want an item:\n' +
          '• Voglio un caffè. = I want a coffee.',
        rule: 'voglio / vuole + action word = "want to [do something]"',
        examples: [
          { italian: 'Voglio mangiare.', english: 'I want to eat.' },
          { italian: 'Luca vuole un lavoro.', english: 'Luca wants a job.' },
          { italian: 'Vuole restare a Roma.', english: 'He wants to stay in Rome.' },
        ],
      },
      {
        title: 'Cercare: Looking for something or someone',
        explanation:
          'What it means:\n' +
          '• cerco = I am looking for / I look for\n' +
          '• cerchi = you are looking for\n' +
          '• cerca = he / she is looking for\n\n' +
          'The pattern:\n' +
          'In Italian, the verb cercare already includes the meaning of "for"! You do not add any extra word:\n' +
          '• Cerco un lavoro. = I am looking for a job.\n' +
          '• Luca cerca Sofia. = Luca is looking for Sofia.',
        rule: 'cerco / cerca + item = "I am / he is looking for [item]"',
        examples: [
          { italian: 'Luca cerca un lavoro.', english: 'Luca is looking for a job.' },
          { italian: 'Cerchi un lavoro?', english: 'Are you looking for a job?' },
          { italian: 'Scusa, cerco un lavoro.', english: 'Excuse me, I am looking for a job.' },
        ],
      },
      {
        title: 'Scusa and per favore: Polite requests',
        explanation:
          'What it means:\n' +
          '• Scusa = Excuse me (friendly, spoken to one person)\n' +
          '• Per favore = Please\n\n' +
          'The pattern:\n' +
          'Use Scusa at the beginning of a question when approaching someone for help.\n' +
          'Use Per favore at the end of an order or request.',
        rule: 'Scusa + question = polite opening · Per favore = please',
        examples: [
          { italian: 'Scusa, dov\'è il bar?', english: 'Excuse me, where is the café?' },
          { italian: 'Un caffè, per favore.', english: 'A coffee, please.' },
          { italian: 'Scusa, cerco un lavoro.', english: 'Excuse me, I am looking for a job.' },
        ],
      },
    ],
    practice: [
      {
        prompt: '"I want to eat." Which sentence is correct?',
        choices: ['Voglio mangiare.', 'Voglio mangio.', 'Mangio voglio.'],
        correctIndex: 0,
        explanation: 'Pair voglio with the basic action word mangiare: Voglio mangiare.',
      },
      {
        prompt: 'Luca is looking for a job. Pick the right sentence.',
        choices: ['Luca cerca un lavoro.', 'Luca cerco un lavoro.', 'Luca cerca per un lavoro.'],
        correctIndex: 0,
        explanation: 'Use cerca for he/she. Cercare already includes "for," so no per is needed.',
      },
      {
        prompt: 'Which sentence politely starts a question to someone on the street?',
        choices: ['Scusa, dov\'è il bar?', 'Dov\'è scusa il bar?', 'Scusa il bar dov\'è?'],
        correctIndex: 0,
        explanation: 'Start politely with Scusa at the beginning: Scusa, dov\'è il bar?',
      },
    ],
  },
  '11-15': {
    batchKey: '11-15',
    title: 'Prepositions: a, in, con, per',
    intro:
      'Small connecting words tell you direction, location, company, and purpose. Here is how four essential Italian prepositions work.',
    steps: [
      {
        title: 'A: Going to or staying in a city or at home',
        explanation:
          'What it means:\n' +
          '• a = to / in / at\n\n' +
          'The pattern:\n' +
          'Italian uses a before city names and the word casa (home):\n' +
          '• Luca va a Roma. = Luca goes to Rome. (movement)\n' +
          '• Marco è a Roma. = Marco is in Rome. (location)\n' +
          '• a casa = at home / (going) home\n\n' +
          'When a combines with il (the), it blends into al:\n' +
          '• a + il bar = al bar (to the café / at the café)',
        rule: 'a + city/casa = "to/in/at" · a + il = al',
        examples: [
          { italian: 'Luca va a Roma.', english: 'Luca goes to Rome.' },
          { italian: 'Vado al caffè.', english: 'I am going to the café.' },
          { italian: 'Marco è a Roma.', english: 'Marco is in Rome.' },
        ],
      },
      {
        title: 'In: Being inside a room, building, or country',
        explanation:
          'What it means:\n' +
          '• in = in / inside\n\n' +
          'The pattern:\n' +
          'Use in when you are inside a room or a country:\n' +
          '• in cucina = in the kitchen\n' +
          '• in Italia = in Italy\n\n' +
          'When in combines with il (the), it blends into nel:\n' +
          '• in + il caffè = nel caffè (inside the café)',
        rule: 'in + room/country = inside that space · in + il = nel',
        examples: [
          { italian: 'Sono in casa.', english: 'I am at home. (inside the house)' },
          { italian: 'Sofia è in cucina.', english: 'Sofia is in the kitchen.' },
          { italian: 'Luca lavora nel caffè.', english: 'Luca works in the café.' },
        ],
      },
      {
        title: 'Con (with) and Per (for)',
        explanation:
          'What it means:\n' +
          '• con = with\n' +
          '• per = for\n\n' +
          'The pattern:\n' +
          'Use con to connect people:\n' +
          '• Luca è con Sofia. = Luca is with Sofia.\n\n' +
          'Use per to explain purpose, a recipient, or reasons:\n' +
          '• soldi per l\'affitto = money for the rent\n' +
          '• grazie per l\'aiuto = thanks for the help\n' +
          '• un caffè per Marco = a coffee for Marco',
        rule: 'con + person = "with" · per + noun = "for"',
        examples: [
          { italian: 'Luca è con Sofia.', english: 'Luca is with Sofia.' },
          { italian: 'Soldi per l\'affitto.', english: 'Money for the rent.' },
          { italian: 'Grazie per l\'aiuto.', english: 'Thanks for the help.' },
        ],
      },
    ],
    practice: [
      {
        prompt: 'Luca goes to the café. Which sentence is correct?',
        choices: ['Luca va al caffè.', 'Luca va in caffè.', 'Luca va a il caffè.'],
        correctIndex: 0,
        explanation: 'a + il blends smoothly into al: Luca va al caffè.',
      },
      {
        prompt: '"I am in the kitchen." Pick the right sentence.',
        choices: ['Sono in cucina.', 'Sono a cucina.', 'Sono con cucina.'],
        correctIndex: 0,
        explanation: 'Use in for rooms: Sono in cucina.',
      },
      {
        prompt: '"Money for the rent." Which phrase is correct?',
        choices: ['Soldi per l\'affitto.', 'Soldi con l\'affitto.', 'Soldi a l\'affitto.'],
        correctIndex: 0,
        explanation: 'Per expresses purpose or recipient: per l\'affitto = for the rent.',
      },
    ],
  },
  '16-20': {
    batchKey: '16-20',
    title: 'Time words and movement verbs',
    intro:
      'Chapters 16–20 add when events take place (oggi, domani) and how characters move around Rome (andare, venire, tornare). Here is how they work.',
    steps: [
      {
        title: 'Time words: Setting when things happen',
        explanation:
          'What it means:\n' +
          '• oggi = today\n' +
          '• domani = tomorrow\n' +
          '• ieri = yesterday\n\n' +
          'The pattern:\n' +
          'In Italian, time words usually come right at the start of the sentence. The rest of the sentence follows in normal order:\n' +
          '• Oggi Luca cerca lavoro. = Today Luca looks for work.\n' +
          '• Domani Sofia viene. = Tomorrow Sofia is coming.',
        rule: '[Time word] + [person] + [verb] = natural Italian sentence order',
        examples: [
          { italian: 'Oggi è lunedì.', english: 'Today is Monday.' },
          { italian: 'Domani Luca lavora.', english: 'Tomorrow Luca works.' },
          { italian: 'Ieri era tranquillo.', english: 'Yesterday it was quiet.' },
        ],
      },
      {
        title: 'Three key movement verbs: Andare, Venire, Tornare',
        explanation:
          'What it means:\n' +
          '• andare (to go): vado = I go, va = he / she goes\n' +
          '• venire (to come): vengo = I come, viene = he / she comes\n' +
          '• tornare (to return): torno = I return, torna = he / she returns\n\n' +
          'The pattern:\n' +
          'Movement verbs naturally pair with a (direction):\n' +
          '• andare a Roma = to go to Rome\n' +
          '• tornare a casa = to return home\n' +
          '• venire al bar = to come to the café',
        rule: 'Movement verb + a + destination = go / come / return to a place',
        examples: [
          { italian: 'Luca va al bar.', english: 'Luca goes to the café.' },
          { italian: 'Sofia viene domani.', english: 'Sofia is coming tomorrow.' },
          { italian: 'Luca torna a casa.', english: 'Luca returns home.' },
        ],
      },
      {
        title: 'Present tense: Happening now or happening regularly',
        explanation:
          'What it means:\n' +
          'In Italian, one present tense form covers both "does" and "is doing".\n\n' +
          'The pattern:\n' +
          'You do not need a separate "-ing" helper word like in English:\n' +
          '• Luca cerca lavoro. = Luca looks for work OR Luca is looking for work.\n' +
          '• Luca lavora al bar. = Luca works at the café OR Luca is working at the café.\n\n' +
          'The context of the sentence makes the meaning clear.',
        rule: 'One present tense form covers "does" and "is doing"',
        examples: [
          { italian: 'Luca cerca lavoro.', english: 'Luca is looking for work.' },
          { italian: 'Sofia parla italiano.', english: 'Sofia speaks Italian.' },
          { italian: 'Marco lavora molto.', english: 'Marco works a lot.' },
        ],
      },
    ],
    practice: [
      {
        prompt: '"Tomorrow Sofia is coming." Which sentence is correct?',
        choices: ['Domani Sofia viene.', 'Sofia domani venire.', 'Domani Sofia va.'],
        correctIndex: 0,
        explanation:
          'Put the time word first, then person + verb: Domani Sofia viene. Venire = to come.',
      },
      {
        prompt: 'Luca returns home. Pick the right sentence.',
        choices: ['Luca torna a casa.', 'Luca torna in casa a.', 'Luca va tornare casa.'],
        correctIndex: 0,
        explanation: 'Tornare a casa is the natural Italian phrase for returning home.',
      },
      {
        prompt: '"Luca goes to the café." Which sentence is correct?',
        choices: ['Luca va al bar.', 'Luca viene al bar.', 'Luca va in bar.'],
        correctIndex: 0,
        explanation: 'Andare (va) means "goes." Al bar means "to the café" (a + il).',
      },
    ],
  },
  '21-25': {
    batchKey: '21-25',
    title: 'Passato prossimo: completed events',
    intro:
      'In Chapters 21–25, the story begins recounting completed past actions (events that happened and finished). Italian uses the passato prossimo for this.',
    steps: [
      {
        title: 'The two-word team for past actions',
        explanation:
          'What it means:\n' +
          'Passato prossimo is the past tense for specific events that happened (like "Luca arrived", "he opened the door").\n\n' +
          'The pattern:\n' +
          'In Italian, you build this past tense using a team of two words:\n' +
          '• Word 1 (Helper word): ha (has) or è (is)\n' +
          '• Word 2 (Past action word): the past form of the verb\n\n' +
          'For regular action words ending in -are, the past form ends in -ato:\n' +
          '• guardare (to look) → ha guardato (looked)\n' +
          '• chiamare (to call) → ha chiamato (called)\n' +
          '• arrivare (to arrive) → è arrivato (arrived)\n' +
          '• tornare (to return) → è tornato (returned)\n\n' +
          'Notice that some verbs take ha and others take è. Learn them as natural pairs from the story!',
        rule: 'ha / è + past action word = completed past event',
        examples: [
          {
            italian: 'Luca è arrivato presto e ha aperto la porta.',
            english: 'Luca arrived early and opened the door.',
          },
          {
            italian: 'Giulia ha guardato i tavoli e non ha sorriso.',
            english: 'Giulia looked at the tables and did not smile.',
          },
          {
            italian: 'Non ha detto niente ai colleghi.',
            english: 'He did not say anything to his colleagues.',
          },
        ],
      },
      {
        title: 'Common irregular past action words',
        explanation:
          'What it means:\n' +
          'Some verbs have special short past forms that do not end in -ato.\n\n' +
          'The pattern:\n' +
          'Here are three common ones you saw in these chapters:\n' +
          '• aprire (to open) → aperto (ha aperto = opened)\n' +
          '• chiudere (to close) → chiuso (ha chiuso = closed)\n' +
          '• dire (to say) → detto (ha detto = said)\n\n' +
          'When you see these words after ha, you know an action was completed.',
        rule: 'Recognize aperto (opened), chiuso (closed), and detto (said)',
        examples: [
          {
            italian: 'Luca è arrivato presto e ha aperto la porta.',
            english: 'Luca arrived early and opened the door.',
          },
          {
            italian: 'Ha chiuso la porta un momento.',
            english: 'He closed the door for a moment.',
          },
          {
            italian: 'Non ha detto niente ai colleghi.',
            english: 'He did not say anything to his colleagues.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt: 'In "Luca è arrivato presto", which words show the past tense?',
        choices: ['è arrivato', 'Luca', 'presto'],
        correctIndex: 0,
        explanation:
          'The two-word team è (helper) + arrivato (past form) creates the past tense.',
      },
      {
        prompt: 'In the story, which form correctly says: "Luca ___ to the café early"?',
        choices: ['è tornato', 'ha tornato', 'torna'],
        correctIndex: 0,
        explanation:
          'Tornare pairs with è in the past: Luca è tornato presto.',
      },
      {
        prompt: 'In "Non ha detto niente ai colleghi", which word is the past action word?',
        choices: ['detto', 'ha', 'niente'],
        correctIndex: 0,
        explanation: 'Detto is the past form of dire (to say): ha detto = he said.',
      },
    ],
  },
  '26-30': {
    batchKey: '26-30',
    title: 'Imperfetto vs passato prossimo: background vs events',
    intro:
      'Good storytelling mixes two past tenses: l’imperfetto to set the background scene, and il passato prossimo to tell the specific events that occurred.',
    steps: [
      {
        title: 'Imperfetto: The background of the scene',
        explanation:
          'What it means:\n' +
          'L’imperfetto helps you show what was happening or what things were like.\n' +
          'Think of it as the background scenery and atmosphere of the scene:\n' +
          '• Era sera. → It was evening.\n' +
          '• Pioveva. → It was raining.\n\n' +
          'The pattern:\n' +
          'Look for these common background forms in the story:\n' +
          '• era = he / she / it was (Giulia era al caffè = Giulia was at the café)\n' +
          '• c\'erano = there were (c\'erano pochi clienti = there were few customers)\n' +
          '• sembrava = seemed (Marco non sembrava tranquillo = Marco did not seem calm)\n' +
          '• sorrideva = was smiling / used to smile',
        rule: 'Imperfetto = setting the background scene and ongoing atmosphere',
        examples: [
          {
            italian: "C'erano ancora pochi clienti questa mattina, come ieri.",
            english: 'There were still a few customers this morning, like yesterday.',
          },
          {
            italian: 'Giulia era già al caffè e non sorrideva.',
            english: 'Giulia was already at the café and was not smiling.',
          },
          {
            italian: 'Marco non sembrava tranquillo.',
            english: 'Marco did not seem calm.',
          },
        ],
      },
      {
        title: 'Passato prossimo: The action that happens',
        explanation:
          'What it means:\n' +
          'Il passato prossimo tells the sharp, completed actions that move the story forward.\n\n' +
          'The pattern:\n' +
          'While the background was ongoing (imperfetto), a specific action took place (passato prossimo):\n' +
          '• Background: Giulia era al caffè... (Giulia was at the café...)\n' +
          '• Event: ...Luca è arrivato. (...Luca arrived.)\n' +
          '• Event: Ha chiuso la porta. (He closed the door.)\n' +
          '• Event: Il padrone ha chiamato Luca. (The owner called Luca.)',
        rule: 'Background (imperfetto) + Event (passato prossimo) = storytelling',
        examples: [
          {
            italian: 'Martedì mattina Luca è tornato al caffè presto.',
            english: 'On Tuesday morning Luca returned to the café early.',
          },
          {
            italian: 'Ha chiuso la porta un momento.',
            english: 'He closed the door for a moment.',
          },
          {
            italian: 'Il padrone ha chiamato Luca e Giulia vicino ai tavoli.',
            english: 'The owner called Luca and Giulia near the tables.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt: 'In "Giulia era già al caffè e non sorrideva", why is "era" used?',
        choices: [
          'It sets the background scene (she was already there).',
          'It is a sudden completed action.',
          'It is happening right now in the present.',
        ],
        correctIndex: 0,
        explanation: 'Era is imperfetto. It describes the ongoing background state.',
      },
      {
        prompt: '"Martedì mattina Luca ___ al caffè presto." Which form best marks the completed event?',
        choices: ['è tornato', 'era tornato', 'torna'],
        correctIndex: 0,
        explanation: 'È tornato (passato prossimo) marks the specific completed event.',
      },
      {
        prompt: 'In storytelling, which tense gives the "background atmosphere"?',
        choices: ['Imperfetto', 'Passato prossimo', 'Present tense'],
        correctIndex: 0,
        explanation: 'L’imperfetto paints the ongoing background atmosphere.',
      },
    ],
  },
  '31-35': {
    batchKey: '31-35',
    title: 'Connecting ideas: se, time, and reason',
    intro:
      'Chapters 31–35 use connectors to link ideas together: se (if), time words (quando, mentre, poi), and reason words (perché, però, almeno).',
    steps: [
      {
        title: 'Se: Exploring possible situations (If...)',
        explanation:
          'What it means:\n' +
          '• se = if\n\n' +
          'The pattern:\n' +
          'Use se to set up a condition or possibility, followed by the outcome:\n' +
          '• Se viene poca gente, non importa. = If few people come, it does not matter.\n' +
          '• Se non arriva nessuno, almeno abbiamo fatto il lavoro. = If nobody arrives, at least we did the work.',
        rule: 'Se + condition = "If [this happens], [this is the result]"',
        examples: [
          {
            italian: 'Se viene poca gente, non importa.',
            english: 'If few people come, it does not matter.',
          },
          {
            italian: 'Se non arriva nessuno, almeno abbiamo fatto il lavoro.',
            english: 'If nobody arrives, at least we did the work.',
          },
          {
            italian: 'Non possiamo solo aspettare. Dobbiamo parlare ancora, se possiamo.',
            english: 'We cannot only wait. We have to talk again, if we can.',
          },
        ],
      },
      {
        title: 'Quando, mentre, poi: Tracking time order',
        explanation:
          'What it means:\n' +
          '• quando = when\n' +
          '• mentre = while (two actions happening at the same time)\n' +
          '• poi = then / after that\n\n' +
          'The pattern:\n' +
          'These words show the sequence of events in a story:\n' +
          '• Quando ha aperto la porta... = When he opened the door...\n' +
          '• Mentre portava i tavoli, Luca ascoltava... = While he was carrying the tables, Luca listened...\n' +
          '• Poi la porta si è aperta. = Then the door opened.',
        rule: 'quando (when) · mentre (while) · poi (then)',
        examples: [
          {
            italian: 'Quando ha aperto la porta, Giulia era già nella sala.',
            english: 'When he opened the door, Giulia was already in the room.',
          },
          {
            italian: 'Mentre portava i tavoli, Luca ascoltava la strada.',
            english: 'While he was carrying the tables, Luca listened to the street.',
          },
          {
            italian: 'Poi la porta si è aperta. Marco è arrivato.',
            english: 'Then the door opened. Marco arrived.',
          },
        ],
      },
      {
        title: 'Perché, però, almeno: Reasons and contrasts',
        explanation:
          'What it means:\n' +
          '• perché = because / why\n' +
          '• però = but / however\n' +
          '• almeno = at least\n\n' +
          'The pattern:\n' +
          'Use these three words to give nuance to thoughts and opinions:\n' +
          '• perché: gives the reason (Non so perché = I do not know why)\n' +
          '• però: introduces a contrast (Sì. Però voglio gente qui. = Yes. But I want people here.)\n' +
          '• almeno: sets a positive minimum (Almeno abbiamo fatto il lavoro. = At least we did the work.)',
        rule: 'perché (because/why) · però (but) · almeno (at least)',
        examples: [
          {
            italian: 'L’altra parte non risponde, e io non so perché.',
            english: 'The other side does not answer, and I do not know why.',
          },
          {
            italian: 'Sì. Però io voglio gente qui.',
            english: 'Yes. But I want people here.',
          },
          {
            italian: 'Va bene. Se non arriva nessuno, almeno abbiamo fatto il lavoro.',
            english: 'Okay. If nobody arrives, at least we did the work.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt: '"___ viene poca gente, non importa." Which word means "If"?',
        choices: ['Se', 'Quando', 'Poi'],
        correctIndex: 0,
        explanation: 'Se introduces a possibility: Se viene poca gente = If few people come.',
      },
      {
        prompt: '"___ la porta si è aperta, Marco è arrivato." Which word means "Then / After that"?',
        choices: ['Poi', 'Mentre', 'Perché'],
        correctIndex: 0,
        explanation: 'Poi means "then" or "after that."',
      },
      {
        prompt: 'In "Non so ___.", which word completes the meaning of "why"?',
        choices: ['perché', 'però', 'almeno'],
        correctIndex: 0,
        explanation: 'Perché means both "because" and "why."',
      },
    ],
  },
  '36-40': {
    batchKey: '36-40',
    title: 'Reading clearly: pronouns and who did what',
    intro:
      'As story plots grow more complex, you need to track who did what to whom. Italian uses small pronouns like gli (to him) and le (to her) to name the recipient of an action.',
    steps: [
      {
        title: 'Finding who did the action in the past',
        explanation:
          'What it means:\n' +
          'When you see helper + past action (ha chiamato, ha detto), look for the person who performed it.\n\n' +
          'The pattern:\n' +
          'The subject is often named right before the verb or in the previous clause:\n' +
          '• Nonna Rosa ha chiamato Luca... → Nonna Rosa is the one calling.\n' +
          '• ...e lei ha ascoltato Luca bene. → Lei (she = Nonna Rosa) is the one listening.',
        rule: 'Helper + past action = identify the subject before translating',
        examples: [
          {
            italian: 'Nonna Rosa ha chiamato Luca e gli ha detto di restare vicino alla porta.',
            english: 'Nonna Rosa called Luca and told him to stay near the door.',
          },
          {
            italian: 'Marco ha portato un caffè a Nonna Rosa, e lei ha ascoltato Luca bene.',
            english: 'Marco brought a coffee to Nonna Rosa, and she listened to Luca well.',
          },
          {
            italian: 'Luca ha sentito le parole e ha capito che poteva scegliere.',
            english: 'Luca heard the words and understood that he could choose.',
          },
        ],
      },
      {
        title: 'Gli: To him / for him',
        explanation:
          'What it means:\n' +
          '• gli = to him / for him\n\n' +
          'The pattern:\n' +
          'gli sits right before the verb and tells you who receives the action or message:\n' +
          '• Nonna Rosa ha chiamato Luca e gli ha detto...\n' +
          'Nonna speaks → Luca receives the words → gli = to Luca (to him).',
        rule: 'gli = "to him / for him" (the male recipient)',
        examples: [
          {
            italian: 'Nonna Rosa ha chiamato Luca e gli ha detto di restare vicino alla porta.',
            english: 'Nonna Rosa called Luca and told him to stay near the door.',
          },
          {
            italian: 'Sofia ha parlato a Luca e gli ha chiesto cosa vuole.',
            english: 'Sofia spoke to Luca and asked him what he wants.',
          },
        ],
      },
      {
        title: 'Le: To her / for her',
        explanation:
          'What it means:\n' +
          '• le = to her / for her\n\n' +
          'The pattern:\n' +
          'Just like gli is "to him", le means "to her":\n' +
          '• Luca ha chiamato Sofia e le ha detto la verità.\n' +
          'Luca speaks → Sofia receives the truth → le = to Sofia (to her).\n\n' +
          'Quick tip: Do not confuse pronoun le (to her) with the plural word le (the, as in le persone = the people).',
        rule: 'le = "to her / for her" (the female recipient)',
        examples: [
          {
            italian: 'Luca ha chiamato Sofia e le ha detto la verità.',
            english: 'Luca called Sofia and told her the truth.',
          },
          {
            italian: 'Giulia ha parlato a Sofia e le ha spiegato l’orario.',
            english: 'Giulia spoke to Sofia and explained the schedule to her.',
          },
        ],
      },
      {
        title: 'Words for plans: forse, se, per adesso',
        explanation:
          'What it means:\n' +
          '• forse = maybe / perhaps\n' +
          '• se = if\n' +
          '• per adesso = for now / for the time being\n\n' +
          'The pattern:\n' +
          'These words help characters talk about uncertain decisions and temporary plans:\n' +
          '• Il padrone forse vende il caffè. = The owner might sell the café.\n' +
          '• Per adesso resto a Roma. = For now I stay in Rome.',
        rule: 'forse (maybe) · se (if) · per adesso (for now)',
        examples: [
          {
            italian: 'Il padrone forse vende il caffè. Non ha deciso.',
            english: 'The owner might sell the café. He has not decided.',
          },
          {
            italian: 'Se la gente viene, il padrone vede lavoro.',
            english: 'If people come, the owner sees work.',
          },
          {
            italian: 'Per adesso resto a Roma.',
            english: 'For now I stay in Rome.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt: 'In "Nonna Rosa ha chiamato Luca e gli ha detto di restare", what does "gli" mean?',
        choices: [
          'to him (Luca, the person receiving the message)',
          'Nonna Rosa',
          'the door',
        ],
        correctIndex: 0,
        explanation: 'gli means "to him." Luca receives what Nonna Rosa said.',
      },
      {
        prompt: 'In "Luca ha chiamato Sofia e le ha detto la verità", what does "le" mean?',
        choices: ['to her (Sofia)', 'the people', 'the truth'],
        correctIndex: 0,
        explanation: 'Here le is the pronoun "to her." Sofia receives the truth.',
      },
      {
        prompt: 'What does "Per adesso resto a Roma" communicate?',
        choices: [
          'A temporary choice to stay for now',
          'A permanent promise never to leave',
          'That Rome sold the café',
        ],
        correctIndex: 0,
        explanation: 'Per adesso means "for now" — the future can still change.',
      },
    ],
  },
  '41-45': {
    batchKey: '41-45',
    title: 'Explaining shifts in perspective: from habit to conscious choice',
    intro:
      'In Chapters 41–45, the upcoming sale of the café challenges Luca’s comfortable routine. You will notice how Italian contrasts ongoing past assumptions with sudden realizations, and how verbs of intention explain personal change.',
    steps: [
      {
        title: 'Pensavo (ongoing belief) vs Ho capito (sudden awakening)',
        explanation:
          'What it means:\n' +
          '• pensavo / credevo = I thought / I used to believe (ongoing mindset)\n' +
          '• ho capito / ho deciso = I understood / I decided (the moment of realization)\n\n' +
          'The pattern:\n' +
          'When explaining how you changed your mind, use l’imperfetto for your old assumption, and il passato prossimo for the moment you woke up to reality:\n' +
          '• Pensavo che questa routine durasse... ma ho capito che dovevo scegliere.\n' +
          '= I thought this routine would last... but I realized I had to choose.',
        rule: 'Old mindset (imperfetto) + awakening (passato prossimo) = explaining personal growth',
        examples: [
          {
            italian: 'Pensavo che questa routine sarebbe durata per sempre, ma ho capito che dovevo scegliere.',
            english: 'I thought this routine would last forever, but I understood I had to choose.',
          },
          {
            italian: 'Lavoravo senza pormi domande, finché Sofia mi ha chiesto cosa volessi davvero.',
            english: 'I was working without asking myself questions, until Sofia asked me what I truly wanted.',
          },
        ],
      },
      {
        title: 'Dovevo (felt obligation) vs Ho voluto (active choice)',
        explanation:
          'What it means:\n' +
          '• dovevo = I was expected to / I felt I had to\n' +
          '• ho voluto = I made the deliberate choice to\n\n' +
          'The pattern:\n' +
          'Notice how Luca moves from feeling pressured by circumstances (dovevo aspettare) to taking personal initiative (ho voluto parlare con sincerità).',
        rule: 'dovevo = perceived obligation · ho voluto = active deliberate choice',
        examples: [
          {
            italian: 'Non volevo più accettare passivamente le decisioni degli altri.',
            english: 'I no longer wanted to passively accept other people’s decisions.',
          },
          {
            italian: 'Ho voluto salire al Gianicolo per guardare la città con occhi diversi.',
            english: 'I chose to go up to the Gianicolo to look at the city with different eyes.',
          },
        ],
      },
      {
        title: 'Rendersi conto (to realize) and Da solo (by oneself)',
        explanation:
          'What it means:\n' +
          '• mi sono reso conto che... = I realized that...\n' +
          '• da solo = by myself / on my own\n\n' +
          'The pattern:\n' +
          'To describe internal realizations and independence, Italian uses rendersi conto di (to become aware of) and da solo (on one\'s own strength).',
        rule: 'rendersi conto di = to realize · da solo = on one’s own',
        examples: [
          {
            italian: 'Mi sono reso conto che stavo lasciando scegliere il caso.',
            english: 'I realized I was letting chance decide.',
          },
          {
            italian: 'Questa volta voglio decidere da solo, con le mie forze.',
            english: 'This time I want to decide on my own, with my own strength.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt: 'Which sentence best expresses: "I thought it was safe, but I realized I had to choose"?',
        choices: [
          'Pensavo fosse sicuro, ma ho capito che dovevo scegliere.',
          'Ho pensato fosse sicuro, ma capivo che ho dovuto scegliere.',
          'Penso sia sicuro, ma capisco che devo scegliere.',
        ],
        correctIndex: 0,
        explanation:
          'Use imperfetto for the ongoing past belief (pensavo) and passato prossimo for the moment of realization (ho capito).',
      },
      {
        prompt: 'In "Mi sono reso conto della situazione", what does "mi sono reso conto" mean?',
        choices: [
          'I realized / I became aware',
          'I refused the situation',
          'I returned home',
        ],
        correctIndex: 0,
        explanation: 'Rendersi conto di means to realize or become conscious of something.',
      },
      {
        prompt: 'Which sentence shows an active, conscious decision rather than passive obligation?',
        choices: [
          'Ho voluto affrontare la discussione a viso aperto.',
          'Dovevo solo aspettare che qualcuno decidesse per me.',
          'Non potevo fare altro che rimanere fermo.',
        ],
        correctIndex: 0,
        explanation: 'Ho voluto + action expresses a deliberate, proactive personal choice.',
      },
    ],
  },
  '46-50': {
    batchKey: '46-50',
    title: 'Comparing possibilities, expressing polite desires, and explaining choices',
    intro:
      'In Chapters 46–50, Luca weighs two real alternatives: the corporate security of the Grand Hotel and the autonomous craft of Marco’s workshop. Here is how Italian softens desires and compares alternatives.',
    steps: [
      {
        title: 'Vorrei and Preferirei: Expressing polite desires',
        explanation:
          'What it means:\n' +
          '• vorrei = I would like\n' +
          '• preferirei = I would prefer\n' +
          '• sarebbe = it would be\n\n' +
          'The pattern:\n' +
          'Instead of demanding "I want" (voglio), use vorrei and preferirei to discuss possibilities respectfully and express nuanced preferences:\n' +
          '• Vorrei capire... = I would like to understand...\n' +
          '• Preferirei costruire un percorso indipendente. = I would prefer to build an independent path.',
        rule: 'Vorrei / Preferirei + action word = "I would like / I would prefer to [do something]"',
        examples: [
          {
            italian: 'Vorrei ringraziarti per la proposta, ma preferirei costruire un percorso indipendente.',
            english: 'I would like to thank you for the offer, but I would prefer to build an independent path.',
          },
          {
            italian: 'Sarebbe un contratto sicuro, ma non so se sia la vita che voglio.',
            english: 'It would be a secure contract, but I do not know if it is the life I want.',
          },
        ],
      },
      {
        title: 'Invece di: Instead of doing something',
        explanation:
          'What it means:\n' +
          '• invece di = instead of\n' +
          '• preferire X a Y = to prefer X over Y\n\n' +
          'The pattern:\n' +
          'When contrasting two paths, pair invece di with a basic action word:\n' +
          '• invece di accettare subito = instead of accepting right away\n' +
          '• Preferisco il rischio all’incertezza passiva. = I prefer the risk to passive uncertainty.',
        rule: 'invece di + action word = "instead of [doing something]"',
        examples: [
          {
            italian: 'Preferisco affrontare il rischio dell’incertezza invece di accettare una sicurezza passiva.',
            english: 'I prefer to face the risk of uncertainty instead of accepting passive security.',
          },
          {
            italian: 'La bottega di Marco richiede sacrificio, ma offre maggiore libertà.',
            english: 'Marco’s workshop requires sacrifice, but offers greater freedom.',
          },
        ],
      },
      {
        title: 'Per (in order to) and Dato che (given that / since)',
        explanation:
          'What it means:\n' +
          '• per + action word = in order to do something\n' +
          '• dato che = given that / since\n\n' +
          'The pattern:\n' +
          'To explain the rationale behind an important life choice:\n' +
          '• per spiegarvi = in order to explain to you all\n' +
          '• dato che ho imparato il mestiere = given that I learned the craft',
        rule: 'per + action word = "in order to" · dato che = "given that / since"',
        examples: [
          {
            italian: 'Vi ho scritto questa lettera per spiegarvi con sincerità la mia scelta.',
            english: 'I wrote you this letter in order to explain my choice to you with sincerity.',
          },
          {
            italian: 'Dato che ho imparato il mestiere, voglio provare a creare qualcosa di mio.',
            english: 'Given that I learned the trade, I want to try to create something of my own.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt: 'How do you politely say: "I would like to thank you, but I would prefer to choose another path"?',
        choices: [
          'Vorrei ringraziarti, ma preferirei scegliere un’altra strada.',
          'Ti ringrazio, ma voglio scegliere un’altra strada subito.',
          'Ti ho ringraziato perché scelgo un’altra strada.',
        ],
        correctIndex: 0,
        explanation:
          'Vorrei and preferirei express gratitude and alternative intention with polite nuance.',
      },
      {
        prompt: 'Which sentence means: "I want to experiment instead of accepting immediately"?',
        choices: [
          'Voglio fare esperimenti invece di accettare subito.',
          'Faccio esperimenti perché accetto subito.',
          'Ho fatto esperimenti prima di accettare subito.',
        ],
        correctIndex: 0,
        explanation: 'Invece di + action word = instead of doing something.',
      },
      {
        prompt: 'In "Vi scrivo per spiegarvi la mia decisione", what does "per spiegarvi" express?',
        choices: [
          'The purpose or intention behind writing (in order to explain)',
          'The past reason why he wrote',
          'A question to his family',
        ],
        correctIndex: 0,
        explanation: 'Per + action word expresses the deliberate purpose of an action.',
      },
    ],
  },
  '51-55': {
    batchKey: '51-55',
    title: 'Negotiating proposals, connecting ideas with cui, and professional counter service',
    intro:
      'In Chapters 51–55, Luca confronts commercial realities at Spazio Monti, builds a community alliance, and opens his coffee counter. Here is how relative pronouns link complex ideas and how polite hospitality is delivered at the counter.',
    steps: [
      {
        title: 'Preposition + cui: Connecting ideas with "whom" and "which"',
        explanation:
          'What it means:\n' +
          '• con cui = with whom / with which\n' +
          '• in cui = in which / where\n' +
          '• per cui = for which / the reason why\n' +
          '• da cui = from which / where\n\n' +
          'The pattern:\n' +
          'Use cui after prepositions (con, in, per, da) to link details smoothly:\n' +
          '• la socia con cui lavoro = the partner with whom I work\n' +
          '• il luogo in cui serviamo il caffè = the place in which we serve coffee\n' +
          '• il progetto per cui ho investito = the project for which I invested',
        rule: '[preposition] + cui = "with whom, in which, for which"',
        examples: [
          {
            italian: 'Questo è il progetto per cui ho investito ogni energia.',
            english: 'This is the project for which I invested all my energy.',
          },
          {
            italian: 'Claudia è la socia con cui condividerò lo spazio e le spese.',
            english: 'Claudia is the partner with whom I will share the space and expenses.',
          },
          {
            italian: 'Il banco di castagno è il luogo in cui preparo ogni espresso con cura.',
            english: 'The chestnut counter is the place in which I prepare every espresso with care.',
          },
        ],
      },
      {
        title: 'Constructive proposals: Se... possiamo...',
        explanation:
          'What it means:\n' +
          '• Se [facciamo X], possiamo [fare Y] = If we do X, we can do Y.\n\n' +
          'The pattern:\n' +
          'In business and partnership discussions, propose constructive compromises using collaborative phrasing:\n' +
          '• Se noleggiamo la macchina invece di comprarla, riduciamo i costi.\n' +
          '= If we lease the machine instead of buying it, we lower the costs.',
        rule: 'Se [action], possiamo [action] = constructive collaborative proposal',
        examples: [
          {
            italian: 'Se noleggiamo la macchina invece di comprarla, riduciamo i costi iniziali.',
            english: 'If we lease the machine instead of buying it, we reduce initial costs.',
          },
          {
            italian: 'Possiamo condividere i margini sul caffè con i tostatori artigianali.',
            english: 'We can share margins on coffee with the artisan roasters.',
          },
        ],
      },
      {
        title: 'Polite counter service: Welcoming customers',
        explanation:
          'What it means:\n' +
          '• Buongiorno a lei = Good morning to you (polite return greeting)\n' +
          '• Le preparo subito un espresso = I will prepare an espresso for you right away\n' +
          '• Desidera dell’acqua fresca? = Would you like some fresh water?\n\n' +
          'The pattern:\n' +
          'When welcoming a customer at the counter, combine respectful formal address with immediate, attentive service.',
        rule: 'Le preparo subito + item = polite counter service formula',
        examples: [
          {
            italian: '«Certamente, buongiorno a lei. Le preparo subito un espresso appena macinato.»',
            english: '«Certainly, good morning to you. I will prepare a freshly ground espresso for you right away.»',
          },
          {
            italian: '«Un espresso davvero eccezionale. Ci rivedremo domani mattina.»',
            english: '«A truly exceptional espresso. You’ll see me again tomorrow morning.»',
          },
        ],
      },
    ],
    practice: [
      {
        prompt: 'Which sentence correctly uses "cui" to say: "This is the reason for which I chose to stay"?',
        choices: [
          'Questo è il motivo per cui ho scelto di restare.',
          'Questo è il motivo che ho scelto di restare.',
          'Questo è il motivo cui ho scelto di restare.',
        ],
        correctIndex: 0,
        explanation: 'Use per cui when the meaning requires "for which / the reason why."',
      },
      {
        prompt: 'How do you propose a constructive business compromise?',
        choices: [
          'Se condividiamo i costi della macchina, riduciamo il rischio per entrambi.',
          'Non voglio pagare niente e dovete fare tutto voi.',
          'Il progetto è troppo difficile, quindi lasciamo perdere.',
        ],
        correctIndex: 0,
        explanation:
          'Collaborative conditional phrasing (Se condividiamo... riduciamo...) builds viable partnerships.',
      },
      {
        prompt: 'How do you greet a customer politely and offer immediate service?',
        choices: [
          'Buongiorno a lei, Le preparo subito un espresso.',
          'Ciao, prendi un caffè se vuoi.',
          'Non abbiamo tempo per fare il caffè adesso.',
        ],
        correctIndex: 0,
        explanation:
          'Formal polite address (Le preparo subito...) provides authentic hospitality at the counter.',
      },
    ],
  },
  '56-60': {
    batchKey: '56-60',
    title: 'Operational rhythm, managing breakdowns, and mutual agreements',
    intro:
      'In Chapters 56–60, Luca manages the morning rush at Spazio Monti, diagnoses a machine breakdown, and sets spatial agreements with Claudia. Here is how Italian expresses method and clear conditions.',
    steps: [
      {
        title: 'Action words ending in -ando and -endo: Explaining HOW something is done',
        explanation:
          'What it means:\n' +
          '• -ando (for -are verbs) and -endo (for -ere / -ire verbs) mean "by doing" or "while doing".\n\n' +
          'The pattern:\n' +
          'Use these forms to explain the method behind an action:\n' +
          '• eliminando i gesti inutili = by eliminating wasted motions\n' +
          '• ascoltando il rumore della pompa = by listening to the pump’s sound\n' +
          '• lavorando con ordine = by working in an orderly way',
        rule: 'verb root + -ando / -endo = "by doing / while doing"',
        examples: [
          {
            italian: 'L’efficienza si costruisce eliminando i gesti inutili e lavorando con ordine.',
            english: 'Efficiency is built by eliminating useless motions and working in an orderly way.',
          },
          {
            italian: 'Ascoltando il rumore della pompa, Luca ha individuato subito la guarnizione usurata.',
            english: 'By listening to the pump’s sound, Luca immediately identified the worn seal.',
          },
        ],
      },
      {
        title: 'Affinché and In modo da: Purpose and clear agreements',
        explanation:
          'What it means:\n' +
          '• in modo da = so as to / in a way that\n' +
          '• affinché = so that / in order that\n\n' +
          'The pattern:\n' +
          'To establish formal conditions or clear agreements between collaborators:\n' +
          '• affinché la convivenza funzioni = in order that cohabitation works well\n' +
          '• in modo da garantire la quiete = so as to guarantee quiet',
        rule: 'in modo da + action word / affinché + condition = "so as to / in order that"',
        examples: [
          {
            italian: 'Affinché lo spazio funzioni nel lungo periodo, dobbiamo stabilire regole chiare.',
            english: 'In order that the space functions over the long term, we must establish clear rules.',
          },
          {
            italian: 'Abbiamo riorganizzato il pomeriggio in modo da accogliere chi desidera leggere.',
            english: 'We reorganized the afternoon so as to welcome those who wish to read.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt: 'Which sentence correctly expresses method: "He resolved the problem by working calmly"?',
        choices: [
          'Ha risolto il problema lavorando con calma.',
          'Ha risolto il problema per lavorare con calma.',
          'Ha risolto il problema che lavora con calma.',
        ],
        correctIndex: 0,
        explanation: 'Lavorando (-ando form) expresses the method through which the action was achieved.',
      },
      {
        prompt: 'In "Affinché la bottega sia sostenibile, dobbiamo monitorare i costi", what does "affinché" express?',
        choices: [
          'The essential purpose or condition (so that / in order that)',
          'The past cause',
          'A concession',
        ],
        correctIndex: 0,
        explanation: 'Affinché introduces a purpose and condition clause ("so that / in order that").',
      },
      {
        prompt: 'How do you say: "Instead of panicking, he replaced the seal"?',
        choices: [
          'Invece di farsi prendere dal panico, ha sostituito la guarnizione.',
          'Prima di farsi prendere dal panico, ha rotto la macchina.',
          'Dato che si fa prendere dal panico, non ha sostituito niente.',
        ],
        correctIndex: 0,
        explanation: 'Invece di + action word indicates choosing a constructive alternative over panic.',
      },
    ],
  },
  '61-65': {
    batchKey: '61-65',
    title: 'Respecting boundaries, craft parallels, and community connection',
    intro:
      'In Chapters 61–65, Luca respects Chiara’s study focus, learns woodworking wisdom from Marco, and welcomes neighbors during a rainstorm. Here is how Italian describes craft principles and balances contrasting ideas.',
    steps: [
      {
        title: 'Consiste nel: Defining what a craft is all about',
        explanation:
          'What it means:\n' +
          '• consiste nel + action word = consists in doing / is all about doing\n' +
          '• adattarsi a = to adapt to\n\n' +
          'The pattern:\n' +
          'Artisanal maturity is described not as forcing perfection, but as listening to natural limits and adapting with care:\n' +
          '• Il mestiere consiste nell’ascoltare... = The craft consists in listening to...',
        rule: 'consistere nel + action word = "to consist of doing [action]"',
        examples: [
          {
            italian: 'Il mestiere consiste nell’ascoltare il limite della materia prima.',
            english: 'The craft consists in listening to the limits of the raw material.',
          },
          {
            italian: 'Invece di scartare il lotto, proviamo ad adattare la temperatura dell’acqua.',
            english: 'Instead of discarding the batch, let’s try adapting the water temperature.',
          },
        ],
      },
      {
        title: 'Benché and Tuttavia: Contrasts and balance',
        explanation:
          'What it means:\n' +
          '• benché / sebbene = although / even though\n' +
          '• tuttavia = nevertheless / however\n\n' +
          'The pattern:\n' +
          'Use these words to balance contrasting observations:\n' +
          '• Benché piovesse a dirotto... = Although it was raining heavily...\n' +
          '• ...tuttavia il locale è rimasto accogliente. = ...nevertheless the shop remained welcoming.',
        rule: 'benché (although) · tuttavia (nevertheless / however)',
        examples: [
          {
            italian: 'Benché il temporale fosse violento, Spazio Monti è diventato un rifugio sicuro.',
            english: 'Although the storm was violent, Spazio Monti became a safe haven.',
          },
          {
            italian: 'Le difficoltà iniziali erano molte; tuttavia, la comunità ha risposto con affetto.',
            english: 'The initial difficulties were many; nevertheless, the community responded with warmth.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt: 'Which sentence correctly uses "consiste nel" to define craft mastery?',
        choices: [
          'Il mestiere consiste nell’ascoltare i limiti della materia e valorizzarla.',
          'Il mestiere consiste per ascoltare i limiti della materia.',
          'Il mestiere consiste che ascolta i limiti della materia.',
        ],
        correctIndex: 0,
        explanation:
          'Consistere nel + action word is the standard Italian structure for "to consist in doing."',
      },
      {
        prompt: 'What does "Benché la pioggia battesse forte, dentro c’era calore" mean?',
        choices: [
          'Although the rain beat down hard, inside there was warmth.',
          'Because it was raining hard, inside was cold.',
          'Before it rained, everyone was warm.',
        ],
        correctIndex: 0,
        explanation: 'Benché introduces a contrast clause ("although / even though").',
      },
      {
        prompt: 'How do you describe a place that welcomes community without elitism?',
        choices: [
          'Un ponte prezioso per appartenere a una vera comunità.',
          'Un locale chiuso solo per clienti ricchi.',
          'Un posto dove non si può parlare con nessuno.',
        ],
        correctIndex: 0,
        explanation: 'Un ponte prezioso... reflects Spazio Monti’s core philosophy of civic connection.',
      },
    ],
  },
  '66-70': {
    batchKey: '66-70',
    title: 'Cultural integration, autonomous craft, and the B1+ Capstone',
    intro:
      'In Chapters 66–70, Luca respects traditional Roman tastes, turns down a corporate takeover offer, conducts his 12-month ledger audit, and renews his daily commitment behind the counter. Here are discourse markers of synthesis and the philosophy of master craft.',
    steps: [
      {
        title: 'Pertanto and Non si tratta di... ma di...: Clear synthesis',
        explanation:
          'What it means:\n' +
          '• d’altronde = after all / on the other hand\n' +
          '• pertanto = therefore / consequently\n' +
          '• non si tratta di X, ma di Y = it is not a matter of X, but of Y\n\n' +
          'The pattern:\n' +
          'In thoughtful reflection and dialogue, use these markers to weigh options and state your core principle:\n' +
          '• Non si tratta di velocità, ma di relazione. = It is not about speed, but about human connection.\n' +
          '• Pertanto, preferisco mantenere la dimensione umana. = Therefore, I prefer to maintain human scale.',
        rule: 'pertanto (therefore) · non si tratta di... ma di... (it is not... but...)',
        examples: [
          {
            italian: 'Non si tratta di imporre una moda straniera, ma di creare un dialogo autentico.',
            english: 'It is not a matter of imposing a foreign trend, but of creating an authentic dialogue.',
          },
          {
            italian: 'L’autonomia ha un valore inestimabile; pertanto, preferisco mantenere la dimensione umana.',
            english: 'Autonomy has inestimable value; therefore, I prefer to maintain human scale.',
          },
        ],
      },
      {
        title: 'The daily renewal of craft: Rinnovarsi ogni mattina',
        explanation:
          'What it means:\n' +
          '• rinnovarsi = to renew oneself / to be renewed\n' +
          '• un passo dopo l’altro = one step after another\n' +
          '• senza cedere al compromesso = without yielding to compromise\n\n' +
          'The pattern:\n' +
          'Expressing enduring dedication uses reflexive actions and steady time markers:\n' +
          '• La scelta si rinnova ogni mattina. = The choice is renewed every single morning.',
        rule: 'rinnovarsi + time marker = continuous active dedication',
        examples: [
          {
            italian: 'La scelta autentica si rinnova ogni singola mattina all’alba dietro al banco.',
            english: 'The authentic choice is renewed every single morning at dawn behind the counter.',
          },
          {
            italian: 'Roma, finalmente, era diventata la sua vera casa.',
            english: 'Rome, finally, had become his true home.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt: 'Which phrase expresses: "It is not a matter of speed, but of human connection"?',
        choices: [
          'Non si tratta di velocità, ma di relazione umana.',
          'Non è velocità perché c’è relazione umana.',
          'Si tratta di velocità invece di relazione umana.',
        ],
        correctIndex: 0,
        explanation:
          'Non si tratta di X, ma di Y is the Italian pattern to contrast superficial metrics with core purpose.',
      },
      {
        prompt: 'What does "pertanto" mean in "Ho scelto l’indipendenza; pertanto rifiuto la proposta"?',
        choices: ['Therefore / Consequently', 'Although', 'Before'],
        correctIndex: 0,
        explanation: 'Pertanto is a conjunctive adverb expressing a clear logical conclusion ("therefore").',
      },
      {
        prompt: 'How does Chapter 70 define Luca’s relationship with Rome at the conclusion of B1+?',
        choices: [
          'Roma, finalmente, era diventata la sua vera casa.',
          'Luca decide di scappare da Roma subito.',
          'Luca rimpiange di aver lasciato Pietralba.',
        ],
        correctIndex: 0,
        explanation: 'Roma era diventata la sua vera casa is the concluding line of Luca’s 70-chapter journey.',
      },
    ],
  },
};

/** Hometown story notes for chapters 1–5. Omitted batches skip the grammar node. */
const PRE_ROME_GRAMMAR_1_5: Record<string, GrammarNote> = {
  'luca-prima-di-roma-01': {
    batchKey: 'luca-prima-di-roma-01:1-5',
    title: 'Sono, è, and mi chiamo',
    intro:
      'In Luca’s first stories, people introduce themselves and describe who is around them. Two core patterns do most of this work: essere (to be) and mi chiamo (my name is).',
    steps: [
      {
        title: 'Sono and è: Saying who someone is',
        explanation:
          'What it means:\n' +
          '• sono = I am\n' +
          '• è = he is / she is / it is\n\n' +
          'The pattern:\n' +
          'In English, you always have to say words like "I", "you", or "he". In Italian, the person words are:\n' +
          '• io = I\n' +
          '• tu = you\n' +
          '• lui = he\n' +
          '• lei = she\n\n' +
          'Italian usually drops io (I) because the word sono already shows that "I" am speaking!\n\n' +
          'When naming someone else, put è right after their name to mean "is": Davide è alla porta = Davide is at the door.',
        rule: 'sono = "I am" · [Name] + è = "[Name] is"',
        examples: [
          { italian: 'Sono Luca.', english: 'I am Luca.' },
          { italian: 'Marta è mia mamma.', english: 'Marta is my mum.' },
          { italian: 'Davide è alla porta.', english: 'Davide is at the door.' },
        ],
      },
      {
        title: 'Mi chiamo: Introducing your name',
        explanation:
          'What it means:\n' +
          '• mi chiamo = my name is (literally: "I call myself")\n\n' +
          'The pattern:\n' +
          'Use mi chiamo whenever you introduce yourself to someone new:\n' +
          '• Mi chiamo Luca. = My name is Luca.',
        rule: 'Mi chiamo + [name] = "My name is [name]"',
        examples: [
          { italian: 'Mi chiamo Luca.', english: 'My name is Luca.' },
          { italian: 'Mi chiamo Davide.', english: 'My name is Davide.' },
        ],
      },
    ],
    practice: [
      {
        prompt: 'How do you say "I am Luca"?',
        choices: ['Sono Luca.', 'È Luca.', 'Mi chiama Luca.'],
        correctIndex: 0,
        explanation: 'Sono means "I am." You do not need to say "Io sono" because sono already makes it clear.',
      },
      {
        prompt: 'What does "Mi chiamo Luca" mean?',
        choices: ['My name is Luca.', 'I call Luca.', 'Luca is calling.'],
        correctIndex: 0,
        explanation: 'Mi chiamo is the standard Italian way to say "My name is."',
      },
    ],
  },
  'luca-prima-di-roma-02': {
    batchKey: 'luca-prima-di-roma-02:1-5',
    title: 'Time: alle and days',
    intro:
      'Luca’s daily routine is built around clock times and weekdays. Italian uses simple building blocks to say when events happen.',
    steps: [
      {
        title: 'Alle + hour: Saying what time something happens',
        explanation:
          'What it means:\n' +
          '• alle otto = at eight (o\'clock)\n' +
          '• alle nove = at nine (o\'clock)\n' +
          '• alle dieci = at ten (o\'clock)\n\n' +
          'The pattern:\n' +
          'Put alle directly in front of the hour number to mean "at [time]".',
        rule: 'alle + [hour] = "at [time]"',
        examples: [
          { italian: 'Alle nove Chiara ha italiano.', english: 'At nine Chiara has Italian class.' },
          { italian: 'Alle dieci Chiara è libera.', english: 'At ten Chiara is free.' },
        ],
      },
      {
        title: 'Days of the week: Setting the schedule',
        explanation:
          'What it means:\n' +
          '• lunedì = Monday\n' +
          '• martedì = Tuesday\n' +
          '• mercoledì = Wednesday\n\n' +
          'The pattern:\n' +
          'Italian days of the week are usually written in lowercase in sentences. Put the day first, then alle + time:\n' +
          '• Lunedì alle otto... = Monday at eight...',
        rule: '[Day] + alle + [hour] = when an event happens',
        examples: [
          { italian: 'Lunedì alle otto Chiara è a scuola.', english: 'Monday at eight Chiara is at school.' },
        ],
      },
    ],
    practice: [
      {
        prompt: 'What does "alle nove" mean?',
        choices: ['At nine', 'On Tuesday', 'Nine euros'],
        correctIndex: 0,
        explanation: 'Alle + number means "at that hour."',
      },
    ],
  },
  'luca-prima-di-roma-03': {
    batchKey: 'luca-prima-di-roma-03:1-5',
    title: 'Shopping: quanto costa?',
    intro:
      'At the supermarket Luca asks prices and pays. Two patterns handle everyday shopping questions.',
    steps: [
      {
        title: 'Quanto costa: Asking the price',
        explanation:
          'What it means:\n' +
          '• Quanto costa...? = How much does ... cost?\n' +
          '• Quanto costa tutto? = How much does everything cost?\n\n' +
          'The pattern:\n' +
          'Quanto = how much. Costa = it costs. Put what you are asking about right at the end.',
        rule: 'Quanto costa + [item] = "How much does [item] cost?"',
        examples: [
          { italian: 'Quanto costa tutto?', english: 'How much does everything cost?' },
          { italian: 'Tutto costa dieci euro.', english: 'Everything costs ten euros.' },
        ],
      },
      {
        title: 'Si può pagare: Asking to settle up',
        explanation:
          'What it means:\n' +
          '• Si può pagare? = Can I pay? / Is it possible to pay?\n\n' +
          'The pattern:\n' +
          'Si può means "is it possible / can one". It is a polite, natural way to ask if the cashier is ready for you.',
        rule: 'Si può pagare? = polite way to ask "Can I pay?"',
        examples: [{ italian: 'Si può pagare?', english: 'Can I pay?' }],
      },
    ],
    practice: [
      {
        prompt: 'How do you ask the total price?',
        choices: ['Quanto costa tutto?', 'Dove costa tutto?', 'Chi costa tutto?'],
        correctIndex: 0,
        explanation: 'Quanto means "how much." Quanto costa tutto? asks the total price.',
      },
    ],
  },
  'luca-prima-di-roma-04': {
    batchKey: 'luca-prima-di-roma-04:1-5',
    title: 'Places: dov’è and c’è',
    intro:
      'Around town Luca asks where things are and notices what is available. Italian uses dov’è and c’è for this.',
    steps: [
      {
        title: 'Dov’è: Asking where something is',
        explanation:
          'What it means:\n' +
          '• Dov’è...? = Where is...?\n\n' +
          'The pattern:\n' +
          'Dov’è blends two words: dove (where) + è (is). Put the place or thing right after dov’è.',
        rule: 'Dov’è + [item] = "Where is [item]?"',
        examples: [
          { italian: 'Dov’è l’autobus?', english: 'Where is the bus?' },
          { italian: 'La fermata è in Via Nazionale.', english: 'The bus stop is on Via Nazionale.' },
        ],
      },
      {
        title: 'C’è: Saying that something is there',
        explanation:
          'What it means:\n' +
          '• C’è... = There is...\n\n' +
          'The pattern:\n' +
          'C’è is a blend of ci (there) + è (is). Use it to point out what is present or available in a place.',
        rule: 'C’è + noun = "There is [noun]"',
        examples: [{ italian: 'C’è un autobus alle nove.', english: 'There’s a bus at nine.' }],
      },
    ],
    practice: [
      {
        prompt: 'What does "Dov’è l’autobus?" ask?',
        choices: ['Where the bus is', 'How much the bus costs', 'When the bus leaves'],
        correctIndex: 0,
        explanation: 'Dov’è contracts dove (where) and è (is) to mean "Where is?"',
      },
    ],
  },
  'luca-prima-di-roma-05': {
    batchKey: 'luca-prima-di-roma-05:1-5',
    title: 'C’è and party phrases',
    intro:
      'At Luca’s party, people talk about what food, music, and drinks are in the room. C’è and location phrases describe the scene.',
    steps: [
      {
        title: 'C’è for food, drinks, and music',
        explanation:
          'What it means:\n' +
          '• C’è musica. = There is music.\n' +
          '• C’è torta. = There is cake.\n' +
          '• C’è succo. = There is juice.\n\n' +
          'The pattern:\n' +
          'Use c’è whenever you want to say what is present in the room.',
        rule: 'C’è + noun = "There is [noun]"',
        examples: [
          { italian: 'C’è musica.', english: 'There’s music.' },
          { italian: 'La festa è nel soggiorno.', english: 'The party is in the living room.' },
        ],
      },
    ],
    practice: [
      {
        prompt: 'What does "C’è torta" mean?',
        choices: ['There’s cake.', 'I want cake.', 'Where is the cake?'],
        correctIndex: 0,
        explanation: 'C’è means "There is."',
      },
    ],
  },
};

export function grammarNoteForBatch(
  start: number,
  end: number,
  storyId = 'luca-a-roma',
): GrammarNote | null {
  if (storyId.startsWith('luca-prima-di-roma-')) {
    if (start === 1 && end === 5) return PRE_ROME_GRAMMAR_1_5[storyId] ?? null;
    return null;
  }
  const key = `${start}-${end}`;
  return GRAMMAR_BY_BATCH[key] ?? null;
}

export function grammarNoteForChapter(
  chapterNumber: number,
  storyId = 'luca-a-roma',
): GrammarNote | null {
  if (!isLessonBatchEnd(chapterNumber)) return null;
  const { start, end } = batchRangeForChapter(chapterNumber);
  return grammarNoteForBatch(start, end, storyId);
}

/** @deprecated Use `steps` on GrammarNote. Kept for any legacy references. */
export type LegacyGrammarPoint = { heading: string; body: string; examples: string[] };
