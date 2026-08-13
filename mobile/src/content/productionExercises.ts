import productionJson from '../../content/stories/luca-a-roma/production-exercises.json';
import {
  ProductionExercisesFileSchema,
  type ProductionExercise,
} from '@/src/content/schemas';

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
  try {
    const parsed = ProductionExercisesFileSchema.parse(productionJson);
    cached = parsed.exercises.map(cloneExercise);
  } catch {
    cached = [];
  }
  return cached;
}

/** All authored production exercises, in file order. Read-only overlay. */
export function getProductionExercises(): readonly ProductionExercise[] {
  return loadExercises().map(cloneExercise);
}

/** Exercises for one chapter, authored order. Empty if none / invalid overlay. */
export function getProductionExercisesForChapter(chapterId: string): ProductionExercise[] {
  return loadExercises()
    .filter((exercise) => exercise.chapterId === chapterId)
    .map(cloneExercise);
}

/** Tests only */
export function __resetProductionExerciseCache() {
  cached = null;
}
