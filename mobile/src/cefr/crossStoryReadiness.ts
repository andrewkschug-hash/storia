/**
 * Future cross-story A1 readiness — data only, no algorithm.
 *
 * A1 complete ≠ Luca a Roma chapter 20.
 * Eventually: pre-Rome A1 stories + Luca A1 chapters + domain coverage + comprehension.
 * Existing evaluateLevelReadiness (Luca Ch1–20 band) must not regress.
 */

import type { CatalogStory } from '@/src/content/schemas';
import type { ReadingProgressRecord } from '@/src/progress/types';

export type ChapterDomainMeta = {
  primaryDomain?: string;
  secondaryDomains?: string[];
};

export type A1ReadinessSignal = {
  storyId: string;
  narrativeArc: string;
  cefrLevel: string;
  status: string;
  completedChapterIds: string[];
  domainsSeen: string[];
};

export function collectA1ReadinessSignals(input: {
  stories: CatalogStory[];
  progressByStoryId: Record<string, ReadingProgressRecord | undefined>;
  domainsByStoryAndChapter?: Record<string, Record<string, ChapterDomainMeta>>;
}): A1ReadinessSignal[] {
  return input.stories
    .filter((story) => story.cefrLevel === 'A1' || story.cefrLevels?.includes('A1'))
    .map((story) => {
      const progress = input.progressByStoryId[story.id];
      const completed = progress?.completedChapterIds ?? [];
      const byChapter = input.domainsByStoryAndChapter?.[story.id] ?? {};
      const domains = new Set<string>();
      for (const chapterId of completed) {
        const meta = byChapter[chapterId];
        if (meta?.primaryDomain) domains.add(meta.primaryDomain);
        for (const extra of meta?.secondaryDomains ?? []) domains.add(extra);
      }
      return {
        storyId: story.id,
        narrativeArc: story.narrativeArc,
        cefrLevel: story.cefrLevel,
        status: story.status,
        completedChapterIds: completed,
        domainsSeen: [...domains],
      };
    });
}

export type CrossStoryA1Readiness = {
  implemented: false;
  note: string;
  signals: A1ReadinessSignal[];
};

export function evaluateCrossStoryA1Readiness(
  signals: A1ReadinessSignal[],
): CrossStoryA1Readiness {
  return {
    implemented: false,
    note:
      'Cross-story A1 readiness is not implemented. Luca a Roma still uses evaluateLevelReadiness on chapters 1–20. Future work: require comprehension across pre-Rome A1 stories + Luca A1 + domain coverage.',
    signals,
  };
}
