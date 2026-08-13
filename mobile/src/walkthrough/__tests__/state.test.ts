import { describe, expect, it } from 'vitest';

import {
  advanceWalkthrough,
  assessProduction,
  canAdvanceWalkthrough,
  chooseComprehension,
  continueFromReading,
  createWalkthroughState,
  revealProduction,
  skipToComprehension,
  tapWalkthroughToken,
} from '@/src/walkthrough/state';

describe('walkthrough isolated state', () => {
  it('starts on intro with no persisted fields', () => {
    const state = createWalkthroughState();
    expect(state).toEqual({
      step: 'intro',
      tappedToken: null,
      comprehensionChoice: null,
      productionRevealed: false,
      productionAssessment: null,
    });
  });

  it('advances intro → reading, then requires a tap before comprehension', () => {
    let state = createWalkthroughState();
    expect(canAdvanceWalkthrough(state)).toBe(true);
    state = advanceWalkthrough(state);
    expect(state.step).toBe('reading');
    expect(canAdvanceWalkthrough(state)).toBe(false);
    expect(continueFromReading(state).step).toBe('reading');

    state = tapWalkthroughToken(state, 'entra');
    expect(state.step).toBe('dictionary');
    expect(state.tappedToken).toBe('entra');
    state = continueFromReading(state);
    expect(state.step).toBe('comprehension');
  });

  it('strips punctuation when tapping a token', () => {
    const state = tapWalkthroughToken(
      { ...createWalkthroughState(), step: 'reading' },
      'bar.',
    );
    expect(state.tappedToken).toBe('bar');
  });

  it('records comprehension without mutating other fields', () => {
    const base = { ...createWalkthroughState(), step: 'comprehension' as const };
    const next = chooseComprehension(base, 0);
    expect(next.comprehensionChoice).toBe(0);
    expect(next.step).toBe('comprehension');
    expect(canAdvanceWalkthrough(next)).toBe(true);
    expect(advanceWalkthrough(next).step).toBe('production');
  });

  it('requires reveal before production self-assessment', () => {
    let state = { ...createWalkthroughState(), step: 'production' as const };
    expect(canAdvanceWalkthrough(state)).toBe(false);
    state = assessProduction(state, 'got_it');
    expect(state.productionAssessment).toBeNull();
    state = revealProduction(state);
    expect(state.productionRevealed).toBe(true);
    state = assessProduction(state, 'almost');
    expect(state.productionAssessment).toBe('almost');
    expect(advanceWalkthrough(state).step).toBe('complete');
  });

  it('allows skipping tap to keep the walkthrough moving', () => {
    const reading = { ...createWalkthroughState(), step: 'reading' as const };
    expect(skipToComprehension(reading).step).toBe('comprehension');
  });

  it('does not expose progress service fields', () => {
    expect(Object.keys(createWalkthroughState()).sort()).toEqual([
      'comprehensionChoice',
      'productionAssessment',
      'productionRevealed',
      'step',
      'tappedToken',
    ]);
  });
});
