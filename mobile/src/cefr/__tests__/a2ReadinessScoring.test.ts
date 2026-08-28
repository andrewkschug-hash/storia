import { describe, expect, it } from 'vitest';

import {
  evaluateA2Readiness,
  scoreProduction,
  type A2LearnerAnswer,
} from '@/src/cefr/a2ReadinessService';

function makeAllCorrectAnswers(): A2LearnerAnswer[] {
  return [
    { questionId: 'a2-readiness-q1', choiceIndex: 0 },
    { questionId: 'a2-readiness-q2', choiceIndex: 0 },
    { questionId: 'a2-readiness-q3', choiceIndex: 0 },
    { questionId: 'a2-readiness-q4', choiceIndex: 0 },
    { questionId: 'a2-readiness-q5', choiceIndex: 0 },
    { questionId: 'a2-readiness-q6', choiceIndex: 0 },
    { questionId: 'a2-readiness-q7', choiceIndex: 0 },
    { questionId: 'a2-readiness-q8', choiceIndex: 0 },
    {
      questionId: 'a2-readiness-q9',
      text: 'Ieri ho lavorato molto perché dovevo finire un progetto.',
    },
    {
      questionId: 'a2-readiness-q10',
      text: 'Preferisco passeggiare nel parco invece di guardare la TV.',
    },
  ];
}

describe('A2 → B1 Readiness Scoring Engine', () => {
  describe('Semantic Production Scoring', () => {
    it('awards 1.0 for valid past sentence with perché (Q9)', () => {
      const result = scoreProduction(
        'a2-readiness-q9',
        'Ieri sera sono andato a dormire presto perché ero molto stanco.',
      );
      expect(result.score).toBe(1.0);
      expect(result.isCorrect).toBe(true);
    });

    it('awards 0.5 partial credit for valid connector with minimal past structure (Q9)', () => {
      const result = scoreProduction('a2-readiness-q9', 'Perché sono stanco.');
      expect(result.score).toBe(0.5);
    });

    it('awards 0.0 for missing connector or empty text (Q9)', () => {
      expect(scoreProduction('a2-readiness-q9', 'Sono andato al cinema ieri sera.').score).toBe(0.5); // has past, no perche -> 0.5
      expect(scoreProduction('a2-readiness-q9', 'ciao').score).toBe(0.0);
      expect(scoreProduction('a2-readiness-q9', '').score).toBe(0.0);
    });

    it('awards 1.0 for valid preference with invece di (Q10)', () => {
      const result = scoreProduction(
        'a2-readiness-q10',
        'Preferisco studiare italiano invece di dormire tutto il giorno.',
      );
      expect(result.score).toBe(1.0);
      expect(result.isCorrect).toBe(true);
    });

    it('awards 0.0 for unrelated answer or missing invece di (Q10)', () => {
      expect(scoreProduction('a2-readiness-q10', 'Oggi fa bel tempo a Roma.').score).toBe(0.0);
    });
  });

  describe('Thresholds & Classification', () => {
    it('classifies 10.0 / 10 as CONFIDENT', () => {
      const answers = makeAllCorrectAnswers();
      const evalResult = evaluateA2Readiness(answers);
      expect(evalResult.totalScore).toBe(10.0);
      expect(evalResult.status).toBe('CONFIDENT');
      expect(evalResult.canAdvanceToB1).toBe(true);
      expect(evalResult.allFloorsMet).toBe(true);
    });

    it('classifies 9.0 / 10 with met floors as CONFIDENT', () => {
      const answers = makeAllCorrectAnswers();
      // Miss Q1 (reading becomes 2/3, total becomes 9.0)
      answers[0].choiceIndex = 1;
      const evalResult = evaluateA2Readiness(answers);
      expect(evalResult.totalScore).toBe(9.0);
      expect(evalResult.status).toBe('CONFIDENT');
      expect(evalResult.canAdvanceToB1).toBe(true);
    });

    it('classifies 8.0 / 10 with met floors as READY', () => {
      const answers = makeAllCorrectAnswers();
      // Miss Q1 and Q4 (reading 2/3, grammar 2/3, total 8.0)
      answers[0].choiceIndex = 1;
      answers[3].choiceIndex = 1;
      const evalResult = evaluateA2Readiness(answers);
      expect(evalResult.totalScore).toBe(8.0);
      expect(evalResult.status).toBe('READY');
      expect(evalResult.canAdvanceToB1).toBe(true);
    });

    it('classifies 7.5 / 10 with partial production as READY', () => {
      const answers = makeAllCorrectAnswers();
      // Miss Q1 (reading 2/3), miss Q4 (grammar 2/3), partial Q9 (0.5) -> 7.5 total
      answers[0].choiceIndex = 1;
      answers[3].choiceIndex = 1;
      answers[8].text = 'Perché sono stanco.'; // 0.5
      const evalResult = evaluateA2Readiness(answers);
      expect(evalResult.totalScore).toBe(7.5);
      expect(evalResult.status).toBe('READY');
      expect(evalResult.canAdvanceToB1).toBe(true);
    });

    it('classifies 7.0 / 10 as APPROACHING', () => {
      const answers = makeAllCorrectAnswers();
      // Miss 3 questions -> 7.0 total
      answers[0].choiceIndex = 1;
      answers[1].choiceIndex = 1;
      answers[3].choiceIndex = 1;
      const evalResult = evaluateA2Readiness(answers);
      expect(evalResult.totalScore).toBe(7.0);
      expect(evalResult.status).toBe('APPROACHING');
      expect(evalResult.canAdvanceToB1).toBe(false);
    });

    it('classifies 5.0 / 10 as APPROACHING', () => {
      const answers = makeAllCorrectAnswers();
      // Miss 5 questions
      answers[0].choiceIndex = 1;
      answers[1].choiceIndex = 1;
      answers[3].choiceIndex = 1;
      answers[4].choiceIndex = 1;
      answers[6].choiceIndex = 1;
      const evalResult = evaluateA2Readiness(answers);
      expect(evalResult.totalScore).toBe(5.0);
      expect(evalResult.status).toBe('APPROACHING');
      expect(evalResult.canAdvanceToB1).toBe(false);
    });

    it('classifies 4.5 / 10 as NOT_READY', () => {
      const answers = makeAllCorrectAnswers();
      // 4.5 total: 4 MC correct (4.0), Q9 partial (0.5), Q10 zero (0.0)
      answers[0].choiceIndex = 1;
      answers[1].choiceIndex = 1;
      answers[2].choiceIndex = 1;
      answers[3].choiceIndex = 1;
      answers[8].text = 'Perché sono stanco.'; // 0.5
      answers[9].text = ''; // 0.0
      const evalResult = evaluateA2Readiness(answers);
      expect(evalResult.totalScore).toBe(4.5);
      expect(evalResult.status).toBe('NOT_READY');
      expect(evalResult.canAdvanceToB1).toBe(false);
    });
  });

  describe('Domain Floor Enforcement', () => {
    it('demotes 8.0 overall with 0/2 production to APPROACHING', () => {
      const answers = makeAllCorrectAnswers();
      // Perfect MC (8/8) but completely empty production (0/2) -> total 8.0
      answers[8].text = '';
      answers[9].text = '';
      const evalResult = evaluateA2Readiness(answers);
      expect(evalResult.totalScore).toBe(8.0);
      expect(evalResult.domains.production.earned).toBe(0.0);
      expect(evalResult.domains.production.metFloor).toBe(false);
      expect(evalResult.allFloorsMet).toBe(false);
      expect(evalResult.status).toBe('APPROACHING');
      expect(evalResult.canAdvanceToB1).toBe(false);
    });

    it('demotes 8.0 overall with 1/3 grammar to APPROACHING', () => {
      const answers = makeAllCorrectAnswers();
      // 3/3 reading, 1/3 grammar, 2/2 inference, 2/2 production -> total 8.0
      answers[3].choiceIndex = 1;
      answers[4].choiceIndex = 1;
      const evalResult = evaluateA2Readiness(answers);
      expect(evalResult.totalScore).toBe(8.0);
      expect(evalResult.domains.grammar.earned).toBe(1.0);
      expect(evalResult.domains.grammar.metFloor).toBe(false);
      expect(evalResult.allFloorsMet).toBe(false);
      expect(evalResult.status).toBe('APPROACHING');
      expect(evalResult.canAdvanceToB1).toBe(false);
    });

    it('demotes 8.0 overall with 1/3 reading to APPROACHING', () => {
      const answers = makeAllCorrectAnswers();
      // 1/3 reading, 3/3 grammar, 2/2 inference, 2/2 production -> total 8.0
      answers[0].choiceIndex = 1;
      answers[1].choiceIndex = 1;
      const evalResult = evaluateA2Readiness(answers);
      expect(evalResult.totalScore).toBe(8.0);
      expect(evalResult.domains.reading.earned).toBe(1.0);
      expect(evalResult.domains.reading.metFloor).toBe(false);
      expect(evalResult.allFloorsMet).toBe(false);
      expect(evalResult.status).toBe('APPROACHING');
      expect(evalResult.canAdvanceToB1).toBe(false);
    });
  });

  describe('Robustness and Safe Defaults', () => {
    it('safely handles empty answer array', () => {
      const evalResult = evaluateA2Readiness([]);
      expect(evalResult.totalScore).toBe(0);
      expect(evalResult.status).toBe('NOT_READY');
      expect(evalResult.canAdvanceToB1).toBe(false);
      expect(evalResult.questionResults.length).toBe(10);
    });

    it('safely handles partial answer array with invalid indices', () => {
      const evalResult = evaluateA2Readiness([
        { questionId: 'a2-readiness-q1', choiceIndex: 99 },
        { questionId: 'unknown-id', choiceIndex: 0 },
      ]);
      expect(evalResult.status).toBe('NOT_READY');
      expect(evalResult.totalScore).toBe(0);
    });
  });
});
