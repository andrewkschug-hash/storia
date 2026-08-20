import lucaScenesJson from '../../content/stories/luca-a-roma/speak-scenes.json';
import preRomeScenesJson from '../../content/stories/luca-prima-di-roma/speak-scenes.json';
import {
  SpeakScenesFileSchema,
  type ProductionExercise,
  type SpeakScene,
  type SpeakSceneLine,
} from '@/src/content/schemas';

/** Authored speak scenes at batch milestones (Luca a Roma + hometown shorts). */

let cached: SpeakScene[] | null = null;

function loadScenes(): SpeakScene[] {
  if (cached) return cached;
  const luca = SpeakScenesFileSchema.parse(lucaScenesJson).scenes;
  const preRome = SpeakScenesFileSchema.parse(preRomeScenesJson).scenes;
  cached = [...luca, ...preRome];
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
