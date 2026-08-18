import type { ChapterListItem } from '@/src/progress/useReadingProgress';
import type { ReadingProgressRecord } from '@/src/progress/types';
import type { StoryPathItem } from '@/src/content/storyPath';

export function unlockHintForChapter(
  chapter: ChapterListItem,
  chapters: ChapterListItem[],
  storyId?: string,
  progress?: ReadingProgressRecord | null,
): string {
  if (storyId && progress && chapter.number > 1 && (chapter.number - 1) % 5 === 0) {
    const batchEnd = chapter.number - 1;
    const grammarId = `${storyId}:grammar:${batchEnd}`;
    const recapId = `${storyId}:recap:${batchEnd}`;
    const done = new Set(progress.completedCheckpointIds ?? []);
    if (!done.has(grammarId)) {
      return `Complete the Grammar review after Ch. ${batchEnd} first`;
    }
    if (!done.has(recapId)) {
      return `Complete the batch Review after Ch. ${batchEnd} first`;
    }
  }
  const previous = chapters.find((c) => c.number === chapter.number - 1);
  return previous ? `Finish Ch. ${previous.number} comprehension to unlock` : 'Locked';
}

export function unlockHintForPathItem(item: Extract<StoryPathItem, { kind: 'grammar' | 'recap' }>): string {
  if (item.kind === 'grammar') {
    return `Finish Ch. ${item.batchEnd} comprehension to unlock`;
  }
  return `Complete the Grammar step for chapters ${item.batchStart}–${item.batchEnd} first`;
}

export function unlockHintForLockedStory(chapters: ChapterListItem[]): string {
  if (chapters.length > 0) {
    return unlockHintForChapter(chapters[0], chapters);
  }
  return 'Coming soon';
}
