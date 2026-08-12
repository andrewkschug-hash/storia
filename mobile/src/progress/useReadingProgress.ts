import { useCallback, useEffect, useState } from 'react';

import { getContentBundle, getStory } from '@/src/content';
import { getProgressService } from '@/src/progress';
import type { ChapterStatus, ReadingProgressRecord } from '@/src/progress/types';

export type ChapterListItem = {
  id: string;
  number: number;
  title: string;
  titleIt: string;
  status: ChapterStatus;
};

export function useReadingProgress() {
  const story = getStory();
  const [progress, setProgress] = useState<ReadingProgressRecord | null>(null);
  const [chapterStatuses, setChapterStatuses] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const service = getProgressService();
      const next = await service.getOrCreate();
      const items: ChapterListItem[] = [];
      for (const summary of story.chapters) {
        const status = await service.getChapterStatus(summary.id);
        items.push({
          id: summary.id,
          number: summary.number,
          title: summary.title,
          titleIt: summary.titleIt,
          status,
        });
      }
      setProgress(next);
      setChapterStatuses(items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [story.chapters]);

  useEffect(() => {
    // Validate content eagerly so startup failures are visible
    try {
      getContentBundle();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
      return;
    }
    void refresh();
  }, [refresh]);

  return {
    story,
    progress,
    chapterStatuses,
    loading,
    error,
    refresh,
    service: getProgressService(),
  };
}
