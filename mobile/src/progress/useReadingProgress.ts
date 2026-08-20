import { useCallback, useEffect, useRef, useState } from 'react';

import { LUCA_STORY_ID, getContentBundle, getStory } from '@/src/content';
import { navAsync } from '@/src/navigation/diagnostics';
import { useRefreshGuard } from '@/src/navigation/useRefreshGuard';
import { getProgressService, peekProgress } from '@/src/progress';
import { hasPassedA1Mastery, isPreRomeStory } from '@/src/progress/a1Gate';
import { unlockAllChapters } from '@/src/progress/unlockAll';
import type { ChapterStatus, ReadingProgressRecord } from '@/src/progress/types';

export type ChapterListItem = {
  id: string;
  number: number;
  title: string;
  titleIt: string;
  status: ChapterStatus;
};

type Options = {
  autoRefresh?: boolean;
};

/** Browse a story without creating a progress row (Home/Stories/Vocabulary). */
export async function loadStoryProgressView(storyId: string): Promise<{
  progress: ReadingProgressRecord | null;
  chapters: ChapterListItem[];
}> {
  const story = getStory(storyId);
  const existing = await peekProgress(storyId);
  if (!existing) {
    const lucaProgress = isPreRomeStory(storyId) ? await peekProgress(LUCA_STORY_ID) : null;
    const lucaChapters = getContentBundle(LUCA_STORY_ID).chapters;
    const hometownLocked =
      isPreRomeStory(storyId) && !hasPassedA1Mastery(lucaProgress, lucaChapters);
    return {
      progress: null,
      chapters: story.chapters.map((summary) => ({
        id: summary.id,
        number: summary.number,
        title: summary.title,
        titleIt: summary.titleIt,
        status: (hometownLocked
          ? 'locked'
          : unlockAllChapters() || summary.number === 1
            ? 'available'
            : 'locked') as ChapterStatus,
      })),
    };
  }
  const service = getProgressService(storyId);
  const { progress, statuses } = await service.listChapterStatuses();
  return { progress, chapters: statuses };
}

export function useReadingProgress(storyId: string = LUCA_STORY_ID, options?: Options) {
  const autoRefresh = options?.autoRefresh ?? false;
  const story = getStory(storyId);
  const [progress, setProgress] = useState<ReadingProgressRecord | null>(null);
  const [chapterStatuses, setChapterStatuses] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const progressRef = useRef(progress);
  const chapterStatusesRef = useRef(chapterStatuses);
  const errorRef = useRef(error);
  progressRef.current = progress;
  chapterStatusesRef.current = chapterStatuses;
  errorRef.current = error;
  const { run } = useRefreshGuard(`reading-progress:${storyId}`);

  const refresh = useCallback(async () => {
    const showSpinner =
      chapterStatusesRef.current.length === 0 && !progressRef.current && !errorRef.current;
    if (showSpinner) setLoading(true);
    try {
      const result = await run(async ({ isStale }) =>
        navAsync(`reading-progress refresh (${storyId})`, async () => {
          const view = await loadStoryProgressView(storyId);
          if (isStale()) return null;
          return view;
        }),
      );
      if (!result) return;
      setProgress(result.progress);
      setChapterStatuses(result.chapters);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [run, storyId]);

  useEffect(() => {
    try {
      getContentBundle(storyId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
      return;
    }
    if (autoRefresh) void refresh();
  }, [autoRefresh, refresh, storyId]);

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
