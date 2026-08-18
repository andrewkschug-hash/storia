import { afterEach, describe, expect, it } from 'vitest';

import {
  LUCA_STORY_ID,
  __resetContentCache,
  findStoryIdForChapter,
  getAvailableStories,
  getChapter,
  getContentBundle,
  journeyOrder,
} from '@/src/content';
import { getProductionExercisesForChapter } from '@/src/content/productionExercises';
import {
  evaluateLearnerCrossStoryA1,
  evaluateCrossStoryA1Readiness,
  collectA1ReadinessSignals,
} from '@/src/cefr';
import type { CatalogStory } from '@/src/content/schemas';
import {
  getContinueReadingTarget,
  isStoryFullyComplete,
} from '@/src/progress/continueReading';
import { __resetProgressService, __setProgressRepository, getProgressService } from '@/src/progress';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import { completeBatchCheckpointsAfterChapter } from '@/src/progress/testHelpers';
import { createInitialProgress } from '@/src/progress/types';
import { skipProduction } from '@/src/production/flow';
import { findSentenceById } from '@/src/vocabulary/storyExamples';
import { VocabularyService } from '@/src/vocabulary/VocabularyService';
import { MemoryUserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';

afterEach(() => {
  __resetContentCache();
  __resetProgressService();
  __setProgressRepository(null);
});

async function completeAllChapters(storyId: string, score = 1) {
  const service = getProgressService(storyId);
  const bundle = getContentBundle(storyId);
  for (const summary of bundle.story.chapters) {
    const chapter = bundle.chapters.get(summary.id)!;
    await service.openChapter(chapter.id);
    const answers = chapter.questions.map((question) => ({
      questionId: question.id,
      correct: score >= 2 / 3,
      attempts: 1,
    }));
    await service.finishComprehensionAndComplete(chapter.id, answers);
    await completeBatchCheckpointsAfterChapter(service, storyId, chapter.number);
  }
}

describe('Phase 12O story identity', () => {
  it('keeps pre-Rome and Luca chapter identities distinct', () => {
    expect(findStoryIdForChapter('luca-prima-di-roma-01-01')).toBe('luca-prima-di-roma-01');
    expect(findStoryIdForChapter('luca-a-roma-01')).toBe(LUCA_STORY_ID);
    expect(getChapter('luca-prima-di-roma-01-01')?.id).not.toBe(getChapter('luca-a-roma-01')?.id);
    expect(getProductionExercisesForChapter('luca-prima-di-roma-01-01', 'luca-prima-di-roma-01').every((row) => row.storyId === 'luca-prima-di-roma-01')).toBe(true);
    expect(getProductionExercisesForChapter('luca-a-roma-01', LUCA_STORY_ID).every((row) => row.storyId === LUCA_STORY_ID)).toBe(true);
    expect(getProductionExercisesForChapter('luca-a-roma-01', 'luca-prima-di-roma-01')).toEqual([]);
  });

  it('isolates progress between pre-Rome and Luca', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    await completeAllChapters('luca-prima-di-roma-01');
    const luca = await getProgressService(LUCA_STORY_ID).getOrCreate();
    const pre = await getProgressService('luca-prima-di-roma-01').getOrCreate();
    expect(pre.completedChapterIds).toHaveLength(6);
    expect(luca.completedChapterIds).toEqual([]);
    expect(pre.storyId).toBe('luca-prima-di-roma-01');
    expect(luca.storyId).toBe(LUCA_STORY_ID);
  });

  it('scopes review sentence lookup by chapterId so s01 cannot collide', () => {
    const luca = getContentBundle(LUCA_STORY_ID);
    const ch1 = findSentenceById(luca, 's01', 'luca-a-roma-01');
    const ch2 = findSentenceById(luca, 's01', 'luca-a-roma-02');
    expect(ch1?.chapter.id).toBe('luca-a-roma-01');
    expect(ch2?.chapter.id).toBe('luca-a-roma-02');
    expect(ch1?.sentence.text).not.toBe(ch2?.sentence.text);
    expect(findSentenceById(luca, 's01', 'luca-prima-di-roma-01-01')).toBeNull();
  });
});

describe('Phase 12O continue reading', () => {
  it('advances to the next available story after one story is finished', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    await completeAllChapters('luca-prima-di-roma-01');
    const pre = await getProgressService('luca-prima-di-roma-01').getOrCreate();
    expect(isStoryFullyComplete(pre, 6)).toBe(true);

    const target = await getContinueReadingTarget();
    expect(target?.storyId).toBe('luca-prima-di-roma-02');
    expect(target?.chapterId).toBe('luca-prima-di-roma-02-01');
    expect(target?.isStart).toBe(true);
  });

  it('still continues inside an unfinished story', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const s3 = getProgressService('luca-prima-di-roma-03');
    await s3.openChapter('luca-prima-di-roma-03-01');
    const target = await getContinueReadingTarget();
    expect(target?.storyId).toBe('luca-prima-di-roma-03');
    expect(target?.chapterId).toBe('luca-prima-di-roma-03-01');
    expect(target?.isStart).toBe(false);
  });
});

describe('Phase 12O production reinforcement', () => {
  it('lets comprehension complete when production is skipped or missing', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const service = getProgressService('luca-prima-di-roma-01');
    const chapter = getContentBundle('luca-prima-di-roma-01').chapters.get('luca-prima-di-roma-01-01')!;
    await service.openChapter(chapter.id);
    expect(skipProduction().action).toBe('complete_chapter');

    await service.recordProduction(chapter.id, {
      skipped: true,
      attempts: [{ exerciseId: 'luca-prima-di-roma-01-ch01-prod-01', assessment: 'skipped' }],
    });
    const answers = chapter.questions.map((question) => ({
      questionId: question.id,
      correct: true,
      attempts: 1,
    }));
    const progress = await service.finishComprehensionAndComplete(chapter.id, answers);
    expect(progress.completedChapterIds).toContain(chapter.id);
    expect(progress.productionByChapter?.[chapter.id]?.skipped).toBe(true);
    expect(await service.getChapterStatus('luca-prima-di-roma-01-02')).not.toBe('locked');
  });

  it('records correct production without marking vocabulary mastered', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const bundle = getContentBundle('luca-prima-di-roma-01');
    const chapter = bundle.chapters.get('luca-prima-di-roma-01-01')!;
    const service = getProgressService('luca-prima-di-roma-01');
    await service.openChapter(chapter.id);
    await service.recordProduction(chapter.id, {
      skipped: false,
      attempts: [
        { exerciseId: 'luca-prima-di-roma-01-ch01-prod-01', assessment: 'got_it' },
        { exerciseId: 'luca-prima-di-roma-01-ch01-prod-02', assessment: 'got_it' },
      ],
    });
    const answers = chapter.questions.map((question) => ({
      questionId: question.id,
      correct: true,
      attempts: 1,
    }));
    const progress = await service.finishComprehensionAndComplete(chapter.id, answers);
    expect(progress.productionByChapter?.[chapter.id]?.skipped).toBe(false);
    expect(progress.productionByChapter?.[chapter.id]?.attempts[0]?.assessment).toBe('got_it');

    const vocab = new VocabularyService(new MemoryUserVocabularyRepository(), bundle);
    const sentence = chapter.paragraphs[0]!.sentences[0]!;
    const before = (await vocab.getState()).lemmas[sentence.tokens[0]!.lemmaId];
    await vocab.recordProductionSuccess({
      lemmaIds: sentence.tokens.map((token) => token.lemmaId),
      chapterId: chapter.id,
      sentenceId: sentence.id,
    });
    const after = (await vocab.getState()).lemmas[sentence.tokens[0]!.lemmaId];
    expect(after.encounterCount).toBeGreaterThan(before?.encounterCount ?? 0);
    expect(after.correctReviewCount).toBe(0);
    expect(after.status).not.toBe('mastered');
  });

  it('records incorrect production without mastery and still completes', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const service = getProgressService('luca-prima-di-roma-01');
    const chapter = getContentBundle('luca-prima-di-roma-01').chapters.get('luca-prima-di-roma-01-01')!;
    await service.openChapter(chapter.id);
    await service.recordProduction(chapter.id, {
      skipped: false,
      attempts: [{ exerciseId: 'luca-prima-di-roma-01-ch01-prod-01', assessment: 'not_yet' }],
    });
    const answers = chapter.questions.map((question) => ({
      questionId: question.id,
      correct: true,
      attempts: 1,
    }));
    const progress = await service.finishComprehensionAndComplete(chapter.id, answers);
    expect(progress.completedChapterIds).toContain(chapter.id);
    expect(progress.productionByChapter?.[chapter.id]?.attempts[0]?.assessment).toBe('not_yet');
  });

  it('leaving production halfway does not complete the chapter', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const service = getProgressService('luca-prima-di-roma-01');
    const chapter = getContentBundle('luca-prima-di-roma-01').chapters.get('luca-prima-di-roma-01-01')!;
    await service.openChapter(chapter.id);
    const progress = await service.getOrCreate();
    expect(progress.completedChapterIds).toEqual([]);
    expect(progress.comprehensionByChapter[chapter.id]).toBeUndefined();
    expect(progress.productionByChapter?.[chapter.id]).toBeUndefined();
  });
});

describe('Phase 12O readiness and extensibility', () => {
  it('does not treat Luca A1 alone or one pre-Rome story as READY', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const luca = getProgressService(LUCA_STORY_ID);
    const lucaBundle = getContentBundle(LUCA_STORY_ID);
    for (const summary of lucaBundle.story.chapters.filter((chapter) => chapter.number <= 20)) {
      const chapter = lucaBundle.chapters.get(summary.id)!;
      await luca.openChapter(chapter.id);
      await luca.finishComprehensionAndComplete(
        chapter.id,
        chapter.questions.map((question) => ({
          questionId: question.id,
          correct: true,
          attempts: 1,
        })),
      );
      await completeBatchCheckpointsAfterChapter(luca, LUCA_STORY_ID, chapter.number);
    }
    const lucaOnly = await evaluateLearnerCrossStoryA1();
    expect(lucaOnly.status === 'READY' || lucaOnly.status === 'CONFIDENT').toBe(false);

    __setProgressRepository(new MemoryReadingProgressRepository());
    await completeAllChapters('luca-prima-di-roma-01');
    const oneStory = await evaluateLearnerCrossStoryA1();
    expect(oneStory.status === 'READY' || oneStory.status === 'CONFIDENT').toBe(false);
  });

  it('lets a future A1 catalog story join readiness without changing Luca or pre-Rome', () => {
    const mystery: CatalogStory = {
      id: 'mystery-night',
      title: 'Mystery night',
      titleIt: 'Notte misteriosa',
      description: 'Future A1 story',
      cefrLevel: 'A1',
      narrativeArc: 'other-a1',
      narrativeOrder: 50,
      status: 'available',
      chapterCount: 4,
      contentPath: 'stories/mystery-night',
    };
    const current = collectA1ReadinessSignals({
      stories: getAvailableStories().filter((story) => story.cefrLevel === 'A1' || story.cefrLevels?.includes('A1')),
      progressByStoryId: {},
      a1ChapterIdsByStory: Object.fromEntries(
        getAvailableStories()
          .filter((story) => story.cefrLevel === 'A1' || story.cefrLevels?.includes('A1'))
          .map((story) => [story.id, getContentBundle(story.id).story.chapters.map((chapter) => chapter.id)]),
      ),
    });
    const expanded = collectA1ReadinessSignals({
      stories: [
        ...getAvailableStories().filter((story) => story.cefrLevel === 'A1' || story.cefrLevels?.includes('A1')),
        mystery,
      ],
      progressByStoryId: {
        'mystery-night': {
          ...createInitialProgress('mystery-night', 'm1'),
          completedChapterIds: ['m1', 'm2', 'm3', 'm4'],
          comprehensionByChapter: Object.fromEntries(
            ['m1', 'm2', 'm3', 'm4'].map((id) => [
              id,
              {
                attempted: 3,
                correct: 3,
                incorrect: 0,
                score: 1,
                completedAt: '2026-08-13T12:00:00.000Z',
                answers: [],
              },
            ]),
          ),
        },
      },
      a1ChapterIdsByStory: {
        ...Object.fromEntries(
          getAvailableStories()
            .filter((story) => story.cefrLevel === 'A1' || story.cefrLevels?.includes('A1'))
            .map((story) => [story.id, getContentBundle(story.id).story.chapters.map((chapter) => chapter.id)]),
        ),
        'mystery-night': ['m1', 'm2', 'm3', 'm4'],
      },
      domainsByStoryAndChapter: {
        'mystery-night': {
          m1: { primaryDomain: 'introductions' },
          m2: { primaryDomain: 'social' },
          m3: { primaryDomain: 'likes' },
          m4: { primaryDomain: 'places' },
        },
      },
    });
    const currentEval = evaluateCrossStoryA1Readiness(current);
    const expandedEval = evaluateCrossStoryA1Readiness(expanded);
    expect(expandedEval.metrics.totalA1Chapters).toBe(currentEval.metrics.totalA1Chapters + 4);
    expect(expanded.some((signal) => signal.storyId === 'mystery-night')).toBe(true);
    expect(getContentBundle(LUCA_STORY_ID).chapters.size).toBe(40);
    expect(getContentBundle('luca-prima-di-roma-01').chapters.size).toBe(6);
  });

  it('orders available stories from the catalog rather than a hardcoded five-story list', () => {
    expect(journeyOrder().map((story) => story.id)).toEqual(getAvailableStories().map((story) => story.id));
    expect(journeyOrder().some((story) => story.id === LUCA_STORY_ID)).toBe(true);
    expect(journeyOrder().filter((story) => story.narrativeArc === 'luca-prima-di-roma')).toHaveLength(5);
  });
});
