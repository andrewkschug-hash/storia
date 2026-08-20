import { useCallback, useState } from 'react';

import { LUCA_STORY_ID } from '@/src/content/catalog';
import { navAsync } from '@/src/navigation/diagnostics';
import { useRefreshGuard } from '@/src/navigation/useRefreshGuard';
import { peekProgress } from '@/src/progress';
import type { ReadingProgressRecord } from '@/src/progress/types';

/** Lightweight progress read for tabs that only need storyId / currentChapterId. */
export function usePeekProgress(storyId: string = LUCA_STORY_ID) {
  const [progress, setProgress] = useState<ReadingProgressRecord | null>(null);
  const { run } = useRefreshGuard(`peek-progress:${storyId}`);

  const refresh = useCallback(async () => {
    const result = await run(async ({ isStale }) =>
      navAsync(`peek-progress refresh (${storyId})`, async () => {
        const next = await peekProgress(storyId);
        if (isStale()) return null;
        return next;
      }),
    );
    if (result !== undefined) setProgress(result);
  }, [run, storyId]);

  return { progress, refresh };
}
