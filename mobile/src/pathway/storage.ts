import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PathwayId } from '@/src/pathway/paths';
import { getLearnerCloud } from '@/src/sync/learnerSession';

const STORAGE_KEY = 'storia:pathway-prefs:v1';

export type PathwayPrefs = {
  pathwayGateSeen: boolean;
  primaryPathwayStoryId: string | null;
};

const DEFAULT_PREFS: PathwayPrefs = {
  pathwayGateSeen: false,
  primaryPathwayStoryId: null,
};

function normalize(raw: unknown): PathwayPrefs {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PREFS };
  const row = raw as Record<string, unknown>;
  return {
    pathwayGateSeen: row.pathwayGateSeen === true,
    primaryPathwayStoryId:
      typeof row.primaryPathwayStoryId === 'string' && row.primaryPathwayStoryId.trim()
        ? row.primaryPathwayStoryId
        : null,
  };
}

export async function loadPathwayPrefs(): Promise<PathwayPrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return normalize(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export async function savePathwayPrefs(prefs: PathwayPrefs): Promise<void> {
  const next = normalize(prefs);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  try {
    const cloud = getLearnerCloud();
    if (cloud) {
      await cloud.upsertLearnerState({
        preferences: {
          pathwayGateSeen: next.pathwayGateSeen,
          primaryPathwayStoryId: next.primaryPathwayStoryId,
        },
      });
    }
  } catch {
    /* local prefs still saved */
  }
}

export async function markPathwayGateSeen(): Promise<PathwayPrefs> {
  const current = await loadPathwayPrefs();
  const next = { ...current, pathwayGateSeen: true };
  await savePathwayPrefs(next);
  return next;
}

export async function setPrimaryPathway(storyId: string | null): Promise<PathwayPrefs> {
  const next = {
    pathwayGateSeen: true,
    primaryPathwayStoryId: storyId,
  };
  await savePathwayPrefs(next);
  return next;
}

export async function choosePathway(_pathwayId: PathwayId, storyId: string): Promise<PathwayPrefs> {
  return setPrimaryPathway(storyId);
}

/** @internal tests */
export async function __resetPathwayPrefs(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
