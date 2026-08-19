import { useCallback, useEffect, useState } from 'react';

import { getChapter, tryGetContentBundle } from '@/src/content';
import {
  getContinueReadingTarget,
  type ContinueReadingTarget,
} from '@/src/progress/continueReading';
import { getProgressService } from '@/src/progress';
import type { ProgressService } from '@/src/progress/ProgressService';

function tryGetProgressService(storyId: string): ProgressService | null {
  try {
    return getProgressService(storyId);
  } catch {
    return null;
  }
}

export function useContinueReading() {
  const [target, setTarget] = useState<ContinueReadingTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await getContinueReadingTarget();
      if (!next) {
        setTarget(null);
        setError(null);
        return;
      }
      const bundle = tryGetContentBundle(next.storyId);
      const chapter = getChapter(next.chapterId, next.storyId);
      if (!bundle || !chapter) {
        setTarget(null);
        setError(
          'Could not load your reading progress. Open Stories to pick up where you left off.',
        );
        return;
      }
      setTarget(next);
      setError(null);
    } catch (e) {
      setTarget(null);
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
  const service = target ? tryGetProgressService(target.storyId) : null;
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
