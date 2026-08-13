import { describe, expect, it } from 'vitest';

import { WALKTHROUGH_READING, getWalkthroughGloss, normalizeWalkthroughToken } from '@/src/walkthrough/content';

describe('walkthrough glosses', () => {
  it('covers every reading token', () => {
    const tokens = WALKTHROUGH_READING.flatMap((sentence) => sentence.tokens);
    for (const token of tokens) {
      expect(getWalkthroughGloss(token), `missing gloss for ${token}`).not.toBeNull();
    }
  });

  it('strips punctuation before lookup', () => {
    expect(normalizeWalkthroughToken('bar.')).toBe('bar');
    expect(getWalkthroughGloss('intorno.')?.surface).toBe('intorno');
    expect(getWalkthroughGloss('entra')?.gloss).toMatch(/enter/i);
  });
});
