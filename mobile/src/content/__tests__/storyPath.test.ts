import { describe, expect, it } from 'vitest';

import { buildStoryPath, grammarCheckpointId, recapCheckpointId } from '@/src/content/storyPath';
import type { ReadingProgressRecord } from '@/src/progress/types';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';

const storyId = 'luca-a-roma';

function chapter(n: number, status: ChapterListItem['status']): ChapterListItem {
  return {
    id: `luca-a-roma-${String(n).padStart(2, '0')}`,
    number: n,
    title: `Ch ${n}`,
    titleIt: `Cap ${n}`,
    status,
  };
}

describe('buildStoryPath', () => {
  it('inserts grammar and recap after every fifth chapter', () => {
    const chapters = [1, 2, 3, 4, 5].map((n) => chapter(n, n < 5 ? 'completed' : 'completed'));
    const path = buildStoryPath(chapters, null, storyId);
    expect(path.map((item) => item.kind)).toEqual([
      'chapter',
      'chapter',
      'chapter',
      'chapter',
      'chapter',
      'grammar',
      'recap',
    ]);
  });

  it('locks recap until grammar is completed', () => {
    const chapters = [1, 2, 3, 4, 5].map((n) => chapter(n, 'completed'));
    const progress = {
      storyId,
      completedChapterIds: chapters.map((c) => c.id),
      completedCheckpointIds: [],
    } as ReadingProgressRecord;
    const path = buildStoryPath(chapters, progress, storyId);
    const grammar = path.find((item) => item.kind === 'grammar');
    const recap = path.find((item) => item.kind === 'recap');
    expect(grammar?.status).toBe('available');
    expect(recap?.status).toBe('locked');
  });

  it('marks checkpoints complete when saved in progress', () => {
    const chapters = [1, 2, 3, 4, 5].map((n) => chapter(n, 'completed'));
    const progress = {
      storyId,
      completedChapterIds: chapters.map((c) => c.id),
      completedCheckpointIds: [
        grammarCheckpointId(storyId, 5),
        recapCheckpointId(storyId, 5),
      ],
    } as ReadingProgressRecord;
    const path = buildStoryPath(chapters, progress, storyId);
    expect(path.find((item) => item.kind === 'grammar')?.status).toBe('completed');
    expect(path.find((item) => item.kind === 'recap')?.status).toBe('completed');
  });

  it('inserts Help Marco after the Chapter 15 recap, not as a story', () => {
    const chapters = [11, 12, 13, 14, 15].map((n) => chapter(n, 'completed'));
    const progress = {
      storyId,
      completedChapterIds: chapters.map((c) => c.id),
      completedCheckpointIds: [
        grammarCheckpointId(storyId, 15),
        recapCheckpointId(storyId, 15),
      ],
      speakScenes: {},
    } as ReadingProgressRecord;
    const path = buildStoryPath(chapters, progress, storyId);
    expect(path.filter((item) => item.kind !== 'chapter').map((item) => item.kind)).toEqual([
      'grammar',
      'recap',
      'speak',
    ]);
    const speak = path.find((item) => item.kind === 'speak');
    expect(speak?.kind === 'speak' && speak.title).toBe('Help Marco');
    expect(speak?.kind === 'speak' && speak.status).toBe('available');
  });

  it('adds grammar, words, and speak after chapter 5 of a hometown story', () => {
    const hometownId = 'luca-prima-di-roma-01';
    const chapters = [1, 2, 3, 4, 5, 6].map((n) => ({
      id: `${hometownId}-0${n}`,
      number: n,
      title: `Ch ${n}`,
      titleIt: `Cap ${n}`,
      status: (n <= 5 ? 'completed' : 'locked') as ChapterListItem['status'],
    }));
    const path = buildStoryPath(chapters, null, hometownId);
    expect(path.filter((item) => item.kind !== 'chapter').map((item) => item.kind)).toEqual([
      'grammar',
      'recap',
      'speak',
    ]);
    const speak = path.find((item) => item.kind === 'speak');
    expect(speak?.kind === 'speak' && speak.sceneId).toBe('luca-prima-di-roma-01-speak-5');
  });
});
