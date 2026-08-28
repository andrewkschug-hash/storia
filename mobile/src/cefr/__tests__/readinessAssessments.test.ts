import { describe, expect, it } from 'vitest';
import {
  A1_PLUS_READINESS_ASSESSMENT,
  A2_READINESS_ASSESSMENT,
  B1_READINESS_ASSESSMENT,
  B1_PLUS_READINESS_ASSESSMENT,
  evaluateReadinessAssessment,
  getReadinessAssessmentForLevel,
  scoreMultipleChoiceQuestion,
  scoreProductionQuestion,
} from '@/src/cefr/readinessAssessments';

describe('Readiness Assessments Catalog & Evaluation', () => {
  it('registers comprehensive assessments for A1+, A2, B1, and B1+', () => {
    expect(getReadinessAssessmentForLevel('A1+')).toBe(A1_PLUS_READINESS_ASSESSMENT);
    expect(getReadinessAssessmentForLevel('A2')).toBe(A2_READINESS_ASSESSMENT);
    expect(getReadinessAssessmentForLevel('B1')).toBe(B1_READINESS_ASSESSMENT);
    expect(getReadinessAssessmentForLevel('B1+')).toBe(B1_PLUS_READINESS_ASSESSMENT);

    expect(A2_READINESS_ASSESSMENT.questions.length).toBe(9);
    expect(A2_READINESS_ASSESSMENT.passage.text.length).toBeGreaterThan(100);
  });

  it('correctly scores multiple choice questions', () => {
    const q = A2_READINESS_ASSESSMENT.questions[0];
    if (q.domain !== 'production') {
      expect(scoreMultipleChoiceQuestion(q, q.correctIndex)).toEqual({
        score: 1.0,
        isCorrect: true,
      });
      expect(scoreMultipleChoiceQuestion(q, q.correctIndex === 0 ? 1 : 0)).toEqual({
        score: 0.0,
        isCorrect: false,
      });
      expect(scoreMultipleChoiceQuestion(q, undefined)).toEqual({
        score: 0.0,
        isCorrect: false,
      });
    }
  });

  it('semantically scores production questions with connectors and patterns', () => {
    const a2Prod = A2_READINESS_ASSESSMENT.questions.find(
      (q) => q.domain === 'production',
    )!;
    if (a2Prod.domain === 'production') {
      const goodAnswer = scoreProductionQuestion(
        a2Prod,
        'Ieri sono andato al mercato perché volevo comprare la frutta.',
      );
      expect(goodAnswer.score).toBe(1.0);
      expect(goodAnswer.isCorrect).toBe(true);

      const partialAnswer = scoreProductionQuestion(a2Prod, 'Sono andato al mercato ieri.');
      expect(partialAnswer.score).toBe(0.5);

      const emptyAnswer = scoreProductionQuestion(a2Prod, '');
      expect(emptyAnswer.score).toBe(0.0);
    }
  });

  it('evaluates full assessment yielding READY when score ≥ 70% and hard floors are met', () => {
    const assessment = A2_READINESS_ASSESSMENT;
    const allCorrectAnswers = assessment.questions.map((q) => {
      if (q.domain === 'production') {
        return {
          questionId: q.id,
          text: 'Ieri sono andato al mercato perché volevo comprare il cibo.',
        };
      }
      return { questionId: q.id, choiceIndex: q.correctIndex };
    });

    const result = evaluateReadinessAssessment(assessment, allCorrectAnswers);
    expect(result.outcome).toBe('READY');
    expect(result.isReady).toBe(true);
    expect(result.headline).toBe('A2 READY');
    expect(result.targetChapterNumber).toBe(25);
    expect(result.domains.reading.metFloor).toBe(true);
    expect(result.domains.grammar.metFloor).toBe(true);
  });

  it('yields NOT QUITE YET when domain floor fails even if total score is moderate', () => {
    const assessment = A2_READINESS_ASSESSMENT;
    // Answer reading correctly, but all grammar wrong
    const answers = assessment.questions.map((q) => {
      if (q.domain === 'reading') {
        return { questionId: q.id, choiceIndex: (q as any).correctIndex };
      }
      if (q.domain === 'production') {
        return {
          questionId: q.id,
          text: 'Ieri sono andato al mercato perché volevo comprare il cibo.',
        };
      }
      // wrong grammar & inference
      return { questionId: q.id, choiceIndex: ((q as any).correctIndex + 1) % 3 };
    });

    const result = evaluateReadinessAssessment(assessment, answers);
    expect(result.outcome).toBe('NOT_YET');
    expect(result.isReady).toBe(false);
    expect(result.headline).toBe('NOT QUITE YET');
    expect(result.domains.grammar.metFloor).toBe(false);
    expect(result.remediationAdvice).toContain('reading journey');
  });
});
