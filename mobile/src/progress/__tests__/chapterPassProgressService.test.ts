import { afterEach, describe, expect, it } from 'vitest';

import { LUCA_STORY_ID, getContentBundle } from '@/src/content';
import {
  __resetProgressService,
  __setProgressRepository,
  getProgressService,
} from '@/src/progress';
import { isListenPassComplete, isReadPassComplete } from '@/src/progress/chapterPass';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';

afterEach(() => {
  __setProgressRepository(null);
  __resetProgressService();
});

describe('ProgressService chapter passes', () => {
  it('marks read and listen passes independently', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const service = getProgressService(LUCA_STORY_ID);
    const chapterId = getContentBundle(LUCA_STORY_ID).story.chapters[0]?.id;
    if (!chapterId) throw new Error('Missing chapter');

    const afterRead = await service.markReadPassComplete(chapterId);
    const passes = afterRead.passesByChapter?.[chapterId] ?? {};
    expect(isReadPassComplete(passes)).toBe(true);
    expect(isListenPassComplete(passes)).toBe(false);

    const afterListen = await service.markListenPassComplete(chapterId);
    const finalPasses = afterListen.passesByChapter?.[chapterId] ?? {};
    expect(isListenPassComplete(finalPasses)).toBe(true);
  });

  it('preserves pass state across service reload', async () => {
    const repo = new MemoryReadingProgressRepository();
    __setProgressRepository(repo);
    const chapterId = getContentBundle(LUCA_STORY_ID).story.chapters[0]?.id;
    if (!chapterId) throw new Error('Missing chapter');

    await getProgressService(LUCA_STORY_ID).markReadPassComplete(chapterId);
    __resetProgressService();

    const reloaded = await getProgressService(LUCA_STORY_ID).getOrCreate();
    expect(isReadPassComplete(reloaded.passesByChapter?.[chapterId] ?? {})).toBe(true);
  });
});
