import { useCallback, useEffect, useRef, useState } from 'react';

import { getAdaptiveService } from '@/src/adaptive';
import {
  selectReinforcingWordViews,
  type ReinforcingWordView,
} from '@/src/adaptive/reinforcingWords';
import { getContentBundle } from '@/src/content';
import { navAsync } from '@/src/navigation/diagnostics';
import { progressDependencyKey } from '@/src/navigation/progressKey';
import { useRefreshGuard } from '@/src/navigation/useRefreshGuard';
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

type RefreshResult = {
  summary: YourItalianSummary;
  activity: ActivitySummary;
  reinforcingWords: ReinforcingWordView[];
  practiceItems: PracticePreviewItem[];
};

type Options = {
  autoRefresh?: boolean;
};

export function useYourItalian(progress: ReadingProgressRecord | null, options?: Options) {
  const autoRefresh = options?.autoRefresh ?? false;
  const [summary, setSummary] = useState<YourItalianSummary | null>(null);
  const [reinforcingWords, setReinforcingWords] = useState<ReinforcingWordView[]>([]);
  const [practiceItems, setPracticeItems] = useState<PracticePreviewItem[]>([]);
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(autoRefresh);
  const progressKey = progressDependencyKey(progress);
  const progressRef = useRef(progress);
  const summaryRef = useRef(summary);
  progressRef.current = progress;
  summaryRef.current = summary;
  const { run } = useRefreshGuard(`your-italian:${progressKey}`);

  const refresh = useCallback(async () => {
    const showSpinner = !summaryRef.current;
    if (showSpinner) setLoading(true);
    try {
      const result = await run(async ({ isStale }) =>
        navAsync('your-italian refresh', async () => {
          const vocab = getVocabularyService();
          const state = await vocab.getState();
          if (isStale()) return null;
          const nextSummary = vocab.summarize(state);
          const nextActivity = await summarizeRecentActivity();
          if (isStale()) return null;

          const currentProgress = progressRef.current;
          let nextReinforcing: ReinforcingWordView[] = [];
          let nextPractice: PracticePreviewItem[] = [];
          if (currentProgress) {
            const bundle = getContentBundle(currentProgress.storyId);
            const profile = await getAdaptiveService().buildProfile(currentProgress, undefined, {
              persist: false,
            });
            if (isStale()) return null;
            nextReinforcing = selectReinforcingWordViews(profile, state, bundle);
            const queue = buildPracticeQueue(state, bundle, profile, { limit: 5 });
            nextPractice = queue.map((item) => ({
              ...item,
              assessmentLabel: formatLastAssessmentLabel(item.lastSelfAssessment),
            }));
          }

          return {
            summary: nextSummary,
            activity: nextActivity,
            reinforcingWords: nextReinforcing,
            practiceItems: nextPractice,
          } satisfies RefreshResult;
        }),
      );
      if (!result) return;
      setSummary(result.summary);
      setActivity(result.activity);
      setReinforcingWords(result.reinforcingWords);
      setPracticeItems(result.practiceItems);
    } catch (error) {
      console.error('[Navigation] your-italian refresh failed', error);
    } finally {
      setLoading(false);
    }
  }, [progressKey, run]);

  useEffect(() => {
    if (autoRefresh) void refresh();
  }, [autoRefresh, refresh]);

  return { summary, reinforcingWords, practiceItems, activity, loading, refresh };
}

export function practiceHomeCopy(count: number): {
  headline: string;
  detail: string;
  cta: string | null;
  readyCount: number;
} {
  if (count <= 0) {
    return {
      headline: "You're all caught up.",
      detail: 'Keep reading — the story is the best teacher.',
      cta: null,
      readyCount: 0,
    };
  }
  return {
    headline: `Practice ${count} word${count === 1 ? '' : 's'}`,
    detail: 'You have a few things to review from your story.',
    cta: 'Practice →',
    readyCount: count,
  };
}
