import lucaScenesJson from '../../content/stories/luca-a-roma/speak-scenes.json';
import {
  SpeakScenesFileSchema,
  type ProductionExercise,
  type SpeakScene,
  type SpeakSceneLine,
} from '@/src/content/schemas';

/** V1: one authored Luca scene (chapter 15). Do not generate scenes or add more until finish-rate evidence exists. */

let cached: SpeakScene[] | null = null;

function loadScenes(): SpeakScene[] {
  if (cached) return cached;
  cached = SpeakScenesFileSchema.parse(lucaScenesJson).scenes;
  return cached;
}

export function getSpeakScenes(storyId?: string): SpeakScene[] {
  const scenes = loadScenes();
  if (!storyId) return scenes;
  return scenes.filter((scene) => scene.storyId === storyId);
}

export function getSpeakSceneForBatch(storyId: string, batchEnd: number): SpeakScene | null {
  return getSpeakScenes(storyId).find((scene) => scene.batchEnd === batchEnd) ?? null;
}

export function getSpeakSceneById(sceneId: string): SpeakScene | null {
  return loadScenes().find((scene) => scene.id === sceneId) ?? null;
}

/** Map a retell line onto the existing production scorer. */
export function speakLineToExercise(scene: SpeakScene, line: SpeakSceneLine): ProductionExercise {
  return {
    exerciseId: line.id,
    storyId: scene.storyId,
    chapterId: line.sourceChapterId ?? `${scene.storyId}-${String(scene.batchEnd).padStart(2, '0')}`,
    sourceSentenceId: line.sourceSentenceId ?? line.id,
    promptEn: line.en,
    expectedIt: line.it,
    acceptableAnswers: line.acceptableAnswers,
    match: line.semantic ? 'semantic' : 'flexible',
    semantic: line.semantic,
    level: 'A1',
    focus: ['speak-scene'],
  };
}

/** Tests only */
export function __resetSpeakSceneCache() {
  cached = null;
}
