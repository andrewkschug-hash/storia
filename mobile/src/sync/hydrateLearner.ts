import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  type AccessibilitySettings,
} from '@/src/accessibility/types';
import {
  loadAccessibilitySettings,
  parseAccessibilitySettings,
  saveAccessibilitySettings,
} from '@/src/accessibility/storage';
import type { AdaptivePersistedState } from '@/src/adaptive/types';
import { createEmptyAdaptiveState } from '@/src/adaptive/types';
import { getAvailableStories } from '@/src/content/catalog';
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
} from '@/src/onboarding/storage';
import type { ReadingProgressRepository } from '@/src/progress/types';
import type { LearnerCloud, LearnerPreferences, LearnerStateSnapshot } from '@/src/sync/types';
import { normalizeVocabularyState } from '@/src/vocabulary/normalize';
import type { UserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
import type { UserVocabularyState } from '@/src/vocabulary/types';
import { createEmptyVocabularyState } from '@/src/vocabulary/types';

const AUDIO_SPEED_KEY = 'storia:audio-speed:v1';
const ADAPTIVE_KEY = 'storia:adaptive-state:v1';

export function isMeaningfulProgress(record: {
  lastOpenedAt: string | null;
  completedChapterIds: string[];
}): boolean {
  return Boolean(record.lastOpenedAt) || record.completedChapterIds.length > 0;
}

export function isMeaningfulVocabulary(state: UserVocabularyState | null | undefined): boolean {
  if (!state) return false;
  return Object.keys(state.lemmas).length > 0 || Object.keys(state.phrases).length > 0;
}

export function isMeaningfulAdaptive(state: AdaptivePersistedState | null | undefined): boolean {
  if (!state) return false;
  return Boolean(state.lastProfile) || state.logs.length > 0 || state.recentHits.length > 0;
}

export function isCustomAccessibility(settings: AccessibilitySettings | null | undefined): boolean {
  if (!settings) return false;
  return JSON.stringify(settings) !== JSON.stringify(DEFAULT_ACCESSIBILITY_SETTINGS);
}

function normalizeAdaptive(raw: unknown): AdaptivePersistedState {
  if (!raw || typeof raw !== 'object') return createEmptyAdaptiveState();
  const row = raw as Partial<AdaptivePersistedState>;
  return {
    logs: Array.isArray(row.logs) ? row.logs : [],
    recentHits: Array.isArray(row.recentHits) ? row.recentHits : [],
    lastProfile: row.lastProfile ?? null,
    lastUpdatedAt: typeof row.lastUpdatedAt === 'string' ? row.lastUpdatedAt : null,
  };
}

function normalizePreferences(raw: unknown): LearnerPreferences {
  if (!raw || typeof raw !== 'object') return {};
  const speed = (raw as { audioSpeed?: unknown }).audioSpeed;
  if (speed === 'slow' || speed === 'normal' || speed === 'faster') {
    return { audioSpeed: speed };
  }
  return {};
}

async function loadLocalAdaptive(): Promise<AdaptivePersistedState> {
  try {
    const raw = await AsyncStorage.getItem(ADAPTIVE_KEY);
    if (!raw) return createEmptyAdaptiveState();
    return normalizeAdaptive(JSON.parse(raw));
  } catch {
    return createEmptyAdaptiveState();
  }
}

async function saveLocalAdaptive(state: AdaptivePersistedState): Promise<void> {
  await AsyncStorage.setItem(ADAPTIVE_KEY, JSON.stringify(state));
}

async function loadLocalAudioSpeed(): Promise<LearnerPreferences['audioSpeed'] | null> {
  try {
    const raw = await AsyncStorage.getItem(AUDIO_SPEED_KEY);
    if (raw === 'slow' || raw === 'normal' || raw === 'faster') return raw;
  } catch {
    /* ignore */
  }
  return null;
}

async function saveLocalAudioSpeed(speed: LearnerPreferences['audioSpeed']): Promise<void> {
  if (!speed) return;
  await AsyncStorage.setItem(AUDIO_SPEED_KEY, speed);
}

async function hydrateVocabulary(
  cloud: LearnerCloud,
  vocabulary: UserVocabularyRepository,
  remote: LearnerStateSnapshot | null,
): Promise<{ restored: boolean; uploaded: boolean }> {
  const remoteVocab = remote?.vocabulary
    ? normalizeVocabularyState(remote.vocabulary)
    : createEmptyVocabularyState();
  const localVocab = await vocabulary.get();

  if (isMeaningfulVocabulary(remoteVocab)) {
    await vocabulary.save(remoteVocab);
    return { restored: true, uploaded: false };
  }
  if (isMeaningfulVocabulary(localVocab)) {
    await cloud.upsertLearnerState({ vocabulary: localVocab });
    return { restored: false, uploaded: true };
  }
  return { restored: false, uploaded: false };
}

async function hydrateAccessibility(
  cloud: LearnerCloud,
  remote: LearnerStateSnapshot | null,
): Promise<void> {
  const remoteSettings = remote?.accessibility
    ? parseAccessibilitySettings(remote.accessibility)
    : null;
  const local = await loadAccessibilitySettings();

  if (remoteSettings && isCustomAccessibility(remoteSettings)) {
    await saveAccessibilitySettings(remoteSettings, { syncCloud: false });
    return;
  }
  if (isCustomAccessibility(local)) {
    await cloud.upsertLearnerState({ accessibility: local });
    return;
  }
  if (remoteSettings) {
    await saveAccessibilitySettings(remoteSettings, { syncCloud: false });
  }
}

async function hydrateAdaptive(cloud: LearnerCloud, remote: LearnerStateSnapshot | null): Promise<void> {
  const remoteAdaptive = remote?.adaptive
    ? normalizeAdaptive(remote.adaptive)
    : createEmptyAdaptiveState();
  const local = await loadLocalAdaptive();

  if (isMeaningfulAdaptive(remoteAdaptive)) {
    await saveLocalAdaptive(remoteAdaptive);
    return;
  }
  if (isMeaningfulAdaptive(local)) {
    await cloud.upsertLearnerState({ adaptive: local });
  }
}

async function hydratePreferences(cloud: LearnerCloud, remote: LearnerStateSnapshot | null): Promise<void> {
  const remotePrefs = normalizePreferences(remote?.preferences);
  const localSpeed = await loadLocalAudioSpeed();

  if (remotePrefs.audioSpeed) {
    await saveLocalAudioSpeed(remotePrefs.audioSpeed);
    return;
  }
  if (localSpeed) {
    await cloud.upsertLearnerState({ preferences: { audioSpeed: localSpeed } });
  }
}

export async function hydrateLearnerFromCloud(
  cloud: LearnerCloud,
  local: ReadingProgressRepository,
  vocabulary?: UserVocabularyRepository | null,
): Promise<{
  onboarded: boolean;
  storiesRestored: number;
  storiesUploaded: number;
  vocabularyRestored: boolean;
  vocabularyUploaded: boolean;
}> {
  const remoteOnboarded = await cloud.getOnboardingComplete();
  const localOnboarded = await hasCompletedOnboarding();
  if (remoteOnboarded) {
    await markOnboardingComplete();
  } else if (localOnboarded) {
    await cloud.setOnboardingComplete();
  }

  const remote = await cloud.listProgress();
  const meaningfulRemote = remote.filter(isMeaningfulProgress);

  let storiesRestored = 0;
  let storiesUploaded = 0;

  if (meaningfulRemote.length > 0) {
    if (local.clearAll) {
      await local.clearAll();
    } else {
      for (const story of getAvailableStories()) {
        await local.clear(story.id);
      }
    }
    for (const row of meaningfulRemote) {
      await local.save(row);
    }
    storiesRestored = meaningfulRemote.length;
  } else {
    const localRows: typeof remote = [];
    if (local.listAll) {
      localRows.push(...(await local.listAll()));
    } else {
      for (const story of getAvailableStories()) {
        const row = await local.get(story.id);
        if (row) localRows.push(row);
      }
    }

    for (const row of localRows) {
      if (!isMeaningfulProgress(row)) continue;
      await cloud.upsertProgress(row);
      storiesUploaded += 1;
    }
  }

  const remoteState = await cloud.getLearnerState();

  let vocabularyRestored = false;
  let vocabularyUploaded = false;
  if (vocabulary) {
    const vocabResult = await hydrateVocabulary(cloud, vocabulary, remoteState);
    vocabularyRestored = vocabResult.restored;
    vocabularyUploaded = vocabResult.uploaded;
  }

  await hydrateAccessibility(cloud, remoteState);
  await hydrateAdaptive(cloud, remoteState);
  await hydratePreferences(cloud, remoteState);

  return {
    onboarded: remoteOnboarded || localOnboarded,
    storiesRestored,
    storiesUploaded,
    vocabularyRestored,
    vocabularyUploaded,
  };
}
