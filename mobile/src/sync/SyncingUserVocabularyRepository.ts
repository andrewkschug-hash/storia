import type { UserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
import type { UserVocabularyState } from '@/src/vocabulary/types';
import type { LearnerCloud } from '@/src/sync/types';
import { isMeaningfulVocabulary } from '@/src/sync/hydrateLearner';

export class SyncingUserVocabularyRepository implements UserVocabularyRepository {
  constructor(
    private readonly local: UserVocabularyRepository,
    private readonly cloud: LearnerCloud | null,
  ) {}

  get() {
    return this.local.get();
  }

  async save(state: UserVocabularyState): Promise<void> {
    await this.local.save(state);
    if (this.cloud && isMeaningfulVocabulary(state)) {
      void this.cloud.upsertLearnerState({ vocabulary: state });
    }
  }

  clear() {
    return this.local.clear();
  }
}
