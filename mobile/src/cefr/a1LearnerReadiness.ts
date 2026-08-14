import {
  a1ChaptersForStory,
  collectA1ReadinessSignals,
  domainsByChapterFromChapters,
  evaluateCrossStoryA1Readiness,
  vocabularySupportFromState,
  type CrossStoryA1Readiness,
} from '@/src/cefr/crossStoryReadiness';
import { getAvailableStories, tryGetContentBundle } from '@/src/content';
import type { CatalogStory } from '@/src/content/schemas';
import { peekProgress } from '@/src/progress';
import type { ReadingProgressRecord } from '@/src/progress/types';
import type { UserVocabularyState } from '@/src/vocabulary/types';

export async function evaluateLearnerCrossStoryA1(input?: {
  stories?: CatalogStory[];
  progressByStoryId?: Record<string, ReadingProgressRecord | undefined>;
  vocabulary?: UserVocabularyState | null;
}): Promise<CrossStoryA1Readiness> {
  const stories = (input?.stories ?? getAvailableStories()).filter(
    (story) => story.cefrLevel === 'A1' || story.cefrLevels?.includes('A1'),
  );

  const a1ChapterIdsByStory: Record<string, string[]> = {};
  const domainsByStoryAndChapter: Record<string, Record<string, { primaryDomain?: string; secondaryDomains?: string[] }>> =
    {};
  const progressByStoryId: Record<string, ReadingProgressRecord | undefined> = {
    ...(input?.progressByStoryId ?? {}),
  };

  for (const story of stories) {
    const bundle = tryGetContentBundle(story.id);
    if (!bundle) {
      a1ChapterIdsByStory[story.id] = [];
      domainsByStoryAndChapter[story.id] = {};
      continue;
    }
    const a1Chapters = a1ChaptersForStory(story, bundle.chapters.values());
    a1ChapterIdsByStory[story.id] = a1Chapters.map((chapter) => chapter.id);
    domainsByStoryAndChapter[story.id] = domainsByChapterFromChapters(a1Chapters);
    if (!(story.id in progressByStoryId)) {
      progressByStoryId[story.id] = (await peekProgress(story.id)) ?? undefined;
    }
  }

  const signals = collectA1ReadinessSignals({
    stories,
    progressByStoryId,
    domainsByStoryAndChapter,
    a1ChapterIdsByStory,
  });

  return evaluateCrossStoryA1Readiness(signals, {
    vocabularySupport: vocabularySupportFromState(input?.vocabulary),
  });
}
