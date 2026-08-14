import type { ReadingProgressRecord, ReadingProgressRepository } from '@/src/progress/types';
import { isMeaningfulProgress } from '@/src/sync/hydrateLearner';
import type { LearnerCloud } from '@/src/sync/types';

export class SyncingReadingProgressRepository implements ReadingProgressRepository {
  constructor(
    private readonly local: ReadingProgressRepository,
    private readonly cloud: LearnerCloud | null,
  ) {}

  get(storyId: string) {
    return this.local.get(storyId);
  }

  async save(progress: ReadingProgressRecord): Promise<void> {
    await this.local.save(progress);
    if (this.cloud && isMeaningfulProgress(progress)) {
      try {
        await this.cloud.upsertProgress(progress);
      } catch {
        /* keep local */
      }
    }
  }

  clear(storyId: string) {
    return this.local.clear(storyId);
  }

  listAll() {
    return this.local.listAll?.() ?? Promise.resolve([]);
  }

  clearAll() {
    return this.local.clearAll?.() ?? Promise.resolve();
  }
}
