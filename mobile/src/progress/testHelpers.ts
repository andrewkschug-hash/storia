import { LUCA_STORY_ID } from '@/src/content/catalog';
import { isLessonBatchEnd } from '@/src/content/lessonBatches';
import { grammarCheckpointId, recapCheckpointId } from '@/src/content/storyPath';
import type { ProgressService } from '@/src/progress/ProgressService';

/** Test helper: unlock the next batch after finishing a fifth chapter. */
export async function completeBatchCheckpointsAfterChapter(
  service: ProgressService,
  storyId: string,
  chapterNumber: number,
): Promise<void> {
  if (!isLessonBatchEnd(chapterNumber)) return;
  if (storyId !== LUCA_STORY_ID && !storyId.startsWith('luca-prima-di-roma-')) return;
  await service.completeCheckpoint(grammarCheckpointId(storyId, chapterNumber));
  await service.completeCheckpoint(recapCheckpointId(storyId, chapterNumber));
}
