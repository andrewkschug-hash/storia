import { beforeEach, describe, expect, it } from 'vitest';
import { getContentBundle, LUCA_STORY_ID } from '@/src/content';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import { ProgressService } from '@/src/progress/ProgressService';

describe('ProgressService with Level Gates (Canonical Architecture)', () => {
  let bundle: ReturnType<typeof getContentBundle>;
  let repo: MemoryReadingProgressRepository;
  let service: ProgressService;

  beforeEach(() => {
    bundle = getContentBundle(LUCA_STORY_ID);
    repo = new MemoryReadingProgressRepository();
    service = new ProgressService(repo, bundle.story, bundle.chapters);
  });

  it('initially locks Chapter 25 for a brand new learner', async () => {
    const statusCh1 = await service.getChapterStatus('luca-a-roma-01');
    const statusCh24 = await service.getChapterStatus('luca-a-roma-24');
    const statusCh25 = await service.getChapterStatus('luca-a-roma-25');

    expect(statusCh1).toBe('in_progress');
    expect(statusCh24).toBe('locked');
    expect(statusCh25).toBe('locked');
  });

  it('unlocks Chapter 25 when A2 level gate is bypassed without falsifying completedChapterIds', async () => {
    // 1. Learner passes A2 readiness test
    const progress = await service.unlockLevelGate('A2');

    // Invariant 1: records evidence and access without overwriting currentCEFRLevel
    expect(progress.unlockedLevelGates).toContain('luca-a-roma:A2');
    expect(progress.demonstratedReadinessLevels).toContain('A2');
    expect(progress.currentCEFRLevel).toBe('A1'); // NOT automatically overwritten!

    // Invariant 2: completedChapterIds remains empty
    expect(progress.completedChapterIds).toEqual([]);

    // Invariant 3 & 4: Chapter 25 is available, Chapter 26 remains locked
    const statusCh25 = await service.getChapterStatus('luca-a-roma-25');
    const statusCh26 = await service.getChapterStatus('luca-a-roma-26');
    expect(statusCh25).toBe('available');
    expect(statusCh26).toBe('locked');

    // Earlier chapters remain available for exploration
    const statusCh1 = await service.getChapterStatus('luca-a-roma-01');
    expect(statusCh1).toBe('in_progress');
  });

  it('preserves sequential progression within the level after starting at Chapter 21 (A1+)', async () => {
    // 1. Unlock A1+ Gate
    await service.unlockLevelGate('A1+');

    // 2. Learner chooses to start Chapter 21
    const started = await service.startAtChapter('luca-a-roma-21');
    expect(started.currentChapterId).toBe('luca-a-roma-21');

    const statusCh21 = await service.getChapterStatus('luca-a-roma-21');
    const statusCh22 = await service.getChapterStatus('luca-a-roma-22');
    expect(statusCh21).toBe('in_progress');
    expect(statusCh22).toBe('locked');

    // 3. Learner reads and completes Chapter 21
    await service.finishComprehensionAndComplete('luca-a-roma-21', [
      { questionId: 'q1', correct: true, attempts: 1 },
    ]);

    const updatedCh21 = await service.getChapterStatus('luca-a-roma-21');
    const updatedCh22 = await service.getChapterStatus('luca-a-roma-22');
    expect(updatedCh21).toBe('completed');
    expect(updatedCh22).toBe('in_progress'); // Sequentially unlocked!

    const saved = await service.getOrCreate();
    expect(saved.completedChapterIds).toEqual(['luca-a-roma-21']); // Only actually read chapters!
  });

  it('preserves sequential progression with batch checkpoints after starting at Chapter 25 (A2)', async () => {
    // 1. Unlock A2 Gate
    await service.unlockLevelGate('A2');

    // 2. Start at Chapter 25
    await service.startAtChapter('luca-a-roma-25');
    expect(await service.getChapterStatus('luca-a-roma-25')).toBe('in_progress');
    expect(await service.getChapterStatus('luca-a-roma-26')).toBe('locked');

    // 3. Complete Chapter 25
    await service.finishComprehensionAndComplete('luca-a-roma-25', [
      { questionId: 'q1', correct: true, attempts: 1 },
    ]);
    expect(await service.getChapterStatus('luca-a-roma-25')).toBe('completed');

    // 4. Complete batch 25 recap checkpoint
    await service.completeCheckpoint('luca-a-roma:grammar:25');
    await service.completeCheckpoint('luca-a-roma:recap:25');

    expect(await service.getChapterStatus('luca-a-roma-26')).toBe('in_progress');
  });
});
