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
      'Chapters 1-5 lean on two verbs: essere (to be) and avere (to have). Here is exactly how they work in the sentences you read.',
    steps: [
      {
        title: 'Essere tells you who someone is, where they are, or how they feel',
        explanation:
          'Essere is "to be." In Italian you change the ending of the verb to match the subject - but you often leave out io / tu / lui because the ending already tells you who is speaking.\n\n' +
          '- è = he / she / it is (Luca è stanco -> Luca is tired)\n' +
          '- sono = I am (Sono a Roma -> I am in Rome)\n' +
          '- sei = you are (informal)\n\n' +
          'When you see è after a name, read it as "is": Sofia è al bar = Sofia is at the bar.',
        rule: 'Name + è + adjective/place = "[Name] is ..."',
        examples: [
          { italian: 'Luca è a Roma.', english: 'Luca is in Rome.' },
          { italian: 'Sofia è stanca.', english: 'Sofia is tired.' },
          { italian: 'È mattina.', english: 'It is morning.' },
        ],
      },
      {
        title: 'Avere tells you what someone has - including feelings',
        explanation:
          'Avere is "to have." Italian uses it for possession and for many feelings English expresses with "to be."\n\n' +
          '- ho = I have (Ho fame -> literally "I have hunger" = I am hungry)\n' +
          '- ha = he / she has (Luca ha una casa -> Luca has a house)\n' +
          '- hai = you have\n\n' +
          'If an English sentence says "I am hungry / thirsty / sleepy," Italian usually says "I have hunger / thirst / sleep."',
        rule: 'Ho / ha + noun often = "I am / he is ..." in English',
        examples: [
          { italian: 'Ho fame.', english: 'I am hungry. (lit. I have hunger)' },
          { italian: 'Luca ha poco soldi.', english: 'Luca has little money.' },
          { italian: 'Non ho molti soldi.', english: 'I do not have much money.' },
        ],
      },
      {
        title: 'Non goes right before the verb to make a sentence negative',
        explanation:
          'To say "not," put non immediately before the verb. Nothing else moves.\n\n' +
          'Affirmative: Ho fame. -> Negative: Non ho fame.\n' +
          'Affirmative: Luca è stanco. -> Negative: Luca non è stanco.\n\n' +
          'Non is one word - do not split it from the verb.',
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
          'Use essere (è) for "is" + adjective: Luca è stanco. Avere (ha) is for possession, not adjectives like "tired."',
      },
      {
        prompt: 'How do you say "I am hungry" in Italian?',
        choices: ['Sono fame.', 'Ho fame.', 'Ho affamato.'],
        correctIndex: 1,
        explanation:
          'Italian says "I have hunger": Ho fame. You need avere (ho), not essere, for this feeling.',
      },
      {
        prompt: 'Which sentence means "Luca does not have much money"?',
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
          'Volere means "to want." To say what you want to do, use volere + an infinitive (the -are / -ere / -ire form):\n\n' +
          '• voglio = I want → Voglio mangiare. (I want to eat.)\n' +
          '• vuole = he / she wants → Luca vuole un lavoro. (Luca wants a job.)\n' +
          '• vuoi = you want\n\n' +
          'You can also want a thing (noun): vuole un caffè = he wants a coffee.',
        rule: 'Volere + infinitive = "want to ..."',
        examples: [
          { italian: 'Voglio mangiare.', english: 'I want to eat.' },
          { italian: 'Luca vuole un lavoro.', english: 'Luca wants a job.' },
          { italian: 'Vuole restare a Roma.', english: 'He wants to stay in Rome.' },
        ],
      },
      {
        title: 'Cercare: a regular verb for "to look for"',
        explanation:
          'Cercare ends in -are, so it follows the same pattern as parlare or mangiare:\n\n' +
          '• cerco = I look for / I am looking for\n' +
          '• cerchi = you look for\n' +
          '• cerca = he / she looks for\n\n' +
          'Put what you are searching for right after the verb: Cerco un lavoro. Word order is flexible — Cerco un lavoro al caffè and Al caffè cerco un lavoro both work.',
        rule: 'Cerco / cerca + thing = "I am / he is looking for ..."',
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
        prompt: '"I want to eat." Which is correct?',
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
        title: 'A = to / at (cities and people)',
        explanation:
          'With cities, Italian often uses a for both movement and location:\n\n' +
          '• Luca va a Roma. = Luca goes to Rome. (movement)\n' +
          '• Marco è a Roma. = Marco is in Rome. (location)\n' +
          '• a casa = home / at home\n' +
          '• a Marco = to Marco (giving something to someone)\n\n' +
          'The verb tells you which reading: andare/venire/tornare → usually "to"; essere/stare → usually "in/at".\n\n' +
          'Combined with the: a + il = al, a + la = alla. Luca va al caffè = Luca goes to the café.',
        rule: 'a + city: "to" with movement verbs, "in/at" with essere',
        examples: [
          { italian: 'Luca va a Roma.', english: 'Luca goes to Rome.' },
          { italian: 'Vado al caffè.', english: 'I am going to the café.' },
          { italian: 'Marco è a Roma.', english: 'Marco is in Rome.' },
        ],
      },
      {
        title: 'In = inside a space',
        explanation:
          'In means "in" or "inside." Use it for rooms, countries (sometimes), and enclosed places:\n\n' +
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
        rule: 'Con + person = "with" · Per + noun = "for"',
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
        prompt: '"I am in the kitchen." Pick the right sentence.',
        choices: ['Sono a cucina.', 'Sono in cucina.', 'Sono con cucina.'],
        correctIndex: 1,
        explanation: 'Inside a room uses in: Sono in cucina.',
      },
      {
        prompt: '"Money for the rent." Which phrase is correct?',
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
          'You do not need a separate "is ...-ing" form - context tells you.',
        rule: 'One present tense covers "does" and "is doing"',
        examples: [
          { italian: 'Luca cerca lavoro.', english: 'Luca is looking for work.' },
          { italian: 'Sofia parla italiano.', english: 'Sofia speaks Italian.' },
          { italian: 'Marco lavora molto.', english: 'Marco works a lot.' },
        ],
      },
    ],
    practice: [
      {
        prompt: '"Tomorrow Sofia is coming." Which is correct?',
        choices: ['Domani Sofia viene.', 'Sofia domani venire.', 'Domani Sofia va.'],
        correctIndex: 0,
        explanation: 'Time first, then subject + verb: Domani Sofia viene. Venire = to come.',
      },
      {
        prompt: 'Luca returns home. Pick the right sentence.',
        choices: ['Luca torna a casa.', 'Luca torna in casa a.', 'Luca va tornare casa.'],
        correctIndex: 0,
        explanation: 'Tornare a casa is the fixed pattern for "return home."',
      },
      {
        prompt: '"Luca goes to the bar." Which is correct?',
        choices: ['Luca viene al bar.', 'Luca va al bar.', 'Luca va in bar.'],
        correctIndex: 1,
        explanation: 'Andare (va) = to go. Al bar = to the bar (a + il).',
      },
    ],
  },
  '21-25': {
    batchKey: '21-25',
    title: 'Passato prossimo: completed events',
    intro:
      'In chapters 21-25, you mainly read completed actions/events. This is mostly passato prossimo.',
    steps: [
      {
        title: 'Passato prossimo = ha/è + past participle',
        explanation:
          'Passato prossimo is used for a completed past event.\n\n' +
          'Form: helper verb (ha or è) + past participle.\n\n' +
          'In the story, some movement/change verbs use essere, such as è arrivato and è tornato. Other verbs use avere, such as ha aperto and ha detto.\n\n' +
          'For now, learn the forms you meet as complete patterns — do not treat “movement = essere” as a rule that always works.\n\n' +
          'Examples you see:\n' +
          '- Luca è arrivato presto e ha aperto la porta.\n' +
          '- Giulia ha guardato i tavoli e non ha sorriso.\n' +
          '- Non ha detto niente ai colleghi.',
        rule: 'Completed past event = ha/è + past participle (learn story forms as patterns)',
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
        title: 'Irregular participles you already saw',
        explanation:
          'Some participles are irregular. Your job is to recognize them in the story.\n\n' +
          'In these chapters you already saw:\n' +
          '- aperto\n' +
          '- chiuso\n' +
          '- detto',
        rule: 'Recognize irregular participles in passato prossimo',
        examples: [
          {
            italian: 'Luca è arrivato presto e ha aperto la porta.',
            english: 'Luca arrived early and opened the door.',
          },
          { italian: 'Ha chiuso la porta un momento.', english: 'He closed the door for a moment.' },
          { italian: 'Non ha detto niente ai colleghi.', english: 'He did not say anything to his colleagues.' },
        ],
      },
    ],
    practice: [
      {
        prompt: '"Luca è arrivato presto." Which part shows the past tense?',
        choices: ['Luca', 'è arrivato', 'presto'],
        correctIndex: 1,
        explanation: '"è arrivato" = è (helper) + participle. That is passato prossimo.',
      },
      {
        prompt: 'In the story, which form is correct: "Luca ___ al caffè presto"?',
        choices: ['ha tornato', 'è tornato', 'torna'],
        correctIndex: 1,
        explanation: 'The story uses è tornato. Learn it as a pattern with essere.',
      },
      {
        prompt: 'In "Non ha detto niente ai colleghi.", which word is the past participle?',
        choices: ['ha', 'detto', 'niente'],
        correctIndex: 1,
        explanation: 'The past participle is "detto" (after ha).',
      },
    ],
  },
  '26-30': {
    batchKey: '26-30',
    title: 'Imperfetto vs passato prossimo: background vs events',
    intro:
      'These chapters mix two past tenses:\n' +
      '- imperfetto for background/ongoing states\n' +
      '- passato prossimo for completed events',
    steps: [
      {
        title: 'Imperfetto = was/used to (background)',
        explanation:
          'Imperfetto describes how things were: feelings, descriptions, and ongoing situations.\n\n' +
          'You often see endings like:\n' +
          '- era / c\'erano\n' +
          '- sembrava\n' +
          '- restava\n',
        rule: 'Imperfetto = background/ongoing past',
        examples: [
          { italian: "C'erano ancora pochi clienti questa mattina, come ieri.", english: 'There were still a few customers this morning, like yesterday.' },
          { italian: 'Giulia era già al caffè e non sorrideva.', english: 'Giulia was already at the cafe and was not smiling.' },
          { italian: 'Marco non sembrava tranquillo.', english: 'Marco did not seem calm.' },
        ],
      },
      {
        title: 'Passato prossimo = what happened (completed events)',
        explanation:
          'In these chapters, completed actions/events are expressed with passato prossimo: helper verb (ha/è) + past participle.\n\n' +
          'You then read the story forward like a sequence of events.',
        rule: 'Passato prossimo = completed action',
        examples: [
          {
            italian: 'Martedì mattina Luca è tornato al caffè presto.',
            english: 'On Tuesday morning Luca returned to the cafe early.',
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
        prompt: '"Giulia era già al caffè e non sorrideva." Which word is correct?',
        choices: ['era', 'è stata', 'ha'],
        correctIndex: 0,
        explanation: 'Era is imperfetto. It describes the background state.',
      },
      {
        prompt: '"Martedì mattina Luca ___ al caffè presto." Which is correct?',
        choices: ['era tornato', 'è tornato', 'torna'],
        correctIndex: 1,
        explanation: 'È tornato is passato prossimo (helper + participle).',
      },
      {
        prompt: 'In the story, which tense typically makes the "event" feeling?',
        choices: ['Imperfetto', 'Passato prossimo', 'Present tense only'],
        correctIndex: 1,
        explanation: 'Passato prossimo = completed events.',
      },
    ],
  },
  '31-35': {
    batchKey: '31-35',
    title: 'Connecting ideas: se, time, and reason',
    intro:
      'Chapters 31-35 use connectors to link ideas: se (possible situation/result), quando/mentre/poi (time), perché (reason), and però/almeno (contrast/at least).',
    steps: [
      {
        title: 'Se + present: a possible situation',
        explanation:
          'You do not need formal terminology here. In these chapters, se works like:\n\n' +
          '"If this happens / is possible…" and then a result.\n\n' +
          'Se + present introduces a possible situation. The result can use the present or another tense depending on what you mean.\n\n' +
          'Examples:\n' +
          '- present result: Se viene poca gente, non importa.\n' +
          '- past result: Se non arriva nessuno, almeno abbiamo fatto il lavoro.',
        rule: 'Se + present = possible situation; the result tense depends on meaning',
        examples: [
          { italian: 'Se viene poca gente, non importa.', english: 'If few people come, it does not matter.' },
          { italian: 'Se non arriva nessuno, almeno abbiamo fatto il lavoro.', english: 'If nobody arrives, at least we did the work.' },
          { italian: 'Non possiamo solo aspettare. Dobbiamo parlare ancora, se possiamo.', english: "We cannot only wait. We have to talk again, if we can." },
        ],
      },
      {
        title: 'Quando / mentre / poi: time order',
        explanation:
          'These words help you follow the story:\n\n' +
          '- quando: "when"\n' +
          '- mentre: "while"\n' +
          '- poi: "then/after that"',
        rule: 'Use connectors to follow time order',
        examples: [
          { italian: 'Quando ha aperto la porta, Giulia era già nella sala.', english: 'When he opened the door, Giulia was already in the room.' },
          { italian: 'Mentre portava i tavoli, Luca ascoltava la strada.', english: 'While he was carrying the tables, Luca listened to the street.' },
          { italian: 'Poi la porta si è aperta. Marco è arrivato.', english: 'Then the door opened. Marco arrived.' },
        ],
      },
      {
        title: 'Perché / però / almeno',
        explanation:
          'These words add meaning after the grammar work is done:\n\n' +
          '- perché = "because/why"\n' +
          '- però = "but/however"\n' +
          '- almeno = "at least"' ,
        rule: 'Reason (perché) + contrast (però) + minimum (almeno)',
        examples: [
          { italian: 'L’altra parte non risponde, e io non so perché.', english: "The other side does not answer, and I do not know why." },
          { italian: 'Sì. Però io voglio gente qui.', english: 'Yes. But I want people here.' },
          { italian: 'Va bene. Se non arriva nessuno, almeno abbiamo fatto il lavoro.', english: 'Okay. If nobody arrives, at least we did the work.' },
        ],
      },
    ],
    practice: [
      {
        prompt: '"___ viene poca gente, non importa. Abbiamo fatto una cosa." Which word fits?',
        choices: [
          'Se',
          'Quando',
          'Poi',
        ],
        correctIndex: 0,
        explanation: '"Se" introduces the possible situation/result.',
      },
      {
        prompt: '"___ la porta si è aperta, Marco è arrivato." Which word fits?',
        choices: ['Poi', 'Mentre', 'Perché'],
        correctIndex: 0,
        explanation: '"Poi" = then/after that.',
      },
      {
        prompt: 'In "Non so ___.", which word completes the meaning of "why"?',
        choices: ['perché', 'però', 'almeno'],
        correctIndex: 0,
        explanation: '"Perché" introduces reason/why.',
      },
    ],
  },
  '36-40': {
    batchKey: '36-40',
    title: 'Reading clearly: pronouns and who did what',
    intro:
      'Chapters 36-40 stay in past narration. This lesson is mainly reading strategy: track who acts, and map pronouns like gli / le to the person who receives the action. That helps Speak scenes where you retell decisions and events.',
    steps: [
      {
        title: 'Passato prossimo: find who did the action',
        explanation:
          'Passato prossimo marks a completed action with ha/è + past participle.\n\n' +
          'Ask: who is the subject of that helper verb? Usually a named person (Luca, Nonna Rosa, Giulia) in the same sentence or the previous one.',
        rule: 'Helper + past participle = the action. Name the subject before you translate.',
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
        title: 'Gli = to him / for him (the recipient)',
        explanation:
          'Gli is an indirect-object pronoun: to him / for him.\n\n' +
          'Do not guess from "the nearest word." Ask: who receives the action?\n\n' +
          'In "Nonna Rosa ha chiamato Luca e gli ha detto…", Nonna speaks, and Luca receives the message → gli = to Luca.\n\n' +
          'In a line like "Marco ha parlato con Luca e gli ha detto…", context still decides who "him" is — usually the person receiving the message.',
        rule: 'gli = to him / for him → identify the recipient of the action',
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
        title: 'Le = to her / for her (same idea)',
        explanation:
          'Le (indirect object) = to her / for her. Same strategy: find the recipient.\n\n' +
          'Do not confuse this le with the article le ("the" before feminine plural nouns), as in Le persone… (= The people…).',
        rule: 'le (pronoun) = to her → find who receives the action',
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
        title: 'Useful for Speak 27–40: forse, se, per adesso',
        explanation:
          'These chapters ask you to produce more than single facts:\n\n' +
          '• forse + present = possibility now/soon (Il padrone forse vende…)\n' +
          '• se + present = if this happens, this result happens\n' +
          '• per adesso = for now (a temporary choice, not forever)\n\n' +
          'You already met se in the connectors lesson. Here you use them to explain plans and decisions.',
        rule: 'forse / se / per adesso help you talk about possibility and temporary choices',
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
        prompt: 'In "Nonna Rosa ha chiamato Luca e gli ha detto di restare.", what does "gli" refer to?',
        choices: ['Luca (the person who receives the message)', 'Nonna Rosa', 'la porta'],
        correctIndex: 0,
        explanation: 'gli = to him. Luca receives what Nonna said.',
      },
      {
        prompt: 'In "Luca ha chiamato Sofia e le ha detto la verità.", what does "le" mean?',
        choices: ['to her (Sofia)', 'the people', 'the truth'],
        correctIndex: 0,
        explanation: 'Here le is the pronoun "to her," not the article "the."',
      },
      {
        prompt: 'What does "Per adesso resto a Roma" communicate?',
        choices: ['A temporary choice to stay', 'A permanent promise never to leave', 'That Rome sold the café'],
        correctIndex: 0,
        explanation: 'Per adesso = for now — the future can still change.',
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
      'In Luca’s introductions you keep seeing essere (to be) and mi chiamo. Here is how those lines work.',
    steps: [
      {
        title: 'Sono / è tell who someone is',
        explanation:
          'sono = I am. è = he / she / it is.\n\n' +
          'Ciao, sono Luca. = Hi, I am Luca.\n' +
          'Davide è alla porta. = Davide is at the door.',
        rule: 'sono = I am · è = he/she is',
        examples: [
          { italian: 'Sono Luca.', english: 'I am Luca.' },
          { italian: 'Marta è mia mamma.', english: 'Marta is my mum.' },
        ],
      },
      {
        title: 'Mi chiamo names you',
        explanation:
          'mi chiamo = my name is (literally “I call myself”).\n\n' +
          'Use it when you introduce yourself: Mi chiamo Luca.',
        rule: 'Mi chiamo + name = My name is …',
        examples: [
          { italian: 'Mi chiamo Luca.', english: 'My name is Luca.' },
          { italian: 'Mi chiamo Davide.', english: 'My name is Davide.' },
        ],
      },
    ],
    practice: [
      {
        prompt: 'How do you say “I am Luca”?',
        choices: ['Sono Luca.', 'È Luca.', 'Mi chiama Luca.'],
        correctIndex: 0,
        explanation: 'sono = I am.',
      },
      {
        prompt: 'What does “Mi chiamo Luca” mean?',
        choices: ['My name is Luca.', 'I call Luca.', 'Luca is calling.'],
        correctIndex: 0,
        explanation: 'mi chiamo = my name is.',
      },
    ],
  },
  'luca-prima-di-roma-02': {
    batchKey: 'luca-prima-di-roma-02:1-5',
    title: 'Time: alle and days',
    intro: 'Luca’s day uses clock times and weekdays. Italian puts alle before the hour.',
    steps: [
      {
        title: 'Alle + hour',
        explanation:
          'alle otto = at eight. alle nove = at nine.\n\n' +
          'Lunedì alle otto Chiara è a scuola.',
        rule: 'alle + hour = at that time',
        examples: [
          { italian: 'Alle nove Chiara ha italiano.', english: 'At nine Chiara has Italian.' },
          { italian: 'Alle dieci Chiara è libera.', english: 'At ten Chiara is free.' },
        ],
      },
      {
        title: 'Days of the week',
        explanation:
          'Days are often used without a capital letter in Italian prose, but you can still recognise them:\n' +
          'lunedì, martedì, mercoledì…',
        rule: 'Day + alle + hour = when something happens',
        examples: [
          { italian: 'Lunedì alle otto Chiara è a scuola.', english: 'Monday at eight Chiara is at school.' },
        ],
      },
    ],
    practice: [
      {
        prompt: 'What does “alle nove” mean?',
        choices: ['At nine', 'On Tuesday', 'Nine euros'],
        correctIndex: 0,
        explanation: 'alle + hour = at that time.',
      },
    ],
  },
  'luca-prima-di-roma-03': {
    batchKey: 'luca-prima-di-roma-03:1-5',
    title: 'Shopping: quanto costa?',
    intro: 'At the supermarket Luca asks prices and pays. Two patterns do most of the work.',
    steps: [
      {
        title: 'Quanto costa…?',
        explanation:
          'Quanto costa? = How much does it cost?\n' +
          'Quanto costa tutto? = How much does everything cost?',
        rule: 'Quanto costa…? = How much does … cost?',
        examples: [
          { italian: 'Quanto costa tutto?', english: 'How much does everything cost?' },
          { italian: 'Tutto costa dieci euro.', english: 'Everything costs ten euros.' },
        ],
      },
      {
        title: 'Si può pagare?',
        explanation: 'Si può pagare? is a polite way to ask if you can pay / settle up.',
        rule: 'Si può pagare? = Can I pay?',
        examples: [{ italian: 'Si può pagare?', english: 'Can I pay?' }],
      },
    ],
    practice: [
      {
        prompt: 'How do you ask the total price?',
        choices: ['Quanto costa tutto?', 'Dove costa tutto?', 'Chi costa tutto?'],
        correctIndex: 0,
        explanation: 'Quanto costa…? asks the price.',
      },
    ],
  },
  'luca-prima-di-roma-04': {
    batchKey: 'luca-prima-di-roma-04:1-5',
    title: 'Places: dov’è and c’è',
    intro: 'Around town Luca asks where things are and notices what is there.',
    steps: [
      {
        title: 'Dov’è…?',
        explanation: 'Dov’è l’autobus? = Where is the bus?\nDov’è contracts dove + è.',
        rule: 'Dov’è…? = Where is…?',
        examples: [
          { italian: 'Dov’è l’autobus?', english: 'Where is the bus?' },
          { italian: 'La fermata è in Via Nazionale.', english: 'The bus stop is on Via Nazionale.' },
        ],
      },
      {
        title: 'C’è…',
        explanation: 'C’è un autobus alle nove. = There is a bus at nine.\nC’è = there is.',
        rule: 'C’è = there is',
        examples: [{ italian: 'C’è un autobus alle nove.', english: 'There’s a bus at nine.' }],
      },
    ],
    practice: [
      {
        prompt: 'What does “Dov’è l’autobus?” ask?',
        choices: ['Where the bus is', 'How much the bus costs', 'When the bus leaves'],
        correctIndex: 0,
        explanation: 'Dov’è = where is.',
      },
    ],
  },
  'luca-prima-di-roma-05': {
    batchKey: 'luca-prima-di-roma-05:1-5',
    title: 'C’è and party phrases',
    intro: 'At Luca’s party you keep seeing c’è for what is available in the room.',
    steps: [
      {
        title: 'C’è + thing',
        explanation:
          'C’è musica. C’è torta. C’è succo.\n' +
          'Each line says that thing is there / available.',
        rule: 'C’è + noun = there is …',
        examples: [
          { italian: 'C’è musica.', english: 'There’s music.' },
          { italian: 'La festa è nel soggiorno.', english: 'The party is in the living room.' },
        ],
      },
    ],
    practice: [
      {
        prompt: 'What does “C’è torta” mean?',
        choices: ['There’s cake.', 'I want cake.', 'Where is the cake?'],
        correctIndex: 0,
        explanation: 'C’è = there is.',
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
