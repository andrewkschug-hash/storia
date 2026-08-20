import { getContentBundle } from '@/src/content';
import { AdaptiveVocabularyService } from '@/src/adaptive/AdaptiveVocabularyService';
import { AsyncStorageAdaptiveStateRepository } from '@/src/adaptive/AsyncStorageAdaptiveStateRepository';
import type { AdaptiveStateRepository } from '@/src/adaptive/MemoryAdaptiveStateRepository';
import { getVocabularyService } from '@/src/vocabulary';
import { SyncingAdaptiveStateRepository } from '@/src/sync/SyncingAdaptiveStateRepository';
import type { LearnerCloud } from '@/src/sync/types';

let service: AdaptiveVocabularyService | null = null;
let repoOverride: AdaptiveStateRepository | null = null;
let localRepo: AsyncStorageAdaptiveStateRepository | null = null;
let adaptiveCloud: LearnerCloud | null = null;
let defaultRepo: AdaptiveStateRepository | null = null;

function getLocalRepository(): AsyncStorageAdaptiveStateRepository {
  if (!localRepo) localRepo = new AsyncStorageAdaptiveStateRepository();
  return localRepo;
}

export function setAdaptiveCloud(cloud: LearnerCloud | null) {
  adaptiveCloud = cloud;
  defaultRepo = null;
  service = null;
}

export function getAdaptiveRepository(): AdaptiveStateRepository {
  if (repoOverride) return repoOverride;
  if (!defaultRepo) {
    const local = getLocalRepository();
    defaultRepo = adaptiveCloud
      ? new SyncingAdaptiveStateRepository(local, adaptiveCloud)
      : local;
  }
  return defaultRepo;
}

export function getAdaptiveService(): AdaptiveVocabularyService {
  if (!service) {
    const bundle = getContentBundle();
    service = new AdaptiveVocabularyService(getAdaptiveRepository(), bundle, getVocabularyService());
  }
  return service;
}

/** @internal tests */
export function __setAdaptiveRepository(repo: AdaptiveStateRepository | null) {
  repoOverride = repo;
  defaultRepo = null;
  service = null;
}

/** @internal tests */
export function __resetAdaptiveService() {
  service = null;
}

export { AdaptiveVocabularyService } from '@/src/adaptive/AdaptiveVocabularyService';
export { MemoryAdaptiveStateRepository } from '@/src/adaptive/MemoryAdaptiveStateRepository';
export { ADAPTIVE_CONFIG, ADAPTIVE_LEMMA_TARGETS, ADAPTIVE_PHRASE_TARGETS } from '@/src/adaptive/config';
export { tapRate, recentTapRate } from '@/src/adaptive/metrics';
export { selectAdaptiveChapter } from '@/src/adaptive/select';
export { buildAdaptiveProfile } from '@/src/adaptive/profile';
export { selectReinforcingWords } from '@/src/adaptive/reinforcingWords';
