import { useCallback, useEffect, useState } from 'react';

import { getChapter, tryGetContentBundle } from '@/src/content';
import {
  getContinueReadingTarget,
  type ContinueReadingTarget,
} from '@/src/progress/continueReading';
import { getProgressService } from '@/src/progress';

export function useContinueReading() {
  const [target, setTarget] = useState<ContinueReadingTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await getContinueReadingTarget();
      setTarget(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const chapter = target ? getChapter(target.chapterId, target.storyId) : undefined;
  const bundle = target ? tryGetContentBundle(target.storyId) : undefined;
  const service = target ? getProgressService(target.storyId) : null;
  const progress = target?.progress ?? null;
  const completed = progress && service ? service.getCompletedCount(progress) : 0;
  const percent =
    progress && service ? service.getReadingPercentComplete(progress) : 0;
  const chapterPercent =
    chapter && progress && service
      ? service.getChapterReadingPercent(chapter, progress.lastSentenceId)
      : 0;

  return {
    target,
    chapter,
    story: bundle?.story,
    progress,
    completed,
    percent,
    chapterPercent,
    loading,
    error,
    refresh,
    service,
  };
}
