const { S, P, chapter } = require('./chapter-helpers');

/** Cap. 1 — Luca arrives in Rome (foundation + a few seed words for ch2) */
const chapter01 = chapter(
  {
    id: 'luca-a-roma-01',
    storyId: 'luca-a-roma',
    number: 1,
    title: 'Arrival',
    titleIt: 'Arrivo',
    difficultyLevel: 1,
    locationIds: ['roma', 'stazione', 'bar-centrale'],
    characterIds: ['luca'],
    events: [
      {
        id: 'ev-01-arrive',
        summary: 'Luca arrives in Rome, tired and hungry, and enters a bar.',
        characterIds: ['luca'],
        locationIds: ['roma', 'stazione', 'bar-centrale'],
        rememberedFacts: ['Luca is in Rome', 'Luca is tired and hungry', 'Luca finds a bar near the station'],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Luca arriva a Roma.', ['luca', 'arrivare', 'a', 'roma']),
      S('s02', 'È alla stazione.', ['essere', 'alla', 'stazione']),
      S('s03', 'È mattina.', ['essere', 'mattina']),
      S('s04', 'Luca è stanco.', ['luca', 'essere', 'stanco']),
    ]),
    P('p2', 2, [
      S('s05', 'Luca ha fame.', ['luca', 'avere', 'fame'], {
        phrases: [
          {
            surface: 'ha fame',
            literalEn: 'has hunger',
            naturalEn: 'is hungry',
            tokenStart: 1,
            tokenEnd: 2,
          },
        ],
      }),
      S('s06', 'Luca vuole mangiare.', ['luca', 'volere', 'mangiare']),
      S('s07', 'Luca cerca un bar.', ['luca', 'cercare', 'un', 'bar']),
      S('s08', "C'è un bar vicino.", ['ce', 'un', 'bar', 'vicino']),
    ]),
    P('p3', 3, [
      S('s09', 'Luca va al bar.', ['luca', 'andare', 'al', 'bar']),
      S('s10', 'Luca entra nel bar.', ['luca', 'entrare', 'nel', 'bar']),
      S('s11', 'Buongiorno.', ['buongiorno'], { speaker: 'luca' }),
      S('s12', 'Luca vuole qualcosa.', ['luca', 'volere', 'qualcosa']),
      S('s13', 'Luca mangia cibo.', ['luca', 'mangiare', 'cibo']),
    ]),
  ],
);

/** Cap. 2 — Explores the city (heavy reuse of ch1; few deliberate new words) */
const chapter02 = chapter(
  {
    id: 'luca-a-roma-02',
    storyId: 'luca-a-roma',
    number: 2,
    title: 'The city',
    titleIt: 'La città',
    difficultyLevel: 1,
    locationIds: ['roma', 'strada', 'bar-centrale', 'centro'],
    characterIds: ['luca'],
    events: [
      {
        id: 'ev-02-explore',
        summary: 'Luca walks the streets of Rome, returns to the bar, still tired but happy.',
        characterIds: ['luca'],
        locationIds: ['roma', 'strada', 'bar-centrale'],
        rememberedFacts: ['Luca walks a lot in Rome', 'Rome is big', 'Luca still goes to the bar'],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Luca è a Roma.', ['luca', 'essere', 'a', 'roma']),
      S('s02', 'Oggi Luca cammina.', ['oggi', 'luca', 'camminare']),
      S('s03', 'Luca cammina per la strada.', ['luca', 'camminare', 'per', 'la', 'strada']),
      S('s04', 'Roma è grande.', ['roma', 'essere', 'grande']),
    ]),
    P('p2', 2, [
      S('s05', 'Luca cerca un bar.', ['luca', 'cercare', 'un', 'bar']),
      S('s06', "C'è un bar vicino.", ['ce', 'un', 'bar', 'vicino']),
      S('s07', 'Luca va al bar.', ['luca', 'andare', 'al', 'bar']),
      S('s08', 'Luca entra nel bar.', ['luca', 'entrare', 'nel', 'bar']),
    ]),
    P('p3', 3, [
      S('s09', 'Luca ha ancora fame.', ['luca', 'avere', 'ancora', 'fame'], {
        phrases: [
          {
            surface: 'ha ancora fame',
            literalEn: 'has still hunger',
            naturalEn: 'is still hungry',
            tokenStart: 1,
            tokenEnd: 3,
          },
        ],
      }),
      S('s10', 'Luca vuole mangiare.', ['luca', 'volere', 'mangiare']),
      S('s11', 'Luca è stanco, ma sta bene.', ['luca', 'essere', 'stanco', 'ma', 'stare', 'bene']),
      S('s12', 'Roma è bella.', ['roma', 'essere', 'bello']),
      S('s13', 'Luca mangia qualcosa.', ['luca', 'mangiare', 'qualcosa']),
    ]),
  ],
);

/** Cap. 3 — Looks for a place to stay */
const chapter03 = chapter(
  {
    id: 'luca-a-roma-03',
    storyId: 'luca-a-roma',
    number: 3,
    title: 'A place to stay',
    titleIt: 'Un posto',
    difficultyLevel: 1,
    locationIds: ['roma', 'centro', 'strada'],
    characterIds: ['luca'],
    events: [
      {
        id: 'ev-03-search-home',
        summary: 'Luca looks for a small apartment near the center; money is tight.',
        characterIds: ['luca'],
        locationIds: ['roma', 'centro'],
        rememberedFacts: [
          'Luca needs an apartment',
          'Luca wants something near the center',
          'Apartments cost a lot',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Luca cerca un posto.', ['luca', 'cercare', 'un', 'posto']),
      S('s02', 'Luca cerca una casa.', ['luca', 'cercare', 'una', 'casa']),
      S('s03', 'Luca vuole un appartamento.', ['luca', 'volere', 'un', 'appartamento']),
      S('s04', 'Vuole un appartamento piccolo.', ['volere', 'un', 'appartamento', 'piccolo']),
    ]),
    P('p2', 2, [
      S('s05', 'Luca cammina molto.', ['luca', 'camminare', 'molto']),
      S('s06', 'Cammina per la strada.', ['camminare', 'per', 'la', 'strada']),
      S('s07', 'Cerca vicino al centro.', ['cercare', 'vicino', 'al', 'centro']),
      S('s08', 'Un appartamento costa molto.', ['un', 'appartamento', 'costare', 'molto']),
      S('s09', 'Luca non ha molti soldi.', ['luca', 'non', 'avere', 'molto', 'soldi']),
    ]),
    P('p3', 3, [
      S('s10', 'Luca è stanco.', ['luca', 'essere', 'stanco']),
      S('s11', 'Ma Luca vuole una casa.', ['ma', 'luca', 'volere', 'una', 'casa']),
      S('s12', 'Domani cerca ancora.', ['domani', 'cercare', 'ancora']),
      S('s13', 'Luca vuole un posto a Roma.', ['luca', 'volere', 'un', 'posto', 'a', 'roma']),
    ]),
  ],
);

/** Cap. 4 — Finds an apartment */
const chapter04 = chapter(
  {
    id: 'luca-a-roma-04',
    storyId: 'luca-a-roma',
    number: 4,
    title: 'The apartment',
    titleIt: "L'appartamento",
    difficultyLevel: 1,
    locationIds: ['appartamento-luca', 'strada', 'roma'],
    characterIds: ['luca'],
    events: [
      {
        id: 'ev-04-apartment',
        summary: 'Luca finds a small apartment near the center and gets the key.',
        characterIds: ['luca'],
        locationIds: ['appartamento-luca'],
        rememberedFacts: [
          'Luca has a small apartment near the center',
          'Luca has the key',
          'The rent is not too high',
        ],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Oggi Luca trova un appartamento.', ['oggi', 'luca', 'trovare', 'un', 'appartamento']),
      S('s02', "L'appartamento è piccolo.", ['appartamento', 'essere', 'piccolo']),
      S('s03', "L'appartamento è vicino al centro.", ['appartamento', 'essere', 'vicino', 'al', 'centro']),
      S('s04', 'Luca è felice.', ['luca', 'essere', 'felice']),
    ]),
    P('p2', 2, [
      S('s05', "C'è una porta.", ['ce', 'una', 'porta']),
      S('s06', "C'è una chiave.", ['ce', 'una', 'chiave']),
      S('s07', 'Luca apre la porta.', ['luca', 'aprire', 'la', 'porta']),
      S('s08', 'Entra nella stanza.', ['entrare', 'nella', 'stanza']),
    ]),
    P('p3', 3, [
      S('s09', 'La stanza è piccola.', ['la', 'stanza', 'essere', 'piccolo']),
      S('s10', 'Ma la stanza è bella.', ['ma', 'la', 'stanza', 'essere', 'bello']),
      S('s11', 'Luca ha una casa a Roma.', ['luca', 'avere', 'una', 'casa', 'a', 'roma']),
      S('s12', "L'affitto non costa troppo.", ['affitto', 'non', 'costare', 'troppo']),
      S('s13', 'Luca sta bene.', ['luca', 'stare', 'bene']),
    ]),
  ],
);

/** Cap. 5 — Meets Sofia (dialogue + Come stai?; fewer new adjectives) */
const chapter05 = chapter(
  {
    id: 'luca-a-roma-05',
    storyId: 'luca-a-roma',
    number: 5,
    title: 'Sofia',
    titleIt: 'Sofia',
    difficultyLevel: 1,
    locationIds: ['bar-centrale', 'roma'],
    characterIds: ['luca', 'sofia'],
    events: [
      {
        id: 'ev-05-meet-sofia',
        summary: 'Luca meets Sofia at the familiar bar; they exchange greetings.',
        characterIds: ['luca', 'sofia'],
        locationIds: ['bar-centrale'],
        rememberedFacts: ['Luca knows Sofia now', 'They met at the bar', 'Sofia lives in Rome'],
      },
    ],
  },
  [
    P('p1', 1, [
      S('s01', 'Luca va al bar.', ['luca', 'andare', 'al', 'bar']),
      S('s02', 'Il bar è vicino alla casa.', ['il', 'bar', 'essere', 'vicino', 'alla', 'casa']),
      S('s03', 'Luca entra nel bar.', ['luca', 'entrare', 'nel', 'bar']),
      S('s04', 'Nel bar c’è una donna.', ['nel', 'bar', 'ce', 'una', 'donna']),
    ]),
    P('p2', 2, [
      S('s05', 'Ciao.', ['ciao'], { speaker: 'sofia' }),
      S('s06', 'Ciao.', ['ciao'], { speaker: 'luca' }),
      S('s07', 'Mi chiamo Sofia.', ['mi_chiamo', 'sofia'], {
        speaker: 'sofia',
        phrases: [
          {
            surface: 'Mi chiamo',
            literalEn: 'Myself I call',
            naturalEn: 'My name is',
            tokenStart: 0,
            tokenEnd: 1,
          },
        ],
      }),
      S('s08', 'Ciao, mi chiamo Luca.', ['ciao', 'mi_chiamo', 'luca'], { speaker: 'luca' }),
      S('s09', 'Sei nuovo?', ['essere', 'nuovo'], { speaker: 'sofia' }),
      S('s10', 'Sì, sono nuovo.', ['si_yes', 'essere', 'nuovo'], { speaker: 'luca' }),
    ]),
    P('p3', 3, [
      S('s10', 'Sofia è a Roma.', ['sofia', 'essere', 'a', 'roma']),
      S('s11', 'Ora Luca conosce Sofia.', ['ora', 'luca', 'conoscere', 'sofia']),
      S('s12', 'Luca è felice.', ['luca', 'essere', 'felice']),
      S('s13', 'Ci vediamo.', ['ci', 'vedere'], {
        speaker: 'sofia',
        phrases: [
          {
            surface: 'Ci vediamo',
            literalEn: 'We see each other',
            naturalEn: 'See you',
            tokenStart: 0,
            tokenEnd: 1,
          },
        ],
      }),
      S('s14', 'Sì, ci vediamo.', ['si_yes', 'ci', 'vedere'], { speaker: 'luca' }),
    ]),
  ],
);

module.exports = { chapter01, chapter02, chapter03, chapter04, chapter05 };
