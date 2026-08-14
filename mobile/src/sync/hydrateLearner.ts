import { getAvailableStories } from '@/src/content/catalog';
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
} from '@/src/onboarding/storage';
import type { ReadingProgressRepository } from '@/src/progress/types';
import type { LearnerCloud } from '@/src/sync/types';

export function isMeaningfulProgress(record: {
  lastOpenedAt: string | null;
  completedChapterIds: string[];
}): boolean {
  return Boolean(record.lastOpenedAt) || record.completedChapterIds.length > 0;
}

export async function hydrateLearnerFromCloud(
  cloud: LearnerCloud,
  local: ReadingProgressRepository,
): Promise<{ onboarded: boolean; storiesRestored: number; storiesUploaded: number }> {
  const remoteOnboarded = await cloud.getOnboardingComplete();
  const localOnboarded = await hasCompletedOnboarding();
  if (remoteOnboarded) {
    await markOnboardingComplete();
  } else if (localOnboarded) {
    await cloud.setOnboardingComplete();
  }

  const remote = await cloud.listProgress();
  const meaningfulRemote = remote.filter(isMeaningfulProgress);

  if (meaningfulRemote.length > 0) {
    if (local.clearAll) {
      await local.clearAll();
    } else {
      for (const story of getAvailableStories()) {
        await local.clear(story.id);
      }
    }
    for (const row of meaningfulRemote) {
      await local.save(row);
    }
    return {
      onboarded: remoteOnboarded || localOnboarded,
      storiesRestored: meaningfulRemote.length,
      storiesUploaded: 0,
    };
  }

  const localRows: typeof remote = [];
  if (local.listAll) {
    localRows.push(...(await local.listAll()));
  } else {
    for (const story of getAvailableStories()) {
      const row = await local.get(story.id);
      if (row) localRows.push(row);
    }
  }

  let uploaded = 0;
  for (const row of localRows) {
    if (!isMeaningfulProgress(row)) continue;
    await cloud.upsertProgress(row);
    uploaded += 1;
  }

  return {
    onboarded: remoteOnboarded || localOnboarded,
    storiesRestored: 0,
    storiesUploaded: uploaded,
  };
}
