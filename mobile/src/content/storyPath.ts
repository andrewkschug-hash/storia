import {
  batchRangeForChapter,
  grammarNoteForBatch,
  isLessonBatchEnd,
  LESSON_BATCH_SIZE,
} from '@/src/content/lessonBatches';
import { getSpeakSceneForBatch } from '@/src/content/speakScenes';
import type { ChapterStatus, ReadingProgressRecord } from '@/src/progress/types';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';

export type StoryPathChapterItem = {
  kind: 'chapter';
  chapter: ChapterListItem;
};

export type StoryPathGrammarItem = {
  kind: 'grammar';
  id: string;
  batchStart: number;
  batchEnd: number;
  title: string;
  status: ChapterStatus;
};

export type StoryPathRecapItem = {
  kind: 'recap';
  id: string;
  batchStart: number;
  batchEnd: number;
  status: ChapterStatus;
};

export type StoryPathSpeakItem = {
  kind: 'speak';
  id: string;
  sceneId: string;
  batchStart: number;
  batchEnd: number;
  title: string;
  status: ChapterStatus;
};

export type StoryPathItem =
  | StoryPathChapterItem
  | StoryPathGrammarItem
  | StoryPathRecapItem
  | StoryPathSpeakItem;

export function grammarCheckpointId(storyId: string, batchEnd: number): string {
  return `${storyId}:grammar:${batchEnd}`;
}

export function recapCheckpointId(storyId: string, batchEnd: number): string {
  return `${storyId}:recap:${batchEnd}`;
}

export function isFirstChapterAfterBatch(chapterNumber: number): boolean {
  return chapterNumber > 1 && (chapterNumber - 1) % LESSON_BATCH_SIZE === 0;
}

export function mergedCheckpointIds(
  progress: ReadingProgressRecord,
  storyId: string,
  options?: { legacyBatchEnds?: number[] },
): Set<string> {
  const done = new Set(progress.completedCheckpointIds ?? []);
  for (const batchEnd of options?.legacyBatchEnds ?? []) {
    done.add(grammarCheckpointId(storyId, batchEnd));
    done.add(recapCheckpointId(storyId, batchEnd));
  }
  return done;
}

export function legacyBatchEndsForProgress(
  progress: ReadingProgressRecord,
  chapterNumberById: Map<string, number>,
): number[] {
  const maxCompleted = progress.completedChapterIds.reduce((max, id) => {
    const n = chapterNumberById.get(id) ?? 0;
    return Math.max(max, n);
  }, 0);
  const legacy: number[] = [];
  for (let batchEnd = LESSON_BATCH_SIZE; batchEnd < maxCompleted; batchEnd += LESSON_BATCH_SIZE) {
    const recapId = recapCheckpointId(progress.storyId, batchEnd);
    if (progress.completedCheckpointIds?.includes(recapId)) continue;
    legacy.push(batchEnd);
  }
  return legacy;
}

export function getGrammarCheckpointStatus(
  progress: ReadingProgressRecord,
  storyId: string,
  batchEnd: number,
  batchChapterCompleted: boolean,
  legacyBatchEnds: number[] = [],
): ChapterStatus {
  const id = grammarCheckpointId(storyId, batchEnd);
  const done = mergedCheckpointIds(progress, storyId, { legacyBatchEnds });
  if (done.has(id)) return 'completed';
  if (!batchChapterCompleted) return 'locked';
  return 'available';
}

export function getRecapCheckpointStatus(
  progress: ReadingProgressRecord,
  storyId: string,
  batchEnd: number,
  grammarStatus: ChapterStatus,
  legacyBatchEnds: number[] = [],
): ChapterStatus {
  const id = recapCheckpointId(storyId, batchEnd);
  const done = mergedCheckpointIds(progress, storyId, { legacyBatchEnds });
  if (done.has(id)) return 'completed';
  if (grammarStatus === 'locked') return 'locked';
  if (grammarStatus !== 'completed') return 'locked';
  return 'available';
}

export function getSpeakPathStatus(
  progress: ReadingProgressRecord,
  recapStatus: ChapterStatus,
  sceneId: string,
): ChapterStatus {
  if (recapStatus !== 'completed') return 'locked';
  const history = progress.speakScenes?.[sceneId] ?? [];
  const finished = history.some((record) => record.skipped === false && record.completedAt);
  return finished ? 'completed' : 'available';
}

/** Insert grammar + recap nodes after every fifth chapter (Duolingo-style path). */
export function buildStoryPath(
  chapters: ChapterListItem[],
  progress: ReadingProgressRecord | null,
  storyId: string,
): StoryPathItem[] {
  const items: StoryPathItem[] = [];
  const record =
    progress ??
    ({
      storyId,
      completedChapterIds: [],
      completedCheckpointIds: [],
    } as ReadingProgressRecord);

  const chapterNumberById = new Map(chapters.map((c) => [c.id, c.number]));
  const legacyBatchEnds = progress
    ? legacyBatchEndsForProgress(progress, chapterNumberById)
    : [];

  for (const chapter of chapters) {
    items.push({ kind: 'chapter', chapter });

    if (!isLessonBatchEnd(chapter.number)) continue;

    const batchEnd = chapter.number;
    const { start: batchStart } = batchRangeForChapter(batchEnd);
    const batchDone = chapter.status === 'completed';
    const grammarStatus = getGrammarCheckpointStatus(
      record,
      storyId,
      batchEnd,
      batchDone,
      legacyBatchEnds,
    );
    const grammarNote = grammarNoteForBatch(batchStart, batchEnd);

    items.push({
      kind: 'grammar',
      id: grammarCheckpointId(storyId, batchEnd),
      batchStart,
      batchEnd,
      title: grammarNote?.title ?? 'Grammar',
      status: grammarStatus,
    });

    const recapStatus = getRecapCheckpointStatus(
      record,
      storyId,
      batchEnd,
      grammarStatus,
      legacyBatchEnds,
    );

    items.push({
      kind: 'recap',
      id: recapCheckpointId(storyId, batchEnd),
      batchStart,
      batchEnd,
      status: recapStatus,
    });

    const scene = getSpeakSceneForBatch(storyId, batchEnd);
    if (scene) {
      items.push({
        kind: 'speak',
        id: scene.id,
        sceneId: scene.id,
        batchStart,
        batchEnd,
        title: scene.title,
        status: getSpeakPathStatus(record, recapStatus, scene.id),
      });
    }
  }

  return items;
}

export function recapBlocksChapter(
  progress: ReadingProgressRecord,
  storyId: string,
  chapterNumber: number,
  chapterNumberById: Map<string, number>,
): boolean {
  if (!isFirstChapterAfterBatch(chapterNumber)) return false;
  const batchEnd = chapterNumber - 1;
  const recapId = recapCheckpointId(storyId, batchEnd);
  const legacy = legacyBatchEndsForProgress(progress, chapterNumberById);
  const done = mergedCheckpointIds(progress, storyId, { legacyBatchEnds: legacy });
  return !done.has(recapId);
}
