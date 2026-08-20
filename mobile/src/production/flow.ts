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

function glossEnglish(entry: LexiconEntry): string {
  let gloss = entry.english.split(/[,;/]/)[0]?.trim() || entry.english;
  if (entry.partOfSpeech === 'verb') {
    gloss = gloss.replace(/^to\s+/i, '').trim();
  }
  return gloss;
}

function uniqueAnswers(...candidates: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of candidates) {
    const line = raw?.trim();
    if (!line) continue;
    const key = line.toLocaleLowerCase('it');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

/**
 * A1 production should ask for a single word or a short two-word chunk —
 * never a full story sentence like "Luca arrives in Rome."
 */
export function a1WordProductionDisplay(
  exercise: ProductionExercise,
  context: ProductionDisplayContext = {},
): ProductionDisplay {
  const overlayExpected = exercise.expectedIt.trim();
  const overlayPrompt = cleanProductionPromptEn(exercise.promptEn);
  const overlayWordCount = countProductionWords(overlayExpected);
  const extras = exercise.acceptableAnswers ?? [];

  // Authored short targets (Buongiorno, Ho fame) stay as-is — no full-sentence swap.
  if (overlayWordCount > 0 && overlayWordCount <= 2) {
    return {
      promptEn: overlayPrompt,
      expectedIt: overlayExpected,
      acceptableAnswers: uniqueAnswers(...extras),
    };
  }

  const source = context.storySentence;
  const lexicon = context.lexiconById;
  if (source?.tokens?.length && lexicon?.size) {
    const focusIds = resolveProductionFocusLemmas(exercise, source as Sentence, lexicon, 2);
    const primaryId = focusIds[0];
    const entry = primaryId ? lexicon.get(primaryId) : undefined;
    if (entry) {
      const surface =
        source.tokens.find((token) => token.lemmaId === entry.lemmaId)?.surface ?? entry.italian;
      return {
        promptEn: glossEnglish(entry),
        expectedIt: entry.italian,
        acceptableAnswers: uniqueAnswers(
          surface,
          overlayExpected,
          ...extras,
        ).filter((line) => line.toLocaleLowerCase('it') !== entry.italian.toLocaleLowerCase('it')),
      };
    }
  }

  // Fallback: first content-ish token from the overlay Italian (skip tiny function words).
  const tokens = overlayExpected
    .replace(/[.!?…]+$/g, '')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const skip = new Set(['a', 'di', 'da', 'in', 'su', 'con', 'per', 'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'e', 'o']);
  const content = tokens.find((token) => !skip.has(token.toLocaleLowerCase('it'))) ?? tokens[0];
  if (content) {
    return {
      promptEn: overlayPrompt.split(/\s+/).find((word) => word.length > 2) ?? overlayPrompt,
      expectedIt: content.replace(/[.,;:!?]+$/g, ''),
      acceptableAnswers: uniqueAnswers(overlayExpected, ...extras).filter(
        (line) => line.toLocaleLowerCase('it') !== content.toLocaleLowerCase('it'),
      ),
    };
  }

  return {
    promptEn: overlayPrompt,
    expectedIt: overlayExpected,
    acceptableAnswers: uniqueAnswers(...extras),
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
