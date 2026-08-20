import a1MasteryJson from '../../content/assessments/a1-mastery.json';
import { A1MasteryAssessmentSchema, type A1MasteryAssessment, type MasteryQuestion } from '@/src/content/schemas';
import { A1_MASTERY_PASS_THRESHOLD } from '@/src/progress/a1Gate';

let cached: A1MasteryAssessment | null = null;

export function getA1MasteryAssessment(): A1MasteryAssessment {
  if (!cached) {
    cached = A1MasteryAssessmentSchema.parse(a1MasteryJson);
  }
  return cached;
}

export function getA1MasteryQuestions(): MasteryQuestion[] {
  return getA1MasteryAssessment().questions;
}

export { A1_MASTERY_PASS_THRESHOLD };

export type MasteryAnswerEvaluation = {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  correctChoice: number;
  explanation: string;
};

export function evaluateMasteryAnswer(
  question: MasteryQuestion,
  selectedIndex: number,
): MasteryAnswerEvaluation {
  const correct = selectedIndex === question.correctChoice;
  return {
    questionId: question.id,
    selectedIndex,
    correct,
    correctChoice: question.correctChoice,
    explanation: question.explanation,
  };
}

export function scoreMasteryResults(
  results: { correct: boolean }[],
): { correct: number; total: number; score: number; passed: boolean } {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const score = total === 0 ? 0 : correct / total;
  const threshold = getA1MasteryAssessment().passThreshold;
  return {
    correct,
    total,
    score,
    passed: score >= threshold,
  };
}
