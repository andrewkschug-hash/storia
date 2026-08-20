import { getContentBundle } from '@/src/content';
import { AsyncStorageUserVocabularyRepository } from '@/src/vocabulary/AsyncStorageUserVocabularyRepository';
import { VocabularyService } from '@/src/vocabulary/VocabularyService';
import type { UserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
import { SyncingUserVocabularyRepository } from '@/src/sync/SyncingUserVocabularyRepository';
import type { LearnerCloud } from '@/src/sync/types';

let service: VocabularyService | null = null;
let repoOverride: UserVocabularyRepository | null = null;
let localRepo: AsyncStorageUserVocabularyRepository | null = null;
let vocabularyCloud: LearnerCloud | null = null;
let defaultRepo: UserVocabularyRepository | null = null;

function getLocalRepository(): AsyncStorageUserVocabularyRepository {
  if (!localRepo) localRepo = new AsyncStorageUserVocabularyRepository();
  return localRepo;
}

export function setVocabularyCloud(cloud: LearnerCloud | null) {
  vocabularyCloud = cloud;
  defaultRepo = null;
  service = null;
}

export function getVocabularyRepository(): UserVocabularyRepository {
  if (repoOverride) return repoOverride;
  if (!defaultRepo) {
    const local = getLocalRepository();
    defaultRepo = vocabularyCloud
      ? new SyncingUserVocabularyRepository(local, vocabularyCloud)
      : local;
  }
  return defaultRepo;
}

export function getVocabularyService(): VocabularyService {
  if (!service) {
    const bundle = getContentBundle();
    service = new VocabularyService(getVocabularyRepository(), bundle);
  }
  return service;
}

/** @internal tests */
export function __setVocabularyRepository(repo: UserVocabularyRepository | null) {
  repoOverride = repo;
  defaultRepo = null;
  service = null;
}

/** @internal tests */
export function __resetVocabularyService() {
  service = null;
}

export { VocabularyService } from '@/src/vocabulary/VocabularyService';
export { resolveTap, resolveSentenceLookup } from '@/src/vocabulary/resolveTap';
export {
  buildLexiconIndex,
  buildLexiconIndexFromBundle,
  findPhraseCoveringToken,
  phraseIdFromSurface,
} from '@/src/vocabulary/dictionaryIndex';
export { MemoryUserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
export { FAMILIARITY_CONFIG, REVIEW_INTERVAL_DAYS } from '@/src/vocabulary/familiarity';
export { browseVocabulary } from '@/src/vocabulary/catalog';
export {
  findExamplesForLemma,
  findExamplesForPhrase,
} from '@/src/vocabulary/storyExamples';
