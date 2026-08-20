import type { AdaptiveStateRepository } from '@/src/adaptive/MemoryAdaptiveStateRepository';
import type { AdaptivePersistedState } from '@/src/adaptive/types';
import type { LearnerCloud } from '@/src/sync/types';
import { isMeaningfulAdaptive } from '@/src/sync/hydrateLearner';

export class SyncingAdaptiveStateRepository implements AdaptiveStateRepository {
  constructor(
    private readonly local: AdaptiveStateRepository,
    private readonly cloud: LearnerCloud | null,
  ) {}

  get() {
    return this.local.get();
  }

  async save(state: AdaptivePersistedState): Promise<void> {
    await this.local.save(state);
    if (this.cloud && isMeaningfulAdaptive(state)) {
      void this.cloud.upsertLearnerState({ adaptive: state });
    }
  }

  clear() {
    return this.local.clear();
  }
}
