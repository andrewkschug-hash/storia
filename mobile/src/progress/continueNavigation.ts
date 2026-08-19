import { router, type Href } from 'expo-router';

import { readerHref } from '@/src/content/storyHrefs';
import {
  getContinueReadingTarget,
  type ContinueReadingTarget,
} from '@/src/progress/continueReading';
import { getProgressService } from '@/src/progress';

/** Navigate to the learner's next step (chapter, grammar, or recap). */
export function navigateToContinueTarget(target: ContinueReadingTarget): void {
  const { storyId, nextAction } = target;
  if (nextAction.kind === 'grammar') {
    router.push(
      `/grammar-note?story=${encodeURIComponent(storyId)}&chapter=${nextAction.batchEnd}` as Href,
    );
    return;
  }
  if (nextAction.kind === 'recap') {
    router.push(
      `/batch-recap?story=${encodeURIComponent(storyId)}&chapter=${nextAction.batchEnd}` as Href,
    );
    return;
  }
  router.push(readerHref(storyId, nextAction.chapterId));
  void getProgressService(storyId).openChapter(nextAction.chapterId);
}

/** Resolve the continue target and navigate, or fall back to the home tab. */
export async function navigateContinueLearning(fallbackHref: Href = '/home' as Href): Promise<void> {
  const target = await getContinueReadingTarget();
  if (target) {
    navigateToContinueTarget(target);
    return;
  }
  router.push(fallbackHref);
}
