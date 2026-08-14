import {
  LUCA_STORY_ID,
  getAvailableStories,
  getCatalogStory,
  getContentBundle,
} from '@/src/content';
import { peekProgress } from '@/src/progress';
import type { ReadingProgressRecord } from '@/src/progress/types';

export type ContinueReadingTarget = {
  storyId: string;
  storyTitleIt: string;
  chapterId: string;
  progress: ReadingProgressRecord | null;
  isStart: boolean;
};

export function isStoryFullyComplete(
  progress: ReadingProgressRecord | null | undefined,
  chapterCount: number,
): boolean {
  if (!progress || chapterCount <= 0) return false;
  return progress.completedChapterIds.length >= chapterCount;
}

export function firstIncompleteChapterId(
  progress: ReadingProgressRecord | null | undefined,
  chapterIds: string[],
): string | null {
  if (chapterIds.length === 0) return null;
  if (!progress) return chapterIds[0] ?? null;
  const done = new Set(progress.completedChapterIds);
  return chapterIds.find((id) => !done.has(id)) ?? null;
}

function availableReadingOrder() {
  return [...getAvailableStories()].sort((a, b) => a.narrativeOrder - b.narrativeOrder);
}

/** Complete beginners start on Luca a Roma — shorter A1 than the hometown stories. */
function recommendedStartStory() {
  const available = getAvailableStories();
  return available.find((story) => story.id === LUCA_STORY_ID) ?? availableReadingOrder()[0];
}

/**
 * Most recently opened available story, else Luca a Roma.
 * If that story is fully complete, continue into the next incomplete
 * available story (narrative order). Does not create progress records.
 */
export async function getContinueReadingTarget(): Promise<ContinueReadingTarget | null> {
  let latest: { storyId: string; openedAt: string; progress: ReadingProgressRecord } | null = null;

  for (const story of getAvailableStories()) {
    const progress = await peekProgress(story.id);
    if (!progress?.lastOpenedAt) continue;
    if (!latest || progress.lastOpenedAt > latest.openedAt) {
      latest = { storyId: story.id, openedAt: progress.lastOpenedAt, progress };
    }
  }

  if (latest) {
    const currentStory = getCatalogStory(latest.storyId);
    const currentBundle = getContentBundle(latest.storyId);
    const currentComplete = isStoryFullyComplete(
      latest.progress,
      currentStory?.chapterCount ?? currentBundle.story.chapters.length,
    );

    if (!currentComplete) {
      return {
        storyId: latest.storyId,
        storyTitleIt: currentStory?.titleIt ?? latest.storyId,
        chapterId: latest.progress.currentChapterId,
        progress: latest.progress,
        isStart: false,
      };
    }

    const order = availableReadingOrder();
    const startIndex = Math.max(0, order.findIndex((story) => story.id === latest.storyId));
    const rotated = [...order.slice(startIndex + 1), ...order.slice(0, startIndex + 1)];
    for (const story of rotated) {
      const progress = story.id === latest.storyId ? latest.progress : await peekProgress(story.id);
      const bundle = getContentBundle(story.id);
      const chapterIds = bundle.story.chapters.map((chapter) => chapter.id);
      if (isStoryFullyComplete(progress, story.chapterCount || chapterIds.length)) continue;
      const chapterId = firstIncompleteChapterId(progress, chapterIds) ?? chapterIds[0];
      if (!chapterId) continue;
      return {
        storyId: story.id,
        storyTitleIt: story.titleIt,
        chapterId,
        progress: progress ?? null,
        isStart: !progress || progress.completedChapterIds.length === 0,
      };
    }

    return {
      storyId: latest.storyId,
      storyTitleIt: currentStory?.titleIt ?? latest.storyId,
      chapterId: latest.progress.currentChapterId,
      progress: latest.progress,
      isStart: false,
    };
  }

  const recommended = recommendedStartStory();
  if (!recommended) return null;
  const bundle = getContentBundle(recommended.id);
  const first = bundle.story.chapters[0];
  if (!first) return null;
  return {
    storyId: recommended.id,
    storyTitleIt: recommended.titleIt,
    chapterId: first.id,
    progress: null,
    isStart: true,
  };
}
