import type { ReadingProgressRecord } from '@/src/progress/types';

/** Stable dependency key — avoids refresh loops from new object references after AsyncStorage reads. */
export function progressDependencyKey(progress?: ReadingProgressRecord | null): string {
  if (!progress) return 'none';
  return [
    progress.storyId,
    progress.currentChapterId,
    progress.completedChapterIds.length,
    progress.lastOpenedAt ?? '',
  ].join(':');
}
