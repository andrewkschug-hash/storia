import lucaProductionJson from '../../content/stories/luca-a-roma/production-exercises.json';
import preRome01Json from '../../content/stories/luca-prima-di-roma-01/production-exercises.json';
import preRome02Json from '../../content/stories/luca-prima-di-roma-02/production-exercises.json';
import preRome03Json from '../../content/stories/luca-prima-di-roma-03/production-exercises.json';
import preRome04Json from '../../content/stories/luca-prima-di-roma-04/production-exercises.json';
import preRome05Json from '../../content/stories/luca-prima-di-roma-05/production-exercises.json';
import {
  ProductionExercisesFileSchema,
  type ProductionExercise,
} from '@/src/content/schemas';

const OVERLAY_JSON: unknown[] = [
  lucaProductionJson,
  preRome01Json,
  preRome02Json,
  preRome03Json,
  preRome04Json,
  preRome05Json,
];

let cached: ProductionExercise[] | null = null;

function cloneExercise(exercise: ProductionExercise): ProductionExercise {
  return {
    ...exercise,
    acceptableAnswers: exercise.acceptableAnswers ? [...exercise.acceptableAnswers] : undefined,
    focus: exercise.focus ? [...exercise.focus] : undefined,
    semantic: exercise.semantic
      ? {
          ...exercise.semantic,
          requiredConcepts: [...exercise.semantic.requiredConcepts],
          requiredPerson: exercise.semantic.requiredPerson
            ? [...exercise.semantic.requiredPerson]
            : undefined,
          requiredRelations: exercise.semantic.requiredRelations
            ? [...exercise.semantic.requiredRelations]
            : undefined,
          conceptAliases: exercise.semantic.conceptAliases
            ? Object.fromEntries(
                Object.entries(exercise.semantic.conceptAliases).map(([key, aliases]) => [
                  key,
                  [...aliases],
                ]),
              )
            : undefined,
        }
      : undefined,
  };
}

function loadExercises(): ProductionExercise[] {
  if (cached) return cached;
  const all: ProductionExercise[] = [];
  for (const raw of OVERLAY_JSON) {
    try {
      const parsed = ProductionExercisesFileSchema.parse(raw);
      all.push(...parsed.exercises.map(cloneExercise));
    } catch {
      // Invalid overlay is skipped; chapter completion still works without production.
    }
  }
  cached = all;
  return cached;
}

/** All authored production exercises, in file order. Read-only overlay. */
export function getProductionExercises(storyId?: string): readonly ProductionExercise[] {
  const all = loadExercises().map(cloneExercise);
  if (!storyId) return all;
  return all.filter((exercise) => exercise.storyId === storyId);
}

/** Exercises for one chapter, authored order. Empty if none / invalid overlay. */
export function getProductionExercisesForChapter(
  chapterId: string,
  storyId?: string,
): ProductionExercise[] {
  return loadExercises()
    .filter(
      (exercise) =>
        exercise.chapterId === chapterId && (!storyId || exercise.storyId === storyId),
    )
    .map(cloneExercise);
}

/** Tests only */
export function __resetProductionExerciseCache() {
  cached = null;
}
