/**
 * A2 → B1 Transfer Readiness Assessment.
 *
 * Combines 30% active unseen diagnostic ("Il giardino di Marta") with
 * 70% longitudinal evidence (Ch 25–40 comprehension, tap autonomy, vocabulary, pathway).
 *
 * Implements independent hard-floor gates:
 * - Active diagnostic >= 7.0 / 10
 * - Production >= 1.0 / 2.0 (50%)
 * - Aspect & Connectors >= 2.0 / 4.0 (50%)
 * - Chapter 25–40 comprehension >= 70%
 * - Recent tap rate <= 18%
 */

import type { AdaptiveLearnerProfile } from '@/src/adaptive/types';
import type { ReadinessStatus } from '@/src/cefr/readiness';
import type { ProductionExercise } from '@/src/content/schemas';
import { scoreProductionAnswer } from '@/src/production/score';
import type { ReadingProgressRecord } from '@/src/progress/types';

// ============================================================
// 1. IMMUTABLE ASSESSMENT PASSAGE & ITEMS
// ============================================================

export const B1_ASSESSMENT_PASSAGE = {
  id: 'il-giardino-di-marta',
  title: 'Il giardino di Marta',
  subtitle: 'Una storia da leggere prima di continuare',
  location: 'Firenze',
  paragraphs: [
    'Marta arriva a Firenze all’inizio della primavera per lavorare in un vecchio laboratorio botanico. La serra è rimasta chiusa per molti mesi: i vetri sono coperti di polvere e le piante hanno bisogno di cura.',
    'Nei primi giorni, Marta pensava che il lavoro fosse semplice. Credeva che bastasse pulire i tavoli e innaffiare ogni mattina. Ma ieri ha scoperto che il sistema dell’acqua non funzionava: una vecchia tubatura di metallo si era rotta durante l’inverno.',
    'Invece di chiamare subito un tecnico della città, ha deciso di esaminare il problema insieme a Giorgio, il falegname vicino di bottega. Giorgio le ha spiegato che il legno e il metallo della serra devono respirare insieme. Con pazienza hanno sostituito la parte rovinata e l’acqua è tornata a scorrere.',
    'La sera, guardando le prime foglie verdi alla luce del tramonto, Marta ha capito che questo laboratorio non è solo un lavoro: è un luogo in cui imparare a osservare prima di agire.',
  ],
} as const;

export type B1DiagnosticSection = 'reading_inference' | 'aspect_tense' | 'production';

export interface B1DiagnosticItem {
  id: string;
  section: B1DiagnosticSection;
  type: 'multiple_choice' | 'production';
  question: string;
  promptEn?: string;
  choices?: string[];
  correctChoice?: number;
  explanation: string;
  productionExercise?: ProductionExercise;
}

export const B1_DIAGNOSTIC_ITEMS: readonly B1DiagnosticItem[] = [
  // Section 1: Reading & Inference (Q1–Q4, 1.0 pt each)
  {
    id: 'b1-diag-01',
    section: 'reading_inference',
    type: 'multiple_choice',
    question: 'Perché Marta è arrivata a Firenze?',
    choices: [
      'Per lavorare nel recupero di un laboratorio botanico.',
      'Per comprare mobili nuovi nella bottega di Giorgio.',
      'Per visitare i monumenti storici della città.',
      'Per cercare un nuovo appartamento vicino al fiume.',
    ],
    correctChoice: 0,
    explanation: 'Il testo spiega subito che Marta arriva a Firenze per lavorare in un vecchio laboratorio botanico.',
  },
  {
    id: 'b1-diag-02',
    section: 'reading_inference',
    type: 'multiple_choice',
    question: 'Cosa ha scoperto Marta dopo i primi giorni?',
    choices: [
      'Che il lavoro richiedeva di riparare una tubatura dell’acqua rotta.',
      'Che Giorgio voleva vendere la serra a una grande azienda.',
      'Che tutte le piante erano già completamente fiorite.',
      'Che bastava semplicemente pulire i tavoli ogni mattina.',
    ],
    correctChoice: 0,
    explanation: 'Marta scopre che una vecchia tubatura di metallo si era rotta durante l’inverno e l’acqua non funzionava.',
  },
  {
    id: 'b1-diag-03',
    section: 'reading_inference',
    type: 'multiple_choice',
    question: 'Come hanno risolto il problema dell’acqua?',
    choices: [
      'Hanno sostituito con pazienza la parte rovinata lavorando insieme.',
      'Hanno aspettato l’arrivo dei tecnici dalla città.',
      'Hanno chiuso definitivamente la vecchia serra.',
      'Hanno comprato una nuova serra di metallo moderno.',
    ],
    correctChoice: 0,
    explanation: 'Insieme a Giorgio, con pazienza hanno sostituito la parte rovinata e l’acqua è tornata a scorrere.',
  },
  {
    id: 'b1-diag-04',
    section: 'reading_inference',
    type: 'multiple_choice',
    question: 'Cosa capisce Marta alla fine della giornata?',
    choices: [
      'Che il laboratorio è un luogo in cui imparare a osservare prima di agire.',
      'Che preferisce fare un lavoro veloce senza perdere tempo.',
      'Che deve tornare subito alla sua città d’origine.',
      'Che la botanica è una materia troppo teorica.',
    ],
    correctChoice: 0,
    explanation: 'Marta capisce che il laboratorio è un luogo in cui imparare a osservare prima di agire.',
  },

  // Section 2: Aspect, Tense & Structural Connectors (Q5–Q8, 1.0 pt each)
  {
    id: 'b1-diag-05',
    section: 'aspect_tense',
    type: 'multiple_choice',
    question: 'Nella frase «Marta pensava che il lavoro fosse semplice... ma ieri ha scoperto il problema», perché l’autore usa "pensava"?',
    choices: [
      'Descrive la convinzione iniziale e continua che aveva prima della scoperta.',
      'Indica un’azione improvvisa e momentanea accaduta ieri sera.',
      'Esprime un’azione futura programmata.',
      'Significa che Marta non vuole più pensare al lavoro.',
    ],
    correctChoice: 0,
    explanation: 'L’imperfetto "pensava" esprime lo stato mentale continuo e di sfondo prima dell’evento specifico.',
  },
  {
    id: 'b1-diag-06',
    section: 'aspect_tense',
    type: 'multiple_choice',
    question: 'Quale frase usa correttamente "invece di" per esprimere una scelta consapevole tra due azioni?',
    choices: [
      'Marta ha esaminato il problema invece di chiamare subito un tecnico.',
      'Marta ha chiamato il tecnico invece che la serra era aperta.',
      'Invece di ha riparato il tubo con Giorgio ieri.',
      'Il legno respira invece di metallo e acqua limpida.',
    ],
    correctChoice: 0,
    explanation: '"Invece di" si unisce a un infinito per indicare un’azione scartata a favore di un’altra.',
  },
  {
    id: 'b1-diag-07',
    section: 'aspect_tense',
    type: 'multiple_choice',
    question: 'In «Giorgio le ha spiegato che il legno deve respirare», a chi si riferisce il pronome "le"?',
    choices: [
      'A Marta (a lei).',
      'Alle piante della serra.',
      'A Giorgio stesso.',
      'Alla città di Firenze.',
    ],
    correctChoice: 0,
    explanation: 'Il pronome indiretto "le" significa "a lei" e si riferisce a Marta, che riceve la spiegazione.',
  },
  {
    id: 'b1-diag-08',
    section: 'aspect_tense',
    type: 'multiple_choice',
    question: 'Nella frase «È un luogo in cui imparare a osservare», che funzione ha "in cui"?',
    choices: [
      'Collega il luogo con una spiegazione ("nel quale / dove").',
      'Esprime una causa temporale ("perché").',
      'Indica una negazione ("senza il quale").',
      'Esprime un dubbio sul futuro.',
    ],
    correctChoice: 0,
    explanation: '"In cui" è un pronome relativo con preposizione che significa "nel quale / dove".',
  },

  // Section 3: Communicative Production (Q9–Q10, 1.0 pt each with 0.0 / 0.5 / 1.0 partial scoring)
  {
    id: 'b1-diag-09',
    section: 'production',
    type: 'production',
    question: 'Esprimi in italiano una preferenza: "Preferirei lavorare nel giardino invece di restare dentro."',
    promptEn: 'I would prefer to work in the garden instead of staying inside.',
    explanation: 'Usa il condizionale "preferirei" e il connettivo "invece di" seguito da un verbo all’infinito.',
    productionExercise: {
      exerciseId: 'b1-diag-09-prod',
      storyId: 'il-giardino-di-marta',
      chapterId: 'b1-diag',
      sourceSentenceId: 'b1-s09',
      promptEn: 'I would prefer to work in the garden instead of staying inside.',
      expectedIt: 'Preferirei lavorare nel giardino invece di restare dentro.',
      acceptableAnswers: [
        'Preferirei lavorare in giardino invece di restare dentro.',
        'Preferirei lavorare nel giardino invece di stare dentro.',
        'Preferirei lavorare in giardino invece di stare dentro.',
        'Preferisco lavorare nel giardino invece di restare dentro.',
        'Vorrei lavorare nel giardino invece di restare dentro.',
        'Vorrei lavorare in giardino invece di stare dentro.',
        'Io preferirei lavorare nel giardino invece di restare dentro.',
        'Preferirei lavorare in giardino invece di rimanere dentro.',
        "Preferirei lavorare all'aperto invece di restare dentro.",
        "Preferisco lavorare all'aperto invece di restare dentro.",
        'Preferirei lavorare fuori invece di restare dentro.',
        'Preferisco lavorare fuori invece di stare dentro.',
      ],
      match: 'semantic',
      level: 'A2',
      focus: ['preferire', 'giardino', 'invece di'],
      semantic: {
        requiredConcepts: ['prefer', 'garden', 'instead_of'],
        conceptAliases: {
          prefer: ['preferirei', 'preferisco', 'vorrei'],
          garden: ['giardino', "all'aperto", 'fuori'],
          instead_of: ['invece di', 'invece che'],
        },
        requiredPerson: ['1sg'],
      },
    },
  },
  {
    id: 'b1-diag-10',
    section: 'production',
    type: 'production',
    question: 'Esprimi in italiano una decisione passata e il motivo: "Ho deciso di restare perché amo questo mestiere."',
    promptEn: 'I decided to stay because I love this craft.',
    explanation: 'Usa il passato prossimo "ho deciso" e il connettivo causale "perché" o "dato che".',
    productionExercise: {
      exerciseId: 'b1-diag-10-prod',
      storyId: 'il-giardino-di-marta',
      chapterId: 'b1-diag',
      sourceSentenceId: 'b1-s10',
      promptEn: 'I decided to stay because I love this craft.',
      expectedIt: 'Ho deciso di restare perché amo questo mestiere.',
      acceptableAnswers: [
        'Ho deciso di rimanere perché amo questo mestiere.',
        'Ho deciso di restare perché mi piace questo lavoro.',
        'Ho deciso di restare perché amo questo lavoro.',
        'Ho voluto restare perché amo questo mestiere.',
        'Io ho deciso di restare perché amo questo mestiere.',
        'Ho deciso di restare dato che amo questo mestiere.',
        'Ho deciso di rimanere perché mi piace questo mestiere.',
      ],
      match: 'semantic',
      level: 'A2',
      focus: ['decidere', 'restare', 'perche', 'mestiere'],
      semantic: {
        requiredConcepts: ['decide', 'stay', 'because', 'craft'],
        conceptAliases: {
          decide: ['ho deciso', 'ho voluto'],
          stay: ['restare', 'rimanere'],
          because: ['perche', 'dato che', 'poiche'],
          craft: ['mestiere', 'lavoro'],
        },
        requiredPerson: ['1sg'],
      },
    },
  },
];

// ============================================================
// 2. DIAGNOSTIC SCORING & PARTIAL CREDIT (0.0 / 0.5 / 1.0)
// ============================================================

export interface B1DiagnosticItemResult {
  itemId: string;
  section: B1DiagnosticSection;
  score: number; // 0.0, 0.5, or 1.0
  passed: boolean;
  userChoice?: number;
  userText?: string;
  feedback: string;
}

export interface B1DiagnosticResult {
  totalScore: number; // 0.0 to 10.0
  percentage: number; // 0.0 to 100.0
  sectionScores: {
    readingInference: number; // 0.0 to 4.0
    aspectTense: number;      // 0.0 to 4.0
    production: number;       // 0.0 to 2.0
  };
  itemResults: B1DiagnosticItemResult[];
}

export function scoreB1Diagnostic(
  multipleChoiceAnswers: Record<string, number | undefined>,
  productionAnswers: Record<string, string | undefined>,
): B1DiagnosticResult {
  let readingInference = 0;
  let aspectTense = 0;
  let production = 0;
  const itemResults: B1DiagnosticItemResult[] = [];

  for (const item of B1_DIAGNOSTIC_ITEMS) {
    if (item.type === 'multiple_choice') {
      const choice = multipleChoiceAnswers[item.id];
      const isCorrect = typeof choice === 'number' && choice === item.correctChoice;
      const score = isCorrect ? 1.0 : 0.0;
      if (item.section === 'reading_inference') readingInference += score;
      if (item.section === 'aspect_tense') aspectTense += score;
      itemResults.push({
        itemId: item.id,
        section: item.section,
        score,
        passed: isCorrect,
        userChoice: choice,
        feedback: isCorrect ? 'Risposta corretta' : item.explanation,
      });
    } else if (item.type === 'production') {
      const text = productionAnswers[item.id] ?? '';
      let score = 0.0;
      let feedback = item.explanation;
      if (item.productionExercise && text.trim().length > 0) {
        const result = scoreProductionAnswer(item.productionExercise, text);
        if (result.status === 'correct') {
          score = 1.0;
          feedback = 'Ottima formulazione!';
        } else if (result.status === 'almost') {
          score = 0.5;
          feedback = 'Significato chiaro, con qualche piccola imprecisione formale.';
        } else {
          score = 0.0;
          feedback = `Suggerimento: ${item.productionExercise.expectedIt}`;
        }
      }
      production += score;
      itemResults.push({
        itemId: item.id,
        section: item.section,
        score,
        passed: score >= 0.5,
        userText: text,
        feedback,
      });
    }
  }

  const totalScore = readingInference + aspectTense + production;
  const percentage = (totalScore / B1_DIAGNOSTIC_ITEMS.length) * 100;

  return {
    totalScore,
    percentage,
    sectionScores: {
      readingInference,
      aspectTense,
      production,
    },
    itemResults,
  };
}

// ============================================================
// 3. LONGITUDINAL EVIDENCE CALCULATION
// ============================================================

export interface B1LongitudinalEvidence {
  comprehensionScore: number;     // 0.0 to 1.0 (Ch 25–40 mean comprehension)
  tapAutonomyScore: number;       // 0.0 to 1.0 (derived from recentTapRate)
  recentTapRate: number;          // raw tap frequency per word read
  vocabularyStrength: number;     // 0.0 to 1.0
  pathwayScore: number;           // 0.0 to 1.0
  longitudinalPercentage: number; // 0.0 to 100.0 (70% composite base)
}

export function calculateB1LongitudinalEvidence(
  profile: AdaptiveLearnerProfile,
  progress: ReadingProgressRecord,
): B1LongitudinalEvidence {
  // 1. Comprehension score across Chapters 25–40 (A2 Act III)
  const a2ChapterScores: number[] = [];
  for (let ch = 25; ch <= 40; ch++) {
    const chId = `luca-a-roma-${String(ch).padStart(2, '0')}`;
    const score = progress.comprehensionByChapter[chId]?.score;
    if (typeof score === 'number') {
      a2ChapterScores.push(score);
    }
  }
  const rawComp =
    a2ChapterScores.length > 0
      ? a2ChapterScores.reduce((sum, s) => sum + s, 0) / a2ChapterScores.length
      : profile.comprehensionStrength;
  const comprehensionScore = Math.round(rawComp * 100) / 100;

  // 2. Lexical autonomy: uses existing canonical recentTapRate
  // A tap rate of 0% = 1.0 autonomy; 25% tap rate or higher = 0.0 autonomy
  const recentTapRate = profile.recentTapRate;
  const tapAutonomyScore = Math.max(0, Math.min(1, 1 - recentTapRate / 0.25));

  // 3. Vocabulary strength from profile
  const vocabularyStrength = Math.max(0, Math.min(1, profile.vocabularyStrength));

  // 4. Pathway & short story evidence
  const pathwayScore = Math.max(
    0.5,
    Math.min(1.0, (progress.completedChapterIds.length >= 25 ? 0.8 : 0.5) + (profile.readingCompletionRate >= 0.5 ? 0.2 : 0)),
  );

  // Composite of the 70% longitudinal layer (scaled to 0–100)
  // Comprehension = 25/70, Tap = 20/70, Vocab = 15/70, Pathway = 10/70
  const weightedLongitudinal =
    comprehensionScore * 25 +
    tapAutonomyScore * 20 +
    vocabularyStrength * 15 +
    pathwayScore * 10;
  const longitudinalPercentage = (weightedLongitudinal / 70) * 100;

  return {
    comprehensionScore,
    tapAutonomyScore,
    recentTapRate,
    vocabularyStrength,
    pathwayScore,
    longitudinalPercentage,
  };
}

// ============================================================
// 4. A2 → B1 COMPOSITE EVALUATOR & HARD FLOORS
// ============================================================

export interface B1HardFloors {
  activeDiagnosticMet: boolean; // >= 7.0 (READY) or >= 8.5 (CONFIDENT)
  productionMet: boolean;       // >= 1.0 / 2.0 (50%)
  aspectTenseMet: boolean;      // >= 2.0 / 4.0 (50%)
  tapRateMet: boolean;          // <= 18% (0.18)
  comprehensionMet: boolean;    // >= 70% (0.70)
  allMetForReady: boolean;
  allMetForConfident: boolean;
}

export interface A2ToB1ReadinessEvaluation {
  currentLevel: 'A2' | 'A2+';
  targetLevel: 'B1';
  status: ReadinessStatus;
  compositeScore: number; // 0.0 to 100.0
  activeScore: number;    // 0.0 to 10.0
  diagnosticPercentage: number;
  longitudinalPercentage: number;
  diagnostic: B1DiagnosticResult;
  longitudinal: B1LongitudinalEvidence;
  hardFloors: B1HardFloors;
  reasons: string[];
  recommendations: string[];
  canChooseNext: boolean;
  message: string;
}

export function evaluateA2ToB1Readiness(input: {
  diagnostic: B1DiagnosticResult;
  longitudinal: B1LongitudinalEvidence;
}): A2ToB1ReadinessEvaluation {
  const { diagnostic, longitudinal } = input;

  // Canonical Composite Formula:
  // 30% Active Diagnostic + 25% Ch 25–40 Comp + 20% Tap Autonomy + 15% Vocab + 10% Pathway
  const activeWeighted = (diagnostic.totalScore / 10.0) * 100 * 0.30;
  const compWeighted = longitudinal.comprehensionScore * 100 * 0.25;
  const tapWeighted = longitudinal.tapAutonomyScore * 100 * 0.20;
  const vocabWeighted = longitudinal.vocabularyStrength * 100 * 0.15;
  const pathwayWeighted = longitudinal.pathwayScore * 100 * 0.10;

  const compositeScore = activeWeighted + compWeighted + tapWeighted + vocabWeighted + pathwayWeighted;

  // Independent Hard Floors
  const activeReadyMet = diagnostic.totalScore >= 7.0;
  const activeConfidentMet = diagnostic.totalScore >= 8.5;
  const productionReadyMet = diagnostic.sectionScores.production >= 1.0; // 50%
  const productionConfidentMet = diagnostic.sectionScores.production >= 1.5; // 75%
  const aspectReadyMet = diagnostic.sectionScores.aspectTense >= 2.0; // 50%
  const aspectConfidentMet = diagnostic.sectionScores.aspectTense >= 3.0; // 75%
  const tapReadyMet = longitudinal.recentTapRate <= 0.18;
  const tapConfidentMet = longitudinal.recentTapRate <= 0.10;
  const compReadyMet = longitudinal.comprehensionScore >= 0.70;
  const compConfidentMet = longitudinal.comprehensionScore >= 0.80;

  const allMetForReady =
    activeReadyMet && productionReadyMet && aspectReadyMet && tapReadyMet && compReadyMet;
  const allMetForConfident =
    activeConfidentMet &&
    productionConfidentMet &&
    aspectConfidentMet &&
    tapConfidentMet &&
    compConfidentMet;

  const hardFloors: B1HardFloors = {
    activeDiagnosticMet: activeReadyMet,
    productionMet: productionReadyMet,
    aspectTenseMet: aspectReadyMet,
    tapRateMet: tapReadyMet,
    comprehensionMet: compReadyMet,
    allMetForReady,
    allMetForConfident,
  };

  const reasons: string[] = [];
  const recommendations: string[] = [];
  let status: ReadinessStatus = 'NOT_READY';

  // Determine Status:
  if (compositeScore >= 90.0 && allMetForConfident) {
    status = 'CONFIDENT';
    reasons.push('Hai dimostrato una comprensione profonda e un’ottima autonomia linguistica su un testo nuovo.');
  } else if (compositeScore >= 75.0 && allMetForReady) {
    status = 'READY';
    reasons.push('Sei pronto per affrontare conversazioni complesse e sfumature narrative in B1.');
  } else if (compositeScore >= 50.0 || (compositeScore >= 75.0 && !allMetForReady)) {
    status = 'APPROACHING';
    if (!activeReadyMet) {
      recommendations.push('Rileggi il brano con attenzione per cogliere meglio le sfumature della storia.');
    }
    if (!productionReadyMet) {
      recommendations.push('Rivedi gli esercizi di produzione dei capitoli 31–40 per consolidare la scrittura.');
    }
    if (!aspectReadyMet) {
      recommendations.push('Rivedi le note grammaticali sui tempi passati (imperfetto e passato prossimo).');
    }
    if (!tapReadyMet) {
      recommendations.push('Prova a rileggere alcuni capitoli di A2 concentrandoti sul flusso del testo.');
    }
    if (!compReadyMet) {
      recommendations.push('Fai qualche ripasso della comprensione nei capitoli 35–40.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Un piccolo ripasso delle storie A2 ti darà la sicurezza necessaria per il livello B1.');
    }
    reasons.push('Sei molto vicino alla soglia di passaggio. Un piccolo ripasso ti darà piena sicurezza.');
  } else {
    status = 'NOT_READY';
    reasons.push('I capitoli di A2 offrono ancora ottime opportunità di consolidamento prima di passare al livello B1.');
    recommendations.push('Rileggi i capitoli 25–40 con calma e completa i ripassi prima del salto di livello.');
  }

  const canChooseNext = status === 'READY' || status === 'CONFIDENT';
  const message =
    status === 'CONFIDENT' || status === 'READY'
      ? 'Hai seguito una storia che non avevi mai letto. Sei pronto per l’Atto IV (B1).'
      : status === 'APPROACHING'
        ? 'Hai seguito gran parte della storia. Un breve ripasso mirato ti porterà a B1.'
        : 'Continua a leggere in A2. Il passaggio a B1 sarà più solido con un po’ più di pratica.';

  return {
    currentLevel: 'A2',
    targetLevel: 'B1',
    status,
    compositeScore: Math.round(compositeScore * 10) / 10,
    activeScore: Math.round(diagnostic.totalScore * 10) / 10,
    diagnosticPercentage: Math.round(diagnostic.percentage * 10) / 10,
    longitudinalPercentage: Math.round(longitudinal.longitudinalPercentage * 10) / 10,
    diagnostic,
    longitudinal,
    hardFloors,
    reasons,
    recommendations,
    canChooseNext,
    message,
  };
}
