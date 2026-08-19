import { afterEach, describe, expect, it } from 'vitest';

import { LUCA_STORY_ID, getContentBundle } from '@/src/content';
import {
  grammarCheckpointId,
  isFirstChapterAfterBatch,
  recapCheckpointId,
} from '@/src/content/storyPath';
import { __resetProgressService, __setProgressRepository, getProgressService } from '@/src/progress';
import { getContinueReadingTarget, homeContinuePresentation } from '@/src/progress/continueReading';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';

function chapterIdByNumber(number: number): string {
  const bundle = getContentBundle(LUCA_STORY_ID);
  const chapter = bundle.story.chapters.find((row) => row.number === number);
  if (!chapter) throw new Error(`Missing chapter ${number}`);
  return chapter.id;
}

async function completeThrough(chapterNumber: number): Promise<void> {
  const service = getProgressService(LUCA_STORY_ID);
  const bundle = getContentBundle(LUCA_STORY_ID);
  for (let number = 1; number <= chapterNumber; number += 1) {
    if (isFirstChapterAfterBatch(number)) {
      const batchEnd = number - 1;
      await service.completeCheckpoint(grammarCheckpointId(LUCA_STORY_ID, batchEnd));
      await service.completeCheckpoint(recapCheckpointId(LUCA_STORY_ID, batchEnd));
    }
    const chapter = bundle.chapters.get(chapterIdByNumber(number));
    if (!chapter) throw new Error(`Missing chapter ${number}`);
    const answers = chapter.questions.map((question) => ({
      questionId: question.id,
      correct: true,
      attempts: 1,
    }));
    await service.finishComprehensionAndComplete(chapter.id, answers);
  }
}

afterEach(() => {
  __setProgressRepository(null);
  __resetProgressService();
});

describe('continue reading batch-boundary routing', () => {
  const boundaries = [
    { pre: 4, end: 5, post: 6, gated: true },
    { pre: 9, end: 10, post: 11, gated: true },
    { pre: 14, end: 15, post: 16, gated: true },
    { pre: 19, end: 20, post: 21, gated: true },
    { pre: 23, end: 24, post: 25, gated: false },
  ] as const;

  it.each(boundaries)(
    'routes correctly across %s/%s boundary',
    async ({ pre, end, post, gated }) => {
      __setProgressRepository(new MemoryReadingProgressRepository());
      __resetProgressService();

      await completeThrough(pre);
      let target = await getContinueReadingTarget();
      expect(target?.nextAction).toEqual({ kind: 'chapter', chapterId: chapterIdByNumber(end) });
      expect(target?.chapterId).toBe(chapterIdByNumber(end));

      await completeThrough(end);
      target = await getContinueReadingTarget();
      if (!gated) {
        expect(target?.nextAction).toEqual({ kind: 'chapter', chapterId: chapterIdByNumber(post) });
        expect(target?.chapterId).toBe(chapterIdByNumber(post));
        return;
      }
      expect(target?.nextAction).toEqual({ kind: 'grammar', batchEnd: end });
      expect(target?.chapterId).toBe(chapterIdByNumber(end));

      const service = getProgressService(LUCA_STORY_ID);
      await service.completeCheckpoint(grammarCheckpointId(LUCA_STORY_ID, end));
      target = await getContinueReadingTarget();
      expect(target?.nextAction).toEqual({ kind: 'recap', batchEnd: end });
      expect(target?.chapterId).toBe(chapterIdByNumber(end));

      await service.completeCheckpoint(recapCheckpointId(LUCA_STORY_ID, end));
      target = await getContinueReadingTarget();
      expect(target?.nextAction).toEqual({ kind: 'chapter', chapterId: chapterIdByNumber(post) });
      expect(target?.chapterId).toBe(chapterIdByNumber(post));
    },
  );

  it('shows grammar presentation instead of the locked next chapter', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    __resetProgressService();

    await completeThrough(5);
    const target = await getContinueReadingTarget();
    if (!target) throw new Error('Missing continue target');
    const bundle = getContentBundle(LUCA_STORY_ID);
    const chapter = bundle.chapters.get(chapterIdByNumber(5));
    if (!chapter) throw new Error('Missing chapter 5');

    const presentation = homeContinuePresentation(target, chapter, 40, 5);
    expect(presentation.title).toBe('Grammar note');
    expect(presentation.subtitle).toBe('Chapters 1–5');
    expect(presentation.buttonLabel).toBe('Continue');
  });
});
