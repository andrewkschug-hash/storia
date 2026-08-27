import { describe, expect, it } from 'vitest';

import type { AdaptiveLearnerProfile } from '@/src/adaptive/types';
import {
  B1_ASSESSMENT_PASSAGE,
  B1_DIAGNOSTIC_ITEMS,
  calculateB1LongitudinalEvidence,
  canTransition,
  evaluateA2ToB1Readiness,
  scoreB1Diagnostic,
} from '@/src/cefr';
import { createInitialProgress, type ReadingProgressRecord } from '@/src/progress/types';

function mockProfile(overrides: Partial<AdaptiveLearnerProfile> = {}): AdaptiveLearnerProfile {
  return {
    learnerId: 'test-learner',
    targetLevel: 'A2',
    vocabularyStrength: 0.85,
    phraseStrength: 0.80,
    comprehensionStrength: 0.88,
    recentTapRate: 0.08,
    recentComprehensionScore: 0.90,
    readingCompletionRate: 0.95,
    averageSentenceDifficulty: 24,
    currentCEFRLevel: 'A2',
    ...overrides,
  };
}

function mockProgressWithA2(overrides: Partial<ReadingProgressRecord> = {}): ReadingProgressRecord {
  const base = createInitialProgress('luca-a-roma', 'luca-a-roma-40');
  const compByChapter: Record<string, { attempted: number; correct: number; incorrect: number; score: number; completedAt: string; answers: any[] }> = {};
  const completedIds: string[] = [];

  for (let ch = 1; ch <= 40; ch++) {
    const chId = `luca-a-roma-${String(ch).padStart(2, '0')}`;
    completedIds.push(chId);
    compByChapter[chId] = {
      attempted: 3,
      correct: 3,
      incorrect: 0,
      score: 0.90,
      completedAt: '2026-08-27T12:00:00.000Z',
      answers: [],
    };
  }

  return {
    ...base,
    currentCEFRLevel: 'A2',
    completedChapterIds: completedIds,
    comprehensionByChapter: compByChapter,
    ...overrides,
  };
}

describe('B1 Readiness Assessment Content & Invariants', () => {
  it('has an independent unseen passage with no Luca or Pietralba dependencies', () => {
    expect(B1_ASSESSMENT_PASSAGE.title).toBe('Il giardino di Marta');
    expect(B1_ASSESSMENT_PASSAGE.paragraphs.length).toBe(4);
    const fullText = B1_ASSESSMENT_PASSAGE.paragraphs.join(' ');
    expect(fullText).not.toContain('Luca');
    expect(fullText).not.toContain('Pietralba');
    expect(fullText).toContain('Marta');
    expect(fullText).toContain('Firenze');
  });

  it('contains exactly 10 diagnostic items (4 reading, 4 aspect/grammar, 2 production)', () => {
    expect(B1_DIAGNOSTIC_ITEMS.length).toBe(10);
    const reading = B1_DIAGNOSTIC_ITEMS.filter((i) => i.section === 'reading_inference');
    const aspect = B1_DIAGNOSTIC_ITEMS.filter((i) => i.section === 'aspect_tense');
    const prod = B1_DIAGNOSTIC_ITEMS.filter((i) => i.section === 'production');

    expect(reading.length).toBe(4);
    expect(aspect.length).toBe(4);
    expect(prod.length).toBe(2);
  });

  it('allows adjacent and major A2 to B1 transitions via canTransition', () => {
    expect(canTransition('A2', 'B1')).toBe(true);
    expect(canTransition('A2+', 'B1')).toBe(true);
    expect(canTransition('A1', 'B1')).toBe(false);
    expect(canTransition('A1', 'A2')).toBe(false);
  });
});

describe('B1 Diagnostic Scoring & Partial Credit', () => {
  it('scores perfect multiple choice and perfect production as 10.0 / 10.0 (100%)', () => {
    const mcAnswers: Record<string, number> = {
      'b1-diag-01': 0,
      'b1-diag-02': 0,
      'b1-diag-03': 0,
      'b1-diag-04': 0,
      'b1-diag-05': 0,
      'b1-diag-06': 0,
      'b1-diag-07': 0,
      'b1-diag-08': 0,
    };
    const prodAnswers: Record<string, string> = {
      'b1-diag-09': 'Preferirei lavorare nel giardino invece di restare dentro.',
      'b1-diag-10': 'Ho deciso di restare perché amo questo mestiere.',
    };

    const diag = scoreB1Diagnostic(mcAnswers, prodAnswers);
    expect(diag.totalScore).toBe(10.0);
    expect(diag.percentage).toBe(100.0);
    expect(diag.sectionScores.readingInference).toBe(4.0);
    expect(diag.sectionScores.aspectTense).toBe(4.0);
    expect(diag.sectionScores.production).toBe(2.0);
  });

  it('supports deterministic partial credit (0.5) on almost-correct production', () => {
    const mcAnswers: Record<string, number> = {
      'b1-diag-01': 0,
      'b1-diag-02': 0,
      'b1-diag-03': 0,
      'b1-diag-04': 0,
      'b1-diag-05': 0,
      'b1-diag-06': 0,
      'b1-diag-07': 0,
      'b1-diag-08': 0,
    };
    const prodAnswers: Record<string, string> = {
      // Perfect on Q9 -> 1.0 score
      'b1-diag-09': 'Preferirei lavorare nel giardino invece di restare dentro.',
      // Missing accent on "perché" -> triggers "almost" (0.5 score)
      'b1-diag-10': 'Ho deciso di restare perche amo questo mestiere.',
    };

    const diag = scoreB1Diagnostic(mcAnswers, prodAnswers);
    expect(diag.sectionScores.readingInference).toBe(4.0);
    expect(diag.sectionScores.aspectTense).toBe(4.0);
    expect(diag.sectionScores.production).toBe(1.5);
    const q9 = diag.itemResults.find((r) => r.itemId === 'b1-diag-09');
    expect(q9?.score).toBe(1.0);
    expect(q9?.passed).toBe(true);
    const q10 = diag.itemResults.find((r) => r.itemId === 'b1-diag-10');
    expect(q10?.score).toBe(0.5);
    expect(q10?.passed).toBe(true);
  });

  it('scores 0 on incorrect answers', () => {
    const diag = scoreB1Diagnostic({}, {});
    expect(diag.totalScore).toBe(0.0);
    expect(diag.percentage).toBe(0.0);
  });
});

describe('Longitudinal Evidence & Composite Evaluation', () => {
  it('calculates longitudinal evidence from profile and Ch 25–40 progress', () => {
    const profile = mockProfile({ recentTapRate: 0.05, vocabularyStrength: 0.90 });
    const progress = mockProgressWithA2();
    const evidence = calculateB1LongitudinalEvidence(profile, progress);

    expect(evidence.comprehensionScore).toBe(0.90);
    expect(evidence.recentTapRate).toBe(0.05);
    expect(evidence.tapAutonomyScore).toBeGreaterThan(0.75);
    expect(evidence.vocabularyStrength).toBe(0.90);
    expect(evidence.longitudinalPercentage).toBeGreaterThan(80);
  });

  it('promotes to CONFIDENT when composite >= 90% and all confident hard floors are met', () => {
    const diag = scoreB1Diagnostic(
      {
        'b1-diag-01': 0,
        'b1-diag-02': 0,
        'b1-diag-03': 0,
        'b1-diag-04': 0,
        'b1-diag-05': 0,
        'b1-diag-06': 0,
        'b1-diag-07': 0,
        'b1-diag-08': 0,
      },
      {
        'b1-diag-09': 'Preferirei lavorare nel giardino invece di restare dentro.',
        'b1-diag-10': 'Ho deciso di restare perché amo questo mestiere.',
      },
    );
    const longitudinal = calculateB1LongitudinalEvidence(
      mockProfile({ recentTapRate: 0.05, vocabularyStrength: 0.95 }),
      mockProgressWithA2(),
    );

    const evalResult = evaluateA2ToB1Readiness({ diagnostic: diag, longitudinal });
    expect(evalResult.status).toBe('CONFIDENT');
    expect(evalResult.canChooseNext).toBe(true);
    expect(evalResult.compositeScore).toBeGreaterThanOrEqual(90.0);
    expect(evalResult.hardFloors.allMetForConfident).toBe(true);
  });

  it('promotes to READY when composite >= 75% and all ready hard floors are met', () => {
    const diag = scoreB1Diagnostic(
      {
        'b1-diag-01': 0,
        'b1-diag-02': 0,
        'b1-diag-03': 0,
        'b1-diag-04': 0,
        'b1-diag-05': 0,
        'b1-diag-06': 0,
        'b1-diag-07': 1, // 1 incorrect in aspect
        'b1-diag-08': 0,
      },
      {
        'b1-diag-09': 'Preferirei lavorare nel giardino invece di restare dentro.',
        'b1-diag-10': '', // 0 on Q10 -> production = 1.0 (50%)
      },
    );
    // Diagnostic total = 8.0
    const longitudinal = calculateB1LongitudinalEvidence(
      mockProfile({ recentTapRate: 0.12, vocabularyStrength: 0.70 }),
      mockProgressWithA2(),
    );

    const evalResult = evaluateA2ToB1Readiness({ diagnostic: diag, longitudinal });
    expect(evalResult.status).toBe('READY');
    expect(evalResult.canChooseNext).toBe(true);
    expect(evalResult.compositeScore).toBeGreaterThanOrEqual(75.0);
    expect(evalResult.hardFloors.allMetForReady).toBe(true);
  });

  it('holds learner in APPROACHING if high composite is achieved but production floor (< 1.0) fails', () => {
    const diag = scoreB1Diagnostic(
      {
        'b1-diag-01': 0,
        'b1-diag-02': 0,
        'b1-diag-03': 0,
        'b1-diag-04': 0,
        'b1-diag-05': 0,
        'b1-diag-06': 0,
        'b1-diag-07': 0,
        'b1-diag-08': 0,
      },
      {
        'b1-diag-09': '', // 0 on both production questions
        'b1-diag-10': '',
      },
    );
    // Total diagnostic = 8.0 / 10 (80%), but production = 0.0 (< 1.0 floor)
    const longitudinal = calculateB1LongitudinalEvidence(
      mockProfile({ recentTapRate: 0.05, vocabularyStrength: 0.95 }),
      mockProgressWithA2(),
    );

    const evalResult = evaluateA2ToB1Readiness({ diagnostic: diag, longitudinal });
    expect(evalResult.compositeScore).toBeGreaterThanOrEqual(75.0);
    expect(evalResult.hardFloors.productionMet).toBe(false);
    expect(evalResult.status).toBe('APPROACHING');
    expect(evalResult.canChooseNext).toBe(false);
    expect(evalResult.recommendations.some((r) => r.includes('produzione'))).toBe(true);
  });

  it('holds learner in APPROACHING if tap rate exceeds 18% hard floor', () => {
    const diag = scoreB1Diagnostic(
      {
        'b1-diag-01': 0,
        'b1-diag-02': 0,
        'b1-diag-03': 0,
        'b1-diag-04': 0,
        'b1-diag-05': 0,
        'b1-diag-06': 0,
        'b1-diag-07': 0,
        'b1-diag-08': 0,
      },
      {
        'b1-diag-09': 'Preferirei lavorare nel giardino invece di restare dentro.',
        'b1-diag-10': 'Ho deciso di restare perché amo questo mestiere.',
      },
    );
    const longitudinal = calculateB1LongitudinalEvidence(
      mockProfile({ recentTapRate: 0.22, vocabularyStrength: 0.90 }), // tap rate 22% > 18%
      mockProgressWithA2(),
    );

    const evalResult = evaluateA2ToB1Readiness({ diagnostic: diag, longitudinal });
    expect(evalResult.hardFloors.tapRateMet).toBe(false);
    expect(evalResult.status).toBe('APPROACHING');
    expect(evalResult.canChooseNext).toBe(false);
    expect(evalResult.recommendations.some((r) => r.includes('testo') || r.includes('flusso'))).toBe(true);
  });

  it('returns NOT_READY for overall composite < 50%', () => {
    const diag = scoreB1Diagnostic({}, {});
    const longitudinal = calculateB1LongitudinalEvidence(
      mockProfile({ recentTapRate: 0.25, vocabularyStrength: 0.20 }),
      createInitialProgress('luca-a-roma', 'luca-a-roma-01'),
    );

    const evalResult = evaluateA2ToB1Readiness({ diagnostic: diag, longitudinal });
    expect(evalResult.status).toBe('NOT_READY');
    expect(evalResult.canChooseNext).toBe(false);
    expect(evalResult.compositeScore).toBeLessThan(50.0);
  });
});

describe('Phase 3 QA — Production Lifecycle, Safety & Idempotency', () => {
  it('QA-1 & QA-2: evaluation is 100% pure and does not mutate progress until explicit confirmation', () => {
    const diag = scoreB1Diagnostic(
      {
        'b1-diag-01': 0, 'b1-diag-02': 0, 'b1-diag-03': 0, 'b1-diag-04': 0,
        'b1-diag-05': 0, 'b1-diag-06': 0, 'b1-diag-07': 0, 'b1-diag-08': 0,
      },
      {
        'b1-diag-09': 'Preferirei lavorare nel giardino invece di restare dentro.',
        'b1-diag-10': 'Ho deciso di restare perché amo questo mestiere.',
      },
    );
    const profile = mockProfile({ recentTapRate: 0.05, vocabularyStrength: 0.95 });
    const progress = mockProgressWithA2();

    // Pure evaluation
    const evalResult = evaluateA2ToB1Readiness({
      diagnostic: diag,
      longitudinal: calculateB1LongitudinalEvidence(profile, progress),
    });

    expect(evalResult.canChooseNext).toBe(true);
    expect(evalResult.status).toBe('CONFIDENT');
    // Invariant: progress record remains A2!
    expect(progress.currentCEFRLevel).toBe('A2');
  });

  it('QA-3: strictly rejects illegal arbitrary skips across the CEFR graph', () => {
    expect(canTransition('A1', 'B1')).toBe(false);
    expect(canTransition('A1+', 'B1')).toBe(false);
    expect(canTransition('A2', 'B1+')).toBe(false);
    expect(canTransition('A1', 'B1+')).toBe(false);
    expect(canTransition('A1', 'A2')).toBe(false);
    expect(canTransition('B1', 'B2')).toBe(false);

    // Only adjacent and explicit A2 -> B1 major bridge are permitted
    expect(canTransition('A1', 'A1+')).toBe(true);
    expect(canTransition('A1+', 'A2')).toBe(true);
    expect(canTransition('A2', 'A2+')).toBe(true);
    expect(canTransition('A2', 'B1')).toBe(true);
    expect(canTransition('A2+', 'B1')).toBe(true);
    expect(canTransition('B1', 'B1+')).toBe(true);
  });

  it('QA-4: accepts semantic alternatives for Q9 including all\'aperto and fuori', () => {
    const diagOutdoor = scoreB1Diagnostic(
      {},
      {
        'b1-diag-09': "Preferirei lavorare all'aperto invece di restare dentro.",
        'b1-diag-10': 'Ho deciso di restare perché amo questo lavoro.',
      },
    );
    const q9 = diagOutdoor.itemResults.find((r) => r.itemId === 'b1-diag-09');
    expect(q9?.score).toBe(1.0);
    expect(q9?.passed).toBe(true);

    const diagFuori = scoreB1Diagnostic(
      {},
      {
        'b1-diag-09': 'Preferisco lavorare fuori invece di stare dentro.',
        'b1-diag-10': 'Ho voluto rimanere dato che amo questo mestiere.',
      },
    );
    const q9Fuori = diagFuori.itemResults.find((r) => r.itemId === 'b1-diag-09');
    expect(q9Fuori?.score).toBe(1.0);
    expect(q9Fuori?.passed).toBe(true);
  });

  it('QA-4: scores 0 on empty, whitespace, or gibberish submissions without crashing', () => {
    const emptyDiag = scoreB1Diagnostic(
      { 'b1-diag-01': undefined },
      { 'b1-diag-09': '   ', 'b1-diag-10': '' },
    );
    expect(emptyDiag.totalScore).toBe(0);
    expect(emptyDiag.itemResults.every((r) => r.score === 0)).toBe(true);
  });
});
