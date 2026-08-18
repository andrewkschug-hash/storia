import { describe, expect, it } from 'vitest';

import { getContentBundle } from '@/src/content';
import { ReviewService } from '@/src/review/ReviewService';
import { createLemmaEncounter } from '@/src/vocabulary/normalize';
import { createEmptyVocabularyState } from '@/src/vocabulary/types';

describe('batch word recap', () => {
  const bundle = getContentBundle();
  const service = new ReviewService(bundle);

  it('never returns an empty session even with no vocabulary history', () => {
    const session = service.createBatchSession(createEmptyVocabularyState(), bundle, 1, 5);
    expect(session.items.length).toBe(5);
    for (const item of session.items) {
      expect(item.choices.length).toBeGreaterThanOrEqual(2);
      expect(item.italian.length).toBeGreaterThan(0);
    }
  });

  it('puts struggled words ahead of backfill', () => {
    const state = createEmptyVocabularyState();
    const weak = createLemmaEncounter('biglietto');
    weak.encounterCount = 4;
    weak.tapCount = 5;
    weak.incorrectReviewCount = 3;
    weak.status = 'learning';
    weak.familiarityScore = 0.1;
    state.lemmas.biglietto = weak;

    const session = service.createBatchSession(state, bundle, 11, 15);
    expect(session.items[0]?.id).toBe('biglietto');
    expect(session.items.length).toBe(5);
  });

  it('describes the recap even when nothing was weak', () => {
    const session = service.createBatchSession(createEmptyVocabularyState(), bundle, 1, 5);
    const copy = service.batchRecapCopy(1, 5, session);
    expect(copy.readyCount).toBeGreaterThan(0);
    expect(copy.detail.toLowerCase()).not.toMatch(/nothing weak/);
  });
});
