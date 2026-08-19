import { router, type Href } from 'expo-router';

import { readerHref } from '@/src/content/storyHrefs';
import { getProgressService } from '@/src/progress';
import { getContinueReadingTarget, type ContinueReadingTarget } from '@/src/progress/continueReading';

/** Navigate to the learner's next step (chapter, grammar, or recap). */
export async function navigateToContinueTarget(target: ContinueReadingTarget): Promise<void> {
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
  const chapterId = nextAction.chapterId;
  router.push(readerHref(storyId, chapterId));
  void getProgressService(storyId).openChapter(chapterId);
}

/** Resolve the continue target and navigate, or fall back to the home tab. */
export async function navigateContinueLearning(fallbackHref: Href = '/home' as Href): Promise<void> {
  const target = await getContinueReadingTarget();
  if (target) {
    await navigateToContinueTarget(target);
    return;
  }
  router.push(fallbackHref);
}
