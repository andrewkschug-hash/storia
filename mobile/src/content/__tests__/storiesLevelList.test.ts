import { describe, expect, it } from 'vitest';

import { insertExtraStoryGroups } from '@/src/components/storiesLevelInsert';

describe('Stories level list extras', () => {
  it('inserts Luca Before Rome after arrival and before finding a place', () => {
    const groups = insertExtraStoryGroups(
      [
        {
          arc: {
            id: 'luca-a-roma-a1',
            cefrLevel: 'A1',
            title: 'Luca arrives in Rome',
            chapterStart: 1,
            chapterEnd: 20,
            status: 'available',
          },
          chapters: [],
          completed: 0,
          total: 20,
          locked: false,
          containsCurrent: true,
        },
        {
          arc: {
            id: 'luca-a-roma-a1-plus',
            cefrLevel: 'A1+',
            title: 'Luca finds his place',
            chapterStart: 21,
            chapterEnd: 24,
            status: 'available',
          },
          chapters: [],
          completed: 0,
          total: 4,
          locked: true,
          containsCurrent: false,
        },
      ],
      [
        {
          afterArcId: 'luca-a-roma-a1',
          id: 'luca-prima-di-roma',
          cefrLevel: 'A1',
          title: 'Luca Before Rome',
          stories: [
            {
              storyId: 'luca-prima-di-roma-01',
              titleIt: 'Luca si presenta',
              completed: 0,
              total: 6,
              chapters: [],
            },
          ],
        },
      ],
    );

    expect(groups.map((group) => group.arc.title)).toEqual([
      'Luca arrives in Rome',
      'Luca Before Rome',
      'Luca finds his place',
    ]);
  });
});
