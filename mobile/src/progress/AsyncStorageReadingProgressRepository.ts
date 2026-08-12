import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ReadingProgressRecord, ReadingProgressRepository } from '@/src/progress/types';

const keyFor = (storyId: string) => `storia:progress:${storyId}`;

export class AsyncStorageReadingProgressRepository implements ReadingProgressRepository {
  async get(storyId: string): Promise<ReadingProgressRecord | null> {
    const raw = await AsyncStorage.getItem(keyFor(storyId));
    if (!raw) return null;
    return JSON.parse(raw) as ReadingProgressRecord;
  }

  async save(progress: ReadingProgressRecord): Promise<void> {
    await AsyncStorage.setItem(keyFor(progress.storyId), JSON.stringify(progress));
  }

  async clear(storyId: string): Promise<void> {
    await AsyncStorage.removeItem(keyFor(storyId));
  }
}
