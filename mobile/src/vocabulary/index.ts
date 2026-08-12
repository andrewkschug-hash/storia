import { getContentBundle } from '@/src/content';
import { AsyncStorageUserVocabularyRepository } from '@/src/vocabulary/AsyncStorageUserVocabularyRepository';
import { VocabularyService } from '@/src/vocabulary/VocabularyService';
import type { UserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';

let service: VocabularyService | null = null;
let repoOverride: UserVocabularyRepository | null = null;

export function getVocabularyService(): VocabularyService {
  if (!service) {
    const bundle = getContentBundle();
    const repo = repoOverride ?? new AsyncStorageUserVocabularyRepository();
    service = new VocabularyService(repo, bundle);
  }
  return service;
}

/** @internal tests */
export function __setVocabularyRepository(repo: UserVocabularyRepository | null) {
  repoOverride = repo;
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
