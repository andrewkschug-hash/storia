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
  return n > 0 && n <= A1_WORD_MODE_MAX_WORDS;
}

export function filterA1WordModeAlternatives(
  expectedIt: string,
  candidates: Array<string | undefined | null>,
): string[] {
  const expectedKey = expectedIt.trim().toLocaleLowerCase('it');
  const seen = new Set<string>(expectedKey ? [expectedKey] : []);
  const out: string[] = [];
  for (const raw of candidates) {
    const line = raw?.trim();
    if (!line) continue;
    if (!isA1WordModeChunk(line)) continue;
    const key = line.toLocaleLowerCase('it');
    if (seen.has(key)) continue;
    seen.add(key);
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

const BARE_COPULA_OR_AUXILIARY = new Set([
  'è',
  'sono',
  'siamo',
  'sei',
  'siete',
  'era',
  'erano',
  'stato',
  'stata',
  'stati',
  'state',
  'sarà',
  'saranno',
  'ho',
  'hai',
  'ha',
  'abbiamo',
  'avete',
  'hanno',
  'aveva',
  'avevano',
]);

export function isBareCopulaOrAuxiliary(text: string): boolean {
  const clean = text.trim().replace(/[.,;:!?…]+$/g, '').toLocaleLowerCase('it');
  return BARE_COPULA_OR_AUXILIARY.has(clean);
}

export function isBareBePrompt(promptEn: string): boolean {
  const clean = promptEn.trim().toLowerCase();
  return clean === 'be' || clean === 'to be';
}

function glossEnglish(entry: LexiconEntry): string {
  let gloss = entry.english.split(/[,;/]/)[0]?.trim() || entry.english;
  if (entry.partOfSpeech === 'verb') {
    gloss = gloss.replace(/^to\s+/i, '').trim();
  }
  return gloss;
}

/**
 * A1 production should ask for a single content word or a short two-word chunk —
 * never a full story sentence and never an isolated copula/auxiliary like "be" -> "è" or "sono".
 */
export function a1WordProductionDisplay(
  exercise: ProductionExercise,
  context: ProductionDisplayContext = {},
): ProductionDisplay {
  const overlayExpected = exercise.expectedIt.trim();
  const overlayPrompt = cleanProductionPromptEn(exercise.promptEn);
  const overlayWordCount = countProductionWords(overlayExpected);
  const extras = exercise.acceptableAnswers ?? [];

  // Authored short targets (Buongiorno, Ho fame, Sono Luca) stay as-is —
  // unless they are single bare copula/auxiliary ("è", "sono") with "be" prompt.
  if (overlayWordCount > 0 && overlayWordCount <= A1_WORD_MODE_MAX_WORDS) {
    const isSingleBareCopula =
      overlayWordCount === 1 &&
      (isBareCopulaOrAuxiliary(overlayExpected) || isBareBePrompt(overlayPrompt));
    if (!isSingleBareCopula && !isBareBePrompt(overlayPrompt)) {
      return {
        promptEn: overlayPrompt,
        expectedIt: overlayExpected,
        acceptableAnswers: filterA1WordModeAlternatives(overlayExpected, extras),
      };
    }
  }

  const source = context.storySentence;
  const lexicon = context.lexiconById;
  if (source?.tokens?.length && lexicon?.size) {
    const focusIds = resolveProductionFocusLemmas(exercise, source as Sentence, lexicon, 6);
    for (const primaryId of focusIds) {
      const entry = lexicon.get(primaryId);
      if (!entry) continue;
      const gloss = glossEnglish(entry);
      if (isBareBePrompt(gloss)) continue;

      const surfaceRaw =
        source.tokens.find((token) => token.lemmaId === entry.lemmaId)?.surface ?? entry.italian;
      const surface = surfaceRaw.replace(/[.,;:!?…]+$/g, '').trim() || entry.italian;

      if (isBareCopulaOrAuxiliary(surface) && countProductionWords(surface) === 1) {
        continue;
      }

      const primary = isA1WordModeChunk(surface) ? surface : entry.italian;
      return {
        promptEn: gloss,
        expectedIt: primary,
        acceptableAnswers: filterA1WordModeAlternatives(primary, [
          surface,
          entry.italian,
          ...extras,
        ]),
      };
    }
  }

  // Fallback: first content-bearing token from the overlay Italian (skip function words and bare copulas).
  const tokens = overlayExpected
    .replace(/[.!?…]+$/g, '')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const skip = new Set([
    'a',
    'di',
    'da',
    'in',
    'su',
    'con',
    'per',
    'il',
    'lo',
    'la',
    'i',
    'gli',
    'le',
    'un',
    'uno',
    'una',
    'e',
    'o',
    'è',
    'sono',
    'siamo',
    'sei',
    'era',
    'ho',
    'ha',
  ]);
  const content = tokens.find((token) => !skip.has(token.toLocaleLowerCase('it'))) ?? tokens[0];
  if (content) {
    const primary = content.replace(/[.,;:!?]+$/g, '');
    let safePrompt = overlayPrompt.split(/\s+/).find((word) => word.length > 2) ?? overlayPrompt;
    if (isBareBePrompt(safePrompt)) {
      safePrompt = primary;
    }
    return {
      promptEn: safePrompt,
      expectedIt: primary,
      acceptableAnswers: filterA1WordModeAlternatives(primary, extras),
    };
  }

  return {
    promptEn: overlayPrompt,
    expectedIt: overlayExpected,
    acceptableAnswers: filterA1WordModeAlternatives(overlayExpected, extras),
  };
}

/**
 * Prefer the story sentence (3rd person) over overlay first-person prompts.
 * Overlay answers remain acceptable so first-person production is still OK.
 * A1 never uses full story sentences — see a1WordProductionDisplay.
 */
export function productionDisplayFromStory(
  exercise: ProductionExercise,
  storySentence?: StorySentenceCue | null,
  context: ProductionDisplayContext = {},
): ProductionDisplay {
  if (exercise.level === 'A1') {
    return a1WordProductionDisplay(exercise, {
      storySentence: context.storySentence ?? storySentence,
      lexiconById: context.lexiconById,
    });
  }

  if (!storySentence?.text.trim()) {
    return {
      promptEn: cleanProductionPromptEn(exercise.promptEn),
      expectedIt: exercise.expectedIt,
      acceptableAnswers: [...(exercise.acceptableAnswers ?? [])],
    };
  }

  const sourceWordCount = countProductionWords(storySentence.text);
  const overlayWordCount = countProductionWords(exercise.expectedIt);

  // Referential integrity check: if story sentence is a runaway expanded sentence
  // (>16 words while overlay is <=10 words) and lacks specific English cue, fallback to authored exercise
  if (sourceWordCount > 16 && overlayWordCount <= 10 && !storySentence.english?.trim()) {
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
