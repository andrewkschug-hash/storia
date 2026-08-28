import { describe, expect, it } from 'vitest';

import {
  A2_B1_READINESS_ASSESSMENT,
  type A2ReadinessChoiceQuestion,
  type A2ReadinessProductionQuestion,
} from '@/src/cefr/a2ReadinessAssessment';

describe('A2 → B1 Readiness Assessment Content', () => {
  it('defines the unseen passage without Luca story dependencies', () => {
    const { passage } = A2_B1_READINESS_ASSESSMENT;
    expect(passage.title).toBeTruthy();
    expect(passage.text.length).toBeGreaterThan(100);
    expect(passage.text.toLowerCase()).not.toContain('luca');
    expect(passage.text.toLowerCase()).not.toContain('sofia');
    expect(passage.text.toLowerCase()).not.toContain('spazio monti');
    expect(passage.text.toLowerCase()).not.toContain('pietralba');
    expect(passage.text).toContain('Marta');
    expect(passage.text).toContain('Firenze');
  });

  it('contains exactly 10 questions across 4 distinct domains', () => {
    const { questions } = A2_B1_READINESS_ASSESSMENT;
    expect(questions.length).toBe(10);

    const reading = questions.filter((q) => q.domain === 'reading');
    const grammar = questions.filter((q) => q.domain === 'grammar');
    const inference = questions.filter((q) => q.domain === 'inference');
    const production = questions.filter((q) => q.domain === 'production');

    expect(reading.length).toBe(3);
    expect(grammar.length).toBe(3);
    expect(inference.length).toBe(2);
    expect(production.length).toBe(2);
  });

  it('authors valid multiple-choice questions for Q1–Q8', () => {
    const choiceQuestions = A2_B1_READINESS_ASSESSMENT.questions.filter(
      (q): q is A2ReadinessChoiceQuestion => q.domain !== 'production',
    );

    expect(choiceQuestions.length).toBe(8);
    for (const q of choiceQuestions) {
      expect(q.prompt.length).toBeGreaterThan(10);
      expect(q.choices.length).toBeGreaterThanOrEqual(3);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.choices.length);
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });

  it('authors valid production prompts with required connectors for Q9–Q10', () => {
    const productionQuestions = A2_B1_READINESS_ASSESSMENT.questions.filter(
      (q): q is A2ReadinessProductionQuestion => q.domain === 'production',
    );

    expect(productionQuestions.length).toBe(2);
    expect(productionQuestions[0].id).toBe('a2-readiness-q9');
    expect(productionQuestions[0].requiredConnector).toBe('perché');
    expect(productionQuestions[1].id).toBe('a2-readiness-q10');
    expect(productionQuestions[1].requiredConnector).toBe('invece di');
  });

  it('configures domain floors and labels', () => {
    const { domainFloors, domainLabels } = A2_B1_READINESS_ASSESSMENT;
    expect(domainFloors.reading).toBeCloseTo(2 / 3);
    expect(domainFloors.grammar).toBeCloseTo(2 / 3);
    expect(domainFloors.inference).toBeCloseTo(1 / 2);
    expect(domainFloors.production).toBeCloseTo(1.0 / 2.0);

    expect(domainLabels.reading).toBeTruthy();
    expect(domainLabels.grammar).toBeTruthy();
    expect(domainLabels.inference).toBeTruthy();
    expect(domainLabels.production).toBeTruthy();
  });
});
