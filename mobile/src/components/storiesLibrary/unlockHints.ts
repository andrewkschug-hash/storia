import type { ChapterListItem } from '@/src/progress/useReadingProgress';
import type { ReadingProgressRecord } from '@/src/progress/types';
import type { StoryPathItem } from '@/src/content/storyPath';
import { LUCA_STORY_ID } from '@/src/content/catalog';
import { a1PlusChapterBlocked } from '@/src/progress/a1Gate';
import type { Chapter } from '@/src/content/schemas';

export function unlockHintForChapter(
  chapter: ChapterListItem,
  chapters: ChapterListItem[],
  storyId?: string,
  progress?: ReadingProgressRecord | null,
  lucaChaptersById?: Map<string, Chapter>,
): string {
  if (
    storyId === LUCA_STORY_ID &&
    progress &&
    lucaChaptersById &&
    a1PlusChapterBlocked(chapter.number, progress, lucaChaptersById)
  ) {
    return 'Pass the A1 check after chapter 20 to unlock A1+ chapters';
  }
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

export function unlockHintForPathItem(
  item: Extract<StoryPathItem, { kind: 'grammar' | 'recap' | 'speak' }>,
): string {
  if (item.kind === 'grammar') {
    return `Finish Ch. ${item.batchEnd} comprehension to unlock`;
  }
  if (item.kind === 'speak') {
    return `Complete the word recap after Ch. ${item.batchEnd} first`;
  }
  return `Complete the Grammar step for chapters ${item.batchStart}–${item.batchEnd} first`;
}

export function unlockHintForLockedStory(
  chapters: ChapterListItem[],
  options?: { hometownLocked?: boolean; a1PlusLocked?: boolean },
): string {
  if (options?.hometownLocked) {
    return 'Finish Luca a Roma (ch. 1–20) and pass the A1 check to unlock hometown stories';
  }
  if (options?.a1PlusLocked) {
    return 'Pass the A1 check after chapter 20 to unlock A1+ chapters';
  }
  if (chapters.length > 0) {
    return unlockHintForChapter(chapters[0], chapters);
  }
  return 'Coming soon';
}

export function unlockHintForHometownGroup(): string {
  return 'Finish Luca a Roma (ch. 1–20) and pass the A1 check to unlock hometown stories';
}
