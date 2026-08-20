import { LUCA_STORY_ID } from '@/src/content/catalog';
import { isLessonBatchEnd } from '@/src/content/lessonBatches';
import { grammarCheckpointId, recapCheckpointId } from '@/src/content/storyPath';
import { a1MasteryCheckpointId } from '@/src/progress/a1Gate';
import type { ProgressService } from '@/src/progress/ProgressService';

/** Test helper: unlock the next batch after finishing a fifth chapter. */
export async function completeBatchCheckpointsAfterChapter(
  service: ProgressService,
  storyId: string,
  chapterNumber: number,
): Promise<void> {
  if (storyId !== LUCA_STORY_ID || !isLessonBatchEnd(chapterNumber)) return;
  await service.completeCheckpoint(grammarCheckpointId(storyId, chapterNumber));
  await service.completeCheckpoint(recapCheckpointId(storyId, chapterNumber));
}

/** Test helper: unlock hometown stories and A1+ chapters. */
export async function grantA1MasteryForTests(service: ProgressService): Promise<void> {
  await service.completeCheckpoint(a1MasteryCheckpointId(LUCA_STORY_ID));
}
