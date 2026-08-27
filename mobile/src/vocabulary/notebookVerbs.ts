/**
 * Story-connected verb patterns for "Il mio quaderno — Come cambiano le parole".
 *
 * This file captures how verbs change form across Person, Tense, and Mindset,
 * connecting every conjugation pattern directly to Luca's lived experience.
 */

export type VerbTenseConjugation = {
  io: string;
  tu: string;
  luiLei: string;
  noi: string;
  voi: string;
  loro: string;
};

export type VerbTransformation = {
  form: string;
  tenseName: string;
  concept: string;
  quoteIt: string;
  quoteEn: string;
  chapterNumber: number;
};

export type WordFamilyMember = {
  wordIt: string;
  wordEn: string;
  kind: 'derivation' | 'inflection';
  relationship: string;
  chapterNumber?: number;
};

export type NotebookVerbPattern = {
  lemmaId: string;
  infinitive: string;
  english: string;
  root: string;
  regularGroup: 'are' | 'ere' | 'ire' | 'irregular';
  whyItChanges: string;
  wordFamily?: WordFamilyMember[];
  presente: VerbTenseConjugation;
  passatoProssimo: VerbTenseConjugation;
  imperfetto: VerbTenseConjugation;
  condizionale?: VerbTenseConjugation;
  transformations: VerbTransformation[];
};

export const NOTEBOOK_VERB_PATTERNS: readonly NotebookVerbPattern[] = [
  {
    lemmaId: 'risolvere',
    infinitive: 'risolvere',
    english: 'to solve / resolve / fix',
    root: 'risolv- / risolt-',
    regularGroup: 'ere',
    whyItChanges:
      'Irregular past participle "risolto". Embodies Luca’s growing technical resilience: fixing breakdowns calmly without abandoning his post.',
    wordFamily: [
      {
        wordIt: 'la risoluzione',
        wordEn: 'resolution / solution',
        kind: 'derivation',
        relationship: 'Noun derivative (root risolt-)',
      },
    ],
    presente: {
      io: 'risolvo',
      tu: 'risolvi',
      luiLei: 'risolve',
      noi: 'risolviamo',
      voi: 'risolvete',
      loro: 'risolvono',
    },
    passatoProssimo: {
      io: 'ho risolto',
      tu: 'hai risolto',
      luiLei: 'ha risolto',
      noi: 'abbiamo risolto',
      voi: 'avete risolto',
      loro: 'hanno risolto',
    },
    imperfetto: {
      io: 'risolvevo',
      tu: 'risolvevi',
      luiLei: 'risolveva',
      noi: 'risolvevamo',
      voi: 'risolvevate',
      loro: 'risolvevano',
    },
    transformations: [
      {
        form: 'ho risolto',
        tenseName: 'Passato Prossimo (Completed action)',
        concept: 'Fixing an emergency before opening',
        quoteIt: 'Il guasto meccanico era stato completamente risolto in meno di venticinque minuti.',
        quoteEn: 'The mechanical breakdown had been completely resolved in under twenty-five minutes.',
        chapterNumber: 59,
      },
      {
        form: 'risolviamo',
        tenseName: 'Presente (Shared resolve)',
        concept: 'Working together to solve friction',
        quoteIt: 'Risolviamo insieme i problemi dello spazio comune.',
        quoteEn: 'We solve the problems of the shared space together.',
        chapterNumber: 60,
      },
      {
        form: 'risolvere',
        tenseName: 'Infinito (The mindset)',
        concept: 'Resilience as an ongoing artisanal craft',
        quoteIt: 'Sapere come risolvere il guasto senza perdere la calma.',
        quoteEn: 'Knowing how to resolve the breakdown without losing composure.',
        chapterNumber: 59,
      },
    ],
  },
  {
    lemmaId: 'gestire',
    infinitive: 'gestire',
    english: 'to manage / handle',
    root: 'gest- / gestisc-',
    regularGroup: 'ire',
    whyItChanges:
      '-ire verb with "-isc-" in the present singular. Reflects Luca learning to govern the flow of orders and workflow under pressure.',
    wordFamily: [
      {
        wordIt: 'la gestione',
        wordEn: 'management / handling',
        kind: 'derivation',
        relationship: 'Noun derivative (root gest-)',
      },
    ],
    presente: {
      io: 'gestisco',
      tu: 'gestisci',
      luiLei: 'gestisce',
      noi: 'gestiamo',
      voi: 'gestite',
      loro: 'gestiscono',
    },
    passatoProssimo: {
      io: 'ho gestito',
      tu: 'hai gestito',
      luiLei: 'ha gestito',
      noi: 'abbiamo gestito',
      voi: 'avete gestito',
      loro: 'hanno gestito',
    },
    imperfetto: {
      io: 'gestivo',
      tu: 'gestivi',
      luiLei: 'gestiva',
      noi: 'gestivamo',
      voi: 'gestivate',
      loro: 'gestivano',
    },
    transformations: [
      {
        form: 'gestisco',
        tenseName: 'Presente (Now)',
        concept: 'Controlling workflow at the counter',
        quoteIt: 'Gestisco il flusso delle persone con ordine.',
        quoteEn: 'I manage the flow of people with order.',
        chapterNumber: 56,
      },
      {
        form: 'gestivo',
        tenseName: 'Imperfetto (Past routine)',
        concept: 'When customer traffic was handled slowly',
        quoteIt: 'Prima gestivo solo poche tazzine alla volta.',
        quoteEn: 'Before I managed only a few cups at a time.',
        chapterNumber: 56,
      },
      {
        form: 'ho gestito',
        tenseName: 'Passato Prossimo (Completed challenge)',
        concept: 'Withstanding the morning rush',
        quoteIt: 'Ho gestito la fretta eliminando i gesti inutili.',
        quoteEn: 'I handled the rush by eliminating wasted motions.',
        chapterNumber: 56,
      },
    ],
  },
  {
    lemmaId: 'parlare',
    infinitive: 'parlare',
    english: 'to speak',
    root: 'parl-',
    regularGroup: 'are',
    whyItChanges:
      'Regular -are verb: the root "parl-" stays stable, while endings indicate person (-o, -i, -a...) and tense (-avo, -avi...).',
    wordFamily: [
      {
        wordIt: 'la parola',
        wordEn: 'word',
        kind: 'derivation',
        relationship: 'Noun derivative (root parl- / parol-)',
        chapterNumber: 5,
      },
    ],
    presente: {
      io: 'parlo',
      tu: 'parli',
      luiLei: 'parla',
      noi: 'parliamo',
      voi: 'parlate',
      loro: 'parlano',
    },
    passatoProssimo: {
      io: 'ho parlato',
      tu: 'hai parlato',
      luiLei: 'ha parlato',
      noi: 'abbiamo parlato',
      voi: 'avete parlato',
      loro: 'hanno parlato',
    },
    imperfetto: {
      io: 'parlavo',
      tu: 'parlavi',
      luiLei: 'parlava',
      noi: 'parlavamo',
      voi: 'parlavate',
      loro: 'parlavano',
    },
    condizionale: {
      io: 'parlerei',
      tu: 'parleresti',
      luiLei: 'parlerebbe',
      noi: 'parleremmo',
      voi: 'parlereste',
      loro: 'parlerebbero',
    },
    transformations: [
      {
        form: 'parlo',
        tenseName: 'Presente (Now)',
        concept: 'Daily interaction and present routine',
        quoteIt: 'Io parlo con Bruno al banco ogni mattina.',
        quoteEn: 'I speak with Bruno at the counter every morning.',
        chapterNumber: 12,
      },
      {
        form: 'parlavo',
        tenseName: 'Imperfetto (Past habit)',
        concept: 'Ongoing background state in the early days',
        quoteIt: 'All’inizio parlavo poco, ma ascoltavo le parole dei clienti.',
        quoteEn: 'At the beginning I spoke little, but listened to the customers’ words.',
        chapterNumber: 20,
      },
      {
        form: 'ho parlato',
        tenseName: 'Passato Prossimo (Completed event)',
        concept: 'The decisive moment of honest communication',
        quoteIt: 'Ho voluto parlare con franchezza a Sofia sul Gianicolo.',
        quoteEn: 'I chose to speak frankly with Sofia on the Gianicolo.',
        chapterNumber: 45,
      },
    ],
  },
  {
    lemmaId: 'lavorare',
    infinitive: 'lavorare',
    english: 'to work',
    root: 'lavor-',
    regularGroup: 'are',
    whyItChanges:
      'Regular -are verb: reflects Luca’s progression from a hired hand to an independent artisan.',
    wordFamily: [
      {
        wordIt: 'il lavoro',
        wordEn: 'work / job',
        kind: 'derivation',
        relationship: 'Noun derivative (root lavor-)',
        chapterNumber: 40,
      },
      {
        wordIt: 'il lavoratore',
        wordEn: 'worker',
        kind: 'derivation',
        relationship: 'Agent noun (-tore)',
      },
    ],
    presente: {
      io: 'lavoro',
      tu: 'lavori',
      luiLei: 'lavora',
      noi: 'lavoriamo',
      voi: 'lavorate',
      loro: 'lavorano',
    },
    passatoProssimo: {
      io: 'ho lavorato',
      tu: 'hai lavorato',
      luiLei: 'ha lavorato',
      noi: 'abbiamo lavorato',
      voi: 'avete lavorato',
      loro: 'hanno lavorato',
    },
    imperfetto: {
      io: 'lavoravo',
      tu: 'lavoravi',
      luiLei: 'lavorava',
      noi: 'lavoravamo',
      voi: 'lavoravate',
      loro: 'lavoravano',
    },
    condizionale: {
      io: 'lavorerei',
      tu: 'lavoreresti',
      luiLei: 'lavorerebbe',
      noi: 'lavoreremmo',
      voi: 'lavorereste',
      loro: 'lavorerebbero',
    },
    transformations: [
      {
        form: 'lavoro',
        tenseName: 'Presente (Now)',
        concept: 'The daily rhythm behind the counter',
        quoteIt: 'Lavoro con attenzione per regolare la macinatura.',
        quoteEn: 'I work with care to adjust the grind.',
        chapterNumber: 3,
      },
      {
        form: 'lavoravo',
        tenseName: 'Imperfetto (Past habit)',
        concept: 'The passive routine before the crisis',
        quoteIt: 'Lavoravo senza pormi troppe domande sul futuro.',
        quoteEn: 'I was working without asking myself too many questions about the future.',
        chapterNumber: 41,
      },
      {
        form: 'ho lavorato',
        tenseName: 'Passato Prossimo (Completed event)',
        concept: 'Effort invested in mastering the trade',
        quoteIt: 'Ho lavorato ogni giorno per imparare il mestiere da Bruno.',
        quoteEn: 'I worked every day to learn the trade from Bruno.',
        chapterNumber: 48,
      },
      {
        form: 'lavorerei',
        tenseName: 'Condizionale (Desire/Hypothesis)',
        concept: 'Envisioning an autonomous future',
        quoteIt: 'Lavorerei volentieri con tostatori artigianali.',
        quoteEn: 'I would gladly work with artisan roasters.',
        chapterNumber: 53,
      },
    ],
  },
  {
    lemmaId: 'essere',
    infinitive: 'essere',
    english: 'to be',
    root: 'irregular',
    regularGroup: 'irregular',
    whyItChanges:
      'Irregular auxiliary: fundamental for identity (sono), past context (ero), and completed experience (sono stato).',
    wordFamily: [
      {
        wordIt: 'lo stato',
        wordEn: 'state / been',
        kind: 'inflection',
        relationship: 'Participle and noun',
      },
    ],
    presente: {
      io: 'sono',
      tu: 'sei',
      luiLei: 'è',
      noi: 'siamo',
      voi: 'siete',
      loro: 'sono',
    },
    passatoProssimo: {
      io: 'sono stato/a',
      tu: 'sei stato/a',
      luiLei: 'è stato/a',
      noi: 'siamo stati/e',
      voi: 'siete stati/e',
      loro: 'sono stati/e',
    },
    imperfetto: {
      io: 'ero',
      tu: 'eri',
      luiLei: 'era',
      noi: 'eravamo',
      voi: 'eravate',
      loro: 'erano',
    },
    condizionale: {
      io: 'sarei',
      tu: 'saresti',
      luiLei: 'sarebbe',
      noi: 'saremmo',
      voi: 'sareste',
      loro: 'sarebbero',
    },
    transformations: [
      {
        form: 'sono',
        tenseName: 'Presente (Identity now)',
        concept: 'Luca declaring who he is',
        quoteIt: 'Sono Luca, vengo da Pietralba e vivo a Roma.',
        quoteEn: 'I am Luca, I come from Pietralba and live in Rome.',
        chapterNumber: 1,
      },
      {
        form: 'ero',
        tenseName: 'Imperfetto (Background state)',
        concept: 'Reflecting on past uncertainty',
        quoteIt: 'All’inizio ero solo uno straniero in una grande città.',
        quoteEn: 'At the beginning I was just a stranger in a big city.',
        chapterNumber: 21,
      },
      {
        form: 'sono stato',
        tenseName: 'Passato Prossimo (Completed experience)',
        concept: 'Admitting the temptation of security',
        quoteIt: 'Sono stato profondamente tentato dall’offerta dell’hotel.',
        quoteEn: 'I was deeply tempted by the hotel offer.',
        chapterNumber: 48,
      },
      {
        form: 'sarebbe',
        tenseName: 'Condizionale (Hypothetical)',
        concept: 'Weighing alternative futures',
        quoteIt: 'Sarebbe una vita sicura, ma non la mia.',
        quoteEn: 'It would be a secure life, but not mine.',
        chapterNumber: 46,
      },
    ],
  },
  {
    lemmaId: 'capire',
    infinitive: 'capire',
    english: 'to understand',
    root: 'cap- / capisc-',
    regularGroup: 'ire',
    whyItChanges:
      '-ire verb with "-isc-" insertion in present singular (capisco, capisci, capisce). Highlights the moment an internal insight lands.',
    wordFamily: [
      {
        wordIt: 'il capito',
        wordEn: 'understood',
        kind: 'inflection',
        relationship: 'Past participle / realization marker',
        chapterNumber: 45,
      },
    ],
    presente: {
      io: 'capisco',
      tu: 'capisci',
      luiLei: 'capisce',
      noi: 'capiamo',
      voi: 'capite',
      loro: 'capiscono',
    },
    passatoProssimo: {
      io: 'ho capito',
      tu: 'hai capito',
      luiLei: 'ha capito',
      noi: 'abbiamo capito',
      voi: 'avete capito',
      loro: 'hanno capito',
    },
    imperfetto: {
      io: 'capivo',
      tu: 'capivi',
      luiLei: 'capiva',
      noi: 'capivamo',
      voi: 'capivate',
      loro: 'capivano',
    },
    condizionale: {
      io: 'capirei',
      tu: 'capiresti',
      luiLei: 'capirebbe',
      noi: 'capiremmo',
      voi: 'capireste',
      loro: 'capirebbero',
    },
    transformations: [
      {
        form: 'capisco',
        tenseName: 'Presente (Now)',
        concept: 'Immediate comprehension in dialogue',
        quoteIt: 'Capisco cosa intendi dire con sincerità.',
        quoteEn: 'I understand what you mean with sincerity.',
        chapterNumber: 27,
      },
      {
        form: 'capivo',
        tenseName: 'Imperfetto (Past background)',
        concept: 'Prior lack of full awareness',
        quoteIt: 'Non capivo ancora il valore dell’autonomia.',
        quoteEn: 'I did not understand the value of autonomy yet.',
        chapterNumber: 42,
      },
      {
        form: 'ho capito',
        tenseName: 'Passato Prossimo (The awakening)',
        concept: 'The turning point of realization',
        quoteIt: 'Ho capito che dovevo scegliere chi volevo diventare.',
        quoteEn: 'I understood that I had to choose who I wanted to become.',
        chapterNumber: 45,
      },
    ],
  },
  {
    lemmaId: 'scegliere',
    infinitive: 'scegliere',
    english: 'to choose',
    root: 'scelg- / scelt-',
    regularGroup: 'irregular',
    whyItChanges:
      'Irregular verb: the root alternates between scelg- (present), scegl- (imperfetto), and scelt- (past participle). The central theme of Luca’s story.',
    wordFamily: [
      {
        wordIt: 'la scelta',
        wordEn: 'choice',
        kind: 'derivation',
        relationship: 'Noun derivative (root scelt-)',
        chapterNumber: 55,
      },
      {
        wordIt: 'scelto',
        wordEn: 'chosen',
        kind: 'inflection',
        relationship: 'Participle / Adjective',
        chapterNumber: 55,
      },
    ],
    presente: {
      io: 'scelgo',
      tu: 'scegli',
      luiLei: 'sceglie',
      noi: 'scegliamo',
      voi: 'scegliete',
      loro: 'scelgono',
    },
    passatoProssimo: {
      io: 'ho scelto',
      tu: 'hai scelto',
      luiLei: 'ha scelto',
      noi: 'abbiamo scelto',
      voi: 'avete scelto',
      loro: 'hanno scelto',
    },
    imperfetto: {
      io: 'sceglievo',
      tu: 'sceglievi',
      luiLei: 'sceglieva',
      noi: 'sceglievamo',
      voi: 'sceglievate',
      loro: 'sceglievano',
    },
    condizionale: {
      io: 'sceglierei',
      tu: 'sceglieresti',
      luiLei: 'sceglierebbe',
      noi: 'sceglieremmo',
      voi: 'scegliereste',
      loro: 'sceglierebbero',
    },
    transformations: [
      {
        form: 'scelgo',
        tenseName: 'Presente (Active agency)',
        concept: 'Conscious declaration of purpose',
        quoteIt: 'Scelgo di restare a Roma e costruire il mio futuro.',
        quoteEn: 'I choose to stay in Rome and build my future.',
        chapterNumber: 45,
      },
      {
        form: 'sceglievo',
        tenseName: 'Imperfetto (Past drifting)',
        concept: 'When circumstances used to choose for him',
        quoteIt: 'Prima lasciavo che fossero gli altri a scegliere per me.',
        quoteEn: 'Before I used to let others choose for me.',
        chapterNumber: 45,
      },
      {
        form: 'ho scelto',
        tenseName: 'Passato Prossimo (Completed decision)',
        concept: 'Standing behind the chosen path',
        quoteIt: 'Ho scelto l’incertezza perché è la mia strada.',
        quoteEn: 'I chose uncertainty because it is my path.',
        chapterNumber: 55,
      },
    ],
  },
  {
    lemmaId: 'volere',
    infinitive: 'volere',
    english: 'to want',
    root: 'vol- / vuol- / vorr-',
    regularGroup: 'irregular',
    whyItChanges:
      'Modal verb: expresses desire in present (voglio), past intention (ho voluto), and polite nuance in conditional (vorrei).',
    wordFamily: [
      {
        wordIt: 'la volontà',
        wordEn: 'will / willpower',
        kind: 'derivation',
        relationship: 'Noun derivative (root vol-)',
      },
      {
        wordIt: 'voluto',
        wordEn: 'wanted / chosen intentionally',
        kind: 'inflection',
        relationship: 'Past participle',
        chapterNumber: 48,
      },
    ],
    presente: {
      io: 'voglio',
      tu: 'vuoi',
      luiLei: 'vuole',
      noi: 'vogliamo',
      voi: 'volete',
      loro: 'vogliono',
    },
    passatoProssimo: {
      io: 'ho voluto',
      tu: 'hai voluto',
      luiLei: 'ha voluto',
      noi: 'abbiamo voluto',
      voi: 'avete voluto',
      loro: 'hanno voluto',
    },
    imperfetto: {
      io: 'volevo',
      tu: 'volevi',
      luiLei: 'voleva',
      noi: 'volevamo',
      voi: 'volevate',
      loro: 'volevano',
    },
    condizionale: {
      io: 'vorrei',
      tu: 'vorresti',
      luiLei: 'vorrebbe',
      noi: 'vorremmo',
      voi: 'vorreste',
      loro: 'vorrebbero',
    },
    transformations: [
      {
        form: 'voglio',
        tenseName: 'Presente (Clear desire)',
        concept: 'Direct declaration of artisan intent',
        quoteIt: 'Voglio metterci le mani io in quello che creo.',
        quoteEn: 'I want to put my own hands into what I create.',
        chapterNumber: 47,
      },
      {
        form: 'volevo',
        tenseName: 'Imperfetto (Past vague wish)',
        concept: 'Initial passive hope',
        quoteIt: 'Volevo solo trovare un posto tranquillo per lavorare.',
        quoteEn: 'I only wanted to find a quiet place to work.',
        chapterNumber: 20,
      },
      {
        form: 'ho voluto',
        tenseName: 'Passato Prossimo (Deliberate act of will)',
        concept: 'Active, courageous choice',
        quoteIt: 'Ho voluto rischiare invece di vivere con il rimpianto.',
        quoteEn: 'I chose to risk instead of living with regret.',
        chapterNumber: 48,
      },
      {
        form: 'vorrei',
        tenseName: 'Condizionale (Polite desire)',
        concept: 'Polite gratitude and assertiveness',
        quoteIt: 'Vorrei ringraziarti, ma preferirei una strada autonoma.',
        quoteEn: 'I would like to thank you, but I would prefer an autonomous path.',
        chapterNumber: 46,
      },
    ],
  },
  {
    lemmaId: 'adattare',
    infinitive: 'adattare',
    english: 'to adapt / adjust to reality',
    root: 'adatt-',
    regularGroup: 'are',
    whyItChanges:
      'Regular -are verb reflecting Luca’s evolution: learning to adapt brew temperatures, workspace layouts, and expectations to organic material constraints.',
    wordFamily: [
      {
        wordIt: 'l’adattamento',
        wordEn: 'adaptation',
        kind: 'derivation',
        relationship: 'Noun derivative (root adatt-)',
      },
    ],
    presente: {
      io: 'adatto',
      tu: 'adatti',
      luiLei: 'adatta',
      noi: 'adattiamo',
      voi: 'adattate',
      loro: 'adattano',
    },
    passatoProssimo: {
      io: 'ho adattato',
      tu: 'hai adattato',
      luiLei: 'ha adattato',
      noi: 'abbiamo adattato',
      voi: 'avete adattato',
      loro: 'hanno adattato',
    },
    imperfetto: {
      io: 'adattavo',
      tu: 'adattavi',
      luiLei: 'adattava',
      noi: 'adattavamo',
      voi: 'adattavate',
      loro: 'adattavano',
    },
    transformations: [
      {
        form: 'adattiamo',
        tenseName: 'Presente (Collaborative adaptation)',
        concept: 'Adjusting parameters to raw materials with Marco',
        quoteIt: 'Allora proviamo ad adattare l’estrazione invece di scartare il lotto.',
        quoteEn: 'Then let’s try adapting the extraction instead of discarding the batch.',
        chapterNumber: 62,
      },
      {
        form: 'ha adattato',
        tenseName: 'Passato Prossimo (Completed adaptation)',
        concept: 'Overcoming material limits through craft',
        quoteIt: 'Luca ha adattato la temperatura dell’acqua per valorizzare il chicco.',
        quoteEn: 'Luca adapted the water temperature to bring out the bean’s value.',
        chapterNumber: 62,
      },
      {
        form: 'adattare',
        tenseName: 'Infinito (The philosophy)',
        concept: 'Craftsmanship as a dialogue with reality',
        quoteIt: 'L’abilità artigianale di adattarsi alla realtà quotidiana.',
        quoteEn: 'The artisanal skill of adapting to everyday reality.',
        chapterNumber: 62,
      },
    ],
  },
  {
    lemmaId: 'accogliere',
    infinitive: 'accogliere',
    english: 'to welcome / receive / embrace',
    root: 'accogli- / accolt-',
    regularGroup: 'irregular',
    whyItChanges:
      'Irregular past participle "accolto" and 1st person "accolgo". Embodies Spazio Monti’s philosophy of opening doors to the whole neighborhood without elitism.',
    wordFamily: [
      {
        wordIt: 'l’accoglienza',
        wordEn: 'hospitality / welcoming',
        kind: 'derivation',
        relationship: 'Noun of quality/action',
        chapterNumber: 66,
      },
      {
        wordIt: 'accogliente',
        wordEn: 'welcoming / cozy',
        kind: 'derivation',
        relationship: 'Adjective of character',
        chapterNumber: 66,
      },
    ],
    presente: {
      io: 'accolgo',
      tu: 'accogli',
      luiLei: 'accoglie',
      noi: 'accogliamo',
      voi: 'accogliete',
      loro: 'accolgono',
    },
    passatoProssimo: {
      io: 'ho accolto',
      tu: 'hai accolto',
      luiLei: 'ha accolto',
      noi: 'abbiamo accolto',
      voi: 'avete accolto',
      loro: 'hanno accolto',
    },
    imperfetto: {
      io: 'accoglievo',
      tu: 'accoglievi',
      luiLei: 'accoglieva',
      noi: 'accoglievamo',
      voi: 'accoglievate',
      loro: 'accoglievano',
    },
    transformations: [
      {
        form: 'accoglie',
        tenseName: 'Presente (Daily hospitality)',
        concept: 'Opening the shop doors to everyone in the rione without snobbery',
        quoteIt: 'Adesso sei un oste che accoglie gli amici a casa propria.',
        quoteEn: 'Now you are a host who welcomes friends into his own home.',
        chapterNumber: 66,
      },
      {
        form: 'ha accolto',
        tenseName: 'Passato Prossimo (Foundational moment)',
        concept: 'The workshop embracing the neighborhood during winter',
        quoteIt: 'Spazio Monti ha accolto residenti e artigiani con calore e rispetto.',
        quoteEn: 'Spazio Monti welcomed residents and artisans with warmth and respect.',
        chapterNumber: 67,
      },
      {
        form: 'accogliere',
        tenseName: 'Infinito (The capstone ethos)',
        concept: 'Artisan craft as generous human service',
        quoteIt: 'La scelta autentica di accogliere ogni persona con un sorriso sincero.',
        quoteEn: 'The authentic choice of welcoming every person with a sincere smile.',
        chapterNumber: 70,
      },
    ],
  },
] as const;

export function getVerbPattern(lemmaId: string): NotebookVerbPattern | null {
  return NOTEBOOK_VERB_PATTERNS.find((v) => v.lemmaId === lemmaId) ?? null;
}

