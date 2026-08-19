import { useCallback, useEffect, useState } from 'react';

import { getAdaptiveService } from '@/src/adaptive';
import {
  selectReinforcingWordViews,
  type ReinforcingWordView,
} from '@/src/adaptive/reinforcingWords';
import { getContentBundle } from '@/src/content';
import { buildPracticeQueue, type PracticeQueueItem } from '@/src/practice';
import type { ReadingProgressRecord } from '@/src/progress/types';
import {
  formatLastAssessmentLabel,
  summarizeRecentActivity,
  type ActivitySummary,
} from '@/src/vocabulary/activitySummary';
import { getVocabularyService } from '@/src/vocabulary';

export type YourItalianSummary = {
  encountered: number;
  new: number;
  learning: number;
  familiar: number;
  mastered: number;
  saved: number;
};

export type PracticePreviewItem = PracticeQueueItem & {
  assessmentLabel: string | null;
};

export function useYourItalian(progress: ReadingProgressRecord | null) {
  const [summary, setSummary] = useState<YourItalianSummary | null>(null);
  const [reinforcingWords, setReinforcingWords] = useState<ReinforcingWordView[]>([]);
  const [practiceItems, setPracticeItems] = useState<PracticePreviewItem[]>([]);
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const vocab = getVocabularyService();
    const state = await vocab.getState();
    setSummary(vocab.summarize(state));
    setActivity(await summarizeRecentActivity());

    if (progress) {
      const bundle = getContentBundle(progress.storyId);
      const profile = await getAdaptiveService().buildProfile(progress);
      setReinforcingWords(selectReinforcingWordViews(profile, state, bundle));
      const queue = buildPracticeQueue(state, bundle, profile, { limit: 5 });
      setPracticeItems(
        queue.map((item) => ({
          ...item,
          assessmentLabel: formatLastAssessmentLabel(item.lastSelfAssessment),
        })),
      );
    } else {
      setReinforcingWords([]);
      setPracticeItems([]);
    }

    setLoading(false);
  }, [progress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { summary, reinforcingWords, practiceItems, activity, loading, refresh };
}

export function practiceHomeCopy(count: number): {
  headline: string;
  detail: string;
  cta: string | null;
} {
  if (count <= 0) {
    return {
      headline: "You're all caught up.",
      detail: 'Keep reading — the story is the best teacher.',
      cta: null,
    };
  }
  return {
    headline: `Practice ${count} word${count === 1 ? '' : 's'}`,
    detail: 'You have a few things to review from your story.',
    cta: 'Practice →',
  };
}
