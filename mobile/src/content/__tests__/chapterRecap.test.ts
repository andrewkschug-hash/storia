import { describe, expect, it } from 'vitest';

import { buildChapterRecap } from '@/src/content/chapterRecap';
import { getChapter, getContentBundle } from '@/src/content';

describe('Chapter recap', () => {
  it('builds recap from chapter events, sentences, and new vocabulary', () => {
    const chapter = getChapter('luca-a-roma-01');
    expect(chapter).toBeDefined();
    const recap = buildChapterRecap(chapter!, getContentBundle().lexiconById);
    expect(recap.titleIt).toBe('Arrivo');
    expect(recap.summary).toMatch(/Luca arrives in Rome/i);
    expect(recap.facts).toContain('Luca is in Rome');
    expect(recap.openingIt).toMatch(/Luca/i);
    expect(recap.closingIt).toBeTruthy();
    expect(recap.lookFors.some((item) => item.italian === 'arrivare')).toBe(true);
  });

  it('includes phrases when the chapter has them', () => {
    const chapter = getChapter('luca-a-roma-05');
    expect(chapter).toBeDefined();
    const recap = buildChapterRecap(chapter!, getContentBundle().lexiconById);
    expect(recap.lookFors.some((item) => item.kind === 'phrase')).toBe(true);
  });
});
