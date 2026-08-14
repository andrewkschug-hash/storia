import { describe, expect, it } from 'vitest';

import {
  PRE_ROME_ARC_ID,
  getCatalogStory,
  getContentBundle,
  getStoriesInArc,
  tryGetContentBundle,
} from '@/src/content';
import { validateStoryCatalog } from '@/src/content/validateCatalog';

const DESIGN = [
  {
    id: 'luca-prima-di-roma-01',
    titleIt: 'Luca si presenta',
    title: 'Luca introduces himself',
    chapterCountTarget: 6,
  },
  {
    id: 'luca-prima-di-roma-02',
    titleIt: 'Una giornata di Luca',
    title: "A day in Luca's life",
    chapterCountTarget: 7,
  },
  {
    id: 'luca-prima-di-roma-03',
    titleIt: 'Al supermercato',
    title: 'At the supermarket',
    chapterCountTarget: 6,
  },
  {
    id: 'luca-prima-di-roma-04',
    titleIt: 'In paese',
    title: 'Around town',
    chapterCountTarget: 7,
  },
  {
    id: 'luca-prima-di-roma-05',
    titleIt: 'La festa di Luca',
    title: "Luca's party",
    chapterCountTarget: 6,
  },
] as const;

describe('Phase 12J pre-Rome story design', () => {
  it('locks the five planned titles, IDs, and chapter targets', () => {
    const stories = getStoriesInArc(PRE_ROME_ARC_ID);
    expect(stories).toHaveLength(5);
    expect(stories.reduce((sum, story) => sum + (story.chapterCountTarget ?? 0), 0)).toBe(32);

    for (const row of DESIGN) {
      const story = getCatalogStory(row.id)!;
      expect(story.titleIt).toBe(row.titleIt);
      expect(story.title).toBe(row.title);
      expect(story.status).toBe('available');
      expect(story.chapterCount).toBe(row.chapterCountTarget);
      expect(story.chapterCountTarget).toBe(row.chapterCountTarget);
      expect(story.cefrLevel).toBe('A1');
      expect(story.protagonistId).toBe('luca');
      expect(story.contentPath).toBe(`stories/${row.id}`);
      expect(story.narrativeArc).toBe(PRE_ROME_ARC_ID);
    }
  });

  it('keeps designed titles loadable as available A1 stories', () => {
    for (const row of DESIGN) {
      expect(getContentBundle(row.id).story.id).toBe(row.id);
      expect(tryGetContentBundle(row.id)?.chapters.size).toBe(row.chapterCountTarget);
    }
    const catalog = validateStoryCatalog();
    expect(catalog.ok).toBe(true);
    expect(catalog.available).toEqual(expect.arrayContaining(['luca-a-roma', ...DESIGN.map((row) => row.id)]));
    expect(catalog.planned).toEqual([]);
  });
});
