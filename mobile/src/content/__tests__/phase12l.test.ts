import { afterEach, describe, expect, it } from 'vitest';

import {
  ELENA_STORY_ID,
  LUCA_STORY_ID,
  PRE_ROME_ARC_ID,
  __resetContentCache,
  buildLearnerJourney,
  findStoryIdForChapter,
  getCatalogStory,
  getChapter,
  getContentBundle,
  getStoriesInArc,
  journeyOrder,
} from '@/src/content';
import { readerHref } from '@/src/content/storyHrefs';
import { validateStoryCatalog } from '@/src/content/validateCatalog';
import { getContinueReadingTarget } from '@/src/progress/continueReading';
import { __resetProgressService, __setProgressRepository, getProgressService } from '@/src/progress';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';

const PRE_ROME = [
  { id: 'luca-prima-di-roma-01', chapters: 6, titleIt: 'Luca si presenta' },
  { id: 'luca-prima-di-roma-02', chapters: 7, titleIt: 'Una giornata di Luca' },
  { id: 'luca-prima-di-roma-03', chapters: 6, titleIt: 'Al supermercato' },
  { id: 'luca-prima-di-roma-04', chapters: 7, titleIt: 'In paese' },
  { id: 'luca-prima-di-roma-05', chapters: 6, titleIt: 'La festa di Luca' },
] as const;

afterEach(() => {
  __resetContentCache();
  __resetProgressService();
  __setProgressRepository(null);
});

describe('Phase 12L pre-Rome wiring', () => {
  it('marks the five stories available with correct chapter counts', () => {
    const catalog = validateStoryCatalog();
    expect(catalog.ok).toBe(true);
    expect(catalog.draft).toEqual([ELENA_STORY_ID]);
    expect(catalog.planned).toEqual([]);
    expect(catalog.available).toEqual(expect.arrayContaining([
      LUCA_STORY_ID,
      ...PRE_ROME.map((row) => row.id),
    ]));
    for (const row of PRE_ROME) {
      const story = getCatalogStory(row.id)!;
      expect(story.status).toBe('available');
      expect(story.chapterCount).toBe(row.chapters);
      expect(story.titleIt).toBe(row.titleIt);
    }
    expect(getCatalogStory(PRE_ROME_ARC_ID)).toBeUndefined();
    expect(getStoriesInArc(PRE_ROME_ARC_ID)).toHaveLength(5);
  });

  it('loads all five bundles independently without touching Luca or Elena', () => {
    for (const row of PRE_ROME) {
      const bundle = getContentBundle(row.id);
      expect(bundle.story.id).toBe(row.id);
      expect(bundle.chapters.size).toBe(row.chapters);
      expect(bundle.chapters.has('luca-a-roma-01')).toBe(false);
    }
    const luca = getContentBundle(LUCA_STORY_ID);
    expect(luca.chapters.size).toBe(40);
    expect(luca.chapters.get('luca-a-roma-01')?.titleIt).toBe('Arrivo');
    expect(getCatalogStory(ELENA_STORY_ID)?.status).toBe('draft');
    expect(() => getContentBundle(ELENA_STORY_ID)).toThrow(/draft/);
  });

  it('resolves chapters by storyId + chapterId, never chapter number alone', () => {
    const preId = 'luca-prima-di-roma-01-01';
    const lucaId = 'luca-a-roma-01';
    expect(findStoryIdForChapter(preId)).toBe('luca-prima-di-roma-01');
    expect(findStoryIdForChapter(lucaId)).toBe(LUCA_STORY_ID);
    expect(getChapter(preId, 'luca-prima-di-roma-01')?.storyId).toBe('luca-prima-di-roma-01');
    expect(getChapter(lucaId, LUCA_STORY_ID)?.number).toBe(1);
    expect(getChapter(preId)?.id).toBe(preId);
    expect(String(readerHref('luca-prima-di-roma-02', 'luca-prima-di-roma-02-01'))).toContain(
      'story=luca-prima-di-roma-02',
    );
  });

  it('keeps stories independently selectable with recommended order only', async () => {
    const repo = new MemoryReadingProgressRepository();
    __setProgressRepository(repo);
    const s2 = getProgressService('luca-prima-di-roma-02');
    expect(await s2.getChapterStatus('luca-prima-di-roma-02-01')).not.toBe('locked');

    const order = journeyOrder().map((story) => story.id);
    expect(order).toEqual([
      'luca-prima-di-roma-01',
      'luca-prima-di-roma-02',
      'luca-prima-di-roma-03',
      'luca-prima-di-roma-04',
      'luca-prima-di-roma-05',
      LUCA_STORY_ID,
      'la-casa-delle-finestre',
    ]);

    const journey = buildLearnerJourney();
    expect(journey[0].groups[0].chapterRange?.storyId).toBe(LUCA_STORY_ID);
    expect(journey[0].groups[1].narrativeArc.id).toBe(PRE_ROME_ARC_ID);
    expect(journey[0].groups[1].stories.map((story) => story.titleIt)).toEqual(
      PRE_ROME.map((row) => row.titleIt),
    );
  });

  it('continues from the most recently opened available story', async () => {
    const repo = new MemoryReadingProgressRepository();
    __setProgressRepository(repo);
    const s3 = getProgressService('luca-prima-di-roma-03');
    await s3.openChapter('luca-prima-di-roma-03-01');
    const luca = getProgressService(LUCA_STORY_ID);
    await luca.openChapter('luca-a-roma-01');

    const target = await getContinueReadingTarget();
    expect(target?.storyId).toBe(LUCA_STORY_ID);
    expect(target?.isStart).toBe(false);
  });
});
