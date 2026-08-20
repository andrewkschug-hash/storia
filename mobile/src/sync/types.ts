import type { AccessibilitySettings } from '@/src/accessibility/types';
import type { AdaptivePersistedState } from '@/src/adaptive/types';
import type { ReadingProgressRecord } from '@/src/progress/types';
import type { UserVocabularyState } from '@/src/vocabulary/types';

export type LearnerPreferences = {
  audioSpeed?: 'slow' | 'normal' | 'faster';
};

export type LearnerStateSnapshot = {
  vocabulary: UserVocabularyState | null;
  accessibility: AccessibilitySettings | null;
  adaptive: AdaptivePersistedState | null;
  preferences: LearnerPreferences | null;
  updatedAt: string | null;
};

export type LearnerStatePatch = {
  vocabulary?: UserVocabularyState | null;
  accessibility?: AccessibilitySettings | null;
  adaptive?: AdaptivePersistedState | null;
  preferences?: LearnerPreferences | null;
};

export type LearnerCloud = {
  getOnboardingComplete(): Promise<boolean | null>;
  setOnboardingComplete(): Promise<void>;
  listProgress(): Promise<ReadingProgressRecord[]>;
  upsertProgress(record: ReadingProgressRecord): Promise<void>;
  getLearnerState(): Promise<LearnerStateSnapshot | null>;
  upsertLearnerState(patch: LearnerStatePatch): Promise<void>;
};
