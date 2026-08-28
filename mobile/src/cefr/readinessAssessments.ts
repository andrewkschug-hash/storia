import type { CEFRLevel } from '@/src/cefr/levels';
import { getLevelGate } from '@/src/cefr/levelGates';
import { LUCA_STORY_ID } from '@/src/content/catalog';

export type ReadinessDomain = 'reading' | 'grammar' | 'inference' | 'production';

export type ReadinessChoiceQuestion = {
  id: string;
  domain: 'reading' | 'grammar' | 'inference';
  skill: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type ReadinessProductionQuestion = {
  id: string;
  domain: 'production';
  skill: string;
  prompt: string;
  hint: string;
  example: string;
  requiredConnector?: string;
  expectedPatternDescription: string;
  explanation: string;
};

export type ReadinessQuestion = ReadinessChoiceQuestion | ReadinessProductionQuestion;

export type ReadinessAssessmentData = {
  id: string;
  targetLevel: CEFRLevel;
  title: string;
  subtitle: string;
  introText: string;
  passage: {
    title: string;
    location: string;
    text: string;
    wordCount: number;
  };
  domainLabels: Record<ReadinessDomain, string>;
  domainFloors: Record<ReadinessDomain, number>;
  questions: ReadinessQuestion[];
};

export type LearnerAnswer = {
  questionId: string;
  choiceIndex?: number;
  text?: string;
};

export type DomainScoreResult = {
  domain: ReadinessDomain;
  label: string;
  earned: number;
  possible: number;
  percentage: number;
  metFloor: boolean;
  floorRequirementText: string;
};

export type ReadinessQuestionResult = {
  questionId: string;
  domain: ReadinessDomain;
  skill: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  explanation: string;
};

export type ReadinessOutcome = 'READY' | 'NOT_YET';

export type ReadinessEvaluation = {
  targetLevel: CEFRLevel;
  outcome: ReadinessOutcome;
  headline: string;
  subheadline: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  allFloorsMet: boolean;
  isReady: boolean;
  targetChapterNumber: number;
  targetChapterId: string;
  domains: Record<ReadinessDomain, DomainScoreResult>;
  questionResults: ReadinessQuestionResult[];
  reasons: string[];
  remediationAdvice: string;
};

// =============================================================================
// ASSESSMENTS CATALOG
// =============================================================================

export const A1_PLUS_READINESS_ASSESSMENT: ReadinessAssessmentData = {
  id: 'readiness-a1-plus',
  targetLevel: 'A1+',
  title: 'Il primo caffè a Trastevere',
  subtitle: 'A1+ Readiness',
  introText:
    'Read a short, independent story and answer a few questions to see if starting at A1+ is the right fit for you.',
  passage: {
    title: 'Il primo caffè a Trastevere',
    location: 'Roma · Quartiere Trastevere',
    text:
      'Marco arriva a Roma di mattina. Cammina per le strade strette di Trastevere e cerca un bar per fare colazione.\n\n' +
      'Trova un piccolo bar con i tavoli fuori. Il barista si chiama Gianni ed è molto gentile. Marco ordina un cappuccino e un cornetto alla crema.\n\n' +
      'Gianni chiede a Marco: «Sei qui per vacanza o per lavoro?»\n\n' +
      'Marco risponde con un sorriso: «Sono qui per studiare l’italiano e conoscere la città.»\n\n' +
      'Gianni sorride e dice: «Allora benvenuto a Roma! Qui la gente parla molto e impari in fretta.»',
    wordCount: 88,
  },
  domainLabels: {
    reading: 'Reading Comprehension',
    grammar: 'Grammar & Verbs',
    inference: 'Meaning & Context',
    production: 'Short Expression',
  },
  domainFloors: {
    reading: 2 / 3,
    grammar: 2 / 3,
    inference: 1 / 2,
    production: 0.5 / 1.0,
  },
  questions: [
    {
      id: 'a1p-q1',
      domain: 'reading',
      skill: 'Main Idea',
      prompt: 'Perché Marco è a Roma?',
      choices: [
        'Per studiare l’italiano e conoscere la città.',
        'Per aprire un nuovo bar a Trastevere.',
        'Per lavorare come barista insieme a Gianni.',
      ],
      correctIndex: 0,
      explanation: 'Marco dice chiaramente: «Sono qui per studiare l’italiano e conoscere la città.»',
    },
    {
      id: 'a1p-q2',
      domain: 'reading',
      skill: 'Factual Details',
      prompt: 'Che cosa ordina Marco al bar?',
      choices: [
        'Un cappuccino e un cornetto alla crema.',
        'Un espresso e una bottiglia d’acqua.',
        'Una pizza e un succo d’arancia.',
      ],
      correctIndex: 0,
      explanation: 'Nel testo si legge: «Marco ordina un cappuccino e un cornetto alla crema.»',
    },
    {
      id: 'a1p-q3',
      domain: 'reading',
      skill: 'Context & Character',
      prompt: 'Come descrive il barista Gianni?',
      choices: [
        'È una persona gentile e accogliente.',
        'È un uomo severo che non vuole parlare.',
        'È un turista che visita Roma per la prima volta.',
      ],
      correctIndex: 0,
      explanation: 'Il testo descrive Gianni come «molto gentile» e dà il benvenuto a Marco.',
    },
    {
      id: 'a1p-q4',
      domain: 'grammar',
      skill: 'Present Tense Verb Agreement',
      prompt: 'Nella frase "Marco ordina un cappuccino", quale forma useresti per "noi"?',
      choices: ['Noi ordiniamo', 'Noi ordinate', 'Noi ordinano'],
      correctIndex: 0,
      explanation: 'La prima persona plurale del verbo ordinare al presente è "ordiniamo".',
    },
    {
      id: 'a1p-q5',
      domain: 'grammar',
      skill: 'Verb Essere vs Avere',
      prompt: 'Quale frase è corretta per descrivere Marco?',
      choices: [
        'Marco è contento di essere a Roma.',
        'Marco ha contento di essere a Roma.',
        'Marco fa contento di essere a Roma.',
      ],
      correctIndex: 0,
      explanation: 'Per descrivere uno stato o sentimento con un aggettivo si usa il verbo essere («è contento»).',
    },
    {
      id: 'a1p-q6',
      domain: 'grammar',
      skill: 'Prepositions (a vs in)',
      prompt: 'Perché si dice "Marco arriva a Roma" ma "cammina in centro"?',
      choices: [
        'Si usa "a" con i nomi di città e "in" con alcune zone o luoghi.',
        'Si usa "a" solo di mattina e "in" di pomeriggio.',
        'Non c’è differenza, sono sempre intercambiabili.',
      ],
      correctIndex: 0,
      explanation: 'Con le città si usa la preposizione "a" (a Roma, a Milano, a Firenze).',
    },
    {
      id: 'a1p-q7',
      domain: 'inference',
      skill: 'Intent & Attitude',
      prompt: 'Perché Gianni dice: «Qui la gente parla molto e impari in fretta»?',
      choices: [
        'Per incoraggiare Marco e dirgli che a Roma farà molta pratica di conversazione.',
        'Per lamentarsi del troppo rumore nelle strade di Trastevere.',
        'Per consigliare a Marco di non parlare con gli sconosciuti.',
      ],
      correctIndex: 0,
      explanation: 'Gianni è amichevole e sottolinea che l’ambiente aperto di Roma aiuterà Marco a imparare.',
    },
    {
      id: 'a1p-q8',
      domain: 'inference',
      skill: 'Connector Interpretation (allora)',
      prompt: 'Che cosa indica la parola "Allora" nella risposta di Gianni?',
      choices: [
        'Introduce una conclusione logica basata su quello che Marco ha appena detto.',
        'Indica il momento esatto in cui il bar chiude.',
        'Segnala che Gianni non ha capito la risposta di Marco.',
      ],
      correctIndex: 0,
      explanation: '"Allora" collega la risposta di Marco («sono qui per studiare») con il benvenuto caloroso.',
    },
    {
      id: 'a1p-q9',
      domain: 'production',
      skill: 'Basic Introduction Sentence',
      prompt: 'Scrivi una breve frase per presentarti dicendo da dove vieni o dove abiti.',
      hint: 'Usa "Sono di..." oppure "Abito a..." seguito dal nome di una città.',
      example: 'Sono di New York e studio italiano.',
      expectedPatternDescription: 'Sono di [city] or Abito a [city] / Studio italiano',
      explanation: 'La frase deve contenere una presentazione semplice con verbo essere o abitare.',
    },
  ],
};

export const A2_READINESS_ASSESSMENT: ReadinessAssessmentData = {
  id: 'readiness-a2',
  targetLevel: 'A2',
  title: 'Una mattina a Testaccio',
  subtitle: 'A2 Readiness',
  introText:
    'Read this short story and answer questions to see if starting at Chapter 25 (A2) matches your current Italian level.',
  passage: {
    title: 'Una mattina al mercato',
    location: 'Roma · Quartiere Testaccio',
    text:
      'Sabato mattina Giulia è andata presto al mercato di Testaccio per comprare ingredienti freschi.\n\n' +
      'Ieri sera ha invitato alcuni amici a cena a casa sua, quindi oggi vuole preparare un piatto tipico romano. Ha comprato pomodori maturi, basilico fresco e un pezzo di pecorino.\n\n' +
      'Mentre sceglieva la verdura, ha incontrato Paolo, un vecchio compagno di università. Paolo le ha sorriso e ha detto: «Che sorpresa! Non ti vedevo da mesi. Come va il lavoro?»\n\n' +
      'Giulia gli ha raccontato le novità e lo ha invitato alla cena. Paolo ha accettato volentieri perché non aveva altri impegni per la serata.',
    wordCount: 104,
  },
  domainLabels: {
    reading: 'Reading Comprehension',
    grammar: 'Past Tenses & Pronouns',
    inference: 'Inference & Connectors',
    production: 'Connected Sentence',
  },
  domainFloors: {
    reading: 2 / 3,
    grammar: 2 / 3,
    inference: 1 / 2,
    production: 0.5 / 1.0,
  },
  questions: [
    {
      id: 'a2-q1',
      domain: 'reading',
      skill: 'Main Idea & Goal',
      prompt: 'Perché Giulia è andata al mercato di Testaccio?',
      choices: [
        'Per comprare ingredienti freschi per una cena con amici stasera.',
        'Per cercare lavoro come venditrice di frutta e verdura.',
        'Per incontrare Paolo che lavora in un banco del mercato.',
      ],
      correctIndex: 0,
      explanation: 'Il testo spiega che Giulia prepara una cena romana per gli amici invitati ieri sera.',
    },
    {
      id: 'a2-q2',
      domain: 'reading',
      skill: 'Timeline & Events',
      prompt: 'Quando ha invitato gli amici a cena?',
      choices: [
        'Ieri sera.',
        'Stamattina mentre era al mercato.',
        'Alcuni mesi fa all’università.',
      ],
      correctIndex: 0,
      explanation: 'Il testo dice: «Ieri sera ha invitato alcuni amici a cena a casa sua».',
    },
    {
      id: 'a2-q3',
      domain: 'reading',
      skill: 'Factual Details',
      prompt: 'Come ha reagito Paolo all’invito di Giulia?',
      choices: [
        'Ha accettato volentieri perché era libero.',
        'Ha rifiutato perché doveva lavorare fino a tardi.',
        'Ha detto che preferiva andare al ristorante da solo.',
      ],
      correctIndex: 0,
      explanation: 'Nel testo: «Paolo ha accettato volentieri perché non aveva altri impegni».',
    },
    {
      id: 'a2-q4',
      domain: 'grammar',
      skill: 'Passato Prossimo vs Imperfetto',
      prompt: 'Nella frase "Mentre sceglieva la verdura, ha incontrato Paolo", perché si usa "sceglieva"?',
      choices: [
        'Perché descrive un’azione in corso di svolgimento interrotta dall’incontro.',
        'Perché indica un’azione che non è mai avvenuta.',
        'Perché è un’azione futura programmata per la sera.',
      ],
      correctIndex: 0,
      explanation: 'L’imperfetto dopo "mentre" descrive l’azione di sfondo continuata nel passato.',
    },
    {
      id: 'a2-q5',
      domain: 'grammar',
      skill: 'Direct Object Pronouns',
      prompt: 'Nella frase "...e lo ha invitato alla cena", a chi si riferisce "lo"?',
      choices: ['A Paolo', 'Al pecorino romano', 'Al mercato di Testaccio'],
      correctIndex: 0,
      explanation: 'Il pronome diretto maschile singolare "lo" sostituisce Paolo.',
    },
    {
      id: 'a2-q6',
      domain: 'grammar',
      skill: 'Passato Prossimo with Auxiliary Essere',
      prompt: 'Perché si dice "Giulia è andata" con il verbo essere?',
      choices: [
        'Perché "andare" è un verbo di movimento e accorda il participio passato al femminile.',
        'Perché tutti i verbi al passato usano sempre essere.',
        'Perché il mercato è un luogo femminile.',
      ],
      correctIndex: 0,
      explanation: 'I verbi di movimento come andare usano l’ausiliare essere e accordano in genere e numero (Giulia è andata).',
    },
    {
      id: 'a2-q7',
      domain: 'inference',
      skill: 'Connector (quindi)',
      prompt: 'Che cosa esprime la parola "quindi" nella seconda frase?',
      choices: [
        'Una conseguenza logica dell’azione precedente.',
        'Il luogo dove si trova il mercato.',
        'Una contraddizione rispetto alla prima frase.',
      ],
      correctIndex: 0,
      explanation: '"Quindi" introduce la conseguenza: ha invitato amici ieri -> quindi oggi compra gli ingredienti.',
    },
    {
      id: 'a2-q8',
      domain: 'inference',
      skill: 'Social Relationship',
      prompt: 'Che tipo di rapporto c’è tra Giulia e Paolo?',
      choices: [
        'Erano compagni di università e si conoscono da tempo.',
        'Non si erano mai visti prima di sabato mattina.',
        'Lavorano insieme nello stesso ufficio tutti i giorni.',
      ],
      correctIndex: 0,
      explanation: 'Paolo è descritto come «un vecchio compagno di università» che Giulia non vedeva da mesi.',
    },
    {
      id: 'a2-q9',
      domain: 'production',
      skill: 'Past Activity with Time & Reason',
      prompt: 'Scrivi una frase al passato dicendo cosa hai fatto ieri o lo scorso weekend usando "perché".',
      hint: 'Usa il passato prossimo (ho fatto, sono andato/a...) e spiega il motivo con perché.',
      example: 'Ieri sono andato al supermercato perché dovevo comprare la cena.',
      requiredConnector: 'perché',
      expectedPatternDescription: 'Past tense clause + perché + reason clause',
      explanation: 'La frase deve usare correttamente un tempo passato e il connettore causale "perché".',
    },
  ],
};

export const B1_READINESS_ASSESSMENT: ReadinessAssessmentData = {
  id: 'readiness-b1',
  targetLevel: 'B1',
  title: 'La bottega di Firenze',
  subtitle: 'B1 Readiness',
  introText:
    'Read this connected Italian passage to evaluate your readiness for B1 stories and complex narrative chapters.',
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
    reading: 'Reading Comprehension',
    grammar: 'Aspect & Pronouns',
    inference: 'Inference & Strategy',
    production: 'Complex Expression',
  },
  domainFloors: {
    reading: 2 / 3,
    grammar: 2 / 3,
    inference: 1 / 2,
    production: 0.5 / 1.0,
  },
  questions: [
    {
      id: 'b1-q1',
      domain: 'reading',
      skill: 'Main Theme & Prudence',
      prompt: 'Qual è il tema principale di questo brano?',
      choices: [
        'Marta affronta con prudenza e pazienza il lavoro su un libro antico e fragile.',
        'Il maestro rimprovera Marta perché è arrivata troppo presto alla bottega.',
        'Marta decide di abbandonare il laboratorio di restauro a causa della pioggia.',
      ],
      correctIndex: 0,
      explanation: 'Marta sceglie saggiamente di aspettare il maestro per imparare la tecnica corretta.',
    },
    {
      id: 'b1-q2',
      domain: 'reading',
      skill: 'Atmosphere & Details',
      prompt: 'Com’era l’atmosfera quando Marta è entrata nella bottega?',
      choices: [
        'Pioveva fuori, le strade erano silenziose e il maestro non era ancora arrivato.',
        'C’erano molti clienti rumorosi che aspettavano all’ingresso.',
        'La bottega era illuminata dal sole splendente del primo pomeriggio.',
      ],
      correctIndex: 0,
      explanation: 'Il testo descrive la pioggia, il silenzio e la bottega prima dell’arrivo del maestro.',
    },
    {
      id: 'b1-q3',
      domain: 'reading',
      skill: 'Chronology & Action',
      prompt: 'Cosa fa Marta quando il maestro entra nella bottega?',
      choices: [
        'Gli mostra il problema con calma prima di toccare le pagine.',
        'Nasconde il libro per paura di essere giudicata.',
        'Incolla rapidamente tutte le pagine staccate da sola.',
      ],
      correctIndex: 0,
      explanation: 'Nel testo: «Quando il maestro è arrivato, lei gli ha mostrato il problema con calma.»',
    },
    {
      id: 'b1-q4',
      domain: 'grammar',
      skill: 'Imperfetto vs Passato Prossimo',
      prompt: 'Nella frase "Fuori pioveva e le strade erano silenziose", quale funzione ha l’imperfetto?',
      choices: [
        'Descrive il contesto e l’atmosfera di sfondo del momento.',
        'Indica un’azione rapida e conclusa in un singolo istante.',
        'Esprime un comando dato dal maestro.',
      ],
      correctIndex: 0,
      explanation: 'L’imperfetto descrive la situazione ambientale continua nel momento in cui Marta arriva.',
    },
    {
      id: 'b1-q5',
      domain: 'grammar',
      skill: 'Indirect Pronouns (le vs gli)',
      prompt: 'Nella frase "Il maestro ha sorriso e le ha detto...", a chi si riferisce "le"?',
      choices: [
        'A Marta (significa "ha detto a lei").',
        'Al libro antico.',
        'Alle strade di Firenze.',
      ],
      correctIndex: 0,
      explanation: 'Il pronome indiretto "le" significa "a lei" (a Marta).',
    },
    {
      id: 'b1-q6',
      domain: 'grammar',
      skill: 'Subject Tracking',
      prompt: 'Nella frase "Marta voleva riparare il libro, ma ha capito che era troppo fragile", chi compie l’azione di "ha capito"?',
      choices: ['Marta', 'Il maestro', 'Il libro antico'],
      correctIndex: 0,
      explanation: 'In italiano il soggetto rimane sottinteso e concorda con Marta.',
    },
    {
      id: 'b1-q7',
      domain: 'inference',
      skill: 'Connector (invece di)',
      prompt: 'Che cosa esprime l’espressione "invece di rischiare" nelle parole del maestro?',
      choices: [
        'Una scelta consapevole che preferisce la cura alla fretta dannosa.',
        'L’ora esatta dell’apertura del laboratorio.',
        'Il motivo per cui Marta non voleva imparare la tecnica.',
      ],
      correctIndex: 0,
      explanation: '"Invece di" introduce l’alternativa negativa che si sceglie di evitare.',
    },
    {
      id: 'b1-q8',
      domain: 'inference',
      skill: 'Character Development',
      prompt: 'Perché Marta si sente tranquilla alla fine del brano?',
      choices: [
        'Perché ha compreso che la pazienza e l’apprendimento sono più importanti della fretta.',
        'Perché il maestro le ha regalato il libro antico.',
        'Perché fuori ha smesso di piovere.',
      ],
      correctIndex: 0,
      explanation: 'Il testo conclude: «Marta si è sentita tranquilla perché ha capito il valore della pazienza.»',
    },
    {
      id: 'b1-q9',
      domain: 'production',
      skill: 'Preference with Alternative (invece di)',
      prompt: 'Esprimi una preferenza per le tue abitudini di studio o tempo libero usando "invece di".',
      hint: 'Usa "Preferisco..." o "Mi piace..." + attività + "invece di" + alternativa.',
      example: 'Preferisco leggere in italiano invece di guardare la TV in inglese.',
      requiredConnector: 'invece di',
      expectedPatternDescription: 'Preference verb + invece di + alternative',
      explanation: 'La frase deve esprimere una preferenza chiara e collegare l’alternativa tramite "invece di".',
    },
  ],
};

export const B1_PLUS_READINESS_ASSESSMENT: ReadinessAssessmentData = {
  id: 'readiness-b1-plus',
  targetLevel: 'B1+',
  title: 'Un incontro a Bologna',
  subtitle: 'B1+ Readiness',
  introText:
    'Read this extended Italian passage to evaluate your readiness for B1+ narrative chapters and complex perspectives.',
  passage: {
    title: 'Un incontro a Bologna',
    location: 'Bologna · Biblioteca Universitaria',
    text:
      'Mentre consultava alcuni documenti storici nella biblioteca dell’Archiginnasio, Lorenzo è stato interrotto da una voce familiare.\n\n' +
      'Era Elena, una ricercatrice con cui aveva collaborato due anni prima a Napoli. Dopo i primi saluti, Elena gli ha spiegato che stava completando un progetto di restauro sui portici medievali.\n\n' +
      'Lorenzo le ha confidato un dubbio professionale: gli avevano offerto un posto di lavoro prestigioso a Milano, ma sentiva che trasferirsi avrebbe significato allontanarsi dalle sue radici e dai progetti a cui teneva di più.\n\n' +
      'Elena lo ha ascoltato con attenzione e ha commentato: «Spesso pensiamo che la crescita professionale coincida con il cambiamento di città, sebbene le opportunità più autentiche siano quelle che costruiamo dove ci sentiamo a casa.»\n\n' +
      'Quella riflessione ha aiutato Lorenzo a guardare la sua scelta da una prospettiva diversa.',
    wordCount: 139,
  },
  domainLabels: {
    reading: 'Reading Comprehension',
    grammar: 'Complex Syntax & Contrast',
    inference: 'Nuance & Philosophy',
    production: 'Reflective Opinion',
  },
  domainFloors: {
    reading: 2 / 3,
    grammar: 2 / 3,
    inference: 1 / 2,
    production: 0.5 / 1.0,
  },
  questions: [
    {
      id: 'b1p-q1',
      domain: 'reading',
      skill: 'Core Dilemma',
      prompt: 'Qual è il dubbio principale che Lorenzo confida ad Elena?',
      choices: [
        'Se accettare un lavoro prestigioso a Milano o rimanere legato ai progetti e alle sue radici.',
        'Se continuare a studiare architettura oppure cambiare completamente facoltà.',
        'Se trasferirsi a Napoli per lavorare nel restauro dei portici con Elena.',
      ],
      correctIndex: 0,
      explanation: 'Lorenzo è indeciso tra l’offerta a Milano e il desiderio di non allontanarsi dalle sue radici.',
    },
    {
      id: 'b1p-q2',
      domain: 'reading',
      skill: 'Context & Past Relationship',
      prompt: 'Come si conoscono Lorenzo ed Elena?',
      choices: [
        'Hanno collaborato a un progetto due anni prima a Napoli.',
        'Si sono conosciuti quella mattina stessa in biblioteca a Bologna.',
        'Lavorano nello stesso studio di architettura a Milano.',
      ],
      correctIndex: 0,
      explanation: 'Il testo specifica: «Elena, una ricercatrice con cui aveva collaborato due anni prima a Napoli».',
    },
    {
      id: 'b1p-q3',
      domain: 'reading',
      skill: 'Resolution & Impact',
      prompt: 'Che effetto hanno le parole di Elena su Lorenzo?',
      choices: [
        'Lo aiutano a valutare la decisione con una prospettiva più profonda e autentica.',
        'Lo convincono ad accettare immediatamente il lavoro a Milano senza dubbi.',
        'Lo fanno arrabbiare perché non desiderava consigli.',
      ],
      correctIndex: 0,
      explanation: 'Il testo conclude che quella riflessione ha aiutato Lorenzo a guardare la scelta da una prospettiva diversa.',
    },
    {
      id: 'b1p-q4',
      domain: 'grammar',
      skill: 'Concessive Connector (sebbene)',
      prompt: 'Nella frase di Elena "...sebbene le opportunità più autentiche siano quelle...", che funzione ha "sebbene"?',
      choices: [
        'Introduce una concessione/contrasto rispetto all’opinione comune.',
        'Indica una causa temporale precisa.',
        'Esprime una conseguenza inevitabile.',
      ],
      correctIndex: 0,
      explanation: '"Sebbene" introduce una proposizione concessiva che mette in contrasto due idee.',
    },
    {
      id: 'b1p-q5',
      domain: 'grammar',
      skill: 'Past Perfect (Trapassato Prossimo)',
      prompt: 'Nella frase "Elena, con cui aveva collaborato due anni prima", perché si usa "aveva collaborato"?',
      choices: [
        'Perché indica un’azione passata avvenuta prima di un altro momento passato.',
        'Perché è un’azione che deve ancora iniziare.',
        'Perché si riferisce a un desiderio ipotetico nel presente.',
      ],
      correctIndex: 0,
      explanation: 'Il trapassato prossimo esprime un’azione anteriore a un momento già passato nel racconto.',
    },
    {
      id: 'b1p-q6',
      domain: 'grammar',
      skill: 'Conditional / Subjunctive Awareness',
      prompt: 'Nella frase "...trasferirsi avrebbe significato allontanarsi", che tempo verbale è "avrebbe significato"?',
      choices: [
        'Condizionale composto (esprime una conseguenza ipotetica nel passato).',
        'Futuro semplice.',
        'Imperfetto indicativo.',
      ],
      correctIndex: 0,
      explanation: 'Il condizionale passato esprime il futuro nel passato o una conseguenza ipotetica passata.',
    },
    {
      id: 'b1p-q7',
      domain: 'inference',
      skill: 'Philosophical Nuance',
      prompt: 'Cosa intende Elena quando dice che le opportunità autentiche sono quelle costruite "dove ci sentiamo a casa"?',
      choices: [
        'Che il vero successo e benessere personale dipendono dal senso di appartenenza e significato, non solo dal prestigio geografico.',
        'Che non bisogna mai viaggiare o visitare altre città italiane.',
        'Che lavorare a Milano è sempre una decisione sbagliata.',
      ],
      correctIndex: 0,
      explanation: 'Elena offre una riflessione sul valore del sentirsi a casa rispetto all’inseguimento del prestigio esteriore.',
    },
    {
      id: 'b1p-q8',
      domain: 'inference',
      skill: 'Tone & Atmosphere',
      prompt: 'Qual è il tono generale dell’incontro tra Lorenzo ed Elena?',
      choices: [
        'Riflessivo, intimo e intellettualmente stimolante.',
        'Comico e spensierato.',
        'Conflittuale e teso.',
      ],
      correctIndex: 0,
      explanation: 'La conversazione è profonda e meditativa, tipica di colleghi che condividono valori comuni.',
    },
    {
      id: 'b1p-q9',
      domain: 'production',
      skill: 'Complex Decision or Contrast (sebbene / ma)',
      prompt: 'Scrivi una frase per esprimere un contrasto o una scelta personale usando "sebbene" oppure "anche se".',
      hint: 'Esprimi due idee collegate da una concessione.',
      example: 'Anche se l’italiano è impegnativo, mi piace molto leggerlo ogni giorno.',
      expectedPatternDescription: 'Concessive clause (sebbene / anche se) + main clause',
      explanation: 'La frase deve esprimere una concessione o contrasto coerente.',
    },
  ],
};

export const READINESS_ASSESSMENTS_BY_LEVEL: Record<string, ReadinessAssessmentData> = {
  'A1+': A1_PLUS_READINESS_ASSESSMENT,
  A2: A2_READINESS_ASSESSMENT,
  B1: B1_READINESS_ASSESSMENT,
  'B1+': B1_PLUS_READINESS_ASSESSMENT,
};

export function getReadinessAssessmentForLevel(
  level: CEFRLevel | string,
): ReadinessAssessmentData | undefined {
  return READINESS_ASSESSMENTS_BY_LEVEL[level];
}

// =============================================================================
// SCORING & EVALUATION ENGINE
// =============================================================================

const PAST_AUXILIARY = /(?:^|[^\p{L}])(ho|hai|ha|abbiamo|avete|hanno|sono|sei|è|e'|siamo|siete)(?:[^\p{L}]|$)/iu;
const PAST_IMPERFETTO = /(?:^|[^\p{L}])(ero|eri|era|eravamo|eravate|erano|avevo|avevi|aveva|avevamo|avevate|avevano|facevo|faceva|andavo|andava|lavoravo|lavorava|studiavo|studiava|volevo|voleva|dovevo|doveva|potevo|poteva|sentivo|sentiva|abitavo|abitava)(?:[^\p{L}]|$)/iu;
const PAST_PARTICIPLE = /\b\w*(ato|ata|ati|ate|uto|uta|uti|ute|ito|ita|iti|ite|fatto|fatta|fatti|fatte|stato|stata|stati|state|visto|vista|visti|viste|preso|presa|presi|prese|messo|messa|messi|messe|scritto|scritta|scritti|scritte|letto|letta|letti|lette|chiuso|chiusa|chiusi|chiuse|aperto|aperta|aperti|aperte|detto|detta|detti|dette)\b/iu;
const PERCHE_CONNECTOR = /(?:^|[^\p{L}])(perch[eéè]|perche'?)(?:[^\p{L}]|$)/iu;
const INVECE_DI_CONNECTOR = /(?:^|[^\p{L}])(invece\s+di|invece\s+che|invece)(?:[^\p{L}]|$)/iu;
const SEBBENE_CONNECTOR = /(?:^|[^\p{L}])(sebbene|benché|benche'|anche\s+se|malgrado|nonostante)(?:[^\p{L}]|$)/iu;

export function scoreMultipleChoiceQuestion(
  question: ReadinessChoiceQuestion,
  choiceIndex?: number,
): { score: number; isCorrect: boolean } {
  if (choiceIndex === undefined) return { score: 0, isCorrect: false };
  const isCorrect = choiceIndex === question.correctIndex;
  return { score: isCorrect ? 1.0 : 0.0, isCorrect };
}

export function scoreProductionQuestion(
  question: ReadinessProductionQuestion,
  rawText?: string,
): { score: number; isCorrect: boolean; feedback: string } {
  const text = (rawText ?? '').trim();
  if (!text || text.length < 5) {
    return { score: 0, isCorrect: false, feedback: 'Risposta non inserita o troppo breve.' };
  }

  const words = text.split(/\s+/).filter(Boolean);

  if (question.id === 'a1p-q9') {
    // Introduction sentence with sono di / abito a / studio
    const hasIntro = /(?:^|[^\p{L}])(sono|abito|vivo|studio|vengo|mi chiamo)(?:[^\p{L}]|$)/iu.test(text);
    if (hasIntro && words.length >= 3) {
      return { score: 1.0, isCorrect: true, feedback: 'Ottima presentazione!' };
    }
    if (words.length >= 2) {
      return { score: 0.5, isCorrect: true, feedback: 'Presentazione comprensibile.' };
    }
    return { score: 0.0, isCorrect: false, feedback: 'Prova a inserire una frase completa.' };
  }

  if (question.id === 'a2-q9') {
    // Past activity with perché
    const hasPerche = PERCHE_CONNECTOR.test(text);
    const hasPast =
      PAST_IMPERFETTO.test(text) ||
      (PAST_AUXILIARY.test(text) && PAST_PARTICIPLE.test(text)) ||
      PAST_PARTICIPLE.test(text);

    if (hasPerche && hasPast && words.length >= 4) {
      return { score: 1.0, isCorrect: true, feedback: 'Ottimo uso del passato e di "perché".' };
    }
    if (hasPerche || hasPast) {
      return { score: 0.5, isCorrect: true, feedback: 'Buona struttura; cura il passato e il motivo.' };
    }
    return { score: 0.0, isCorrect: false, feedback: 'Includi un evento passato e la parola "perché".' };
  }

  if (question.id === 'b1-q9') {
    // Preference with invece di
    const hasInvece = INVECE_DI_CONNECTOR.test(text);
    const hasPreference = /(?:^|[^\p{L}])(preferisco|vorrei|mi piace|scelgo|voglio)(?:[^\p{L}]|$)/iu.test(text);
    if (hasInvece && hasPreference && words.length >= 4) {
      return { score: 1.0, isCorrect: true, feedback: 'Ottima formulazione con "invece di".' };
    }
    if (hasInvece || hasPreference) {
      return { score: 0.5, isCorrect: true, feedback: 'Connettore o preferenza presente.' };
    }
    return { score: 0.0, isCorrect: false, feedback: 'Esprimi una preferenza con "invece di".' };
  }

  if (question.id === 'b1p-q9') {
    // Concessive with sebbene or anche se
    const hasConcessive = SEBBENE_CONNECTOR.test(text);
    if (hasConcessive && words.length >= 4) {
      return { score: 1.0, isCorrect: true, feedback: 'Ottima formulazione concessiva.' };
    }
    if (words.length >= 4) {
      return { score: 0.5, isCorrect: true, feedback: 'Buona riflessione, prova a usare "anche se" o "sebbene".' };
    }
    return { score: 0.0, isCorrect: false, feedback: 'Esprimi un contrasto con "anche se" o "sebbene".' };
  }

  return { score: words.length >= 3 ? 0.5 : 0.0, isCorrect: words.length >= 3, feedback: 'Risposta registrata.' };
}

export function evaluateReadinessAssessment(
  assessment: ReadinessAssessmentData,
  answers: LearnerAnswer[] = [],
  storyId: string = LUCA_STORY_ID,
): ReadinessEvaluation {
  const answerMap = new Map<string, LearnerAnswer>(answers.map((a) => [a.questionId, a]));

  const domainEarned: Record<ReadinessDomain, number> = {
    reading: 0,
    grammar: 0,
    inference: 0,
    production: 0,
  };

  const domainPossible: Record<ReadinessDomain, number> = {
    reading: 0,
    grammar: 0,
    inference: 0,
    production: 0,
  };

  const questionResults: ReadinessQuestionResult[] = [];

  for (const q of assessment.questions) {
    const answer = answerMap.get(q.id);

    if (q.domain === 'production') {
      domainPossible.production += 1.0;
      const prodResult = scoreProductionQuestion(q as ReadinessProductionQuestion, answer?.text);
      domainEarned.production += prodResult.score;

      questionResults.push({
        questionId: q.id,
        domain: q.domain,
        skill: q.skill,
        prompt: q.prompt,
        userAnswer: answer?.text?.trim() || '(No answer)',
        correctAnswer: (q as ReadinessProductionQuestion).example,
        isCorrect: prodResult.isCorrect,
        score: prodResult.score,
        explanation: `${prodResult.feedback} ${q.explanation}`,
      });
    } else {
      domainPossible[q.domain] += 1.0;
      const mc = q as ReadinessChoiceQuestion;
      const mcResult = scoreMultipleChoiceQuestion(mc, answer?.choiceIndex);
      domainEarned[q.domain] += mcResult.score;

      const userChoiceText =
        typeof answer?.choiceIndex === 'number' &&
        answer.choiceIndex >= 0 &&
        answer.choiceIndex < mc.choices.length
          ? mc.choices[answer.choiceIndex]
          : '(No answer)';

      questionResults.push({
        questionId: q.id,
        domain: q.domain,
        skill: q.skill,
        prompt: q.prompt,
        userAnswer: userChoiceText,
        correctAnswer: mc.choices[mc.correctIndex],
        isCorrect: mcResult.isCorrect,
        score: mcResult.score,
        explanation: q.explanation,
      });
    }
  }

  // Check hard domain floors
  const readingMet =
    domainPossible.reading > 0
      ? domainEarned.reading / domainPossible.reading >= assessment.domainFloors.reading
      : true;
  const grammarMet =
    domainPossible.grammar > 0
      ? domainEarned.grammar / domainPossible.grammar >= assessment.domainFloors.grammar
      : true;
  const inferenceMet =
    domainPossible.inference > 0
      ? domainEarned.inference / domainPossible.inference >= assessment.domainFloors.inference
      : true;
  const productionMet =
    domainPossible.production > 0
      ? domainEarned.production / domainPossible.production >= assessment.domainFloors.production
      : true;

  const allFloorsMet = readingMet && grammarMet; // Hard floors: Reading & Grammar

  const totalScore =
    domainEarned.reading +
    domainEarned.grammar +
    domainEarned.inference +
    domainEarned.production;

  const maxScore =
    domainPossible.reading +
    domainPossible.grammar +
    domainPossible.inference +
    domainPossible.production;

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const isReady = percentage >= 70 && allFloorsMet;

  const outcome: ReadinessOutcome = isReady ? 'READY' : 'NOT_YET';

  const gate = getLevelGate(assessment.targetLevel, undefined, storyId);
  const targetChapterNumber = gate?.targetChapterNumber ?? 1;
  const targetChapterId = gate?.targetChapterId ?? `${storyId}-01`;

  const headline = isReady ? `${assessment.targetLevel} READY` : 'NOT QUITE YET';
  const subheadline = isReady
    ? "You've shown you're ready for Luca's next chapter."
    : "You're close. The next chapters will help you strengthen a few areas.";

  const reasons: string[] = [];
  if (isReady) {
    reasons.push(
      `Strong comprehension of Italian narrative and sentence structure at the ${assessment.targetLevel} level.`,
    );
  } else {
    if (!readingMet) {
      reasons.push('Reading comprehension of unfamiliar details will benefit from earlier chapters.');
    }
    if (!grammarMet) {
      reasons.push('Verb forms, aspect, and pronouns need a little more reinforcement.');
    }
    if (reasons.length === 0) {
      reasons.push('A few more chapters of reading will make this level much more comfortable.');
    }
  }

  const remediationAdvice = isReady
    ? `You can begin right away at Chapter ${targetChapterNumber}. Your earlier chapters remain available anytime.`
    : `We recommend continuing your reading journey through ${gate?.previousLevel ?? 'the earlier chapters'} to build confidence before jumping into ${assessment.targetLevel}.`;

  const domains: Record<ReadinessDomain, DomainScoreResult> = {
    reading: {
      domain: 'reading',
      label: assessment.domainLabels.reading,
      earned: domainEarned.reading,
      possible: domainPossible.reading,
      percentage: domainPossible.reading > 0 ? (domainEarned.reading / domainPossible.reading) * 100 : 0,
      metFloor: readingMet,
      floorRequirementText: `Minimum ${Math.ceil(domainPossible.reading * assessment.domainFloors.reading)} of ${domainPossible.reading}`,
    },
    grammar: {
      domain: 'grammar',
      label: assessment.domainLabels.grammar,
      earned: domainEarned.grammar,
      possible: domainPossible.grammar,
      percentage: domainPossible.grammar > 0 ? (domainEarned.grammar / domainPossible.grammar) * 100 : 0,
      metFloor: grammarMet,
      floorRequirementText: `Minimum ${Math.ceil(domainPossible.grammar * assessment.domainFloors.grammar)} of ${domainPossible.grammar}`,
    },
    inference: {
      domain: 'inference',
      label: assessment.domainLabels.inference,
      earned: domainEarned.inference,
      possible: domainPossible.inference,
      percentage: domainPossible.inference > 0 ? (domainEarned.inference / domainPossible.inference) * 100 : 0,
      metFloor: inferenceMet,
      floorRequirementText: `Minimum ${Math.ceil(domainPossible.inference * assessment.domainFloors.inference)} of ${domainPossible.inference}`,
    },
    production: {
      domain: 'production',
      label: assessment.domainLabels.production,
      earned: domainEarned.production,
      possible: domainPossible.production,
      percentage: domainPossible.production > 0 ? (domainEarned.production / domainPossible.production) * 100 : 0,
      metFloor: productionMet,
      floorRequirementText: `Minimum ${domainPossible.production * assessment.domainFloors.production} pts`,
    },
  };

  return {
    targetLevel: assessment.targetLevel,
    outcome,
    headline,
    subheadline,
    totalScore,
    maxScore,
    percentage,
    allFloorsMet,
    isReady,
    targetChapterNumber,
    targetChapterId,
    domains,
    questionResults,
    reasons,
    remediationAdvice,
  };
}
