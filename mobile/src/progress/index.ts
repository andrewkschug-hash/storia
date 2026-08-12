import { getContentBundle } from '@/src/content';
import { AsyncStorageReadingProgressRepository } from '@/src/progress/AsyncStorageReadingProgressRepository';
import { ProgressService } from '@/src/progress/ProgressService';
import type { ReadingProgressRepository } from '@/src/progress/types';

let service: ProgressService | null = null;
let repoOverride: ReadingProgressRepository | null = null;

export function getProgressService(): ProgressService {
  if (!service) {
    const bundle = getContentBundle();
    const repo = repoOverride ?? new AsyncStorageReadingProgressRepository();
    service = new ProgressService(repo, bundle.story, bundle.chapters);
  }
  return service;
}

/** @internal tests */
export function __setProgressRepository(repo: ReadingProgressRepository | null) {
  repoOverride = repo;
  service = null;
}

/** @internal tests */
export function __resetProgressService() {
  service = null;
}
