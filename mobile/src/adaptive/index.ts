import { getContentBundle } from '@/src/content';
import { AdaptiveVocabularyService } from '@/src/adaptive/AdaptiveVocabularyService';
import { AsyncStorageAdaptiveStateRepository } from '@/src/adaptive/AsyncStorageAdaptiveStateRepository';
import type { AdaptiveStateRepository } from '@/src/adaptive/MemoryAdaptiveStateRepository';
import { getVocabularyService } from '@/src/vocabulary';

let service: AdaptiveVocabularyService | null = null;
let repoOverride: AdaptiveStateRepository | null = null;

export function getAdaptiveService(): AdaptiveVocabularyService {
  if (!service) {
    const bundle = getContentBundle();
    const repo = repoOverride ?? new AsyncStorageAdaptiveStateRepository();
    service = new AdaptiveVocabularyService(repo, bundle, getVocabularyService());
  }
  return service;
}

/** @internal tests */
export function __setAdaptiveRepository(repo: AdaptiveStateRepository | null) {
  repoOverride = repo;
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
export { scoreLemma, scorePhrase } from '@/src/adaptive/scoring';
