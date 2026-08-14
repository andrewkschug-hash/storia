import { describe, expect, it } from 'vitest';

import { chapterCompleteView } from '@/src/progress/chapterComplete';

describe('chapter complete copy', () => {
  it('points to the next chapter after finishing one', () => {
    expect(chapterCompleteView(1, 2)).toEqual({
      headline: 'Chapter 1 completed!',
      detail: 'Continue to Chapter 2.',
      button: 'Continue to Chapter 2',
    });
  });

  it('sends the learner home after the last chapter', () => {
    expect(chapterCompleteView(6, null)).toEqual({
      headline: 'Chapter 6 completed!',
      detail: 'You’ve finished this story.',
      button: 'Back to home',
    });
  });
});
