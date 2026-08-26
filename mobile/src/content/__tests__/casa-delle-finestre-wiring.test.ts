import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CASA_STORY_ID,
  LUCA_STORY_ID,
  __resetContentCache,
  a2PlusGenrePathStories,
  buildLearnerJourney,
  getCatalogStory,
  getChapter,
  getContentBundle,
} from '@/src/content';
import { extraRowsFromCatalogStories, insertExtraStoryGroups } from '@/src/components/storiesLevelInsert';
import { REGISTERED_AVAILABLE_STORY_SOURCES } from '@/src/content/preRomeSources';
import { CASA_DELLE_FINESTRE_SOURCE } from '@/src/content/casaFinestreSources';
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
    expect(getContentBundle(LUCA_STORY_ID).chapters.size).toBeGreaterThanOrEqual(40);
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

  it('survives every Stories-list stage as an A2+ entry', async () => {
    expect(CASA_DELLE_FINESTRE_SOURCE.storyPath).toBe('stories/la-casa-delle-finestre');
    expect(REGISTERED_AVAILABLE_STORY_SOURCES[CASA_STORY_ID]).toBe(CASA_DELLE_FINESTRE_SOURCE);

    const story = getCatalogStory(CASA_STORY_ID);
    expect(story, 'catalog must contain la-casa-delle-finestre').toBeTruthy();
    expect(story!.chapterCount).toBe(24);
    expect(story!.status).toBe('available');
    expect(story!.cefrLevel).toBe('A2+');
    expect(story!.narrativeArc).toBe('a2-plus-genre-paths');
    expect(story!.protagonistId).toBe('irene-colombo');

    expect(getContentBundle(CASA_STORY_ID).chapters.size).toBe(24);

    const selector = a2PlusGenrePathStories();
    expect(selector.map((row) => row.id), 'Stories-list selector must return Casa').toContain(
      CASA_STORY_ID,
    );

    const journey = buildLearnerJourney();
    const a2plus = journey.find((band) => band.cefrLevel === 'A2+');
    const a2PlusStories = a2plus?.groups.flatMap((group) => group.stories) ?? [];
    expect(a2PlusStories.map((row) => row.id), 'A2+ journey band must receive Casa').toContain(
      CASA_STORY_ID,
    );

    const repo = new MemoryReadingProgressRepository();
    __setProgressRepository(repo);
    const { loadStoryProgressView } = await import('@/src/progress/useReadingProgress');
    const view = await loadStoryProgressView(CASA_STORY_ID);
    expect(view.chapters).toHaveLength(24);
    expect(view.chapters[0]?.status).toBe('available');
    expect(view.chapters[1]?.status).toBe('locked');

    const extraRows = extraRowsFromCatalogStories(a2PlusStories, 'A2+');
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
          title: 'A2+ genre paths',
          stories: extraRows,
        },
      ],
    );
    const a2PlusGroup = groups.find((group) => group.arc.cefrLevel === 'A2+');
    expect(a2PlusGroup, 'Stories UI must render an A2+ section').toBeTruthy();
    expect(a2PlusGroup!.stories?.map((row) => row.storyId)).toContain(CASA_STORY_ID);
    expect(a2PlusGroup!.stories?.find((row) => row.storyId === CASA_STORY_ID)?.total).toBe(24);
  });

  it('does not hide the A2+ section until progress rows load', () => {
    const src = readFileSync(join(fileURLToPath(new URL('.', import.meta.url)), '../../../app/(tabs)/stories.tsx'), 'utf8');
    expect(src).toMatch(/a2PlusStories\.length/);
    expect(src).toMatch(/extraRowsFromCatalogStories\(a2PlusStories/);
  });
});
