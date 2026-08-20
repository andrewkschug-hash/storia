import { useCallback, useEffect, useState } from 'react';

import { LUCA_STORY_ID, getContentBundle, getStory } from '@/src/content';
import { getProgressService, peekProgress } from '@/src/progress';
import { unlockAllChapters } from '@/src/progress/unlockAll';
import type { ChapterStatus, ReadingProgressRecord } from '@/src/progress/types';

export type ChapterListItem = {
  id: string;
  number: number;
  title: string;
  titleIt: string;
  status: ChapterStatus;
};

/** Browse a story without creating a progress row (Home/Stories/Vocabulary). */
export async function loadStoryProgressView(storyId: string): Promise<{
  progress: ReadingProgressRecord | null;
  chapters: ChapterListItem[];
}> {
  const story = getStory(storyId);
  const existing = await peekProgress(storyId);
  if (!existing) {
    return {
      progress: null,
      chapters: story.chapters.map((summary) => ({
        id: summary.id,
        number: summary.number,
        title: summary.title,
        titleIt: summary.titleIt,
        status: (unlockAllChapters() || summary.number === 1 ? 'available' : 'locked') as ChapterStatus,
      })),
    };
  }
  const service = getProgressService(storyId);
  const { progress, statuses } = await service.listChapterStatuses();
  return { progress, chapters: statuses };
}

export function useReadingProgress(storyId: string = LUCA_STORY_ID) {
  const story = getStory(storyId);
  const [progress, setProgress] = useState<ReadingProgressRecord | null>(null);
  const [chapterStatuses, setChapterStatuses] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const view = await loadStoryProgressView(storyId);
      setProgress(view.progress);
      setChapterStatuses(view.chapters);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    try {
      getContentBundle(storyId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
      return;
    }
    void refresh();
  }, [refresh, storyId]);

  return {
    story,
    progress,
    chapterStatuses,
    loading,
    error,
    refresh,
    service: getProgressService(storyId),
    storyId,
  };
}
