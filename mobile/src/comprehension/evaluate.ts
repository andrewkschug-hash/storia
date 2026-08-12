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
