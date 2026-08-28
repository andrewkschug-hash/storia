import lucaScenesJson from '../../content/stories/luca-a-roma/speak-scenes.json';
import preRomeScenesJson from '../../content/stories/luca-prima-di-roma/speak-scenes.json';
import {
  SpeakScenesFileSchema,
  type ProductionExercise,
  type SpeakScene,
  type SpeakSceneLine,
  type SpeakSceneTurn,
} from '@/src/content/schemas';

/** Authored speak scenes at batch milestones (Luca a Roma + hometown shorts). */

let cached: SpeakScene[] | null = null;

function normalizeScene(scene: SpeakScene): SpeakScene {
  if (scene.turns && scene.turns.length > 0) {
    const legacyLines: SpeakSceneLine[] = scene.turns
      .filter((t) => t.learnerTurn)
      .map((t) => ({
        id: t.id,
        en: t.learnerTurn!.objectiveEn,
        it: t.learnerTurn!.targetIt,
        acceptableAnswers: t.learnerTurn!.acceptableAnswers,
        semantic: t.learnerTurn!.semantic,
      }));
    return {
      ...scene,
      turns: scene.turns,
      lines: legacyLines.length > 0 ? legacyLines : (scene.lines ?? []),
    };
  }

  const turns: SpeakSceneTurn[] = (scene.lines ?? []).map((line) => ({
    id: line.id,
    speakerId: 'partner',
    speakerName: 'Partner',
    it: line.it,
    en: line.en,
    learnerTurn: {
      role: 'Luca',
      objectiveEn: line.en,
      intent: 'respond',
      targetIt: line.it,
      acceptableAnswers: line.acceptableAnswers,
      semantic: line.semantic,
    },
  }));

  return {
    ...scene,
    turns,
    lines: scene.lines ?? [],
  };
}

function loadScenes(): SpeakScene[] {
  if (cached) return cached;
  const luca = SpeakScenesFileSchema.parse(lucaScenesJson).scenes.map(normalizeScene);
  const preRome = SpeakScenesFileSchema.parse(preRomeScenesJson).scenes.map(normalizeScene);
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

/** Map a dialogue turn onto the production scorer. */
export function speakTurnToExercise(scene: SpeakScene, turn: SpeakSceneTurn): ProductionExercise {
  const learner = turn.learnerTurn ?? {
    role: 'Luca',
    objectiveEn: turn.en,
    intent: 'respond',
    targetIt: turn.it,
    acceptableAnswers: [],
  };

  return {
    exerciseId: turn.id,
    storyId: scene.storyId,
    chapterId: `${scene.storyId}-${String(scene.batchEnd).padStart(2, '0')}`,
    sourceSentenceId: turn.id,
    promptEn: learner.sayEn ?? learner.objectiveEn,
    expectedIt: learner.targetIt,
    acceptableAnswers: learner.acceptableAnswers,
    match: learner.semantic ? 'semantic' : 'flexible',
    semantic: learner.semantic,
    level: 'A1',
    focus: ['speak-scene', learner.intent],
  };
}

/** Map a retell line onto the existing production scorer (legacy compatibility). */
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

