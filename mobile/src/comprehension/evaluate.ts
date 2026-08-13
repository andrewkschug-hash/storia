import type { ComprehensionQuestion } from '@/src/content/schemas';

export type AnswerEvaluation = {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  correctChoice: number;
  explanation: string;
};

export function evaluateAnswer(
  question: ComprehensionQuestion,
  selectedIndex: number,
): AnswerEvaluation {
  const correct = selectedIndex === question.correctChoice;
  return {
    questionId: question.id,
    selectedIndex,
    correct,
    correctChoice: question.correctChoice,
    explanation: question.explanation,
  };
}

export function scoreAnswers(
  results: { correct: boolean; attempts: number }[],
): { correct: number; incorrect: number; attempted: number; score: number } {
  const correct = results.filter((r) => r.correct).length;
  const incorrect = results.length - correct;
  const attempted = results.reduce((sum, r) => sum + r.attempts, 0);
  return {
    correct,
    incorrect,
    attempted,
    score: results.length === 0 ? 0 : correct / results.length,
  };
}

/**
 * Present multiple-choice options in a stable but shuffled order so the
 * authored correct answer is not always in the first slot.
 */
export function shuffleQuestionChoices(
  question: ComprehensionQuestion,
  seedExtra = '',
): ComprehensionQuestion {
  const correctText = question.choices[question.correctChoice];
  if (correctText == null || question.choices.length < 2) {
    return question;
  }

  const seeded = hashSeed(`${question.id}:${seedExtra}`);
  const choices = seededShuffle(question.choices, seeded);
  const correctChoice = choices.indexOf(correctText);
  if (correctChoice < 0) {
    return question;
  }

  return {
    ...question,
    choices,
    correctChoice,
  };
}

function hashSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic Fisher–Yates using a simple LCG seeded from `seed`. */
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let state = seed || 1;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}
