import { describe, expect, it } from 'vitest';

import { createLemmaEncounter } from '@/src/vocabulary/normalize';
import { scorePracticeItem } from '@/src/vocabulary/practicePriority';
import { applySelfAssessment } from '@/src/vocabulary/selfAssessment';

describe('practicePriority', () => {
  const now = new Date('2026-08-19T12:00:00.000Z');

  it('prioritizes repeated not_yet above single almost', () => {
    const notYet = createLemmaEncounter('vendere');
    notYet.encounterCount = 4;
    applySelfAssessment(notYet, 'not_yet', now);
    applySelfAssessment(notYet, 'not_yet', now);

    const almost = createLemmaEncounter('affitto');
    almost.encounterCount = 4;
    applySelfAssessment(almost, 'almost', now);

    const notYetScore = scorePracticeItem(notYet, undefined, undefined, now);
    const almostScore = scorePracticeItem(almost, undefined, undefined, now);
    expect(notYetScore.priority).toBeGreaterThan(almostScore.priority);
  });

  it('recent got_it lowers practice priority', () => {
    const row = createLemmaEncounter('casa');
    row.encounterCount = 5;
    row.status = 'learning';
    applySelfAssessment(row, 'got_it', now);
    const scored = scorePracticeItem(row, undefined, undefined, now);
    expect(scored.reasons).toContain('recent-got-it');
  });
});
