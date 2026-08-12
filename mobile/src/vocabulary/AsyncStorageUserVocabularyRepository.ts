import AsyncStorage from '@react-native-async-storage/async-storage';

import { createEmptyVocabularyState, type UserVocabularyState } from '@/src/vocabulary/types';
import { normalizeVocabularyState } from '@/src/vocabulary/normalize';
import type { UserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';

const STORAGE_KEY = 'storia:user-vocabulary:v1';

export class AsyncStorageUserVocabularyRepository implements UserVocabularyRepository {
  async get(): Promise<UserVocabularyState> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyVocabularyState();
    try {
      return normalizeVocabularyState(JSON.parse(raw) as Partial<UserVocabularyState>);
    } catch {
      return createEmptyVocabularyState();
    }
  }

  async save(state: UserVocabularyState): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
