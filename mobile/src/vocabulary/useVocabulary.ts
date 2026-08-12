import { useCallback, useEffect, useState } from 'react';

import { getContentBundle } from '@/src/content';
import { getReviewService } from '@/src/review';
import type { HomeReviewCopy, ReviewSession } from '@/src/review/ReviewService';
import { getVocabularyService } from '@/src/vocabulary';
import { browseVocabulary, type VocabBrowseItem } from '@/src/vocabulary/catalog';
import type { UserVocabularyState } from '@/src/vocabulary/types';

export function useVocabulary(progress?: {
  currentChapterId: string;
  completedChapterIds: string[];
} | null) {
  const [state, setState] = useState<UserVocabularyState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const vocab = getVocabularyService();
    const next = await vocab.getState();
    setState(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = state ? getVocabularyService().summarize(state) : null;
  const lists = state ? browseVocabulary(getContentBundle(), state) : null;

  let session: ReviewSession | null = null;
  let home: HomeReviewCopy | null = null;
  if (state && progress) {
    session = getReviewService().createSession(state, {
      currentChapterId: progress.currentChapterId,
      completedChapterIds: progress.completedChapterIds,
    });
    home = getReviewService().homeCopy(session);
  }

  return {
    state,
    loading,
    refresh,
    summary,
    lists,
    session,
    home,
    learning: (lists?.learning ?? []) as VocabBrowseItem[],
    familiar: (lists?.familiar ?? []) as VocabBrowseItem[],
    mastered: (lists?.mastered ?? []) as VocabBrowseItem[],
    saved: (lists?.saved ?? []) as VocabBrowseItem[],
  };
}
