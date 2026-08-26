/**
 * Story-connected editorial metadata for "Il mio quaderno".
 *
 * This file contains curated narrative metadata referencing canonical content.
 * It does NOT duplicate lexicon definitions, translations, or learner state.
 */

export type NotebookMoment = {
  id: string;
  chapterStart: number;
  chapterEnd: number;
  titleIt: string;
  titleEn: string;
  tagline: string;
  description: string;
  coreThemes: string[];
  signatureQuote: {
    textIt: string;
    textEn: string;
    chapterNumber: number;
    speaker: string;
  };
};

export type NarrativeWordAnnotation = {
  lemmaId: string;
  whyItMatters: string;
  storyAnchor: {
    chapterNumber: number;
    quoteIt: string;
    quoteEn: string;
  };
};

export type NotebookPhrase = {
  id: string;
  textIt: string;
  textEn: string;
  speaker: string;
  chapterNumber: number;
  whyMemorable: string;
};

export type NotebookGrammarInsight = {
  id: string;
  titleIt: string;
  formula: string;
  exampleIt: string;
  exampleEn: string;
  explanation: string;
  chapterRange: {
    start: number;
    end: number;
  };
  sampleChapterNumber: number;
};

/** The 5 narrative acts of Luca a Roma */
export const NOTEBOOK_MOMENTS: readonly NotebookMoment[] = [
  {
    id: 'arrivo',
    chapterStart: 1,
    chapterEnd: 20,
    titleIt: 'Arrivo',
    titleEn: 'Arrival',
    tagline: 'Learning to survive in Rome',
    description:
      'Luca arrives from Pietralba with uncertain Italian and starts working at Bruno’s café, learning to navigate the city, its morning rhythms, and its language one cup at a time.',
    coreThemes: ['casa', 'lavoro', 'quartiere', 'amici'],
    signatureQuote: {
      textIt: 'Un caffè al giorno, una parola alla volta.',
      textEn: 'One coffee a day, one word at a time.',
      chapterNumber: 5,
      speaker: 'Luca',
    },
  },
  {
    id: 'appartenenza',
    chapterStart: 21,
    chapterEnd: 24,
    titleIt: 'Appartenenza',
    titleEn: 'Belonging',
    tagline: 'Finding people who feel like home',
    description:
      'Rome begins to feel less like an overwhelming foreign city and more like a community where relationships take root through daily conversations and shared meals.',
    coreThemes: ['fiducia', 'abitudine', 'famiglia', 'presenza'],
    signatureQuote: {
      textIt: 'Questa città non fa sconti a nessuno, ma se impari ad ascoltarla ti tiene compagnia.',
      textEn: 'This city gives discounts to no one, but if you learn to listen, it keeps you company.',
      chapterNumber: 24,
      speaker: 'Sofia',
    },
  },
  {
    id: 'responsabilita',
    chapterStart: 25,
    chapterEnd: 40,
    titleIt: 'Responsabilità',
    titleEn: 'Responsibility',
    tagline: 'The café crisis & past narration',
    description:
      'Bruno’s café faces financial strain. Luca steps up from a passive worker into an active participant, taking responsibility for daily challenges and realizing he wants to stay.',
    coreThemes: ['mestiere', 'impegno', 'collaborazione', 'risoluzione'],
    signatureQuote: {
      textIt: 'Per adesso questa è casa.',
      textEn: 'For now, this is home.',
      chapterNumber: 40,
      speaker: 'Luca',
    },
  },
  {
    id: 'due-vite',
    chapterStart: 41,
    chapterEnd: 49,
    titleIt: 'Due vite possibili',
    titleEn: 'Two Possible Lives',
    tagline: 'Security vs. Autonomy',
    description:
      'The café’s sale forces Luca to confront two genuine futures: the corporate security and predictability of the Grand Hotel versus the artisanal craft and autonomy of Marco’s workshop.',
    coreThemes: ['sicurezza', 'autonomia', 'rischio', 'artigianale'],
    signatureQuote: {
      textIt: 'Quando una cosa viene bene, so che ci ho messo io le mani.',
      textEn: 'When something turns out well, I know I put my own hands into it.',
      chapterNumber: 47,
      speaker: 'Marco',
    },
  },
  {
    id: 'la-scelta',
    chapterStart: 50,
    chapterEnd: 55,
    titleIt: 'La scelta',
    titleEn: 'The Choice',
    tagline: 'Building something of his own',
    description:
      'Luca negotiates the partnership at Spazio Monti, unites local micro-roasters, receives Bruno’s brass tamper, and steps behind his own counter on a quiet rainy Monday.',
    coreThemes: ['scelta', 'fondamento', 'negoziazione', 'futuro'],
    signatureQuote: {
      textIt: 'Adesso tocca a te.',
      textEn: 'Now it is your turn.',
      chapterNumber: 54,
      speaker: 'Bruno',
    },
  },
] as const;

/** Selected narrative-significant vocabulary with story annotations */
export const NARRATIVE_VOCABULARY: readonly NarrativeWordAnnotation[] = [
  {
    lemmaId: 'contratto',
    whyItMatters:
      'Giulia presents Luca with a permanent contract at the Grand Hotel, forcing him to choose between corporate certainty and independent craft.',
    storyAnchor: {
      chapterNumber: 46,
      quoteIt: 'Un contratto a tempo indeterminato con uno stipendio doppio.',
      quoteEn: 'A permanent contract with double the salary.',
    },
  },
  {
    lemmaId: 'fiducia',
    whyItMatters:
      'Trust between Bruno, Sofia, Marco, and Claudia forms the human foundation that makes Luca’s independent project viable in Rome.',
    storyAnchor: {
      chapterNumber: 53,
      quoteIt: 'La fiducia costruita in anni di lavoro condiviso.',
      quoteEn: 'The trust built over years of shared work.',
    },
  },
  {
    lemmaId: 'pressino',
    whyItMatters:
      'Bruno’s worn brass tamper becomes the physical symbol of forty years of craft handed down to the next generation.',
    storyAnchor: {
      chapterNumber: 54,
      quoteIt: 'Bruno ha posato il suo vecchio pressino d’ottone sul banco.',
      quoteEn: 'Bruno placed his old brass tamper on the counter.',
    },
  },
  {
    lemmaId: 'artigianale',
    whyItMatters:
      'Marco’s workshop and the Ostiense micro-roasters teach Luca that artisanal quality comes from personal authorship.',
    storyAnchor: {
      chapterNumber: 47,
      quoteIt: 'Il lavoro artigianale richiede fatica ma restituisce dignità.',
      quoteEn: 'Artisanal work requires effort but gives back dignity.',
    },
  },
  {
    lemmaId: 'scelta',
    whyItMatters:
      'The turning point of Luca’s journey: moving from passive reaction to deliberate, authored agency on the Gianicolo.',
    storyAnchor: {
      chapterNumber: 45,
      quoteIt: 'Voleva essere lui a scegliere la direzione della propria vita.',
      quoteEn: 'He wanted to be the one to choose the direction of his own life.',
    },
  },
  {
    lemmaId: 'sicurezza',
    whyItMatters:
      'The tempting guarantee of a predictable salary and status, weighed against the desire to author his own future.',
    storyAnchor: {
      chapterNumber: 46,
      quoteIt: 'La sicurezza economica era una promessa rassicurante.',
      quoteEn: 'Economic security was a reassuring promise.',
    },
  },
  {
    lemmaId: 'autonomia',
    whyItMatters:
      'The freedom and responsibility of shaping one’s work with one’s own hands from start to finish.',
    storyAnchor: {
      chapterNumber: 47,
      quoteIt: 'L’autonomia ha un prezzo, ma è l’unico modo per sentirsi vivi.',
      quoteEn: 'Autonomy has a price, but it is the only way to feel alive.',
    },
  },
  {
    lemmaId: 'mestiere',
    whyItMatters:
      'Bruno’s lifelong trade, passed along not through lectures but through daily disciplined ritual behind the machine.',
    storyAnchor: {
      chapterNumber: 54,
      quoteIt: 'Il mestiere non si spiega con i discorsi: si trasmette con i gesti.',
      quoteEn: 'The trade is not explained with speeches: it is passed down through gestures.',
    },
  },
  {
    lemmaId: 'incertezza',
    whyItMatters:
      'No longer a terrifying threat happening to Luca, but the natural uncertainty belonging to a life he has consciously chosen.',
    storyAnchor: {
      chapterNumber: 55,
      quoteIt: 'Un’incertezza scelta con consapevolezza e coraggio.',
      quoteEn: 'An uncertainty chosen with awareness and courage.',
    },
  },
  {
    lemmaId: 'fondamento',
    whyItMatters:
      'Pietralba and Bruno’s café are not prisons to escape, but the solid foundation upon which Luca builds his future.',
    storyAnchor: {
      chapterNumber: 48,
      quoteIt: 'Pietralba è il terreno solido sotto i miei piedi.',
      quoteEn: 'Pietralba is the solid ground beneath my feet.',
    },
  },
  {
    lemmaId: 'vendere',
    whyItMatters:
      'The sudden announcement that shatters Luca’s comfortable routine and forces him to decide who he wants to become.',
    storyAnchor: {
      chapterNumber: 41,
      quoteIt: 'Bruno ha deciso di vendere il locale alla fine dell’anno.',
      quoteEn: 'Bruno decided to sell the place at the end of the year.',
    },
  },
  {
    lemmaId: 'macinare',
    whyItMatters:
      'The tactile art of adjusting bean grind and extraction pressure that transforms coffee making into a conscious craft.',
    storyAnchor: {
      chapterNumber: 49,
      quoteIt: 'Ha regolato la macinatura finché la crema non è uscita densa.',
      quoteEn: 'He adjusted the grind until the crema poured out dense.',
    },
  },
  {
    lemmaId: 'rischio',
    whyItMatters:
      'Luca explains to his parents that choosing security out of fear would be a compromise; he prefers to face risk in order to build something authentic.',
    storyAnchor: {
      chapterNumber: 48,
      quoteIt: 'Preferisco affrontare il rischio dell’incertezza invece di una sicurezza passiva.',
      quoteEn: 'I prefer to face the risk of uncertainty instead of a passive security.',
    },
  },
  {
    lemmaId: 'alleanza',
    whyItMatters:
      'Luca discovers that true independence is not isolation; it is built on creative collaboration with peers.',
    storyAnchor: {
      chapterNumber: 53,
      quoteIt: 'Un’alleanza tra artigiani che condividono la stessa passione.',
      quoteEn: 'An alliance among artisans who share the same passion.',
    },
  },
  {
    lemmaId: 'suburra',
    whyItMatters:
      'The historic Roman neighborhood in Monti where Luca opens his independent coffee counter at Spazio Monti.',
    storyAnchor: {
      chapterNumber: 55,
      quoteIt: 'I vicoli della Suburra si svegliavano sotto la pioggia leggera.',
      quoteEn: 'The alleys of the Suburra were waking up under the light rain.',
    },
  },
] as const;

/** Memorable story phrases and dialogues */
export const NOTEBOOK_PHRASES: readonly NotebookPhrase[] = [
  {
    id: 'phrase-ch05',
    textIt: 'Un caffè al giorno, una parola alla volta.',
    textEn: 'One coffee a day, one word at a time.',
    speaker: 'Luca',
    chapterNumber: 5,
    whyMemorable: 'Luca’s early humble motto as he begins learning Italian and working in Rome.',
  },
  {
    id: 'phrase-ch24',
    textIt: 'Questa città non fa sconti a nessuno, ma se impari ad ascoltarla ti tiene compagnia.',
    textEn: 'This city gives discounts to no one, but if you learn to listen, it keeps you company.',
    speaker: 'Sofia',
    chapterNumber: 24,
    whyMemorable: 'Sofia welcoming Luca into the real texture of Roman life.',
  },
  {
    id: 'phrase-ch40',
    textIt: 'Per adesso questa è casa.',
    textEn: 'For now, this is home.',
    speaker: 'Luca',
    chapterNumber: 40,
    whyMemorable: 'Luca’s realization at the end of Act 3 that his roots in Rome have taken hold.',
  },
  {
    id: 'phrase-ch45',
    textIt: 'Voglio essere la persona che sceglie consapevolmente.',
    textEn: 'I want to be the person who consciously chooses.',
    speaker: 'Luca',
    chapterNumber: 45,
    whyMemorable: 'The turning point on the Gianicolo where Luca sheds passivity.',
  },
  {
    id: 'phrase-ch47',
    textIt: 'Quando una cosa viene bene, so che ci ho messo io le mani.',
    textEn: 'When something turns out well, I know I put my own hands into it.',
    speaker: 'Marco',
    chapterNumber: 47,
    whyMemorable: 'The artisan definition of authorship that inspires Luca’s coffee venture.',
  },
  {
    id: 'phrase-ch48',
    textIt: 'Pietralba non è una prigione: è il terreno solido sotto i miei piedi.',
    textEn: 'Pietralba is not a prison: it is the solid ground beneath my feet.',
    speaker: 'Luca',
    chapterNumber: 48,
    whyMemorable: 'Luca explaining to his parents that staying in Rome honors his roots.',
  },
  {
    id: 'phrase-ch52',
    textIt: 'Non cerco una purezza astratta, ma devo capire se posso costruire un’identità autentica.',
    textEn: 'I am not seeking abstract purity, but I must understand if I can build an authentic identity.',
    speaker: 'Luca',
    chapterNumber: 52,
    whyMemorable: 'Facing commercial pressure without compromising personal values.',
  },
  {
    id: 'phrase-ch54',
    textIt: 'Adesso tocca a te.',
    textEn: 'Now it is your turn.',
    speaker: 'Bruno',
    chapterNumber: 54,
    whyMemorable: 'Bruno passing his brass tamper and lifelong craft to Luca.',
  },
  {
    id: 'phrase-ch55',
    textIt: 'Buongiorno a lei, benvenuto allo Spazio Monti. Le preparo subito un espresso.',
    textEn: 'Good morning to you, welcome to Spazio Monti. I will prepare an espresso for you right away.',
    speaker: 'Luca',
    chapterNumber: 55,
    whyMemorable: 'The opening line of Luca’s new life behind his own counter.',
  },
] as const;

/** Concise "Una cosa che ho capito" story insights */
export const NOTEBOOK_GRAMMAR_INSIGHTS: readonly NotebookGrammarInsight[] = [
  {
    id: 'insight-imperfetto-passato',
    titleIt: 'Dal pensiero all’azione',
    formula: 'Imperfetto (background/abitudine) → Passato Prossimo (svolta)',
    exampleIt: 'Pensavo che la routine sarebbe durata sempre, ma ho capito che dovevo scegliere.',
    exampleEn: 'I thought the routine would last forever, but I understood I had to choose.',
    explanation:
      'Imperfetto describes how Luca used to see things passively; passato prossimo captures the moment of realization.',
    chapterRange: { start: 41, end: 45 },
    sampleChapterNumber: 45,
  },
  {
    id: 'insight-condizionale-scelta',
    titleIt: 'Valutare e preferire con garbo',
    formula: 'Condizionale presente (vorrei / preferirei) + invece di',
    exampleIt: 'Vorrei ringraziarti per la proposta, ma preferirei costruire un percorso indipendente.',
    exampleEn: 'I would like to thank you for the offer, but I would prefer to build an independent path.',
    explanation:
      'The conditional allows Luca to evaluate Giulia’s hotel contract with genuine gratitude while asserting his autonomy.',
    chapterRange: { start: 46, end: 50 },
    sampleChapterNumber: 48,
  },
  {
    id: 'insight-preposizioni-cui',
    titleIt: 'Collegare le ragioni profonde',
    formula: 'Preposizione + cui (il progetto per cui / il luogo in cui)',
    exampleIt: 'Questo è il progetto per cui ho investito tutto: il banco in cui servo ogni espresso con cura.',
    exampleEn: 'This is the project for which I invested everything: the counter at which I serve each espresso with care.',
    explanation:
      'Relative pronouns with cui connect physical locations and deep motivations to Luca’s daily craft at Spazio Monti.',
    chapterRange: { start: 51, end: 55 },
    sampleChapterNumber: 55,
  },
] as const;

/** Helper to find narrative annotation for a lemma if one exists */
export function getNarrativeAnnotation(lemmaId: string): NarrativeWordAnnotation | null {
  return NARRATIVE_VOCABULARY.find((item) => item.lemmaId === lemmaId) ?? null;
}

/** Helper to find the narrative moment for a chapter number */
export function getMomentForChapter(chapterNumber: number): NotebookMoment | null {
  return (
    NOTEBOOK_MOMENTS.find(
      (moment) => chapterNumber >= moment.chapterStart && chapterNumber <= moment.chapterEnd,
    ) ?? null
  );
}
