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
  {
    id: 'funziona-davvero',
    chapterStart: 56,
    chapterEnd: 60,
    titleIt: 'Funziona davvero?',
    titleEn: 'Does It Really Work?',
    tagline: 'Craft vs. operational reality',
    description:
      'The morning rush, financial overhead, unexpected machine breakdowns, and spatial negotiations force Luca to discover that artisan excellence only endures when adapted to real human and economic rhythms.',
    coreThemes: ['flusso', 'margine', 'resilienza', 'accordo', 'equilibrio'],
    signatureQuote: {
      textIt: 'Con pazienza, equilibrio, dialogo continuo e rispetto reciproco, la realtà poteva diventare la casa autentica del mestiere.',
      textEn: 'With patience, balance, ongoing dialogue, and mutual respect, reality could become the authentic home of the craft.',
      chapterNumber: 60,
      speaker: 'Luca',
    },
  },
  {
    id: 'chi-ce-intorno',
    chapterStart: 61,
    chapterEnd: 65,
    titleIt: "Chi c'è intorno a me?",
    titleEn: 'Who Is Around Me?',
    tagline: 'Respecting boundaries & discovering community',
    description:
      'Chiara’s focused study, Marco’s woodcraft parallel, a sudden autumn storm, and the open studio evening teach Luca that excellence is not total control over perfection, but a lasting bridge to authentic community.',
    coreThemes: ['priorità', 'vincolo', 'rifugio', 'umiltà', 'comunità'],
    signatureQuote: {
      textIt: 'Non hai semplicemente aperto un bar per vendere bevande ai passanti: hai creato un luogo in cui le persone desiderano rimanere, parlare e appartenere.',
      textEn: 'You didn’t simply open a bar to sell drinks to passersby: you created a place where people desire to stay, talk, and belong.',
      chapterNumber: 65,
      speaker: 'Claudia',
    },
  },
  {
    id: 'la-scelta-rinnovata',
    chapterStart: 66,
    chapterEnd: 70,
    titleIt: 'La scelta rinnovata',
    titleEn: 'The Choice Renewed',
    tagline: 'Integration, autonomy & the B1+ capstone',
    description:
      'Balancing neighborhood traditions with modern craft, surviving winter through collaborative workshops, rejecting corporate buyout in favor of human scale, and taking an annual ledger inventory bring Luca full circle as a master artisan and pillar of his Roman community.',
    coreThemes: ['tradizione', 'resilienza', 'autonomia', 'bilancio', 'sintesi'],
    signatureQuote: {
      textIt: 'La scelta autentica si rinnova ogni singola mattina all’alba: quando accendi la macchina, accogli il primo cliente con un sorriso sincero e decidi di non cedere al compromesso facile sulla qualità del lavoro.',
      textEn: 'The authentic choice is renewed every single morning at dawn: when you turn on the machine, welcome the first customer with a sincere smile, and decide never to yield to easy compromise on craft quality.',
      chapterNumber: 70,
      speaker: 'Luca',
    },
  },
] as const;

/** Selected narrative-significant vocabulary with story annotations */
export const NARRATIVE_VOCABULARY: readonly NarrativeWordAnnotation[] = [
  {
    lemmaId: 'tradizione',
    whyItMatters:
      'Signor Sergio’s blunt morning feedback teaches Luca that authentic craft in an ancient Roman rione means respecting established neighborhood traditions rather than imposing modern trends with arrogance.',
    storyAnchor: {
      chapterNumber: 66,
      quoteIt: 'Integrarsi a Roma non significava perdere la propria identità, ma costruire un ponte paziente tra la tradizione del passato e la bellezza del presente.',
      quoteEn: 'Integrating in Rome did not mean losing one’s identity, but building a patient bridge between past tradition and present beauty.',
    },
  },
  {
    lemmaId: 'bilancio',
    whyItMatters:
      'The 12-month ledger inventory allows Luca to see that early panic and breakdowns were essential stepping stones toward sustainable mastery and inner calm.',
    storyAnchor: {
      chapterNumber: 69,
      quoteIt: 'Il bilancio di un anno non era una semplice verifica contabile, ma la consacrazione di una trasformazione interiore irreversibile.',
      quoteEn: 'The year-end review was not a simple accounting check, but the coronation of an irreversible inner transformation.',
    },
  },
  {
    lemmaId: 'resilienza',
    whyItMatters:
      'Winter foot-traffic drops force the workshop to invent collaborative weekend classes, proving that economic resilience is born from human connection and adaptable value.',
    storyAnchor: {
      chapterNumber: 67,
      quoteIt: 'La resilienza economica di un’attività artigianale nasceva dalla capacità di creare valore autentico e relazioni umane durature.',
      quoteEn: 'The economic resilience of an artisan business was born from the ability to create authentic value and lasting human relationships.',
    },
  },
  {
    lemmaId: 'comunita',
    whyItMatters:
      'Luca steps outside Spazio Monti during the open studio evening and realizes he is no longer an isolated apprentice trying to prove his individual worth, but part of a living community.',
    storyAnchor: {
      chapterNumber: 65,
      quoteIt: 'Guardando la luce calda che illuminava l’antico lastricato di Roma, comprese finalmente che il suo mestiere era un ponte prezioso per appartenere a una vera comunità umana.',
      quoteEn: 'Looking at the warm light illuminating Rome’s ancient cobblestones, he finally understood that his craft was a precious bridge to belong to a true human community.',
    },
  },
  {
    lemmaId: 'vincolo',
    whyItMatters:
      'Marco’s woodcraft parallel teaches Luca that material constraints like humidity are not defects to fight with arrogance, but an artisanal dialogue that brings out authentic sweetness.',
    storyAnchor: {
      chapterNumber: 62,
      quoteIt: 'Il mestiere consiste nell’ascoltare il limite della materia e trovare il modo giusto per valorizzarla così com’è.',
      quoteEn: 'The craft consists in listening to the material’s limits and finding the right way to value it just as it is.',
    },
  },
  {
    lemmaId: 'rifugio',
    whyItMatters:
      'When a violent thunderstorm hits Monti, Spazio Monti becomes a warm civic haven where strangers find shelter, dry towels, and hot spiced tea.',
    storyAnchor: {
      chapterNumber: 63,
      quoteIt: 'Era diventato un rifugio civico, un porto sicuro in cui la fragilità umana poteva trovare calore, ascolto e conforto.',
      quoteEn: 'It had become a civic haven, a safe harbor where human fragility could find warmth, listening, and comfort.',
    },
  },
  {
    lemmaId: 'accordo',
    whyItMatters:
      'Instead of working in isolation or defending rigid boundaries, Luca and Claudia forge an operational pact for the afternoon that turns empty space into a quiet haven.',
    storyAnchor: {
      chapterNumber: 60,
      quoteIt: 'Affinché la convivenza funzioni nel lungo periodo, è fondamentale che stabiliamo regole chiare di convivenza e di suddivisione dello spazio comune.',
      quoteEn: 'In order for cohabitation to work in the long run, it is fundamental that we establish clear rules of co-living and division of shared space.',
    },
  },
  {
    lemmaId: 'equilibrio',
    whyItMatters:
      'Movement 1 concludes with Luca realizing that craft mastery is not about stubborn control, but achieving balance between speed, hospitality, and economic sanity.',
    storyAnchor: {
      chapterNumber: 60,
      quoteIt: 'La prova tangibile che con pazienza, equilibrio, dialogo continuo e rispetto reciproco, la realtà poteva diventare la casa autentica del mestiere.',
      quoteEn: 'Tangible proof that with patience, balance, ongoing dialogue, and mutual respect, reality could become the authentic home of the craft.',
    },
  },
  {
    lemmaId: 'guasto',
    whyItMatters:
      'When the espresso machine blows a group seal before the morning rush, Luca learns that resilience is not avoiding breakdowns, but knowing how to resolve them calmly.',
    storyAnchor: {
      chapterNumber: 59,
      quoteIt: 'La vera maturità nel mestiere consisteva nella capacità di affrontare il guasto senza perdere la calma.',
      quoteEn: 'True maturity in the craft consisted in the capacity to face breakdowns without losing composure.',
    },
  },
  {
    lemmaId: 'consapevolezza',
    whyItMatters:
      'Bruno’s frank advice gives Luca the awareness to distinguish morning transit speed from afternoon hospitality, preventing burnout and business failure.',
    storyAnchor: {
      chapterNumber: 58,
      quoteIt: 'Non sei più un ragazzo che fa esperimenti in cucina: adesso sei il titolare di una bottega che deve vivere nel mondo reale.',
      quoteEn: 'You are no longer a kid running experiments in a kitchen: now you are the owner of a shop that must live in the real world.',
    },
  },
  {
    lemmaId: 'margine',
    whyItMatters:
      'Calculating the month-end balance sheet reveals to Luca that passion alone cannot pay bills: an artisan venture requires an economic margin to survive unexpected shocks.',
    storyAnchor: {
      chapterNumber: 57,
      quoteIt: 'Luca sentiva il margine utile assottigliarsi come un foglio sottile di carta velina.',
      quoteEn: 'Luca felt the operating margin thin down like a thin sheet of tissue paper.',
    },
  },
  {
    lemmaId: 'sostenibile',
    whyItMatters:
      'Claudia reminds Luca that choosing independence is only genuine when the craft learns how to sustain itself economically without compromising quality.',
    storyAnchor: {
      chapterNumber: 57,
      quoteIt: 'Un progetto indipendente diventa solido quando la qualità del mestiere impara a essere economicamente sostenibile nel tempo.',
      quoteEn: 'An independent project becomes solid when craft quality learns to be economically sustainable over time.',
    },
  },
  {
    lemmaId: 'flusso',
    whyItMatters:
      'The steady flow of morning commuters on Via dei Serpenti teaches Luca that a counter must work in harmony with the neighborhood’s real schedule.',
    storyAnchor: {
      chapterNumber: 56,
      quoteIt: 'Governare il flusso delle persone e costruire un ritmo capace di reggere l’urto della realtà.',
      quoteEn: 'Governing the flow of people and building a rhythm capable of withstanding reality.',
    },
  },
  {
    lemmaId: 'efficienza',
    whyItMatters:
      'Luca learns that efficiency is not panic or rushed speed, but the deliberate elimination of wasted motions to protect the soul of the craft.',
    storyAnchor: {
      chapterNumber: 56,
      quoteIt: 'L’efficienza non significava lavorare con fretta e affanno; significava eliminare i gesti inutili.',
      quoteEn: 'Efficiency did not mean working with haste and panic; it meant eliminating useless motions.',
    },
  },
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
