import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { normalizeProgress, type ReadingProgressRecord } from '@/src/progress/types';
import type { LearnerCloud } from '@/src/sync/types';

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
}
