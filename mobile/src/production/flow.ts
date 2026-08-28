import type { LexiconEntry, ProductionExercise, Sentence } from '@/src/content/schemas';
import { countProductionWords } from '@/src/production/score';
import { resolveProductionFocusLemmas } from '@/src/vocabulary/productionFocusLemmas';

export type StorySentenceCue = {
  text: string;
  english: string | null;
};

export type { SelfAssessment } from '@/src/vocabulary/selfAssessment';

export type AfterComprehensionResults =
  | { action: 'show_production'; exercises: ProductionExercise[] }
  | { action: 'complete_chapter' };

export type ProductionDisplay = {
  promptEn: string;
  expectedIt: string;
  acceptableAnswers: string[];
};

export type ProductionCardView = {
  promptEn: string;
  expectedIt: string | null;
  acceptableAnswers: string[];
  showAnswerVisible: boolean;
  continueVisible: boolean;
  howDidYouDoVisible: boolean;
  progressLabel: string;
  /** A1 uses short word/phrase prompts — hide full-sentence hint UI. */
  wordFocused: boolean;
};

export type ProductionDisplayContext = {
  storySentence?: (StorySentenceCue & Partial<Pick<Sentence, 'tokens' | 'phrases'>>) | null;
  lexiconById?: Map<string, LexiconEntry>;
};

/** A1 word/chunk mode: visible Italian targets stay ≤2 words. */
export const A1_WORD_MODE_MAX_WORDS = 2;

export function isA1WordModeChunk(text: string): boolean {
  const n = countProductionWords(text);
  return n > 0 && n <= 10;
}

export function filterA1WordModeAlternatives(
  expectedIt: string,
  candidates: Array<string | undefined | null>,
): string[] {
  const expectedNorm = expectedIt.trim().toLowerCase().replace(/['’.,;:!?…]+/g, '');
  const seen = new Set<string>(expectedNorm ? [expectedNorm] : []);
  const out: string[] = [];
  for (const raw of candidates) {
    const line = raw?.trim();
    if (!line) continue;
    const norm = line.toLowerCase().replace(/['’.,;:!?…]+/g, '');
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(line);
  }
  return out;
}

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

export function a1WordProductionDisplay(
  exercise: ProductionExercise,
  context: ProductionDisplayContext = {},
): ProductionDisplay {
  const overlayExpected = exercise.expectedIt.trim();
  const overlayPrompt = cleanProductionPromptEn(exercise.promptEn);
  const extras = exercise.acceptableAnswers ?? [];

  return {
    promptEn: overlayPrompt,
    expectedIt: overlayExpected,
    acceptableAnswers: filterA1WordModeAlternatives(overlayExpected, extras),
  };
}

/**
 * Display authored production exercises with cleaned English prompts and deduplicated alternatives.
 */
export function productionDisplayFromStory(
  exercise: ProductionExercise,
  storySentence?: StorySentenceCue | null,
  context: ProductionDisplayContext = {},
): ProductionDisplay {
  const promptEn = cleanProductionPromptEn(exercise.promptEn);
  const expectedIt = exercise.expectedIt.trim();
  const rawAlts = exercise.acceptableAnswers ?? [];

  return {
    promptEn,
    expectedIt,
    acceptableAnswers: filterA1WordModeAlternatives(expectedIt, rawAlts),
  };
}

export function productionCardView(
  exercise: ProductionExercise,
  index: number,
  total: number,
  revealed: boolean,
  storySentence?: StorySentenceCue | null,
  context: ProductionDisplayContext = {},
): ProductionCardView {
  const display = productionDisplayFromStory(exercise, storySentence, {
    storySentence: context.storySentence ?? storySentence,
    lexiconById: context.lexiconById,
  });
  return {
    promptEn: display.promptEn,
    expectedIt: revealed ? display.expectedIt : null,
    acceptableAnswers: revealed ? display.acceptableAnswers : [],
    showAnswerVisible: !revealed,
    continueVisible: revealed,
    howDidYouDoVisible: revealed,
    progressLabel: `${index + 1} of ${total}`,
    wordFocused: exercise.level === 'A1',
  };
}

