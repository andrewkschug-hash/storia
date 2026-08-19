import { describe, expect, it } from 'vitest';

import {
  applySelfAssessment,
  nextDueAtForAssessment,
} from '@/src/vocabulary/selfAssessment';
import { computeFamiliarity } from '@/src/vocabulary/familiarity';
import { createLemmaEncounter } from '@/src/vocabulary/normalize';

describe('selfAssessment', () => {
  const now = new Date('2026-08-19T12:00:00.000Z');

  it('got_it increments correctReviewCount and advances interval', () => {
    const row = createLemmaEncounter('vendere');
    applySelfAssessment(row, 'got_it', now);
    expect(row.correctReviewCount).toBe(1);
    expect(row.almostReviewCount).toBe(0);
    expect(row.incorrectReviewCount).toBe(0);
    expect(row.lastSelfAssessment).toBe('got_it');
    expect(row.intervalIndex).toBe(0);
  });

  it('almost increments almostReviewCount and holds interval index', () => {
    const row = createLemmaEncounter('affitto');
    row.intervalIndex = 2;
    applySelfAssessment(row, 'almost', now);
    expect(row.almostReviewCount).toBe(1);
    expect(row.incorrectReviewCount).toBe(0);
    expect(row.intervalIndex).toBe(2);
    expect(row.lastSelfAssessment).toBe('almost');
  });

  it('not_yet increments incorrectReviewCount and regresses interval', () => {
    const row = createLemmaEncounter('affitto');
    row.intervalIndex = 2;
    applySelfAssessment(row, 'not_yet', now);
    expect(row.incorrectReviewCount).toBe(1);
    expect(row.almostReviewCount).toBe(0);
    expect(row.intervalIndex).toBe(1);
    expect(row.lastSelfAssessment).toBe('not_yet');
  });

  it('almost penalty is lighter than not_yet in familiarity', () => {
    const almostRow = createLemmaEncounter('a');
    almostRow.encounterCount = 5;
    almostRow.almostReviewCount = 1;
    const notYetRow = createLemmaEncounter('b');
    notYetRow.encounterCount = 5;
    notYetRow.incorrectReviewCount = 1;

    const almostScore = computeFamiliarity({
      encounterCount: almostRow.encounterCount,
      chaptersEncountered: 1,
      tapCount: 0,
      saveCount: 0,
      saved: false,
      correctReviewCount: 0,
      incorrectReviewCount: 0,
      almostReviewCount: 1,
      lastEncounteredAt: now.toISOString(),
      lastReviewedAt: now.toISOString(),
    }, now).score;

    const notYetScore = computeFamiliarity({
      encounterCount: notYetRow.encounterCount,
      chaptersEncountered: 1,
      tapCount: 0,
      saveCount: 0,
      saved: false,
      correctReviewCount: 0,
      incorrectReviewCount: 1,
      almostReviewCount: 0,
      lastEncounteredAt: now.toISOString(),
      lastReviewedAt: now.toISOString(),
    }, now).score;

    expect(almostScore).toBeGreaterThan(notYetScore);
  });

  it('got_it after not_yet improves familiarity', () => {
    const row = createLemmaEncounter('vendere');
    row.encounterCount = 6;
    applySelfAssessment(row, 'not_yet', now);
    const afterNotYet = row.familiarityScore;
    applySelfAssessment(row, 'got_it', now);
    expect(row.familiarityScore).toBeGreaterThan(afterNotYet);
  });

  it('nextDueAtForAssessment holds interval on almost', () => {
    const spaced = nextDueAtForAssessment('almost', 2, now);
    expect(spaced.intervalIndex).toBe(2);
  });
});
