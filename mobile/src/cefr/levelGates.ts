import type { CEFRLevel } from '@/src/cefr/levels';
import { DEFAULT_LUCA_ARCS, type StoryArc } from '@/src/cefr/arcs';
import { LUCA_STORY_ID } from '@/src/content/catalog';
import type { ReadingProgressRecord } from '@/src/progress/types';

export type LevelGatePrerequisite = {
  type: 'complete';
  previousLevel: CEFRLevel;
  requiredChapterNumber: number;
  description: string;
};

export type LevelGateBypass = {
  type: 'readiness_test';
  testId: string;
  targetLevel: CEFRLevel;
  title: string;
  requiredScorePercent: number;
};

export type LevelGate = {
  id: string;
  level: CEFRLevel;
  storyId: string;
  targetChapterNumber: number;
  targetChapterId: string;
  title: string;
  titleIt: string;
  storyArcTitle: string;
  chapterRangeText: string;
  previousLevel: CEFRLevel;
  previousChaptersText: string;
  prerequisite: LevelGatePrerequisite;
  bypass: LevelGateBypass;
};

/**
 * Builds canonical LevelGate definitions derived directly from StoryArc definitions.
 * This ensures chapter ranges and prerequisites never desynchronize from the curriculum.
 */
export function buildLevelGatesForStory(
  arcs: StoryArc[] = DEFAULT_LUCA_ARCS,
  storyId: string = LUCA_STORY_ID,
): LevelGate[] {
  const storyArcs = arcs.filter((a) => a.storyId === storyId && a.chapterEnd >= a.chapterStart);
  const gates: LevelGate[] = [];

  for (let i = 1; i < storyArcs.length; i++) {
    const currentArc = storyArcs[i];
    const prevArc = storyArcs[i - 1];

    const testId = `readiness-${currentArc.cefrLevel.toLowerCase().replace('+', '-plus')}`;
    const targetChapterNumber = currentArc.chapterStart;
    const targetChapterId = `${storyId}-${String(targetChapterNumber).padStart(2, '0')}`;

    gates.push({
      id: `${storyId}:${currentArc.cefrLevel}`,
      level: currentArc.cefrLevel,
      storyId,
      targetChapterNumber,
      targetChapterId,
      title: currentArc.title,
      titleIt: currentArc.titleIt,
      storyArcTitle: currentArc.narrativeStage || currentArc.title,
      chapterRangeText: `Chapters ${currentArc.chapterStart}–${currentArc.chapterEnd}`,
      previousLevel: prevArc.cefrLevel,
      previousChaptersText:
        prevArc.chapterStart === 1
          ? `Chapters 1–${prevArc.chapterEnd}`
          : `Chapters ${prevArc.chapterStart}–${prevArc.chapterEnd}`,
      prerequisite: {
        type: 'complete',
        previousLevel: prevArc.cefrLevel,
        requiredChapterNumber: prevArc.chapterEnd,
        description: `Complete ${prevArc.cefrLevel} to continue`,
      },
      bypass: {
        type: 'readiness_test',
        testId,
        targetLevel: currentArc.cefrLevel,
        title: `${currentArc.cefrLevel} Readiness Test`,
        requiredScorePercent: 75,
      },
    });
  }

  return gates;
}

export function getLevelGate(
  level: CEFRLevel,
  arcs: StoryArc[] = DEFAULT_LUCA_ARCS,
  storyId: string = LUCA_STORY_ID,
): LevelGate | undefined {
  const gates = buildLevelGatesForStory(arcs, storyId);
  return gates.find((g) => g.level === level && g.storyId === storyId);
}

export function getGateForChapter(
  chapterNumber: number,
  arcs: StoryArc[] = DEFAULT_LUCA_ARCS,
  storyId: string = LUCA_STORY_ID,
): LevelGate | undefined {
  const gates = buildLevelGatesForStory(arcs, storyId);
  return gates.find((g) => g.targetChapterNumber === chapterNumber && g.storyId === storyId);
}

/**
 * Determines if a level gate is unlocked for the user, either through:
 * 1. Demonstrated readiness test-out (`unlockedLevelGates` contains gate.id), OR
 * 2. Completing the prerequisite chapter in `completedChapterIds`.
 */
export function isLevelGateUnlocked(
  gate: LevelGate,
  progress: Pick<ReadingProgressRecord, 'unlockedLevelGates' | 'completedChapterIds'>,
  chaptersById?: Map<string, { id: string; number: number }>,
): boolean {
  if (progress.unlockedLevelGates?.includes(gate.id)) {
    return true;
  }

  if (chaptersById) {
    const requiredNumber = gate.prerequisite.requiredChapterNumber;
    const reqChapter = [...chaptersById.values()].find((c) => c.number === requiredNumber);
    if (reqChapter && progress.completedChapterIds.includes(reqChapter.id)) {
      return true;
    }
  }

  return false;
}
