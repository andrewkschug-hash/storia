import { useCallback, useEffect, useState } from 'react';

import { getAdaptiveService } from '@/src/adaptive';
import { LUCA_STORY_ID, tryGetContentBundle } from '@/src/content';
import { buildPracticeQueue } from '@/src/practice';
import type { ReadingProgressRecord } from '@/src/progress/types';
import { browseVocabulary, type VocabBrowseItem } from '@/src/vocabulary/catalog';
import { getVocabularyService } from '@/src/vocabulary';
import type { UserVocabularyState } from '@/src/vocabulary/types';
import { practiceHomeCopy, type YourItalianSummary } from '@/src/vocabulary/useYourItalian';

export function useVocabulary(progress?: ReadingProgressRecord | null) {
  const [state, setState] = useState<UserVocabularyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [home, setHome] = useState<ReturnType<typeof practiceHomeCopy> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const vocab = getVocabularyService();
      const next = await vocab.getState();
      setState(next);

      if (progress) {
        const bundle = tryGetContentBundle(progress.storyId ?? LUCA_STORY_ID);
        if (bundle) {
          const profile = await getAdaptiveService().buildProfile(progress);
          const count = buildPracticeQueue(next, bundle, profile, { limit: 5 }).length;
          setHome(practiceHomeCopy(count));
        } else {
          setHome(null);
        }
      } else {
        setHome(null);
      }
    } catch {
      setHome(null);
    } finally {
      setLoading(false);
    }
  }, [progress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary: YourItalianSummary | null = state ? getVocabularyService().summarize(state) : null;
  const bundle = tryGetContentBundle();
  const lists = state && bundle ? browseVocabulary(bundle, state) : null;

  return {
    state,
    loading,
    refresh,
    summary,
    lists,
    home,
    learning: (lists?.learning ?? []) as VocabBrowseItem[],
    familiar: (lists?.familiar ?? []) as VocabBrowseItem[],
    mastered: (lists?.mastered ?? []) as VocabBrowseItem[],
    saved: (lists?.saved ?? []) as VocabBrowseItem[],
  };
}
