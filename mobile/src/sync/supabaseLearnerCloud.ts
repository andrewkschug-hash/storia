import { parseAccessibilitySettings } from '@/src/accessibility/storage';
import type { AdaptivePersistedState } from '@/src/adaptive/types';
import { createEmptyAdaptiveState } from '@/src/adaptive/types';
import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { normalizeProgress, type ReadingProgressRecord } from '@/src/progress/types';
import type {
  LearnerCloud,
  LearnerPreferences,
  LearnerStatePatch,
  LearnerStateSnapshot,
} from '@/src/sync/types';
import { normalizeVocabularyState } from '@/src/vocabulary/normalize';
import { createEmptyVocabularyState, type UserVocabularyState } from '@/src/vocabulary/types';

async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await getSupabase().auth.getUser();
    if (error || !data.user?.id) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

function asProgress(row: unknown): ReadingProgressRecord | null {
  if (!row || typeof row !== 'object') return null;
  const payload = (row as { payload?: unknown }).payload;
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as ReadingProgressRecord;
  if (typeof record.storyId !== 'string' || !record.storyId) return null;
  if (typeof record.currentChapterId !== 'string' || !record.currentChapterId) return null;
  return normalizeProgress({
    ...record,
    completedChapterIds: Array.isArray(record.completedChapterIds) ? record.completedChapterIds : [],
  });
}

function asVocabulary(raw: unknown): UserVocabularyState | null {
  if (!raw || typeof raw !== 'object') return null;
  return normalizeVocabularyState(raw as Partial<UserVocabularyState>);
}

function asAdaptive(raw: unknown): AdaptivePersistedState | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Partial<AdaptivePersistedState>;
  return {
    logs: Array.isArray(row.logs) ? row.logs : [],
    recentHits: Array.isArray(row.recentHits) ? row.recentHits : [],
    lastProfile: row.lastProfile ?? null,
    lastUpdatedAt: typeof row.lastUpdatedAt === 'string' ? row.lastUpdatedAt : null,
  };
}

function asPreferences(raw: unknown): LearnerPreferences | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as {
    audioSpeed?: unknown;
    pathwayGateSeen?: unknown;
    primaryPathwayStoryId?: unknown;
  };
  const prefs: LearnerPreferences = {};
  if (row.audioSpeed === 'slow' || row.audioSpeed === 'normal' || row.audioSpeed === 'faster') {
    prefs.audioSpeed = row.audioSpeed;
  }
  if (row.pathwayGateSeen === true) prefs.pathwayGateSeen = true;
  if (row.pathwayGateSeen === false) prefs.pathwayGateSeen = false;
  if (typeof row.primaryPathwayStoryId === 'string') {
    prefs.primaryPathwayStoryId = row.primaryPathwayStoryId;
  } else if (row.primaryPathwayStoryId === null) {
    prefs.primaryPathwayStoryId = null;
  }
  return Object.keys(prefs).length > 0 ? prefs : {};
}

export class SupabaseLearnerCloud implements LearnerCloud {
  async getOnboardingComplete(): Promise<boolean | null> {
    const userId = await currentUserId();
    if (!userId) return null;
    try {
      const { data, error } = await getSupabase()
        .from('storia_profiles')
        .select('onboarding_completed_at')
        .eq('id', userId)
        .maybeSingle();
      if (error) return null;
      return Boolean(data?.onboarding_completed_at);
    } catch {
      return null;
    }
  }

  async setOnboardingComplete(): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    try {
      await getSupabase()
        .from('storia_profiles')
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq('id', userId);
    } catch {
      /* local flag still saved */
    }
  }

  async listProgress(): Promise<ReadingProgressRecord[]> {
    const userId = await currentUserId();
    if (!userId) return [];
    try {
      const { data, error } = await getSupabase()
        .from('storia_story_progress')
        .select('payload')
        .eq('user_id', userId);
      if (error || !data) return [];
      return data.map(asProgress).filter((row): row is ReadingProgressRecord => Boolean(row));
    } catch {
      return [];
    }
  }

  async upsertProgress(record: ReadingProgressRecord): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    try {
      await getSupabase().from('storia_story_progress').upsert({
        user_id: userId,
        story_id: record.storyId,
        payload: record,
        updated_at: new Date().toISOString(),
      });
    } catch {
      /* local progress still saved */
    }
  }

  async getLearnerState(): Promise<LearnerStateSnapshot | null> {
    const userId = await currentUserId();
    if (!userId) return null;
    try {
      const { data, error } = await getSupabase()
        .from('storia_learner_state')
        .select('vocabulary, accessibility, adaptive, preferences, updated_at')
        .eq('user_id', userId)
        .maybeSingle();
      if (error || !data) return null;
      return {
        vocabulary: asVocabulary(data.vocabulary) ?? createEmptyVocabularyState(),
        accessibility: data.accessibility ? parseAccessibilitySettings(data.accessibility) : null,
        adaptive: asAdaptive(data.adaptive) ?? createEmptyAdaptiveState(),
        preferences: asPreferences(data.preferences),
        updatedAt: typeof data.updated_at === 'string' ? data.updated_at : null,
      };
    } catch {
      return null;
    }
  }

  async upsertLearnerState(patch: LearnerStatePatch): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    try {
      const existing = await this.getLearnerState();
      const preferences =
        patch.preferences !== undefined
          ? { ...(existing?.preferences ?? {}), ...patch.preferences }
          : existing?.preferences ?? null;
      await getSupabase().from('storia_learner_state').upsert({
        user_id: userId,
        vocabulary: patch.vocabulary !== undefined ? patch.vocabulary : existing?.vocabulary ?? null,
        accessibility:
          patch.accessibility !== undefined ? patch.accessibility : existing?.accessibility ?? null,
        adaptive: patch.adaptive !== undefined ? patch.adaptive : existing?.adaptive ?? null,
        preferences,
        updated_at: new Date().toISOString(),
      });
    } catch {
      /* local state still saved */
    }
  }
}
