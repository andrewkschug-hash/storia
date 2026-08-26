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

export type NotebookVerbPattern = {
  lemmaId: string;
  infinitive: string;
  english: string;
  root: string;
  regularGroup: 'are' | 'ere' | 'ire' | 'irregular';
  whyItChanges: string;
  presente: VerbTenseConjugation;
  passatoProssimo: VerbTenseConjugation;
  imperfetto: VerbTenseConjugation;
  condizionale?: VerbTenseConjugation;
  transformations: VerbTransformation[];
};

export const NOTEBOOK_VERB_PATTERNS: readonly NotebookVerbPattern[] = [
  {
    lemmaId: 'parlare',
    infinitive: 'parlare',
    english: 'to speak',
    root: 'parl-',
    regularGroup: 'are',
    whyItChanges:
      'Regular -are verb: the root "parl-" stays stable, while endings indicate person (-o, -i, -a...) and tense (-avo, -avi...).',
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
] as const;

export function getVerbPattern(lemmaId: string): NotebookVerbPattern | null {
  return NOTEBOOK_VERB_PATTERNS.find((v) => v.lemmaId === lemmaId) ?? null;
}
