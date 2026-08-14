import type { ReadingProgressRecord } from '@/src/progress/types';

export type LearnerCloud = {
  getOnboardingComplete(): Promise<boolean | null>;
  setOnboardingComplete(): Promise<void>;
  listProgress(): Promise<ReadingProgressRecord[]>;
  upsertProgress(record: ReadingProgressRecord): Promise<void>;
};
