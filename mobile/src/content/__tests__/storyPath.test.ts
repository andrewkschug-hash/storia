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
});
