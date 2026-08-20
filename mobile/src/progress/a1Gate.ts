import { LUCA_STORY_ID, PRE_ROME_ARC_ID, getCatalogStory } from '@/src/content/catalog';
import type { Chapter } from '@/src/content/schemas';
import type { ReadingProgressRecord } from '@/src/progress/types';

/** Last chapter in the Luca a Roma A1 band. */
export const LUCA_A1_BAND_END = 20;

/** First chapter in the A1+ band — gated until the A1 mastery test is passed. */
export const LUCA_A1_PLUS_START = 21;

export const A1_MASTERY_PASS_THRESHOLD = 0.75;

export function a1MasteryCheckpointId(storyId: string = LUCA_STORY_ID): string {
  return `${storyId}:a1-mastery`;
}

export function hasPassedA1Mastery(
  progress: ReadingProgressRecord | null | undefined,
  chaptersById?: Map<string, Chapter>,
): boolean {
  if (!progress) return false;
  if (progress.completedCheckpointIds?.includes(a1MasteryCheckpointId(progress.storyId))) {
    return true;
  }
  // Learners who already advanced into A1+ before the gate shipped.
  if (chaptersById) {
    for (const chapter of chaptersById.values()) {
      if (chapter.number >= LUCA_A1_PLUS_START && progress.completedChapterIds.includes(chapter.id)) {
        return true;
      }
    }
  }
  return false;
}

export function isLucaA1BandComplete(
  progress: ReadingProgressRecord,
  chaptersById: Map<string, Chapter>,
): boolean {
  for (let number = 1; number <= LUCA_A1_BAND_END; number += 1) {
    const chapter = [...chaptersById.values()].find((c) => c.number === number);
    if (!chapter) continue;
    if (!progress.completedChapterIds.includes(chapter.id)) return false;
  }
  return true;
}

export function canTakeA1MasteryTest(
  progress: ReadingProgressRecord,
  chaptersById: Map<string, Chapter>,
): boolean {
  if (hasPassedA1Mastery(progress, chaptersById)) return false;
  return isLucaA1BandComplete(progress, chaptersById);
}

export function isPreRomeStory(storyId: string): boolean {
  return getCatalogStory(storyId)?.narrativeArc === PRE_ROME_ARC_ID;
}

export function hometownStoriesUnlocked(
  lucaProgress: ReadingProgressRecord | null | undefined,
  lucaChaptersById?: Map<string, Chapter>,
): boolean {
  return hasPassedA1Mastery(lucaProgress, lucaChaptersById);
}

export function a1PlusChapterBlocked(
  chapterNumber: number,
  lucaProgress: ReadingProgressRecord,
  chaptersById: Map<string, Chapter>,
): boolean {
  if (chapterNumber < LUCA_A1_PLUS_START) return false;
  return !hasPassedA1Mastery(lucaProgress, chaptersById);
}

export function masteryScorePassed(score: number): boolean {
  return score >= A1_MASTERY_PASS_THRESHOLD;
}
