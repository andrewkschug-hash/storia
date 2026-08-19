const { S, P, chapter } = require('./chapter-helpers');

/** Cap. 6 — Sofia shows the neighborhood */
const chapter06 = chapter(
  {
    id: 'luca-a-roma-06',
    storyId: 'luca-a-roma',
    number: 6,
    title: 'The neighborhood',
    titleIt: 'Il quartiere',
    difficultyLevel: 1,
    locationIds: ['quartiere', 'roma', 'appartamento-luca'],
    characterIds: ['luca', 'sofia'],
    events: [
      {
        id: 'ev-06-quartiere',
        summary: 'Sofia shows Luca her neighborhood: shops and the piazza.',
        characterIds: ['luca', 'sofia'],
        locationIds: ['quartiere'],
        rememberedFacts: [
          'Luca has an apartment',
          'Sofia shows Luca the neighborhood',
          'There is a shop and a piazza nearby',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Luca ha una casa a Roma.', ['luca', 'avere', 'una', 'casa', 'a', 'roma']),
      S('s02', 'Luca conosce Sofia.', ['luca', 'conoscere', 'sofia']),
      S('s03', 'Oggi Sofia e Luca camminano.', ['oggi', 'sofia', 'e', 'luca', 'camminare']),
      S('s04', 'Vanno nel quartiere.', ['andare', 'nel', 'quartiere']),
    ]),
    P('p2', 2, [
      S('s05', "Nel quartiere c'è un negozio.", ['nel', 'quartiere', 'ce', 'un', 'negozio']),
      S('s06', "C'è anche una piazza.", ['ce', 'anche', 'una', 'piazza']),
      S('s07', 'La piazza è bella.', ['la', 'piazza', 'essere', 'bello']),
      S('s08', 'Il negozio è vicino.', ['il', 'negozio', 'essere', 'vicino']),
    ]),
    P('p3', 3, [
      S('s09', 'Questo è il mio quartiere.', ['questo', 'essere', 'il', 'mio', 'quartiere'], {
        speaker: 'sofia',
      }),
      S('s10', 'È bello.', ['essere', 'bello'], { speaker: 'luca' }),
      S('s11', 'Come stai oggi?', ['come', 'stare', 'oggi'], { speaker: 'sofia' }),
      S('s12', 'Bene, grazie.', ['bene', 'grazie'], { speaker: 'luca' }),
      S('s13', 'Ci vediamo domani.', ['ci', 'vedere', 'domani'], { speaker: 'sofia' }),
    ]),
  ],
);

/** Cap. 7 — Luca needs a job */
const chapter07 = chapter(
  {
    id: 'luca-a-roma-07',
    storyId: 'luca-a-roma',
    number: 7,
    title: 'Work',
    titleIt: 'Il lavoro',
    difficultyLevel: 1,
    locationIds: ['appartamento-luca', 'roma', 'bar-centrale'],
    characterIds: ['luca', 'sofia'],
    events: [
      {
        id: 'ev-07-needs-job',
        summary: 'Luca needs work to pay rent; Sofia offers to help.',
        characterIds: ['luca', 'sofia'],
        locationIds: ['appartamento-luca'],
        rememberedFacts: [
          'Luca needs a job',
          'Luca needs money for rent',
          'Sofia tells Luca to ask at the café',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Luca ha una casa a Roma.', ['luca', 'avere', 'una', 'casa', 'a', 'roma']),
      S('s02', "L'affitto costa molto.", ['affitto', 'costare', 'molto']),
      S('s03', 'Luca non ha molti soldi.', ['luca', 'non', 'avere', 'molto', 'soldi']),
      S('s04', 'Luca vuole un lavoro.', ['luca', 'volere', 'un', 'lavoro']),
    ]),
    P('p2', 2, [
      S('s05', 'Sofia ascolta Luca.', ['sofia', 'ascoltare', 'luca']),
      S('s06', 'Cerchi un lavoro?', ['cercare', 'un', 'lavoro'], { speaker: 'sofia' }),
      S('s07', 'Sì, voglio un lavoro.', ['si_yes', 'volere', 'un', 'lavoro'], {
        speaker: 'luca',
      }),
      S('s08', "Voglio soldi per l'affitto.", ['volere', 'soldi', 'per', 'affitto'], {
        speaker: 'luca',
      }),
    ]),
    P('p3', 3, [
      S('s09', 'Posso aiutare.', ['potere', 'aiutare'], {
        speaker: 'sofia',
        phrases: [
          {
            surface: 'Posso aiutare',
            literalEn: 'I can help',
            naturalEn: 'I can help',
            tokenStart: 0,
            tokenEnd: 1,
          },
        ],
      }),
      S('s10', 'Grazie.', ['grazie'], { speaker: 'luca' }),
      S('s11', 'Chiedi al caffè.', ['chiedere', 'al', 'caffe'], { speaker: 'sofia' }),
      S('s12', 'Domani Luca cerca un lavoro.', ['domani', 'luca', 'cercare', 'un', 'lavoro']),
      S('s13', 'Luca vuole vivere a Roma.', ['luca', 'volere', 'vivere', 'a', 'roma']),
    ]),
  ],
);

/** Cap. 8 — Luca searches for work */
const chapter08 = chapter(
  {
    id: 'luca-a-roma-08',
    storyId: 'luca-a-roma',
    number: 8,
    title: 'Looking for work',
    titleIt: 'Cercare lavoro',
    difficultyLevel: 1,
    locationIds: ['quartiere', 'lavoro-caffe', 'roma'],
    characterIds: ['luca', 'sofia'],
    events: [
      {
        id: 'ev-08-search-work',
        summary: 'Luca asks about work at a café and waits for an answer.',
        characterIds: ['luca', 'sofia'],
        locationIds: ['lavoro-caffe', 'quartiere'],
        rememberedFacts: [
          'Luca is looking for work at a café',
          'Sofia told him to ask there',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Oggi Luca cerca un lavoro.', ['oggi', 'luca', 'cercare', 'un', 'lavoro']),
      S('s02', 'Luca cammina nel quartiere.', ['luca', 'camminare', 'nel', 'quartiere']),
      S('s03', 'Sofia aiuta Luca.', ['sofia', 'aiutare', 'luca']),
      S('s04', 'Chiedi al caffè.', ['chiedere', 'al', 'caffe'], { speaker: 'sofia' }),
    ]),
    P('p2', 2, [
      S('s05', "C'è un caffè vicino.", ['ce', 'un', 'caffe', 'vicino']),
      S('s06', 'Luca va al caffè.', ['luca', 'andare', 'al', 'caffe']),
      S('s07', 'Luca entra nel caffè.', ['luca', 'entrare', 'nel', 'caffe']),
      S('s08', 'Buongiorno.', ['buongiorno'], { speaker: 'luca' }),
    ]),
    P('p3', 3, [
      S('s09', 'Scusa, cerco un lavoro.', ['scusa', 'cercare', 'un', 'lavoro'], {
        speaker: 'luca',
        phrases: [
          {
            surface: 'Scusa',
            literalEn: 'Excuse / Sorry',
            naturalEn: 'Excuse me',
            tokenStart: 0,
            tokenEnd: 0,
          },
        ],
      }),
      S('s10', 'Luca aspetta.', ['luca', 'aspettare']),
      S('s11', 'Non so.', ['non', 'sapere'], {
        speaker: 'luca',
        phrases: [
          {
            surface: 'Non so',
            literalEn: 'I do not know',
            naturalEn: "I don't know",
            tokenStart: 0,
            tokenEnd: 1,
          },
        ],
      }),
      S('s12', 'Aspetta un momento.', ['aspettare', 'un', 'momento'], {
        speaker: 'sofia',
        phrases: [
          {
            surface: 'un momento',
            literalEn: 'a moment',
            naturalEn: 'a moment',
            tokenStart: 1,
            tokenEnd: 2,
          },
        ],
      }),
      S('s13', 'Va bene.', ['andare', 'bene'], {
        speaker: 'luca',
        phrases: [
          {
            surface: 'Va bene',
            literalEn: 'It goes well',
            naturalEn: 'Okay / All right',
            tokenStart: 0,
            tokenEnd: 1,
          },
        ],
      }),
    ]),
  ],
);

/** Cap. 9 — Opportunity at the café (reuse lavoro; padrone speaks) */
const chapter09 = chapter(
  {
    id: 'luca-a-roma-09',
    storyId: 'luca-a-roma',
    number: 9,
    title: 'An opportunity',
    titleIt: 'Un lavoro',
    difficultyLevel: 1,
    locationIds: ['lavoro-caffe', 'roma'],
    characterIds: ['luca', 'padrone'],
    events: [
      {
        id: 'ev-09-opportunity',
        summary: 'The café owner offers Luca work starting tomorrow.',
        characterIds: ['luca', 'padrone'],
        locationIds: ['lavoro-caffe'],
        rememberedFacts: [
          'Luca can work at the café',
          'The padrone offered Luca a job',
          'Luca starts tomorrow',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Luca torna al caffè.', ['luca', 'tornare', 'al', 'caffe']),
      S('s02', "Nel caffè c'è il padrone.", ['nel', 'caffe', 'ce', 'il', 'padrone']),
      S('s03', 'Luca parla con il padrone.', ['luca', 'parlare', 'con', 'il', 'padrone']),
    ]),
    P('p2', 2, [
      S('s04', 'Vuoi lavorare qui?', ['volere', 'lavorare', 'qui'], { speaker: 'padrone' }),
      S('s05', 'Sì, posso lavorare qui?', ['si_yes', 'potere', 'lavorare', 'qui'], {
        speaker: 'luca',
        phrases: [
          {
            surface: 'posso lavorare',
            literalEn: 'I can to work',
            naturalEn: 'I can work',
            tokenStart: 1,
            tokenEnd: 2,
          },
        ],
      }),
      S('s06', 'Sì, va bene.', ['si_yes', 'andare', 'bene'], {
        speaker: 'padrone',
        phrases: [
          {
            surface: 'va bene',
            literalEn: 'it goes well',
            naturalEn: 'okay / all right',
            tokenStart: 1,
            tokenEnd: 2,
          },
        ],
      }),
      S('s07', 'Grazie.', ['grazie'], { speaker: 'luca' }),
    ]),
    P('p3', 3, [
      S('s08', 'Luca può lavorare nel caffè.', ['luca', 'potere', 'lavorare', 'nel', 'caffe'], {
        phrases: [
          {
            surface: 'può lavorare',
            literalEn: 'can to work',
            naturalEn: 'can work',
            tokenStart: 1,
            tokenEnd: 2,
          },
        ],
      }),
      S('s09', 'Luca ha un lavoro.', ['luca', 'avere', 'un', 'lavoro']),
      S('s10', 'Domani Luca lavora.', ['domani', 'luca', 'lavorare']),
      S('s11', 'Luca è felice.', ['luca', 'essere', 'felice']),
      S('s12', 'Il lavoro non è difficile.', ['il', 'lavoro', 'non', 'essere', 'difficile']),
    ]),
  ],
);

/** Cap. 10 — First day; meets Giulia */
const chapter10 = chapter(
  {
    id: 'luca-a-roma-10',
    storyId: 'luca-a-roma',
    number: 10,
    title: 'First day',
    titleIt: 'Primo giorno',
    difficultyLevel: 1,
    locationIds: ['lavoro-caffe', 'roma'],
    characterIds: ['luca', 'giulia'],
    events: [
      {
        id: 'ev-10-giulia',
        summary: 'Luca starts work and meets colleague Giulia.',
        characterIds: ['luca', 'giulia'],
        locationIds: ['lavoro-caffe'],
        rememberedFacts: ['Luca works at the café', 'Giulia is Luca’s colleague'],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Oggi Luca lavora.', ['oggi', 'luca', 'lavorare']),
      S('s02', 'Luca va al caffè.', ['luca', 'andare', 'al', 'caffe']),
      S('s03', 'È mattina.', ['essere', 'mattina']),
      S('s04', 'Luca entra nel caffè.', ['luca', 'entrare', 'nel', 'caffe']),
    ]),
    P('p2', 2, [
      S('s05', "Nel caffè c'è Giulia.", ['nel', 'caffe', 'ce', 'giulia']),
      S('s06', 'Giulia lavora qui.', ['giulia', 'lavorare', 'qui']),
      S('s07', 'Ciao, sono Giulia.', ['ciao', 'essere', 'giulia'], { speaker: 'giulia' }),
      S('s08', 'Ciao, sono Luca.', ['ciao', 'essere', 'luca'], { speaker: 'luca' }),
      S('s09', 'Come stai?', ['come', 'stare'], { speaker: 'giulia' }),
      S('s10', 'Bene, grazie.', ['bene', 'grazie'], { speaker: 'luca' }),
    ]),
    P('p3', 3, [
      S('s11', 'Lavoriamo insieme.', ['lavorare', 'insieme'], { speaker: 'giulia' }),
      S('s12', 'Va bene.', ['andare', 'bene'], {
        speaker: 'luca',
        phrases: [
          {
            surface: 'Va bene',
            literalEn: 'it goes well',
            naturalEn: 'okay / all right',
            tokenStart: 0,
            tokenEnd: 1,
          },
        ],
      }),
      S('s13', 'Luca conosce Giulia.', ['luca', 'conoscere', 'giulia']),
      S('s14', 'Il primo giorno va bene.', ['il', 'primo', 'giorno', 'andare', 'bene'], {
        phrases: [
          {
            surface: 'va bene',
            literalEn: 'it goes well',
            naturalEn: 'goes well',
            tokenStart: 3,
            tokenEnd: 4,
          },
        ],
      }),
    ]),
  ],
);

/** Cap. 11 — Meets Marco */
const chapter11 = chapter(
  {
    id: 'luca-a-roma-11',
    storyId: 'luca-a-roma',
    number: 11,
    title: 'Marco',
    titleIt: 'Marco',
    difficultyLevel: 1,
    locationIds: ['lavoro-caffe', 'roma'],
    characterIds: ['luca', 'sofia', 'marco', 'giulia'],
    events: [
      {
        id: 'ev-11-meet-marco',
        summary: 'Sofia brings her friend Marco to the café; Luca meets him.',
        characterIds: ['luca', 'sofia', 'marco'],
        locationIds: ['lavoro-caffe'],
        rememberedFacts: [
          'Marco is Sofia’s friend',
          'Luca meets Marco at the café',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Luca lavora nel caffè.', ['luca', 'lavorare', 'nel', 'caffe']),
      S('s02', 'Giulia lavora con Luca.', ['giulia', 'lavorare', 'con', 'luca']),
      S('s03', 'Sofia arriva al caffè.', ['sofia', 'arrivare', 'al', 'caffe']),
      S('s04', "Con Sofia c'è Marco.", ['con', 'sofia', 'ce', 'marco']),
    ]),
    P('p2', 2, [
      S('s05', 'Marco è un amico di Sofia.', ['marco', 'essere', 'un', 'amico', 'di', 'sofia']),
      S('s06', 'Ciao, sono Marco.', ['ciao', 'essere', 'marco'], { speaker: 'marco' }),
      S('s07', 'Ciao, sono Luca.', ['ciao', 'essere', 'luca'], { speaker: 'luca' }),
      S('s08', 'Come stai?', ['come', 'stare'], { speaker: 'luca' }),
      S('s09', 'Bene.', ['bene'], { speaker: 'marco' }),
    ]),
    P('p3', 3, [
      S('s10', 'Prendiamo un caffè insieme.', ['prendere', 'un', 'caffe', 'insieme'], {
        speaker: 'sofia',
      }),
      S('s11', 'Sì, va bene.', ['si_yes', 'andare', 'bene'], {
        speaker: 'luca',
        phrases: [
          {
            surface: 'va bene',
            literalEn: 'it goes well',
            naturalEn: 'okay / all right',
            tokenStart: 1,
            tokenEnd: 2,
          },
        ],
      }),
      S('s12', 'Luca conosce Marco.', ['luca', 'conoscere', 'marco']),
      S('s13', 'Il gruppo è felice.', ['il', 'gruppo', 'essere', 'felice']),
    ]),
  ],
);

/** Cap. 12 — Marco’s mother is unwell; he needs a ticket and has no money */
const chapter12 = chapter(
  {
    id: 'luca-a-roma-12',
    storyId: 'luca-a-roma',
    number: 12,
    title: 'A problem',
    titleIt: 'Un problema',
    difficultyLevel: 1,
    locationIds: ['lavoro-caffe', 'roma'],
    characterIds: ['luca', 'sofia', 'marco'],
    events: [
      {
        id: 'ev-12-marco-problem',
        summary:
          'Marco’s mother sent a message: she is not well. He must go to her house, buy a ticket, and has no money.',
        characterIds: ['luca', 'sofia', 'marco'],
        locationIds: ['lavoro-caffe'],
        rememberedFacts: [
          'Marco’s mother is not well',
          'The message is from Marco’s mother',
          'Marco must go to his mother’s house',
          'Marco needs a train ticket and has no money',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Marco torna al caffè.', ['marco', 'tornare', 'al', 'caffe']),
      S('s02', 'Marco non è felice.', ['marco', 'non', 'essere', 'felice']),
      S('s03', 'Marco ha un problema.', ['marco', 'avere', 'un', 'problema']),
      S('s04', 'Luca e Sofia ascoltano.', ['luca', 'e', 'sofia', 'ascoltare']),
    ]),
    P('p2', 2, [
      S('s05', "Cosa c'è?", ['cosa', 'ce'], {
        speaker: 'luca',
        phrases: [
          {
            surface: "Cosa c'è?",
            literalEn: 'What is there?',
            naturalEn: "What's wrong?",
            tokenStart: 0,
            tokenEnd: 1,
          },
        ],
      }),
      S('s06', "C'è un messaggio di mamma.", ['ce', 'un', 'messaggio', 'di', 'mamma'], {
        speaker: 'marco',
      }),
      S('s07', 'Mia mamma non sta bene.', ['mio', 'mamma', 'non', 'stare', 'bene'], {
        speaker: 'marco',
      }),
      S('s08', 'Devo andare a casa di mamma.', [
        'dovere',
        'andare',
        'a',
        'casa',
        'di',
        'mamma',
      ], { speaker: 'marco' }),
    ]),
    P('p3', 3, [
      S('s09', 'Devo comprare un biglietto.', ['dovere', 'comprare', 'un', 'biglietto'], {
        speaker: 'marco',
      }),
      S('s10', 'Non ho soldi.', ['non', 'avere', 'soldi'], { speaker: 'marco' }),
      S('s11', 'Non ho tempo.', ['non', 'avere', 'tempo'], { speaker: 'marco' }),
      S('s12', 'Sofia vuole aiutare Marco.', ['sofia', 'volere', 'aiutare', 'marco']),
      S('s13', 'Luca vuole aiutare Marco.', ['luca', 'volere', 'aiutare', 'marco']),
    ]),
  ],
);

/** Cap. 13 — Sofia gives Marco money so he can buy the ticket */
const chapter13 = chapter(
  {
    id: 'luca-a-roma-13',
    storyId: 'luca-a-roma',
    number: 13,
    title: 'Helping Marco',
    titleIt: 'Aiutare Marco',
    difficultyLevel: 2,
    locationIds: ['lavoro-caffe', 'quartiere', 'roma'],
    characterIds: ['luca', 'sofia', 'marco', 'giulia'],
    events: [
      {
        id: 'ev-13-help-marco',
        summary: 'Sofia gives Marco money; that money is for the ticket he must buy.',
        characterIds: ['luca', 'sofia', 'marco', 'giulia'],
        locationIds: ['lavoro-caffe'],
        rememberedFacts: [
          'The group helps Marco',
          'Sofia gives Marco money for the ticket',
          'Marco will buy the ticket with Sofia’s money',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Luca, Sofia e Giulia parlano.', [
        'luca',
        'sofia',
        'e',
        'giulia',
        'parlare',
      ]),
      S('s02', 'Il gruppo vuole aiutare Marco.', [
        'il',
        'gruppo',
        'volere',
        'aiutare',
        'marco',
      ]),
      S('s03', 'Marco vuole aiuto.', ['marco', 'volere', 'aiuto']),
    ]),
    P('p2', 2, [
      S('s04', 'Possiamo aiutare.', ['potere', 'aiutare'], { speaker: 'sofia' }),
      S('s05', 'Io ho pochi soldi.', ['io', 'avere', 'poco', 'soldi'], { speaker: 'luca' }),
      S('s06', 'Ma insieme possiamo fare qualcosa.', [
        'ma',
        'insieme',
        'potere',
        'fare',
        'qualcosa',
      ], { speaker: 'giulia' }),
      S('s07', 'Grazie, siete gentili.', ['grazie', 'essere', 'gentile'], { speaker: 'marco' }),
    ]),
    P('p3', 3, [
      S('s08', 'Sofia dà soldi a Marco.', ['sofia', 'dare', 'soldi', 'a', 'marco']),
      S('s09', 'È per il biglietto.', ['essere', 'per', 'il', 'biglietto'], {
        speaker: 'sofia',
      }),
      S('s10', 'Compra il biglietto.', ['comprare', 'il', 'biglietto'], { speaker: 'sofia' }),
      S('s11', 'Grazie, Sofia.', ['grazie', 'sofia'], { speaker: 'marco' }),
      S('s12', 'Marco è tranquillo.', ['marco', 'essere', 'tranquillo']),
    ]),
  ],
);

/** Cap. 14 — Money is solved; he still cannot go alone, and time is short */
const chapter14 = chapter(
  {
    id: 'luca-a-roma-14',
    storyId: 'luca-a-roma',
    number: 14,
    title: 'Time pressure',
    titleIt: 'Poco tempo',
    difficultyLevel: 2,
    locationIds: ['lavoro-caffe', 'roma'],
    characterIds: ['luca', 'sofia', 'marco', 'giulia'],
    events: [
      {
        id: 'ev-14-complicated',
        summary:
          'Marco has money now, but he must leave soon and cannot go alone. They go to Nonna Rosa for advice.',
        characterIds: ['luca', 'sofia', 'marco', 'giulia'],
        locationIds: ['lavoro-caffe'],
        rememberedFacts: [
          'Marco has money for the ticket now',
          'Marco must leave soon and cannot go alone',
          'They go to Nonna Rosa for advice',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Marco ha soldi adesso.', ['marco', 'avere', 'soldi', 'adesso']),
      S('s02', 'Ma Marco deve partire presto.', [
        'ma',
        'marco',
        'dovere',
        'partire',
        'presto',
      ]),
      S('s03', 'Marco non ha molto tempo.', ['marco', 'non', 'avere', 'molto', 'tempo']),
      S('s04', 'Deve andare a casa di mamma.', [
        'dovere',
        'andare',
        'a',
        'casa',
        'di',
        'mamma',
      ]),
    ]),
    P('p2', 2, [
      S('s05', 'Devo partire presto.', ['dovere', 'partire', 'presto'], { speaker: 'marco' }),
      S('s06', 'Non posso stare qui.', ['non', 'potere', 'stare', 'qui'], {
        speaker: 'marco',
        phrases: [
          {
            surface: 'Non posso',
            literalEn: 'I cannot',
            naturalEn: "I can't",
            tokenStart: 0,
            tokenEnd: 1,
          },
        ],
      }),
      S('s07', 'Non posso andare solo.', ['non', 'potere', 'andare', 'solo'], {
        speaker: 'marco',
      }),
      S('s08', 'Cosa facciamo adesso?', ['cosa', 'fare', 'adesso'], { speaker: 'sofia' }),
    ]),
    P('p3', 3, [
      S('s09', 'Non lo so.', ['non', 'lo', 'sapere'], {
        speaker: 'marco',
        phrases: [
          {
            surface: 'Non lo so',
            literalEn: 'I do not know it',
            naturalEn: "I don't know",
            tokenStart: 0,
            tokenEnd: 2,
          },
        ],
      }),
      S('s10', 'Luca vuole aiutare.', ['luca', 'volere', 'aiutare']),
      S('s11', 'Andiamo a casa di Nonna Rosa.', [
        'andare',
        'a',
        'casa',
        'di',
        'nonna',
        'rosa',
      ], { speaker: 'sofia' }),
      S('s12', 'Nonna Rosa sa cosa fare.', ['nonna', 'rosa', 'sapere', 'cosa', 'fare'], {
        speaker: 'giulia',
      }),
      S('s13', 'Sì, oggi.', ['si_yes', 'oggi'], { speaker: 'luca' }),
    ]),
  ],
);

/** Cap. 15 — Nonna Rosa tells them to go with Marco tomorrow */
const chapter15 = chapter(
  {
    id: 'luca-a-roma-15',
    storyId: 'luca-a-roma',
    number: 15,
    title: 'A plan',
    titleIt: 'Un piano',
    difficultyLevel: 2,
    locationIds: ['casa-nonna', 'quartiere', 'roma'],
    characterIds: ['luca', 'sofia', 'marco', 'giulia', 'nonna-rosa'],
    events: [
      {
        id: 'ev-15-piano',
        summary:
          'They tell Nonna Rosa the problem. She tells them to go with Marco tomorrow on the train.',
        characterIds: ['luca', 'sofia', 'marco', 'giulia', 'nonna-rosa'],
        locationIds: ['casa-nonna'],
        rememberedFacts: [
          'Nonna Rosa tells them to go with Marco',
          'They will take the train tomorrow',
          'They will leave together tomorrow',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Il gruppo va a casa di Nonna Rosa.', [
        'il',
        'gruppo',
        'andare',
        'a',
        'casa',
        'di',
        'nonna',
        'rosa',
      ]),
      S('s02', 'Nonna Rosa apre la porta.', ['nonna', 'rosa', 'aprire', 'la', 'porta']),
      S('s03', 'Entrate, siete a casa.', ['entrare', 'essere', 'a', 'casa'], {
        speaker: 'nonna-rosa',
      }),
      S('s04', 'La casa è tranquilla.', ['la', 'casa', 'essere', 'tranquillo']),
    ]),
    P('p2', 2, [
      S('s05', 'Marco deve andare a casa di mamma.', [
        'marco',
        'dovere',
        'andare',
        'a',
        'casa',
        'di',
        'mamma',
      ], { speaker: 'sofia' }),
      S('s06', 'La mamma non sta bene.', ['la', 'mamma', 'non', 'stare', 'bene'], {
        speaker: 'sofia',
      }),
      S('s07', 'Ha soldi per il biglietto.', ['avere', 'soldi', 'per', 'il', 'biglietto'], {
        speaker: 'luca',
      }),
      S('s08', 'Marco non può andare solo.', ['marco', 'non', 'potere', 'andare', 'solo'], {
        speaker: 'giulia',
      }),
    ]),
    P('p3', 3, [
      S('s09', 'Andate insieme.', ['andare', 'insieme'], { speaker: 'nonna-rosa' }),
      S('s10', 'Domani prendete il treno.', ['domani', 'prendere', 'il', 'treno'], {
        speaker: 'nonna-rosa',
      }),
      S('s11', "L'aiuto è importante.", ['aiuto', 'essere', 'importante'], {
        speaker: 'nonna-rosa',
        phrases: [
          {
            surface: "L'aiuto",
            literalEn: 'the help',
            naturalEn: 'help',
            tokenStart: 0,
            tokenEnd: 0,
          },
        ],
      }),
      S('s12', 'Perché no?', ['perche', 'no'], {
        speaker: 'nonna-rosa',
        phrases: [
          {
            surface: 'Perché no?',
            literalEn: 'Why not?',
            naturalEn: 'Why not?',
            tokenStart: 0,
            tokenEnd: 1,
          },
        ],
      }),
      S('s13', 'Domani partono insieme.', ['domani', 'partire', 'insieme']),
      S('s14', 'Grazie, Nonna Rosa.', ['grazie', 'nonna', 'rosa'], { speaker: 'sofia' }),
    ]),
  ],
);

/** Cap. 16 — They leave Rome */
const chapter16 = chapter(
  {
    id: 'luca-a-roma-16',
    storyId: 'luca-a-roma',
    number: 16,
    title: 'Leaving Rome',
    titleIt: 'Partire',
    difficultyLevel: 2,
    locationIds: ['stazione', 'roma'],
    characterIds: ['luca', 'sofia', 'marco', 'giulia'],
    events: [
      {
        id: 'ev-16-leave',
        summary: 'The group goes to the station, puts the ticket in the suitcase, and boards the train.',
        characterIds: ['luca', 'sofia', 'marco', 'giulia'],
        locationIds: ['stazione'],
        rememberedFacts: [
          'The group leaves Rome by train',
          'Marco has the ticket',
          'The ticket is in the suitcase',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'È mattina.', ['essere', 'mattina']),
      S('s02', 'Andiamo alla stazione.', ['andare', 'alla', 'stazione'], { speaker: 'sofia' }),
      S('s03', 'Luca porta una valigia.', ['luca', 'portare', 'una', 'valigia']),
      S('s04', 'Ho il biglietto.', ['avere', 'il', 'biglietto'], { speaker: 'marco' }),
    ]),
    P('p2', 2, [
      S('s05', 'La stazione è grande.', ['la', 'stazione', 'essere', 'grande']),
      S('s06', "C'è un treno.", ['ce', 'un', 'treno']),
      S('s07', 'Prendiamo il treno.', ['prendere', 'il', 'treno'], { speaker: 'sofia' }),
      S('s08', 'Sì, andiamo.', ['si_yes', 'andare'], { speaker: 'marco' }),
    ]),
    P('p3', 3, [
      S('s09', 'Il biglietto è nella valigia.', ['il', 'biglietto', 'essere', 'nella', 'valigia'], {
        speaker: 'luca',
      }),
      S('s10', 'Giulia chiude la valigia.', ['giulia', 'chiudere', 'la', 'valigia']),
      S('s11', 'Il gruppo entra nel treno.', ['il', 'gruppo', 'entrare', 'nel', 'treno']),
      S('s12', 'Il treno parte adesso.', ['il', 'treno', 'partire', 'adesso']),
      S('s13', 'Il viaggio inizia.', ['il', 'viaggio', 'iniziare']),
    ]),
  ],
);

/** Cap. 17 — The trip begins */
const chapter17 = chapter(
  {
    id: 'luca-a-roma-17',
    storyId: 'luca-a-roma',
    number: 17,
    title: 'The trip',
    titleIt: 'Il viaggio',
    difficultyLevel: 2,
    locationIds: ['fuori-roma', 'stazione'],
    characterIds: ['luca', 'sofia', 'marco', 'giulia'],
    events: [
      {
        id: 'ev-17-trip',
        summary: 'On the train they see a small city; Marco says he must see his mother.',
        characterIds: ['luca', 'sofia', 'marco', 'giulia'],
        locationIds: ['fuori-roma'],
        rememberedFacts: [
          'The group is outside Rome on the way to Marco’s mother',
          'The trip is going well so far',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Il gruppo è fuori da Roma.', ['il', 'gruppo', 'essere', 'fuori', 'da', 'roma']),
      S('s02', 'Il treno va.', ['il', 'treno', 'andare']),
      S('s03', 'Luca guarda fuori.', ['luca', 'guardare', 'fuori']),
      S('s04', 'Vede una città piccola.', ['vedere', 'una', 'citta', 'piccolo']),
    ]),
    P('p2', 2, [
      S('s05', 'Viaggiamo insieme.', ['viaggiare', 'insieme'], { speaker: 'sofia' }),
      S('s06', 'Sì, è bello.', ['si_yes', 'essere', 'bello'], { speaker: 'luca' }),
      S('s07', 'Come stai, Marco?', ['come', 'stare', 'marco'], { speaker: 'giulia' }),
      S('s08', 'Devo vedere mamma.', ['dovere', 'vedere', 'mamma'], { speaker: 'marco' }),
    ]),
    P('p3', 3, [
      S('s09', 'Il gruppo mangia qualcosa.', ['il', 'gruppo', 'mangiare', 'qualcosa']),
      S('s10', 'Hanno sete e fame.', ['avere', 'sete', 'e', 'fame']),
      S('s11', 'Andiamo a casa di mamma.', ['andare', 'a', 'casa', 'di', 'mamma'], {
        speaker: 'luca',
      }),
      S('s12', 'Il viaggio va bene.', ['il', 'viaggio', 'andare', 'bene'], {
        phrases: [
          {
            surface: 'va bene',
            literalEn: 'it goes well',
            naturalEn: 'is going well',
            tokenStart: 2,
            tokenEnd: 3,
          },
        ],
      }),
      S('s13', 'Ora il tempo passa.', ['ora', 'il', 'tempo', 'passare']),
    ]),
  ],
);

/** Cap. 18 — Something unexpected */
const chapter18 = chapter(
  {
    id: 'luca-a-roma-18',
    storyId: 'luca-a-roma',
    number: 18,
    title: 'A surprise',
    titleIt: 'Una sorpresa',
    difficultyLevel: 2,
    locationIds: ['fuori-roma'],
    characterIds: ['luca', 'sofia', 'marco', 'giulia'],
    events: [
      {
        id: 'ev-18-surprise',
        summary: 'The train arrives in the small city; Marco cannot find the ticket; the suitcase is missing.',
        characterIds: ['luca', 'sofia', 'marco', 'giulia'],
        locationIds: ['fuori-roma'],
        rememberedFacts: [
          'The train arrives in the small city',
          'The ticket and suitcase seem lost',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Il treno arriva.', ['il', 'treno', 'arrivare']),
      S('s02', 'Siamo in città.', ['essere', 'in', 'citta'], { speaker: 'luca' }),
      S('s03', "C'è un problema.", ['ce', 'un', 'problema']),
      S('s04', 'Marco cerca il biglietto.', ['marco', 'cercare', 'il', 'biglietto']),
    ]),
    P('p2', 2, [
      S('s05', 'Non trovo il biglietto.', ['non', 'trovare', 'il', 'biglietto'], {
        speaker: 'marco',
      }),
      S('s06', 'È un problema.', ['essere', 'un', 'problema'], { speaker: 'sofia' }),
      S('s07', "Dov'è la valigia?", ['dove_e', 'la', 'valigia'], {
        speaker: 'giulia',
        phrases: [
          {
            surface: "Dov'è",
            literalEn: 'Where is',
            naturalEn: 'Where is',
            tokenStart: 0,
            tokenEnd: 0,
          },
        ],
      }),
      S('s08', 'La valigia non è qui.', ['la', 'valigia', 'non', 'essere', 'qui'], {
        speaker: 'luca',
      }),
      S('s09', 'Scusa.', ['scusa'], { speaker: 'marco' }),
    ]),
    P('p3', 3, [
      S('s10', 'Il gruppo non è tranquillo.', ['il', 'gruppo', 'non', 'essere', 'tranquillo']),
      S('s11', 'Marco è stanco.', ['marco', 'essere', 'stanco']),
      S('s12', 'Cosa facciamo adesso?', ['cosa', 'fare', 'adesso'], { speaker: 'sofia' }),
      S('s13', 'Dobbiamo cercare.', ['dovere', 'cercare'], { speaker: 'luca' }),
      S('s14', 'La sorpresa non è bella.', ['la', 'sorpresa', 'non', 'essere', 'bello']),
    ]),
  ],
);

/** Cap. 19 — They solve it (risolvere introduced here deliberately) */
const chapter19 = chapter(
  {
    id: 'luca-a-roma-19',
    storyId: 'luca-a-roma',
    number: 19,
    title: 'Solving it',
    titleIt: 'Risolvere',
    difficultyLevel: 2,
    locationIds: ['fuori-roma'],
    characterIds: ['luca', 'sofia', 'marco', 'giulia'],
    events: [
      {
        id: 'ev-19-solve',
        summary:
          'They find the suitcase, then the ticket inside it. They go to Marco’s mother; she is there and she is well.',
        characterIds: ['luca', 'sofia', 'marco', 'giulia'],
        locationIds: ['fuori-roma'],
        rememberedFacts: [
          'Giulia finds the suitcase; the ticket is inside',
          'They go to Marco’s mother',
          'Marco’s mother is there and she is well',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Il gruppo vuole risolvere il problema.', [
        'il',
        'gruppo',
        'volere',
        'risolvere',
        'il',
        'problema',
      ]),
      S('s02', "Dov'è la valigia?", ['dove_e', 'la', 'valigia'], {
        speaker: 'luca',
        phrases: [
          {
            surface: "Dov'è",
            literalEn: 'Where is',
            naturalEn: 'Where is',
            tokenStart: 0,
            tokenEnd: 0,
          },
        ],
      }),
      S('s03', 'Aspetta, la valigia è qui.', ['aspettare', 'la', 'valigia', 'essere', 'qui'], {
        speaker: 'giulia',
      }),
      S('s04', 'Giulia trova la valigia.', ['giulia', 'trovare', 'la', 'valigia']),
    ]),
    P('p2', 2, [
      S('s05', 'Luca cerca nella valigia.', ['luca', 'cercare', 'nella', 'valigia']),
      S('s06', 'Ecco il biglietto!', ['ecco', 'il', 'biglietto'], { speaker: 'marco' }),
      S('s07', 'Insieme risolviamo il problema.', [
        'insieme',
        'risolvere',
        'il',
        'problema',
      ], { speaker: 'luca' }),
      S('s08', 'Andiamo a casa di mamma.', ['andare', 'a', 'casa', 'di', 'mamma'], {
        speaker: 'sofia',
      }),
    ]),
    P('p3', 3, [
      S('s09', 'La mamma di Marco è qui.', ['la', 'mamma', 'di', 'marco', 'essere', 'qui']),
      S('s10', 'La mamma sta bene.', ['la', 'mamma', 'stare', 'bene']),
      S('s11', 'Ciao, mamma.', ['ciao', 'mamma'], { speaker: 'marco' }),
      S('s12', 'Grazie, amici.', ['grazie', 'amico'], { speaker: 'marco' }),
      S('s13', 'Il problema è risolto.', ['il', 'problema', 'essere', 'risolvere']),
    ]),
  ],
);

/** Cap. 20 — Return to Rome */
const chapter20 = chapter(
  {
    id: 'luca-a-roma-20',
    storyId: 'luca-a-roma',
    number: 20,
    title: 'Home again',
    titleIt: 'Tornare a casa',
    difficultyLevel: 2,
    locationIds: ['roma', 'stazione', 'quartiere'],
    characterIds: ['luca', 'sofia', 'marco', 'giulia'],
    events: [
      {
        id: 'ev-20-return',
        summary: 'After seeing Marco’s mother, the friends return to Rome; Luca has a home, a job, and friends.',
        characterIds: ['luca', 'sofia', 'marco', 'giulia'],
        locationIds: ['roma', 'stazione'],
        rememberedFacts: [
          'The group returns to Rome after seeing Marco’s mother',
          'They are friends and happy at home',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Poi il gruppo torna a Roma.', ['poi', 'il', 'gruppo', 'tornare', 'a', 'roma']),
      S('s02', 'Arrivano alla stazione.', ['arrivare', 'alla', 'stazione']),
      S('s03', 'Roma è bella.', ['roma', 'essere', 'bello']),
      S('s04', 'Luca è a casa.', ['luca', 'essere', 'a', 'casa']),
    ]),
    P('p2', 2, [
      S('s05', 'Siamo a casa.', ['essere', 'a', 'casa'], { speaker: 'sofia' }),
      S('s06', 'Sì, siamo a Roma.', ['si_yes', 'essere', 'a', 'roma'], { speaker: 'luca' }),
      S('s07', 'Come stai ora?', ['come', 'stare', 'ora'], { speaker: 'sofia' }),
      S('s08', 'Bene. Grazie per tutto.', ['bene', 'grazie', 'per', 'tutto'], {
        speaker: 'marco',
      }),
      S('s09', 'Siete amici importanti.', ['essere', 'amico', 'importante'], {
        speaker: 'marco',
      }),
    ]),
    P('p3', 3, [
      S('s10', 'Il gruppo cammina nel quartiere.', [
        'il',
        'gruppo',
        'camminare',
        'nel',
        'quartiere',
      ]),
      S('s11', 'Luca ha una casa, un lavoro e amici.', [
        'luca',
        'avere',
        'una',
        'casa',
        'un',
        'lavoro',
        'e',
        'amico',
      ]),
      S('s12', 'Sofia, Giulia e Marco sono felici.', [
        'sofia',
        'giulia',
        'e',
        'marco',
        'essere',
        'felice',
      ]),
      S('s13', 'Insieme vivono a Roma.', ['insieme', 'vivere', 'a', 'roma']),
      S('s14', 'La sera è tranquilla.', ['la', 'sera', 'essere', 'tranquillo']),
      S('s15', 'Ci vediamo.', ['ci', 'vedere'], { speaker: 'luca' }),
      S('s16', 'Luca è felice a Roma.', ['luca', 'essere', 'felice', 'a', 'roma']),
    ]),
  ],
);

module.exports = {
  chapter06,
  chapter07,
  chapter08,
  chapter09,
  chapter10,
  chapter11,
  chapter12,
  chapter13,
  chapter14,
  chapter15,
  chapter16,
  chapter17,
  chapter18,
  chapter19,
  chapter20,
};
