import type { AccessibilitySettings } from '@/src/accessibility/types';
import type { AdaptivePersistedState } from '@/src/adaptive/types';
import type { ReadingProgressRecord } from '@/src/progress/types';
import type {
  LearnerCloud,
  LearnerPreferences,
  LearnerStatePatch,
  LearnerStateSnapshot,
} from '@/src/sync/types';
import type { UserVocabularyState } from '@/src/vocabulary/types';

export class MemoryLearnerCloud implements LearnerCloud {
  onboardingComplete: boolean | null = null;
  progress = new Map<string, ReadingProgressRecord>();
  vocabulary: UserVocabularyState | null = null;
  accessibility: AccessibilitySettings | null = null;
  adaptive: AdaptivePersistedState | null = null;
  preferences: LearnerPreferences | null = null;
  updatedAt: string | null = null;

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

  async getLearnerState(): Promise<LearnerStateSnapshot | null> {
    if (
      !this.vocabulary &&
      !this.accessibility &&
      !this.adaptive &&
      !this.preferences &&
      !this.updatedAt
    ) {
      return null;
    }
    return {
      vocabulary: this.vocabulary,
      accessibility: this.accessibility,
      adaptive: this.adaptive,
      preferences: this.preferences,
      updatedAt: this.updatedAt,
    };
  }

  async upsertLearnerState(patch: LearnerStatePatch): Promise<void> {
    if (patch.vocabulary !== undefined) this.vocabulary = patch.vocabulary;
    if (patch.accessibility !== undefined) this.accessibility = patch.accessibility;
    if (patch.adaptive !== undefined) this.adaptive = patch.adaptive;
    if (patch.preferences !== undefined) {
      this.preferences = { ...(this.preferences ?? {}), ...patch.preferences };
    }
    this.updatedAt = new Date().toISOString();
  }
}
