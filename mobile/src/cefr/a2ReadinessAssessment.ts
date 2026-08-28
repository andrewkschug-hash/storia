/**
 * A2 → B1 Readiness Check ("Una nuova pagina")
 *
 * Content definition for the transfer-based readiness assessment at the A2/B1 boundary.
 *
 * Pedagogical invariant: Story familiarity ≠ transfer ability.
 * The unseen passage features an independent setting and characters (Marta in Florence)
 * to assess whether the learner can independently comprehend connected Italian prose,
 * distinguish past aspect, resolve pronouns, interpret connectors, and produce language.
 */

export type A2ReadinessDomain =
  | 'reading'
  | 'grammar'
  | 'inference'
  | 'production';

export type A2ReadinessChoiceQuestion = {
  id: string;
  domain: 'reading' | 'grammar' | 'inference';
  skill: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type A2ReadinessProductionQuestion = {
  id: string;
  domain: 'production';
  skill: string;
  prompt: string;
  hint: string;
  example: string;
  requiredConnector: string;
  expectedPatternDescription: string;
  explanation: string;
};

export type A2ReadinessQuestion =
  | A2ReadinessChoiceQuestion
  | A2ReadinessProductionQuestion;

export type A2ReadinessAssessmentData = {
  id: string;
  title: string;
  subtitle: string;
  introText: string;
  passage: {
    title: string;
    location: string;
    text: string;
    wordCount: number;
  };
  domainLabels: Record<A2ReadinessDomain, string>;
  domainFloors: Record<A2ReadinessDomain, number>;
  questions: A2ReadinessQuestion[];
};

export const A2_B1_READINESS_ASSESSMENT: A2ReadinessAssessmentData = {
  id: 'a2-b1-readiness-unseen-01',
  title: 'Una nuova pagina',
  subtitle: 'A2 → B1 Readiness Check',
  introText:
    'Hai camminato con Luca fino a qui. Ora prova a leggere una storia nuova, senza conoscere i personaggi.',
  passage: {
    title: 'La bottega di Firenze',
    location: 'Firenze · Martedì mattina',
    text:
      'Martedì mattina Marta è arrivata presto alla bottega di Firenze.\n\n' +
      'Fuori pioveva e le strade erano silenziose. Il maestro non era ancora arrivato, ma la porta era già aperta.\n\n' +
      'Marta è entrata e ha visto un vecchio libro sul tavolo di legno. La copertina era rovinata e alcune pagine erano staccate. Marta voleva riparare il libro da sola, ma ha capito che era troppo fragile.\n\n' +
      'Quando il maestro è arrivato, lei gli ha mostrato il problema con calma. Il maestro ha sorriso e le ha detto: «Hai fatto bene ad aspettare. Preferisco spiegarti la tecnica invece di rischiare di rovinare la carta antica.»\n\n' +
      'Marta si è sentita tranquilla perché ha capito il valore della pazienza.',
    wordCount: 125,
  },
  domainLabels: {
    reading: 'Comprensione del testo',
    grammar: 'Grammatica e tempi verbali',
    inference: 'Significato e collegamenti',
    production: 'Produzione scritta',
  },
  domainFloors: {
    reading: 2 / 3, // min 2 out of 3
    grammar: 2 / 3, // min 2 out of 3
    inference: 1 / 2, // min 1 out of 2
    production: 1.0 / 2.0, // min 1.0 out of 2.0
  },
  questions: [
    // -------------------------------------------------------------------------
    // DOMAIN 1: READING COMPREHENSION (Q1–Q3)
    // -------------------------------------------------------------------------
    {
      id: 'a2-readiness-q1',
      domain: 'reading',
      skill: 'Main Idea & Core Theme',
      prompt: 'Qual è il tema principale di questo brano?',
      choices: [
        'Marta affronta con prudenza e pazienza il lavoro su un libro fragile.',
        'Il maestro è arrabbiato perché Marta ha danneggiato la bottega.',
        'Marta decide di non lavorare più a Firenze a causa della pioggia.',
      ],
      correctIndex: 0,
      explanation:
        'Il brano descrive come Marta sceglie di aspettare il maestro per imparare la tecnica giusta invece di rischiare di rovinare il libro antico.',
    },
    {
      id: 'a2-readiness-q2',
      domain: 'reading',
      skill: 'Factual Details in Context',
      prompt: 'Com’era la situazione quando Marta è entrata nella bottega?',
      choices: [
        'Fuori pioveva, la bottega era silenziosa e la copertina del libro era rovinata.',
        'C’erano molti clienti che aspettavano davanti alla porta chiusa.',
        'Il maestro stava già lavorando al tavolo di legno da alcune ore.',
      ],
      correctIndex: 0,
      explanation:
        'Il testo descrive la pioggia, il silenzio mattutino e lo stato rovinato della copertina del libro prima dell’arrivo del maestro.',
    },
    {
      id: 'a2-readiness-q3',
      domain: 'reading',
      skill: 'Chronological Sequence & Temporal Markers',
      prompt: 'Che cosa ha fatto Marta quando il maestro è arrivato?',
      choices: [
        'Gli ha mostrato il problema con calma prima di toccare le pagine.',
        'Ha nascosto il libro perché aveva paura di essere rimproverata.',
        'Ha incollato tutte le pagine staccate da sola in fretta.',
      ],
      correctIndex: 0,
      explanation:
        'Nel testo si legge chiaramente: "Quando il maestro è arrivato, lei gli ha mostrato il problema con calma."',
    },

    // -------------------------------------------------------------------------
    // DOMAIN 2: GRAMMAR & ASPECT IN CONTEXT (Q4–Q6)
    // -------------------------------------------------------------------------
    {
      id: 'a2-readiness-q4',
      domain: 'grammar',
      skill: 'Imperfetto vs Passato Prossimo (Background vs Event)',
      prompt: 'Nella frase "Fuori pioveva e le strade erano silenziose", perché si usa l’imperfetto?',
      choices: [
        'Perché descrive la situazione di sfondo e l’atmosfera del momento.',
        'Perché indica un’azione rapida e conclusa in un singolo istante.',
        'Perché esprime un’azione che deve ancora accadere nel futuro.',
      ],
      correctIndex: 0,
      explanation:
        'L’imperfetto (pioveva, erano) descrive il contesto e lo stato di sfondo, a differenza del passato prossimo che segnala gli eventi puntuali.',
    },
    {
      id: 'a2-readiness-q5',
      domain: 'grammar',
      skill: 'Indirect Pronouns (gli vs le Reference)',
      prompt: 'Nella frase "Il maestro ha sorriso e le ha detto...", a chi si riferisce il pronome "le"?',
      choices: [
        'A Marta (significa "ha detto a lei").',
        'Alle pagine staccate del libro.',
        'Al maestro stesso che parla da solo.',
      ],
      correctIndex: 0,
      explanation:
        'Il pronome indiretto "le" significa "a lei" (a Marta) e indica chi riceve le parole dette dal maestro.',
    },
    {
      id: 'a2-readiness-q6',
      domain: 'grammar',
      skill: 'Subject Tracking Across Compound Clauses',
      prompt: 'Nella frase "Marta voleva riparare il libro, ma ha capito...", chi compie l’azione di "ha capito"?',
      choices: [
        'Marta (il soggetto è lo stesso della prima parte della frase).',
        'Il libro di legno.',
        'Il maestro di Firenze.',
      ],
      correctIndex: 0,
      explanation:
        'In italiano il pronome soggetto viene omesso perché la desinenza verbale e il contesto collegano l’azione direttamente a Marta.',
    },

    // -------------------------------------------------------------------------
    // DOMAIN 3: MEANING, INFERENCE & CONNECTORS (Q7–Q8)
    // -------------------------------------------------------------------------
    {
      id: 'a2-readiness-q7',
      domain: 'inference',
      skill: 'Intention, Values & Character Reasoning',
      prompt: 'Perché il maestro dice «Hai fatto bene ad aspettare»?',
      choices: [
        'Perché preferisce insegnare con cura invece di rischiare di rovinare la carta.',
        'Perché non voleva che Marta entrasse nella bottega prima dell’orario.',
        'Perché quel libro non aveva alcun valore per il laboratorio.',
      ],
      correctIndex: 0,
      explanation:
        'Il maestro apprezza la prudenza di Marta e spiega che è meglio dedicare tempo all’apprendimento piuttosto che agire con fretta dannosa.',
    },
    {
      id: 'a2-readiness-q8',
      domain: 'inference',
      skill: 'Connector Interpretation (invece di)',
      prompt: 'Che cosa esprime l’espressione "invece di rischiare" nelle parole del maestro?',
      choices: [
        'Una scelta consapevole preferita rispetto a un’alternativa negativa.',
        'Il momento esatto in cui la pioggia ha smesso di cadere.',
        'La ragione per cui la bottega aveva la porta già aperta.',
      ],
      correctIndex: 0,
      explanation:
        '"Invece di" introduce l’azione che si sceglie di evitare a favore dell’opzione preferita e costruttiva.',
    },

    // -------------------------------------------------------------------------
    // DOMAIN 4: PRODUCTION & SYNTHESIS (Q9–Q10)
    // -------------------------------------------------------------------------
    {
      id: 'a2-readiness-q9',
      domain: 'production',
      skill: 'Past Action with Reason (perché)',
      prompt:
        'Racconta una cosa che hai fatto nel passato spiegando il motivo con la parola "perché".',
      hint: 'Usa il passato prossimo o l’imperfetto e collega le due parti con perché.',
      example: 'Ieri ho riposato perché ero molto stanco.',
      requiredConnector: 'perché',
      expectedPatternDescription:
        'Past event (passato prossimo/imperfetto) + perché + clause explaining reason',
      explanation:
        'La frase deve descrivere un’azione passata e indicare il motivo usando il connettore "perché".',
    },
    {
      id: 'a2-readiness-q10',
      domain: 'production',
      skill: 'Preference with Alternative (invece di)',
      prompt:
        'Esprimi una preferenza per il tuo tempo libero o studio usando "invece di".',
      hint: 'Usa preferisco / vorrei seguito da un’attività e da invece di + alternativa.',
      example: 'Preferisco leggere un libro invece di guardare la televisione.',
      requiredConnector: 'invece di',
      expectedPatternDescription:
        'Preference verb (preferisco / vorrei / mi piace) + invece di + alternative activity/noun',
      explanation:
        'La frase deve esprimere una preferenza chiara collegata a un’alternativa tramite "invece di".',
    },
  ],
};
