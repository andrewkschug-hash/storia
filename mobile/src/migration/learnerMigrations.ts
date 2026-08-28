import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAvailableStories, getContentBundle } from '@/src/content';
import { getProductionExercises } from '@/src/content/productionExercises';
import { getSpeakSceneById } from '@/src/content/speakScenes';
import { peekProgress } from '@/src/progress';
import type { ProductionSelfAssessment, ReadingProgressRecord } from '@/src/progress/types';
import {
  resolveProductionFocusLemmas,
  resolveSentenceFocusLemmas,
} from '@/src/vocabulary/productionFocusLemmas';
import { createLemmaEncounter } from '@/src/vocabulary/normalize';
import type { SelfAssessment } from '@/src/vocabulary/selfAssessment';
import { applySelfAssessment } from '@/src/vocabulary/selfAssessment';
import { findSentenceById } from '@/src/vocabulary/storyExamples';
import type { UserVocabularyState } from '@/src/vocabulary/types';

const MIGRATION_VERSION_KEY = 'storia:migrations:v1';
const CURRENT_MIGRATION_VERSION = 1;

let migrationPromise: Promise<void> | null = null;
let migrationVersionOverride: number | null = null;

async function readMigrationVersion(): Promise<number> {
  if (migrationVersionOverride !== null) return migrationVersionOverride;
  if (typeof window === 'undefined') return CURRENT_MIGRATION_VERSION;
  try {
    const raw = await AsyncStorage.getItem(MIGRATION_VERSION_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return CURRENT_MIGRATION_VERSION;
  }
}

async function writeMigrationVersion(version: number): Promise<void> {
  if (typeof window === 'undefined') {
    migrationVersionOverride = version;
    return;
  }
  try {
    await AsyncStorage.setItem(MIGRATION_VERSION_KEY, String(version));
  } catch {
    migrationVersionOverride = version;
  }
}

export async function ensureLearnerMigrations(
  loadVocabulary: () => Promise<UserVocabularyState>,
  saveVocabulary: (state: UserVocabularyState) => Promise<void>,
): Promise<void> {
  if (migrationPromise) return migrationPromise;
  migrationPromise = runMigrations(loadVocabulary, saveVocabulary).finally(() => {
    migrationPromise = null;
  });
  return migrationPromise;
}

async function runMigrations(
  loadVocabulary: () => Promise<UserVocabularyState>,
  saveVocabulary: (state: UserVocabularyState) => Promise<void>,
): Promise<void> {
  const version = await readMigrationVersion();
  if (version >= CURRENT_MIGRATION_VERSION) return;

  const state = await loadVocabulary();
  let changed = false;

  if (version < 1) {
    changed = (await migrateProgressAssessments(state)) || changed;
  }

  if (changed) {
    await saveVocabulary(state);
  }
  await writeMigrationVersion(CURRENT_MIGRATION_VERSION);
}

function toAssessment(value: ProductionSelfAssessment | undefined): SelfAssessment | null {
  if (value === 'got_it' || value === 'almost' || value === 'not_yet') return value;
  return null;
}

async function migrateProgressAssessments(state: UserVocabularyState): Promise<boolean> {
  let changed = false;
  for (const story of getAvailableStories()) {
    const progress = await peekProgress(story.id);
    if (!progress) continue;
    changed = migrateStoryProgress(state, progress) || changed;
  }
  return changed;
}

function migrateStoryProgress(state: UserVocabularyState, progress: ReadingProgressRecord): boolean {
  let changed = false;
  const bundle = getContentBundle(progress.storyId);
  const exercises = getProductionExercises(progress.storyId);

  for (const record of Object.values(progress.productionByChapter ?? {})) {
    if (!record || record.skipped) continue;
    for (const attempt of record.attempts ?? []) {
      const assessment = toAssessment(attempt.assessment);
      if (!assessment) continue;
      const exercise = exercises.find((row) => row.exerciseId === attempt.exerciseId);
      if (!exercise) continue;
      const located = findSentenceById(bundle, exercise.sourceSentenceId, exercise.chapterId);
      if (!located) continue;
      const lemmaIds = resolveProductionFocusLemmas(
        exercise,
        located.sentence,
        bundle.lexiconById,
      );
      for (const lemmaId of lemmaIds) {
        if (applyMigrationAssessment(state, lemmaId, assessment)) changed = true;
      }
    }
  }

  for (const [sceneId, records] of Object.entries(progress.speakScenes ?? {})) {
    const scene = getSpeakSceneById(sceneId);
    if (!scene) continue;
    for (const sceneRecord of records) {
      for (const lineAttempt of sceneRecord.lines ?? []) {
        const line = (scene.lines ?? []).find((row) => row.id === lineAttempt.lineId);
        if (!line?.sourceSentenceId) continue;
        const located = findSentenceById(
          bundle,
          line.sourceSentenceId,
          line.sourceChapterId ?? undefined,
        );
        if (!located) continue;
        const lemmaIds = resolveSentenceFocusLemmas(located.sentence, bundle.lexiconById);
        for (const lemmaId of lemmaIds) {
          if (applyMigrationAssessment(state, lemmaId, lineAttempt.vote)) changed = true;
        }
      }
    }
  }

  return changed;
}

function applyMigrationAssessment(
  state: UserVocabularyState,
  lemmaId: string,
  assessment: SelfAssessment,
): boolean {
  const existing = state.lemmas[lemmaId];
  if (existing?.lastSelfAssessmentAt) return false;
  const row = existing ?? createLemmaEncounter(lemmaId);
  applySelfAssessment(row, assessment);
  state.lemmas[lemmaId] = row;
  return true;
}

/** @internal tests */
export async function __resetMigrationVersion(): Promise<void> {
  migrationVersionOverride = null;
  migrationPromise = null;
  if (typeof window !== 'undefined') {
    try {
      await AsyncStorage.removeItem(MIGRATION_VERSION_KEY);
    } catch {
      // ignore in test/runtime environments without storage
    }
  }
}

export { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY };
