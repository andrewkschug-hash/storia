import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearAccessibilitySettings } from '@/src/accessibility/storage';
import { __resetAdaptiveService, setAdaptiveCloud } from '@/src/adaptive';
import { isSupabaseConfigured } from '@/src/lib/supabaseEnv';
import { markOnboardingComplete } from '@/src/onboarding/storage';
import { __resetProgressService, getProgressRepository, setProgressCloud } from '@/src/progress';
import { hydrateLearnerFromCloud } from '@/src/sync/hydrateLearner';
import { SupabaseLearnerCloud } from '@/src/sync/supabaseLearnerCloud';
import type { LearnerCloud } from '@/src/sync/types';
import {
  __resetVocabularyService,
  getVocabularyRepository,
  setVocabularyCloud,
} from '@/src/vocabulary';

const AUDIO_SPEED_KEY = 'storia:audio-speed:v1';
const ADAPTIVE_KEY = 'storia:adaptive-state:v1';
const VOCAB_KEY = 'storia:user-vocabulary:v1';

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

function wireCloud(cloud: LearnerCloud | null) {
  setProgressCloud(cloud);
  setVocabularyCloud(cloud);
  setAdaptiveCloud(cloud);
}

export async function completeOnboardingAndSync(): Promise<void> {
  await markOnboardingComplete();
  const cloud = getLearnerCloud();
  if (!cloud) return;
  wireCloud(cloud);
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
  wireCloud(cloud);
  hydrationPromise = (async () => {
    try {
      await hydrateLearnerFromCloud(cloud, getProgressRepository(), getVocabularyRepository());
      hydratedForUser = key;
      __resetProgressService();
      __resetVocabularyService();
      __resetAdaptiveService();
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
  try {
    await getVocabularyRepository().clear();
  } catch {
    await AsyncStorage.removeItem(VOCAB_KEY);
  }
  await clearAccessibilitySettings();
  await AsyncStorage.multiRemove([ADAPTIVE_KEY, AUDIO_SPEED_KEY]).catch(async () => {
    await AsyncStorage.removeItem(ADAPTIVE_KEY);
    await AsyncStorage.removeItem(AUDIO_SPEED_KEY);
  });
  wireCloud(null);
  hydratedForUser = null;
  hydrationPromise = null;
  __resetProgressService();
  __resetVocabularyService();
  __resetAdaptiveService();
}
