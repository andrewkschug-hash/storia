import {
  A2_B1_READINESS_ASSESSMENT,
  type A2ReadinessDomain,
  type A2ReadinessQuestion,
} from '@/src/cefr/a2ReadinessAssessment';
import type { ReadinessStatus } from '@/src/cefr/readiness';

export type A2LearnerAnswer = {
  questionId: string;
  choiceIndex?: number;
  text?: string;
};

export type A2DomainResult = {
  domain: A2ReadinessDomain;
  label: string;
  earned: number;
  possible: number;
  percentage: number;
  metFloor: boolean;
  floorRequirementText: string;
};

export type A2QuestionResult = {
  questionId: string;
  domain: A2ReadinessDomain;
  skill: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  explanation: string;
};

export type A2ReadinessEvaluation = {
  status: ReadinessStatus;
  totalScore: number;
  maxScore: number;
  percentage: number;
  canAdvanceToB1: boolean;
  allFloorsMet: boolean;
  domains: Record<A2ReadinessDomain, A2DomainResult>;
  questionResults: A2QuestionResult[];
  reasons: string[];
  remediationAdvice: string;
  headline: string;
};

/**
 * Evaluates a single multiple-choice question.
 */
export function scoreMultipleChoice(
  question: A2ReadinessQuestion,
  choiceIndex: number | undefined,
): { score: number; isCorrect: boolean } {
  if (question.domain === 'production' || choiceIndex === undefined) {
    return { score: 0, isCorrect: false };
  }
  const isCorrect = choiceIndex === question.correctIndex;
  return { score: isCorrect ? 1.0 : 0.0, isCorrect };
}

const PAST_AUXILIARY = /(?:^|[^\p{L}])(ho|hai|ha|abbiamo|avete|hanno|sono|sei|è|e'|siamo|siete)(?:[^\p{L}]|$)/iu;
const PAST_IMPERFETTO = /(?:^|[^\p{L}])(ero|eri|era|eravamo|eravate|erano|avevo|avevi|aveva|avevamo|avevate|avevano|facevo|faceva|andavo|andava|lavoravo|lavorava|studiavo|studiava|volevo|voleva|dovevo|doveva|potevo|poteva|sentivo|sentiva|abitavo|abitava)(?:[^\p{L}]|$)/iu;
const PAST_PARTICIPLE = /\b\w*(ato|ata|ati|ate|uto|uta|uti|ute|ito|ita|iti|ite|fatto|fatta|fatti|fatte|stato|stata|stati|state|visto|vista|visti|viste|preso|presa|presi|prese|messo|messa|messi|messe|scritto|scritta|scritti|scritte|letto|letta|letti|lette|chiuso|chiusa|chiusi|chiuse|aperto|aperta|aperti|aperte|detto|detta|detti|dette)\b/iu;
const PERCHE_CONNECTOR = /(?:^|[^\p{L}])(perch[eéè]|perche'?)(?:[^\p{L}]|$)/iu;

const PREFERENCE_VERB = /(?:^|[^\p{L}])(preferisco|preferirei|vorrei|mi piace|mi piacerebbe|scelgo|voglio|desidero|preferiamo)(?:[^\p{L}]|$)/iu;
const INVECE_DI_CONNECTOR = /(?:^|[^\p{L}])(invece\s+di|invece\s+che|invece)(?:[^\p{L}]|$)/iu;

/**
 * Semantically evaluates an open-ended production answer.
 * Grants 1.0 (full), 0.5 (partial), or 0.0 (zero).
 */
export function scoreProduction(
  questionId: string,
  rawText: string | undefined,
): { score: number; isCorrect: boolean; feedback: string } {
  const text = (rawText ?? '').trim();
  if (!text || text.length < 5) {
    return {
      score: 0,
      isCorrect: false,
      feedback: 'Risposta non inserita o troppo breve.',
    };
  }

  const words = text.split(/\s+/).filter(Boolean);

  if (questionId === 'a2-readiness-q9') {
    // Q9: Past sentence with reason using perché
    const hasPerche = PERCHE_CONNECTOR.test(text);
    const hasPast =
      PAST_IMPERFETTO.test(text) ||
      (PAST_AUXILIARY.test(text) && PAST_PARTICIPLE.test(text)) ||
      PAST_PARTICIPLE.test(text);

    if (hasPerche && hasPast && words.length >= 4) {
      return {
        score: 1.0,
        isCorrect: true,
        feedback: 'Ottimo uso del passato e del connettore "perché".',
      };
    }
    if (hasPerche && words.length >= 3) {
      return {
        score: 0.5,
        isCorrect: true,
        feedback: 'Connettore presente; assicurati di usare chiaramente un tempo passato.',
      };
    }
    if (hasPast && words.length >= 3) {
      return {
        score: 0.5,
        isCorrect: false,
        feedback: 'Tempo passato corretto, ma manca il connettore "perché".',
      };
    }
    return {
      score: 0.0,
      isCorrect: false,
      feedback: 'La frase deve includere un evento passato e il connettore "perché".',
    };
  }

  if (questionId === 'a2-readiness-q10') {
    // Q10: Preference with invece di
    const hasInvece = INVECE_DI_CONNECTOR.test(text);
    const hasPreference = PREFERENCE_VERB.test(text);

    if (hasInvece && hasPreference && words.length >= 4) {
      return {
        score: 1.0,
        isCorrect: true,
        feedback: 'Ottima formulazione della preferenza con "invece di".',
      };
    }
    if (hasInvece && words.length >= 3) {
      return {
        score: 0.5,
        isCorrect: true,
        feedback: 'Uso corretto di "invece di", ma la preferenza poteva essere più esplicita.',
      };
    }
    if (hasPreference && words.length >= 3) {
      return {
        score: 0.5,
        isCorrect: false,
        feedback: 'Preferenza espressa, ma manca il connettore "invece di".',
      };
    }
    return {
      score: 0.0,
      isCorrect: false,
      feedback: 'La frase deve esprimere una preferenza usando "invece di".',
    };
  }

  return { score: 0, isCorrect: false, feedback: 'Domanda non riconosciuta.' };
}

/**
 * Main evaluation function for the A2 → B1 readiness check.
 */
export function evaluateA2Readiness(
  learnerAnswers: A2LearnerAnswer[] = [],
): A2ReadinessEvaluation {
  const assessment = A2_B1_READINESS_ASSESSMENT;
  const answerMap = new Map<string, A2LearnerAnswer>(
    learnerAnswers.map((a) => [a.questionId, a]),
  );

  const domainEarned: Record<A2ReadinessDomain, number> = {
    reading: 0,
    grammar: 0,
    inference: 0,
    production: 0,
  };

  const domainPossible: Record<A2ReadinessDomain, number> = {
    reading: 3,
    grammar: 3,
    inference: 2,
    production: 2,
  };

  const questionResults: A2QuestionResult[] = [];

  for (const q of assessment.questions) {
    const answer = answerMap.get(q.id);

    if (q.domain === 'production') {
      const prodScore = scoreProduction(q.id, answer?.text);
      domainEarned.production += prodScore.score;

      questionResults.push({
        questionId: q.id,
        domain: q.domain,
        skill: q.skill,
        prompt: q.prompt,
        userAnswer: answer?.text?.trim() || '(Nessuna risposta)',
        correctAnswer: q.example,
        isCorrect: prodScore.isCorrect,
        score: prodScore.score,
        explanation: prodScore.feedback + ' ' + q.explanation,
      });
    } else {
      const mcScore = scoreMultipleChoice(q, answer?.choiceIndex);
      domainEarned[q.domain] += mcScore.score;

      const userChoiceText =
        typeof answer?.choiceIndex === 'number' &&
        answer.choiceIndex >= 0 &&
        answer.choiceIndex < q.choices.length
          ? q.choices[answer.choiceIndex]
          : '(Nessuna risposta)';

      questionResults.push({
        questionId: q.id,
        domain: q.domain,
        skill: q.skill,
        prompt: q.prompt,
        userAnswer: userChoiceText,
        correctAnswer: q.choices[q.correctIndex],
        isCorrect: mcScore.isCorrect,
        score: mcScore.score,
        explanation: q.explanation,
      });
    }
  }

  const readingMet = domainEarned.reading >= 2.0; // min 2/3
  const grammarMet = domainEarned.grammar >= 2.0; // min 2/3
  const inferenceMet = domainEarned.inference >= 1.0; // min 1/2
  const productionMet = domainEarned.production >= 1.0; // min 1.0 / 2.0

  const allFloorsMet = readingMet && grammarMet && inferenceMet && productionMet;

  const totalScore =
    domainEarned.reading +
    domainEarned.grammar +
    domainEarned.inference +
    domainEarned.production;

  const maxScore = 10.0;
  const percentage = (totalScore / maxScore) * 100;

  let status: ReadinessStatus = 'NOT_READY';
  if (totalScore >= 9.0 && allFloorsMet) {
    status = 'CONFIDENT';
  } else if (totalScore >= 7.5 && allFloorsMet) {
    status = 'READY';
  } else if (totalScore >= 5.0) {
    status = 'APPROACHING';
  } else {
    status = 'NOT_READY';
  }

  const canAdvanceToB1 = status === 'READY' || status === 'CONFIDENT';

  const reasons: string[] = [];
  if (status === 'CONFIDENT') {
    reasons.push(
      'Eccellente capacità di comprendere e produrre l’italiano in contesti nuovi e complessi.',
    );
  } else if (status === 'READY') {
    reasons.push(
      'Solida comprensione dei tempi passati, dei connettori e della struttura delle frasi.',
    );
  } else if (status === 'APPROACHING') {
    if (!productionMet) {
      reasons.push(
        'La produzione scritta con connettori e tempi passati richiede un po’ più di consolidamento.',
      );
    }
    if (!grammarMet) {
      reasons.push(
        'I contrasti tra imperfetto e passato prossimo e i pronomi necessitano di ulteriore pratica.',
      );
    }
    if (!readingMet) {
      reasons.push(
        'La comprensione dettagliata di testi non familiari trarrà beneficio da letture supplementari.',
      );
    }
    if (!inferenceMet) {
      reasons.push('Attenzione alle intenzioni dei personaggi e alle sfumature dei connettori.');
    }
    if (reasons.length === 0) {
      reasons.push(
        'Sei quasi pronto per il livello B1, ma un breve consolidamento garantirà una lettura più fluida.',
      );
    }
  } else {
    reasons.push(
      'I tempi verbali del passato e la struttura dei connettori richiedono ancora pratica attiva a livello A2.',
    );
  }

  const remediationAdvice =
    canAdvanceToB1
      ? 'Il tuo percorso prosegue con il Capitolo 41 di Luca a Roma, dove il linguaggio diventa più ricco e indipendente.'
      : 'Ti consigliamo di esplorare "La casa delle finestre" (pausa di lettura A2+) o ripassare i capitoli 25–40 prima di sbloccare il livello B1.';

  const headline =
    status === 'CONFIDENT' || status === 'READY'
      ? '✦ Pronto per il prossimo capitolo'
      : status === 'APPROACHING'
        ? 'Quasi pronto per il B1'
        : 'Continua a consolidare l’A2';

  const domains: Record<A2ReadinessDomain, A2DomainResult> = {
    reading: {
      domain: 'reading',
      label: assessment.domainLabels.reading,
      earned: domainEarned.reading,
      possible: domainPossible.reading,
      percentage: (domainEarned.reading / domainPossible.reading) * 100,
      metFloor: readingMet,
      floorRequirementText: 'Minimo 2 su 3 corrette',
    },
    grammar: {
      domain: 'grammar',
      label: assessment.domainLabels.grammar,
      earned: domainEarned.grammar,
      possible: domainPossible.grammar,
      percentage: (domainEarned.grammar / domainPossible.grammar) * 100,
      metFloor: grammarMet,
      floorRequirementText: 'Minimo 2 su 3 corrette',
    },
    inference: {
      domain: 'inference',
      label: assessment.domainLabels.inference,
      earned: domainEarned.inference,
      possible: domainPossible.inference,
      percentage: (domainEarned.inference / domainPossible.inference) * 100,
      metFloor: inferenceMet,
      floorRequirementText: 'Minimo 1 su 2 corrette',
    },
    production: {
      domain: 'production',
      label: assessment.domainLabels.production,
      earned: domainEarned.production,
      possible: domainPossible.production,
      percentage: (domainEarned.production / domainPossible.production) * 100,
      metFloor: productionMet,
      floorRequirementText: 'Minimo 1.0 punto su 2.0',
    },
  };

  return {
    status,
    totalScore,
    maxScore,
    percentage,
    canAdvanceToB1,
    allFloorsMet,
    domains,
    questionResults,
    reasons,
    remediationAdvice,
    headline,
  };
}
