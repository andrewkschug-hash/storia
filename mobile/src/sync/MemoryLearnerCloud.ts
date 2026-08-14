import type { ReadingProgressRecord } from '@/src/progress/types';
import type { LearnerCloud } from '@/src/sync/types';

export class MemoryLearnerCloud implements LearnerCloud {
  onboardingComplete: boolean | null = null;
  progress = new Map<string, ReadingProgressRecord>();

  async getOnboardingComplete(): Promise<boolean | null> {
    return this.onboardingComplete;
  }

  async setOnboardingComplete(): Promise<void> {
    this.onboardingComplete = true;
  }

  async listProgress(): Promise<ReadingProgressRecord[]> {
    return [...this.progress.values()].map((row) => ({
      ...row,
      completedChapterIds: [...row.completedChapterIds],
    }));
  }

  async upsertProgress(record: ReadingProgressRecord): Promise<void> {
    this.progress.set(record.storyId, {
      ...record,
      completedChapterIds: [...record.completedChapterIds],
    });
  }
}
