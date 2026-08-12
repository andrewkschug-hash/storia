import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AdaptivePersistedState } from '@/src/adaptive/types';
import { createEmptyAdaptiveState } from '@/src/adaptive/types';
import type { AdaptiveStateRepository } from '@/src/adaptive/MemoryAdaptiveStateRepository';

const STORAGE_KEY = 'storia:adaptive-state:v1';

export class AsyncStorageAdaptiveStateRepository implements AdaptiveStateRepository {
  async get(): Promise<AdaptivePersistedState> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyAdaptiveState();
    try {
      const parsed = JSON.parse(raw) as AdaptivePersistedState;
      return {
        logs: parsed.logs ?? [],
        recentHits: parsed.recentHits ?? [],
        lastProfile: parsed.lastProfile ?? null,
        lastUpdatedAt: parsed.lastUpdatedAt ?? null,
      };
    } catch {
      return createEmptyAdaptiveState();
    }
  }

  async save(state: AdaptivePersistedState): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
