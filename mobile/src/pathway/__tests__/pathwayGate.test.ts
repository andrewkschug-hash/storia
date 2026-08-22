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
      clear: async () => {
        store.clear();
      },
    },
  };
});

vi.mock('@/src/sync/learnerSession', () => ({
  getLearnerCloud: () => null,
}));

vi.mock('@/src/security/buildMode', () => ({
  isDevBuild: vi.fn(() => false),
  isProductionBuild: vi.fn(() => true),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import { LUCA_STORY_ID, __resetContentCache, getContentBundle } from '@/src/content';
import {
  A2_PLUS_PATHWAYS,
  CASA_PATHWAY_STORY_ID,
  LUCA_A2_FINAL_CHAPTER_ID,
  __resetPathwayPrefs,
  a2PlusLockedHint,
  canAccessA2Plus,
  choosePathway,
  loadPathwayPrefs,
  markPathwayGateSeen,
  shouldShowPathwayGate,
} from '@/src/pathway';
import {
  __resetProgressService,
  __setProgressRepository,
  getProgressRepository,
  getProgressService,
} from '@/src/progress';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import type { ReadingProgressRecord } from '@/src/progress/types';
import { __resetUnlockAllChapters, setUnlockAllChapters } from '@/src/progress/unlockAll';
import { isDevBuild } from '@/src/security/buildMode';

function lucaA2CompleteProgress(): ReadingProgressRecord {
  const chapters = getContentBundle(LUCA_STORY_ID).story.chapters;
  return {
    storyId: LUCA_STORY_ID,
    narrativeArc: 'luca-a-roma',
    currentChapterId: LUCA_A2_FINAL_CHAPTER_ID,
    lastSentenceId: null,
    completedChapterIds: chapters.map((c) => c.id),
    readingTimeMs: 0,
    lastOpenedAt: new Date().toISOString(),
    streakDays: 1,
    lastStreakDate: null,
    comprehensionByChapter: {},
    currentCEFRLevel: 'A2',
  };
}

afterEach(async () => {
  __resetContentCache();
  __resetProgressService();
  __setProgressRepository(null);
  __resetUnlockAllChapters();
  await __resetPathwayPrefs();
  vi.mocked(isDevBuild).mockReturnValue(false);
});

beforeEach(async () => {
  await AsyncStorage.clear();
  __setProgressRepository(new MemoryReadingProgressRepository());
});

describe('A2+ pathway definitions', () => {
  it('lists all three A2+ pathways as available', () => {
    const available = A2_PLUS_PATHWAYS.filter((p) => p.status === 'available');
    expect(available).toHaveLength(3);
    expect(available.map((p) => p.storyId)).toEqual([
      CASA_PATHWAY_STORY_ID,
      'lettera-per-elena',
      'il-villaggio-che-non-esiste',
    ]);
    expect(A2_PLUS_PATHWAYS.filter((p) => p.status === 'coming_soon')).toHaveLength(0);
    expect(A2_PLUS_PATHWAYS.every((p) => p.hookEn.length > 0)).toBe(true);
  });
});

describe('A2+ pathway access', () => {
  it('blocks learners until Luca A2 (ch40) is complete', async () => {
    expect(await canAccessA2Plus()).toBe(false);
    expect(await shouldShowPathwayGate()).toBe(false);
    expect(a2PlusLockedHint()).toMatch(/Chapter 40/i);
  });

  it('unlocks after Luca A2 completion and shows gate once', async () => {
    await getProgressRepository().save(lucaA2CompleteProgress());
    expect(await canAccessA2Plus()).toBe(true);
    expect(await shouldShowPathwayGate()).toBe(true);

    await markPathwayGateSeen();
    expect(await shouldShowPathwayGate()).toBe(false);
    expect((await loadPathwayPrefs()).pathwayGateSeen).toBe(true);
  });

  it('repeat entry does not re-show the gate', async () => {
    await getProgressRepository().save(lucaA2CompleteProgress());
    await markPathwayGateSeen();
    expect(await shouldShowPathwayGate()).toBe(false);
    expect(await shouldShowPathwayGate()).toBe(false);
  });

  it('allows unlockAllChapters bypass without Luca completion', async () => {
    setUnlockAllChapters(true);
    expect(await canAccessA2Plus()).toBe(true);
    expect(await shouldShowPathwayGate()).toBe(true);
  });

  it('allows isDevBuild bypass without Luca completion', async () => {
    vi.mocked(isDevBuild).mockReturnValue(true);
    expect(await canAccessA2Plus()).toBe(true);
    expect(await shouldShowPathwayGate()).toBe(true);
  });
});

describe('A2+ pathway selection persistence', () => {
  it('persists primaryPathwayStoryId and keeps gate seen on choose', async () => {
    await getProgressRepository().save(lucaA2CompleteProgress());
    const prefs = await choosePathway('la-casa-delle-finestre', CASA_PATHWAY_STORY_ID);
    expect(prefs.pathwayGateSeen).toBe(true);
    expect(prefs.primaryPathwayStoryId).toBe(CASA_PATHWAY_STORY_ID);

    const reloaded = await loadPathwayPrefs();
    expect(reloaded).toEqual(prefs);
    expect(await shouldShowPathwayGate()).toBe(false);
  });

  it('preserves per-storyId progress when setting primary path', async () => {
    await getProgressRepository().save(lucaA2CompleteProgress());
    await choosePathway('la-casa-delle-finestre', CASA_PATHWAY_STORY_ID);

    await getProgressRepository().save({
      storyId: CASA_PATHWAY_STORY_ID,
      narrativeArc: 'a2-plus-genre-paths',
      currentChapterId: 'la-casa-delle-finestre-02',
      lastSentenceId: null,
      completedChapterIds: ['la-casa-delle-finestre-01'],
      readingTimeMs: 0,
      lastOpenedAt: new Date().toISOString(),
      streakDays: 1,
      lastStreakDate: null,
      comprehensionByChapter: {},
      currentCEFRLevel: 'A2+',
    });
    __resetProgressService();

    await choosePathway('la-casa-delle-finestre', CASA_PATHWAY_STORY_ID);
    expect(await getProgressService(CASA_PATHWAY_STORY_ID).getChapterStatus('la-casa-delle-finestre-01')).toBe(
      'completed',
    );
    expect((await loadPathwayPrefs()).primaryPathwayStoryId).toBe(CASA_PATHWAY_STORY_ID);
  });

  it('Not now marks gate seen without setting a primary path', async () => {
    await getProgressRepository().save(lucaA2CompleteProgress());
    await markPathwayGateSeen();
    const prefs = await loadPathwayPrefs();
    expect(prefs.pathwayGateSeen).toBe(true);
    expect(prefs.primaryPathwayStoryId).toBeNull();
    expect(await shouldShowPathwayGate()).toBe(false);
  });

  it('available pathways each have a storyId', () => {
    for (const pathway of A2_PLUS_PATHWAYS.filter((p) => p.status === 'available')) {
      expect(pathway.storyId).toBeTruthy();
    }
  });
});
