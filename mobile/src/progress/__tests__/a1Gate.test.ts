import { describe, expect, it } from 'vitest';

import { getContentBundle, LUCA_STORY_ID } from '@/src/content';
import {
  A1_MASTERY_PASS_THRESHOLD,
  a1MasteryCheckpointId,
  a1PlusChapterBlocked,
  canTakeA1MasteryTest,
  hasPassedA1Mastery,
  hometownStoriesUnlocked,
  isLucaA1BandComplete,
  masteryScorePassed,
} from '@/src/progress/a1Gate';
import { createInitialProgress } from '@/src/progress/types';
import { scoreMasteryResults } from '@/src/content/a1MasteryTest';

describe('A1 gate', () => {
  const lucaChapters = getContentBundle(LUCA_STORY_ID).chapters;

  it('blocks A1+ chapters until mastery checkpoint', () => {
    const progress = createInitialProgress(LUCA_STORY_ID, 'luca-a-roma-01');
    expect(a1PlusChapterBlocked(21, progress, lucaChapters)).toBe(true);
    progress.completedCheckpointIds = [a1MasteryCheckpointId()];
    expect(a1PlusChapterBlocked(21, progress, lucaChapters)).toBe(false);
  });

  it('grandfathers learners who already completed chapter 21+', () => {
    const progress = createInitialProgress(LUCA_STORY_ID, 'luca-a-roma-01');
    progress.completedChapterIds = ['luca-a-roma-21'];
    expect(hasPassedA1Mastery(progress, lucaChapters)).toBe(true);
    expect(hometownStoriesUnlocked(progress, lucaChapters)).toBe(true);
  });

  it('requires full A1 band before the mastery test', () => {
    const progress = createInitialProgress(LUCA_STORY_ID, 'luca-a-roma-01');
    expect(canTakeA1MasteryTest(progress, lucaChapters)).toBe(false);
    for (let n = 1; n <= 20; n += 1) {
      progress.completedChapterIds.push(`luca-a-roma-${String(n).padStart(2, '0')}`);
    }
    expect(isLucaA1BandComplete(progress, lucaChapters)).toBe(true);
    expect(canTakeA1MasteryTest(progress, lucaChapters)).toBe(true);
  });

  it('scores mastery at 75% threshold', () => {
    expect(masteryScorePassed(A1_MASTERY_PASS_THRESHOLD)).toBe(true);
    expect(masteryScorePassed(0.74)).toBe(false);
    const passed = scoreMasteryResults(Array.from({ length: 20 }, (_, i) => ({ correct: i < 15 })));
    expect(passed.passed).toBe(true);
    const failed = scoreMasteryResults(Array.from({ length: 20 }, (_, i) => ({ correct: i < 14 })));
    expect(failed.passed).toBe(false);
  });
});
