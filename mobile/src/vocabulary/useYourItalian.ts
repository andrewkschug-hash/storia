import { useCallback, useEffect, useState } from 'react';

import { getAdaptiveService } from '@/src/adaptive';
import {
  selectReinforcingWordViews,
  type ReinforcingWordView,
} from '@/src/adaptive/reinforcingWords';
import { getContentBundle } from '@/src/content';
import type { ReadingProgressRecord } from '@/src/progress/types';
import { getVocabularyService } from '@/src/vocabulary';

export type YourItalianSummary = {
  encountered: number;
  new: number;
  learning: number;
  familiar: number;
  mastered: number;
  saved: number;
};

export function useYourItalian(progress: ReadingProgressRecord | null) {
  const [summary, setSummary] = useState<YourItalianSummary | null>(null);
  const [reinforcingWords, setReinforcingWords] = useState<ReinforcingWordView[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const vocab = getVocabularyService();
    const state = await vocab.getState();
    setSummary(vocab.summarize(state));

    if (progress) {
      const profile = await getAdaptiveService().buildProfile(progress);
      const bundle = getContentBundle(progress.storyId);
      setReinforcingWords(selectReinforcingWordViews(profile, state, bundle));
    } else {
      setReinforcingWords([]);
    }

    setLoading(false);
  }, [progress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { summary, reinforcingWords, loading, refresh };
}
