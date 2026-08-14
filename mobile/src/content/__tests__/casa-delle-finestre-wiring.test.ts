import { afterEach, describe, expect, it } from 'vitest';

import { insertExtraStoryGroups } from '@/src/components/storiesLevelInsert';
import {
  CASA_STORY_ID,
  LUCA_STORY_ID,
  __resetContentCache,
  getCatalogStory,
  getChapter,
  getContentBundle,
} from '@/src/content';
import { validateStoryCatalog } from '@/src/content/validateCatalog';
import { __resetProgressService, __setProgressRepository, getProgressService, peekProgress } from '@/src/progress';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';

afterEach(() => {
  __resetContentCache();
  __resetProgressService();
  __setProgressRepository(null);
});

describe('La casa delle finestre wiring', () => {
  it('is available with 24 chapters and does not alter Luca', () => {
    const catalog = validateStoryCatalog();
    expect(catalog.ok).toBe(true);
    expect(catalog.available).toContain(CASA_STORY_ID);
    const story = getCatalogStory(CASA_STORY_ID)!;
    expect(story.status).toBe('available');
    expect(story.chapterCount).toBe(24);
    expect(story.cefrLevel).toBe('A2+');
    expect(story.protagonistId).toBe('irene-colombo');

    const bundle = getContentBundle(CASA_STORY_ID);
    expect(bundle.chapters.size).toBe(24);
    expect(bundle.chapters.has('luca-a-roma-01')).toBe(false);
    expect(bundle.story.chapters[0].id).toBe('la-casa-delle-finestre-01');
    expect(bundle.chapters.get('la-casa-delle-finestre-24')?.titleIt).toBe("L'archivio");
    expect(getChapter('la-casa-delle-finestre-01', CASA_STORY_ID)?.paragraphs[0].sentences[0].english).toBeTruthy();
    expect(bundle.entitySource?.storyLocalCharacterIds).toContain('irene-colombo');
    expect(getContentBundle(LUCA_STORY_ID).chapters.size).toBe(40);
  });

  it('keeps progress keyed by storyId', async () => {
    const repo = new MemoryReadingProgressRepository();
    __setProgressRepository(repo);
    await getProgressService(CASA_STORY_ID).openChapter('la-casa-delle-finestre-01');
    expect((await peekProgress(CASA_STORY_ID))?.storyId).toBe(CASA_STORY_ID);
    expect(await peekProgress(LUCA_STORY_ID)).toBeNull();
    expect(await getProgressService(CASA_STORY_ID).getChapterStatus('la-casa-delle-finestre-02')).toBe(
      'locked',
    );
  });

  it('inserts the A2+ extra section after Luca A2', () => {
    const groups = insertExtraStoryGroups(
      [
        {
          arc: {
            id: 'luca-a-roma-a2',
            cefrLevel: 'A2',
            title: "Luca's new life",
            chapterStart: 25,
            chapterEnd: 40,
            status: 'available',
          },
          chapters: [],
          completed: 0,
          total: 16,
          locked: false,
          containsCurrent: false,
        },
      ],
      [
        {
          afterArcId: 'luca-a-roma-a2',
          id: 'a2-plus-genre-paths',
          cefrLevel: 'A2+',
          title: 'La casa delle finestre',
          stories: [
            {
              storyId: CASA_STORY_ID,
              titleIt: 'La casa delle finestre',
              completed: 0,
              total: 24,
              chapters: [],
            },
          ],
        },
      ],
    );
    expect(groups.map((group) => group.arc.id)).toEqual(['luca-a-roma-a2', 'a2-plus-genre-paths']);
  });
});
