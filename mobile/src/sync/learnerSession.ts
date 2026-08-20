import { isSupabaseConfigured } from '@/src/lib/supabaseEnv';
import { markOnboardingComplete } from '@/src/onboarding/storage';
import { __resetProgressService, getProgressRepository, setProgressCloud } from '@/src/progress';
import { hydrateLearnerFromCloud } from '@/src/sync/hydrateLearner';
import { SupabaseLearnerCloud } from '@/src/sync/supabaseLearnerCloud';
import type { LearnerCloud } from '@/src/sync/types';

let cloudOverride: LearnerCloud | null | undefined;
let hydratedForUser: string | null = null;
let hydrationPromise: Promise<void> | null = null;

export function getLearnerCloud(): LearnerCloud | null {
  if (cloudOverride !== undefined) return cloudOverride;
  if (!isSupabaseConfigured()) return null;
  return new SupabaseLearnerCloud();
}

/** @internal tests */
export function __setLearnerCloud(cloud: LearnerCloud | null | undefined) {
  cloudOverride = cloud;
  hydratedForUser = null;
}

export function __resetLearnerHydration() {
  hydratedForUser = null;
  hydrationPromise = null;
}

export async function completeOnboardingAndSync(): Promise<void> {
  await markOnboardingComplete();
  const cloud = getLearnerCloud();
  if (!cloud) return;
  setProgressCloud(cloud);
  try {
    await cloud.setOnboardingComplete();
  } catch {
    /* local flag still saved */
  }
}

export async function hydrateLearnerIfNeeded(userId?: string | null): Promise<void> {
  const cloud = getLearnerCloud();
  if (!cloud) return;
  const key = userId ?? 'session';
  if (hydratedForUser === key) return;
  if (hydrationPromise) {
    await hydrationPromise;
    return;
  }
  setProgressCloud(cloud);
  hydrationPromise = (async () => {
    try {
      await hydrateLearnerFromCloud(cloud, getProgressRepository());
      hydratedForUser = key;
      __resetProgressService();
    } catch {
      /* stay on local cache */
    }
  })().finally(() => {
    hydrationPromise = null;
  });
  await hydrationPromise;
}

export async function clearLocalLearnerState(): Promise<void> {
  const repo = getProgressRepository();
  if (repo.clearAll) await repo.clearAll();
  setProgressCloud(null);
  hydratedForUser = null;
  hydrationPromise = null;
  __resetProgressService();
}
