import { describe, expect, it } from 'vitest';

import {
  evaluateMasteryAnswer,
  getA1MasteryAssessment,
  getA1MasteryQuestions,
  scoreMasteryResults,
} from '@/src/content/a1MasteryTest';

describe('A1 mastery assessment content', () => {
  it('loads 20 Italian-only questions with a 75% pass threshold', () => {
    const assessment = getA1MasteryAssessment();
    expect(assessment.assessmentId).toBe('a1-mastery');
    expect(assessment.passThreshold).toBe(0.75);
    expect(getA1MasteryQuestions()).toHaveLength(20);
    expect(assessment.questions.filter((q) => q.section === 'grammar').length).toBe(8);
    expect(assessment.questions.filter((q) => q.section === 'vocabulary').length).toBe(6);
    expect(assessment.questions.filter((q) => q.section === 'story').length).toBe(6);
  });

  it('evaluates answers and scores pass/fail', () => {
    const [first] = getA1MasteryQuestions();
    const evaluation = evaluateMasteryAnswer(first, first.correctChoice);
    expect(evaluation.correct).toBe(true);
    const wrong = evaluateMasteryAnswer(first, (first.correctChoice + 1) % first.choices.length);
    expect(wrong.correct).toBe(false);

    const results = getA1MasteryQuestions().map((question) => ({
      correct: evaluateMasteryAnswer(question, question.correctChoice).correct,
    }));
    expect(scoreMasteryResults(results).passed).toBe(true);
  });
});
