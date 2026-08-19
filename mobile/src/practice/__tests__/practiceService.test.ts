import { describe, expect, it } from 'vitest';

import { advancePracticeSession, type PracticePrompt } from '@/src/practice/PracticeService';

function prompt(id: string): PracticePrompt {
  return {
    kind: 'lemma',
    id,
    italian: id,
    english: id,
    priority: 100,
    reasons: [],
    lastSelfAssessment: null,
    contextPrompt: null,
    contextAnswer: null,
    exampleSentence: null,
    chapterNumber: null,
  };
}

describe('advancePracticeSession', () => {
  it('removes item on got_it', () => {
    const items = [prompt('a'), prompt('b')];
    const result = advancePracticeSession(items, 0, 'got_it', {});
    expect(result.remaining).toHaveLength(1);
    expect(result.remaining[0]?.id).toBe('b');
  });

  it('moves almost to end once', () => {
    const items = [prompt('a'), prompt('b')];
    const result = advancePracticeSession(items, 0, 'almost', {});
    expect(result.remaining).toHaveLength(2);
    expect(result.remaining[0]?.id).toBe('b');
    expect(result.remaining[1]?.id).toBe('a');
  });

  it('keeps not_yet at front on first repeat', () => {
    const items = [prompt('a'), prompt('b')];
    const result = advancePracticeSession(items, 0, 'not_yet', {});
    expect(result.remaining).toHaveLength(2);
    expect(result.remaining[0]?.id).toBe('a');
    expect(result.repeated).toBe(true);
  });
});
