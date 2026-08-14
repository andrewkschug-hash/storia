import {
  ProductionExercisesFileSchema,
  type ProductionCefrLevel,
  type ProductionExercise,
  type ProductionExercisesFile,
  type ProductionMatch,
} from '@/src/content/schemas';
import { countProductionSentences, countProductionWords } from '@/src/production/score';

export type ProductionValidationIssue = {
  path: string;
  message: string;
};

export type ProductionSentenceIndex = Map<string, Map<string, string>>;

export type ProductionValidationContext = {
  storyId: string;
  chapterIds: Set<string>;
  /** chapterId → sentenceId → exact Italian text */
  sentencesByChapter: ProductionSentenceIndex;
  minChapter?: number;
  maxChapter?: number;
  /** When set, every exercise must use this CEFR production band. */
  expectedLevel?: ProductionCefrLevel;
};

export type ProductionValidationResult = {
  ok: boolean;
  issues: ProductionValidationIssue[];
  warnings: ProductionValidationIssue[];
  exerciseCount: number;
  chapterCounts: Record<string, number>;
  levelCounts: Record<ProductionCefrLevel, number>;
  matchCounts: Record<ProductionMatch, number>;
  sourceSentenceCount: number;
  alternativeCount: number;
};

const LUCA_CHAPTER_ID_RE = /^luca-a-roma-(\d{2})$/;
export const LUCA_STORY_ID_FOR_PRODUCTION = 'luca-a-roma';

export function productionLevelForChapter(chapterNumber: number): ProductionCefrLevel {
  if (chapterNumber >= 1 && chapterNumber <= 20) return 'A1';
  if (chapterNumber >= 21 && chapterNumber <= 24) return 'A1+';
  if (chapterNumber >= 25 && chapterNumber <= 40) return 'A2';
  throw new Error(`Chapter ${chapterNumber} is outside Luca 1–40`);
}

export function parseChapterNumber(chapterId: string): number | null {
  const match = LUCA_CHAPTER_ID_RE.exec(chapterId);
  if (!match) return null;
  return Number(match[1]);
}

export function isLucaProductionStory(storyId: string): boolean {
  return storyId === LUCA_STORY_ID_FOR_PRODUCTION;
}

export function validateProductionExercises(
  raw: unknown,
  context: ProductionValidationContext,
): ProductionValidationResult {
  const issues: ProductionValidationIssue[] = [];
  const warnings: ProductionValidationIssue[] = [];
  const minChapter = context.minChapter ?? 1;
  const maxChapter = context.maxChapter ?? 40;

  const parsed = ProductionExercisesFileSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({
        path: issue.path.length ? issue.path.join('.') : '(root)',
        message: issue.message,
      });
    }
    return emptyFail(issues);
  }

  const file: ProductionExercisesFile = parsed.data;
  if (file.storyId !== context.storyId) {
    issues.push({
      path: 'storyId',
      message: `storyId "${file.storyId}" does not match expected "${context.storyId}"`,
    });
  }

  const exerciseIds = new Set<string>();
  const sourceKeys = new Set<string>();
  const chapterCounts: Record<string, number> = {};
  const levelCounts: Record<ProductionCefrLevel, number> = { A1: 0, 'A1+': 0, A2: 0 };
  const matchCounts: Record<ProductionMatch, number> = { exact: 0, flexible: 0, semantic: 0 };
  let alternativeCount = 0;

  file.exercises.forEach((exercise, index) => {
    const path = `exercises[${index}]`;
    validateOneExercise(
      exercise,
      path,
      context,
      minChapter,
      maxChapter,
      issues,
      warnings,
      exerciseIds,
      sourceKeys,
    );
    chapterCounts[exercise.chapterId] = (chapterCounts[exercise.chapterId] ?? 0) + 1;
    if (exercise.level === 'A1' || exercise.level === 'A1+' || exercise.level === 'A2') {
      levelCounts[exercise.level] += 1;
    }
    if (exercise.match === 'exact' || exercise.match === 'flexible' || exercise.match === 'semantic') {
      matchCounts[exercise.match] += 1;
    }
    alternativeCount += exercise.acceptableAnswers?.length ?? 0;
  });

  return {
    ok: issues.length === 0,
    issues,
    warnings,
    exerciseCount: file.exercises.length,
    chapterCounts,
    levelCounts,
    matchCounts,
    sourceSentenceCount: sourceKeys.size,
    alternativeCount,
  };
}

function emptyFail(issues: ProductionValidationIssue[]): ProductionValidationResult {
  return {
    ok: false,
    issues,
    warnings: [],
    exerciseCount: 0,
    chapterCounts: {},
    levelCounts: { A1: 0, 'A1+': 0, A2: 0 },
    matchCounts: { exact: 0, flexible: 0, semantic: 0 },
    sourceSentenceCount: 0,
    alternativeCount: 0,
  };
}

function validateOneExercise(
  exercise: ProductionExercise,
  path: string,
  context: ProductionValidationContext,
  minChapter: number,
  maxChapter: number,
  issues: ProductionValidationIssue[],
  warnings: ProductionValidationIssue[],
  exerciseIds: Set<string>,
  sourceKeys: Set<string>,
) {
  if (exercise.storyId !== context.storyId) {
    issues.push({
      path: `${path}.storyId`,
      message: `storyId "${exercise.storyId}" does not match "${context.storyId}"`,
    });
  }

  if (exerciseIds.has(exercise.exerciseId)) {
    issues.push({
      path: `${path}.exerciseId`,
      message: `duplicate exerciseId "${exercise.exerciseId}"`,
    });
  } else {
    exerciseIds.add(exercise.exerciseId);
  }

  if (!context.chapterIds.has(exercise.chapterId)) {
    issues.push({
      path: `${path}.chapterId`,
      message: `unknown chapterId "${exercise.chapterId}"`,
    });
    return;
  }

  if (isLucaProductionStory(context.storyId)) {
    const chapterNumber = parseChapterNumber(exercise.chapterId);
    if (chapterNumber === null) {
      issues.push({
        path: `${path}.chapterId`,
        message: `chapterId "${exercise.chapterId}" is not a Luca chapter id`,
      });
      return;
    }
    if (chapterNumber < minChapter || chapterNumber > maxChapter) {
      issues.push({
        path: `${path}.chapterId`,
        message: `chapter ${chapterNumber} is outside Luca ${minChapter}–${maxChapter}`,
      });
    }

    const expectedLevel = productionLevelForChapter(
      Math.min(Math.max(chapterNumber, 1), 40),
    );
    if (chapterNumber >= 1 && chapterNumber <= 40 && exercise.level !== expectedLevel) {
      issues.push({
        path: `${path}.level`,
        message: `level "${exercise.level}" does not match chapter ${chapterNumber} band "${expectedLevel}"`,
      });
    }
  } else if (context.expectedLevel && exercise.level !== context.expectedLevel) {
    issues.push({
      path: `${path}.level`,
      message: `level "${exercise.level}" does not match story band "${context.expectedLevel}"`,
    });
  }

  const prompt = exercise.promptEn.trim();
  if (!prompt) {
    issues.push({ path: `${path}.promptEn`, message: 'English prompt is empty' });
  }

  const expectedIt = exercise.expectedIt.trim();
  if (!expectedIt) {
    issues.push({ path: `${path}.expectedIt`, message: 'expected Italian is empty' });
  }

  const sourceKey = `${exercise.chapterId}:${exercise.sourceSentenceId}`;
  if (sourceKeys.has(sourceKey)) {
    issues.push({
      path: `${path}.sourceSentenceId`,
      message: `duplicate source sentence ${sourceKey}`,
    });
  } else {
    sourceKeys.add(sourceKey);
  }

  const chapterSentences = context.sentencesByChapter.get(exercise.chapterId);
  if (!chapterSentences) {
    issues.push({
      path: `${path}.chapterId`,
      message: `no sentences indexed for "${exercise.chapterId}"`,
    });
    return;
  }

  const sourceText = chapterSentences.get(exercise.sourceSentenceId);
  if (sourceText === undefined) {
    issues.push({
      path: `${path}.sourceSentenceId`,
      message: `sentence "${exercise.sourceSentenceId}" does not exist in ${exercise.chapterId}`,
    });
    return;
  }

  // expectedIt may differ from the source sentence. The source only proves
  // the learner has already met the concept in the chapter.

  if (exercise.acceptableAnswers) {
    for (const [altIndex, alt] of exercise.acceptableAnswers.entries()) {
      if (!alt.trim()) {
        issues.push({
          path: `${path}.acceptableAnswers[${altIndex}]`,
          message: 'acceptable answer is empty',
        });
      }
      if (alt.trim() === expectedIt) {
        issues.push({
          path: `${path}.acceptableAnswers[${altIndex}]`,
          message: 'acceptable answer duplicates expectedIt',
        });
      }
    }
  }

  if (exercise.match === 'semantic' && !exercise.semantic) {
    issues.push({
      path: `${path}.semantic`,
      message: 'semantic match requires semantic constraints',
    });
  }

  const wordCount = countProductionWords(exercise.expectedIt);
  const sentenceCount = countProductionSentences(exercise.expectedIt);
  if (wordCount > 12) {
    warnings.push({
      path: `${path}.expectedIt`,
      message: `long production target (${wordCount} words); consider splitting`,
    });
  }
  if (sentenceCount > 2) {
    warnings.push({
      path: `${path}.expectedIt`,
      message: `multi-act production target (${sentenceCount} sentences); consider splitting`,
    });
  }
}
