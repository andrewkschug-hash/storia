import {
  LUCA_STORY_ID,
  getAvailableStories,
  getCatalogStory,
  getContentBundle,
} from '@/src/content';
import { batchRangeForChapter, grammarNoteForBatch } from '@/src/content/lessonBatches';
import {
  grammarCheckpointId,
  recapBlocksChapter,
  recapCheckpointId,
} from '@/src/content/storyPath';
import { peekProgress } from '@/src/progress';
import type { ReadingProgressRecord } from '@/src/progress/types';

export type ContinueReadingTarget = {
  storyId: string;
  storyTitleIt: string;
  chapterId: string;
  progress: ReadingProgressRecord | null;
  isStart: boolean;
  nextAction: ContinueAction;
};

export type ContinueAction =
  | { kind: 'chapter'; chapterId: string }
  | { kind: 'grammar'; batchEnd: number }
  | { kind: 'recap'; batchEnd: number };

export type HomeContinuePresentation = {
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  progressChapterNumber: number;
};

export function homeContinuePresentation(
  target: ContinueReadingTarget,
  chapter: { titleIt: string; number: number },
  totalChapters: number,
  chaptersCompleted: number,
): HomeContinuePresentation {
  const chapterProgressSubtitle = `Chapter ${chapter.number} of ${totalChapters}${
    chaptersCompleted > 0 ? ` · ${chaptersCompleted} finished` : ''
  }`;

  if (target.nextAction.kind === 'grammar') {
    const { start, end } = batchRangeForChapter(target.nextAction.batchEnd);
    return {
      eyebrow: 'Next up',
      title: 'Grammar note',
      subtitle: `Chapters ${start}–${end}`,
      buttonLabel: 'Continue',
      progressChapterNumber: target.nextAction.batchEnd,
    };
  }
  if (target.nextAction.kind === 'recap') {
    const { start, end } = batchRangeForChapter(target.nextAction.batchEnd);
    return {
      eyebrow: 'Next up',
      title: 'Word recap',
      subtitle: `Chapters ${start}–${end}`,
      buttonLabel: 'Continue',
      progressChapterNumber: target.nextAction.batchEnd,
    };
  }
  return {
    eyebrow: target.isStart ? 'Start reading' : 'Continue reading',
    title: chapter.titleIt,
    subtitle: chapterProgressSubtitle,
    buttonLabel: target.isStart ? 'Start reading' : 'Continue reading',
    progressChapterNumber: chapter.number,
  };
}

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

function resolveNextAction(
  storyId: string,
  progress: ReadingProgressRecord,
): { chapterId: string; nextAction: ContinueAction } {
  const bundle = getContentBundle(storyId);
  const current = bundle.chapters.get(progress.currentChapterId);
  if (!current) {
    const chapterIds = bundle.story.chapters.map((chapter) => chapter.id);
    const fallback =
      firstIncompleteChapterId(progress, chapterIds) ?? chapterIds[0] ?? progress.currentChapterId;
    return {
      chapterId: fallback,
      nextAction: { kind: 'chapter', chapterId: fallback },
    };
  }
  const chapterNumberById = new Map(
    [...bundle.chapters.values()].map((chapter) => [chapter.id, chapter.number] as const),
  );
  if (!recapBlocksChapter(progress, storyId, current.number, chapterNumberById)) {
    return {
      chapterId: current.id,
      nextAction: { kind: 'chapter', chapterId: current.id },
    };
  }

  const batchEnd = current.number - 1;
  const done = new Set(progress.completedCheckpointIds ?? []);
  const grammarId = grammarCheckpointId(storyId, batchEnd);
  const recapId = recapCheckpointId(storyId, batchEnd);
  const chapterBefore = bundle.story.chapters.find((chapter) => chapter.number === batchEnd);
  const fallbackChapterId = chapterBefore?.id ?? current.id;
  const { start, end } = batchRangeForChapter(batchEnd);
  const grammarNote = grammarNoteForBatch(start, end, storyId);

  if (grammarNote && !done.has(grammarId)) {
    return { chapterId: fallbackChapterId, nextAction: { kind: 'grammar', batchEnd } };
  }
  if (!done.has(recapId)) {
    return { chapterId: fallbackChapterId, nextAction: { kind: 'recap', batchEnd } };
  }
  return {
    chapterId: current.id,
    nextAction: { kind: 'chapter', chapterId: current.id },
  };
}

/**
 * Most recently opened available story, else Luca a Roma.
 * If that story is fully complete, continue into the next incomplete
 * available story (narrative order). Does not create progress records.
 */
let continueTargetPromise: Promise<ContinueReadingTarget | null> | null = null;

async function computeContinueReadingTarget(): Promise<ContinueReadingTarget | null> {
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
      const resolved = resolveNextAction(latest.storyId, latest.progress);
      return {
        storyId: latest.storyId,
        storyTitleIt: currentStory?.titleIt ?? latest.storyId,
        chapterId: resolved.chapterId,
        progress: latest.progress,
        isStart: false,
        nextAction: resolved.nextAction,
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
        nextAction: { kind: 'chapter', chapterId },
      };
    }

    const resolved = resolveNextAction(latest.storyId, latest.progress);
    return {
      storyId: latest.storyId,
      storyTitleIt: currentStory?.titleIt ?? latest.storyId,
      chapterId: resolved.chapterId,
      progress: latest.progress,
      isStart: false,
      nextAction: resolved.nextAction,
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
    nextAction: { kind: 'chapter', chapterId: first.id },
  };
}

export async function getContinueReadingTarget(): Promise<ContinueReadingTarget | null> {
  if (!continueTargetPromise) {
    continueTargetPromise = computeContinueReadingTarget().finally(() => {
      continueTargetPromise = null;
    });
  }
  return continueTargetPromise;
}
