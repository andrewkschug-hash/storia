import type { ProductionExercise } from '@/src/content/schemas';

export type StorySentenceCue = {
  text: string;
  english: string | null;
};

export type SelfAssessment = 'got_it' | 'almost' | 'not_yet';

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

/**
 * Prefer the story sentence (3rd person) over overlay first-person prompts.
 * Overlay answers remain acceptable so first-person production is still OK.
 */
export function productionDisplayFromStory(
  exercise: ProductionExercise,
  storySentence?: StorySentenceCue | null,
): { promptEn: string; expectedIt: string; acceptableAnswers: string[] } {
  if (!storySentence?.text.trim()) {
    return {
      promptEn: cleanProductionPromptEn(exercise.promptEn),
      expectedIt: exercise.expectedIt,
      acceptableAnswers: [...(exercise.acceptableAnswers ?? [])],
    };
  }

  const expectedIt = storySentence.text.trim();
  const promptEn = cleanProductionPromptEn(storySentence.english?.trim() || exercise.promptEn);
  const extras = [exercise.expectedIt, ...(exercise.acceptableAnswers ?? [])]
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.toLocaleLowerCase('it') !== expectedIt.toLocaleLowerCase('it'));

  return {
    promptEn,
    expectedIt,
    acceptableAnswers: [...new Set(extras)],
  };
}

export function productionCardView(
  exercise: ProductionExercise,
  index: number,
  total: number,
  revealed: boolean,
  storySentence?: StorySentenceCue | null,
): ProductionCardView {
  const display = productionDisplayFromStory(exercise, storySentence);
  return {
    promptEn: display.promptEn,
    expectedIt: revealed ? display.expectedIt : null,
    acceptableAnswers: revealed ? display.acceptableAnswers : [],
    showAnswerVisible: !revealed,
    continueVisible: revealed,
    howDidYouDoVisible: revealed,
    progressLabel: `${index + 1} of ${total}`,
  };
}
