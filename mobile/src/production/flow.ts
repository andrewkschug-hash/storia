import type { LexiconEntry, ProductionExercise, Sentence } from '@/src/content/schemas';
import { resolveProductionFocusLemmas } from '@/src/vocabulary/productionFocusLemmas';

export type StorySentenceCue = {
  text: string;
  english: string | null;
};

export type { SelfAssessment } from '@/src/vocabulary/selfAssessment';

export type AfterComprehensionResults =
  | { action: 'show_production'; exercises: ProductionExercise[] }
  | { action: 'complete_chapter' };

export type ProductionCardView = {
  promptEn: string;
  expectedIt: string | null;
  acceptableAnswers: string[];
  showAnswerVisible: boolean;
  continueVisible: boolean;
  howDidYouDoVisible: boolean;
  progressLabel: string;
  keywordMode: boolean;
};

export function afterComprehensionResults(
  exercises: ProductionExercise[],
): AfterComprehensionResults {
  if (exercises.length === 0) return { action: 'complete_chapter' };
  return { action: 'show_production', exercises };
}

export function advanceProduction(
  index: number,
  total: number,
): { index: number; done: false } | { done: true } {
  if (index + 1 < total) return { index: index + 1, done: false };
  return { done: true };
}

/** Skipping production always completes the chapter. Overlay presence does not gate reading. */
export function skipProduction(): { action: 'complete_chapter'; skipped: true } {
  return { action: 'complete_chapter', skipped: true };
}

/** Overlay prompts sometimes repeat the screen instruction. Never show that in the English card. */
export function cleanProductionPromptEn(promptEn: string): string {
  return promptEn.replace(/\s*say it in italian\.?\s*$/i, '').trim();
}

/** A1 learners practice key words, not full story sentences. Higher levels keep sentence mode. */
export function usesKeywordProduction(exercise: ProductionExercise): boolean {
  if (exercise.promptScope === 'sentence') return false;
  if (exercise.promptScope === 'keyword') return true;
  return exercise.level === 'A1';
}

function englishGloss(entry: LexiconEntry | undefined, fallback: string): string {
  if (!entry?.english) return fallback;
  return entry.english.split(/[,;]/)[0]?.trim() || fallback;
}

function uniqueAnswers(primary: string, extras: string[]): string[] {
  const normalizedPrimary = primary.toLocaleLowerCase('it');
  return [...new Set(extras.map((line) => line.trim()).filter(Boolean))].filter(
    (line) => line.toLocaleLowerCase('it') !== normalizedPrimary,
  );
}

/**
 * Keyword-focused display for early A1: prompt and expected answer use 1–2 focus words,
 * not the full narration sentence.
 */
export function productionKeywordDisplay(
  exercise: ProductionExercise,
  source: Sentence,
  lexiconById: Map<string, LexiconEntry>,
): { promptEn: string; expectedIt: string; acceptableAnswers: string[] } {
  const focusIds = resolveProductionFocusLemmas(exercise, source, lexiconById, 2);
  if (focusIds.length === 0) {
    return {
      promptEn: cleanProductionPromptEn(exercise.promptEn),
      expectedIt: exercise.expectedIt,
      acceptableAnswers: [...(exercise.acceptableAnswers ?? [])],
    };
  }

  const promptEn = focusIds
    .map((lemmaId) => englishGloss(lexiconById.get(lemmaId), lemmaId))
    .join(' · ');

  const surfacesByLemma = new Map(source.tokens.map((token) => [token.lemmaId, token.surface]));
  const expectedIt = focusIds
    .map((lemmaId) => lexiconById.get(lemmaId)?.italian ?? surfacesByLemma.get(lemmaId) ?? lemmaId)
    .join(' ');

  const extras = uniqueAnswers(expectedIt, [
    exercise.expectedIt,
    ...(exercise.acceptableAnswers ?? []),
    ...focusIds.map((lemmaId) => surfacesByLemma.get(lemmaId) ?? '').filter(Boolean),
  ]);

  return { promptEn, expectedIt, acceptableAnswers: extras };
}

/**
 * Prefer the story sentence (3rd person) over overlay first-person prompts.
 * Overlay answers remain acceptable so first-person production is still OK.
 */
export function productionDisplayFromStory(
  exercise: ProductionExercise,
  storySentence?: StorySentenceCue | null,
  options?: {
    sourceSentence?: Sentence | null;
    lexiconById?: Map<string, LexiconEntry>;
  },
): { promptEn: string; expectedIt: string; acceptableAnswers: string[] } {
  const source = options?.sourceSentence;
  const lexicon = options?.lexiconById;
  if (usesKeywordProduction(exercise) && source?.tokens?.length && lexicon) {
    return productionKeywordDisplay(exercise, source, lexicon);
  }

  if (!storySentence?.text.trim()) {
    return {
      promptEn: cleanProductionPromptEn(exercise.promptEn),
      expectedIt: exercise.expectedIt,
      acceptableAnswers: [...(exercise.acceptableAnswers ?? [])],
    };
  }

  const expectedIt = storySentence.text.trim();
  const promptEn = cleanProductionPromptEn(storySentence.english?.trim() || exercise.promptEn);
  const extras = uniqueAnswers(expectedIt, [
    exercise.expectedIt,
    ...(exercise.acceptableAnswers ?? []),
  ]);

  return {
    promptEn,
    expectedIt,
    acceptableAnswers: extras,
  };
}

export function productionCardView(
  exercise: ProductionExercise,
  index: number,
  total: number,
  revealed: boolean,
  storySentence?: StorySentenceCue | null,
  options?: {
    sourceSentence?: Sentence | null;
    lexiconById?: Map<string, LexiconEntry>;
  },
): ProductionCardView {
  const keywordMode = usesKeywordProduction(exercise);
  const display = productionDisplayFromStory(exercise, storySentence, options);
  return {
    promptEn: display.promptEn,
    expectedIt: revealed ? display.expectedIt : null,
    acceptableAnswers: revealed ? display.acceptableAnswers : [],
    showAnswerVisible: !revealed,
    continueVisible: revealed,
    howDidYouDoVisible: revealed,
    progressLabel: `${index + 1} of ${total}`,
    keywordMode,
  };
}
