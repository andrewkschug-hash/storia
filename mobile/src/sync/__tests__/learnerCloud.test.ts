import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: async (key: string) => {
        store.delete(key);
      },
      getAllKeys: async () => [...store.keys()],
      multiRemove: async (keys: string[]) => {
        for (const key of keys) store.delete(key);
      },
    },
  };
});

import { __resetContentCache } from '@/src/content';
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
  resetOnboarding,
} from '@/src/onboarding/storage';
import { __resetProgressService, __setProgressRepository, peekProgress } from '@/src/progress';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import { createInitialProgress } from '@/src/progress/types';
import { hydrateLearnerFromCloud } from '@/src/sync/hydrateLearner';
import { MemoryLearnerCloud } from '@/src/sync/MemoryLearnerCloud';
import { SyncingReadingProgressRepository } from '@/src/sync/SyncingReadingProgressRepository';

beforeEach(async () => {
  await resetOnboarding();
});

afterEach(async () => {
  __resetContentCache();
  __resetProgressService();
  __setProgressRepository(null);
  await resetOnboarding();
});

function progress(storyId: string, chapterId: string, extra?: Partial<ReturnType<typeof createInitialProgress>>) {
  return {
    ...createInitialProgress(storyId, chapterId),
    lastOpenedAt: '2026-08-13T12:00:00.000Z',
    completedChapterIds: [chapterId],
    ...extra,
  };
}

describe('learner cloud hydrate', () => {
  it('restores onboarding and story progress from the account', async () => {
    const cloud = new MemoryLearnerCloud();
    const local = new MemoryReadingProgressRepository();
    cloud.onboardingComplete = true;
    await cloud.upsertProgress(progress('luca-prima-di-roma-01', 'luca-prima-di-roma-01-01'));

    const result = await hydrateLearnerFromCloud(cloud, local);

    expect(result.storiesRestored).toBe(1);
    expect(await hasCompletedOnboarding()).toBe(true);
    expect((await local.get('luca-prima-di-roma-01'))?.completedChapterIds).toEqual([
      'luca-prima-di-roma-01-01',
    ]);
  });

  it('uploads local progress and onboarding when the account has none yet', async () => {
    const cloud = new MemoryLearnerCloud();
    const local = new MemoryReadingProgressRepository();
    await markOnboardingComplete();
    await local.save(progress('luca-prima-di-roma-01', 'luca-prima-di-roma-01-02'));

    const result = await hydrateLearnerFromCloud(cloud, local);

    expect(result.storiesUploaded).toBe(1);
    expect(cloud.onboardingComplete).toBe(true);
    expect(cloud.progress.get('luca-prima-di-roma-01')?.currentChapterId).toBe(
      'luca-prima-di-roma-01-02',
    );
  });

  it('does not upload empty getOrCreate-style rows', async () => {
    const cloud = new MemoryLearnerCloud();
    const local = new MemoryReadingProgressRepository();
    await local.save(createInitialProgress('luca-a-roma', 'luca-a-roma-01'));

    const result = await hydrateLearnerFromCloud(cloud, local);
    expect(result.storiesUploaded).toBe(0);
    expect(cloud.progress.size).toBe(0);
  });

  it('prefers remote progress over leftover local progress from another session', async () => {
    const cloud = new MemoryLearnerCloud();
    const local = new MemoryReadingProgressRepository();
    await local.save(progress('luca-prima-di-roma-03', 'luca-prima-di-roma-03-01'));
    await cloud.upsertProgress(progress('luca-prima-di-roma-01', 'luca-prima-di-roma-01-01'));

    await hydrateLearnerFromCloud(cloud, local);

    expect(await local.get('luca-prima-di-roma-03')).toBeNull();
    expect((await local.get('luca-prima-di-roma-01'))?.storyId).toBe('luca-prima-di-roma-01');
  });
});

describe('syncing progress repository', () => {
  it('writes meaningful chapter progress to the cloud', async () => {
    const cloud = new MemoryLearnerCloud();
    const local = new MemoryReadingProgressRepository();
    const repo = new SyncingReadingProgressRepository(local, cloud);
    const row = progress('luca-prima-di-roma-01', 'luca-prima-di-roma-01-01');
    await repo.save(row);
    expect(cloud.progress.get('luca-prima-di-roma-01')?.completedChapterIds).toEqual([
      'luca-prima-di-roma-01-01',
    ]);
    expect(await peekProgress('luca-prima-di-roma-01')).toBeNull();
    __setProgressRepository(repo);
    expect((await peekProgress('luca-prima-di-roma-01'))?.storyId).toBe('luca-prima-di-roma-01');
  });
});
