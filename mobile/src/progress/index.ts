import { getCatalogStory, LUCA_STORY_ID } from '@/src/content/catalog';
import { getContentBundle } from '@/src/content';
import { AsyncStorageReadingProgressRepository } from '@/src/progress/AsyncStorageReadingProgressRepository';
import { ProgressService } from '@/src/progress/ProgressService';
import type { ReadingProgressRepository } from '@/src/progress/types';

const services = new Map<string, ProgressService>();
let repoOverride: ReadingProgressRepository | null = null;

/** Defaults to Luca a Roma. Progress is keyed by storyId — never by chapter number alone. */
export function getProgressService(storyId: string = LUCA_STORY_ID): ProgressService {
  const existing = services.get(storyId);
  if (existing) return existing;

  const bundle = getContentBundle(storyId);
  const repo = repoOverride ?? new AsyncStorageReadingProgressRepository();
  const narrativeArc = getCatalogStory(storyId)?.narrativeArc ?? bundle.narrativeArc;
  const service = new ProgressService(repo, bundle.story, bundle.chapters, narrativeArc);
  services.set(storyId, service);
  return service;
}

/** @internal tests */
export function __setProgressRepository(repo: ReadingProgressRepository | null) {
  repoOverride = repo;
  services.clear();
}

/** @internal tests */
export function __resetProgressService() {
  services.clear();
}
