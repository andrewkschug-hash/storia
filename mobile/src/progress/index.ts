import { getCatalogStory, LUCA_STORY_ID } from '@/src/content/catalog';
import { getContentBundle } from '@/src/content';
import { AsyncStorageReadingProgressRepository } from '@/src/progress/AsyncStorageReadingProgressRepository';
import { ProgressService } from '@/src/progress/ProgressService';
import type { ReadingProgressRecord, ReadingProgressRepository } from '@/src/progress/types';
import { SyncingReadingProgressRepository } from '@/src/sync/SyncingReadingProgressRepository';
import type { LearnerCloud } from '@/src/sync/types';

const services = new Map<string, ProgressService>();
let repoOverride: ReadingProgressRepository | null = null;
let localRepo: AsyncStorageReadingProgressRepository | null = null;
let progressCloud: LearnerCloud | null = null;
let defaultRepo: ReadingProgressRepository | null = null;

function getLocalRepository(): AsyncStorageReadingProgressRepository {
  if (!localRepo) localRepo = new AsyncStorageReadingProgressRepository();
  return localRepo;
}

export function setProgressCloud(cloud: LearnerCloud | null) {
  progressCloud = cloud;
  defaultRepo = null;
  services.clear();
}

export function getProgressRepository(): ReadingProgressRepository {
  if (repoOverride) return repoOverride;
  if (!defaultRepo) {
    const local = getLocalRepository();
    defaultRepo = progressCloud ? new SyncingReadingProgressRepository(local, progressCloud) : local;
  }
  return defaultRepo;
}

/** Defaults to Luca a Roma. Progress is keyed by storyId — never by chapter number alone. */
export function getProgressService(storyId: string = LUCA_STORY_ID): ProgressService {
  const existing = services.get(storyId);
  if (existing) return existing;

  const bundle = getContentBundle(storyId);
  const repo = getProgressRepository();
  const narrativeArc = getCatalogStory(storyId)?.narrativeArc ?? bundle.narrativeArc;
  const service = new ProgressService(repo, bundle.story, bundle.chapters, narrativeArc);
  services.set(storyId, service);
  return service;
}

/** Read stored progress without creating a record. */
export async function peekProgress(storyId: string): Promise<ReadingProgressRecord | null> {
  return getProgressRepository().get(storyId);
}

/** @internal tests */
export function __setProgressRepository(repo: ReadingProgressRepository | null) {
  repoOverride = repo;
  defaultRepo = null;
  services.clear();
}

/** @internal tests */
export function __resetProgressService() {
  services.clear();
}
