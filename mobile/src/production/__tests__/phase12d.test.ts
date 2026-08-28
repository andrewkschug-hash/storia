import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { loadContentBundle } from '@/src/content/loadContentBundle';
import {
  getProductionExercises,
  getProductionExercisesForChapter,
} from '@/src/content/productionExercises';
import type { ProductionExercise } from '@/src/content/schemas';
import { ProgressService } from '@/src/progress/ProgressService';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import {
  advanceProduction,
  afterComprehensionResults,
  productionCardView,
  productionDisplayFromStory,
  skipProduction,
} from '@/src/production/flow';
import { countProductionWords } from '@/src/production/score';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '../../../content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

function loadBundle() {
  const chapterJsonByFile: Record<string, unknown> = {};
  for (const file of readdirSync(chaptersDir)) {
    if (!file.endsWith('.json')) continue;
    chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
  }
  return loadContentBundle({
    charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
    locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
    lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
    manifestJson: JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')),
    chapterJsonByFile,
    storyPath: 'stories/luca-a-roma',
  });
}

function sampleExercise(overrides: Partial<ProductionExercise> = {}): ProductionExercise {
  return {
    exerciseId: 'luca-a-roma-ch01-prod-02',
    storyId: 'luca-a-roma',
    chapterId: 'luca-a-roma-01',
    sourceSentenceId: 's05',
    promptEn: "I'm hungry. Say it in Italian.",
    expectedIt: 'Ho fame.',
    acceptableAnswers: ['Io ho fame.'],
    match: 'flexible',
    level: 'A1',
    focus: ['avere', 'fame'],
    ...overrides,
  };
}

describe('Phase 12D production overlay loading', () => {
  it('loads 4 authored exercises for a Luca chapter', () => {
    const exercises = getProductionExercisesForChapter('luca-a-roma-01');
    expect(exercises).toHaveLength(4);
    expect(exercises.map((e) => e.exerciseId)).toEqual([
      'luca-a-roma-ch01-prod-01',
      'luca-a-roma-ch01-prod-02',
      'luca-a-roma-ch01-prod-03',
      'luca-a-roma-ch01-prod-04',
    ]);
    expect(exercises.every((e) => e.chapterId === 'luca-a-roma-01')).toBe(true);
  });

  it('keeps authored order across all 40 chapters', () => {
    const all = getProductionExercises('luca-a-roma');
    expect(all).toHaveLength(160);
    for (let n = 1; n <= 40; n += 1) {
      const id = `luca-a-roma-${String(n).padStart(2, '0')}`;
      const chapterExercises = getProductionExercisesForChapter(id);
      expect(chapterExercises, id).toHaveLength(4);
      const fromAll = all.filter((e) => e.chapterId === id);
      expect(chapterExercises.map((e) => e.exerciseId)).toEqual(fromAll.map((e) => e.exerciseId));
    }
  });

  it('returns no exercises when the overlay has none for a chapter', () => {
    expect(getProductionExercisesForChapter('missing-chapter')).toEqual([]);
    expect(afterComprehensionResults([])).toEqual({ action: 'complete_chapter' });
  });

  it('does not mutate the overlay when callers edit returned objects', () => {
    const first = getProductionExercisesForChapter('luca-a-roma-01');
    const originalPrompt = first[0].promptEn;
    const originalExpected = first[0].expectedIt;
    first[0].promptEn = 'MUTATED';
    first[0].expectedIt = 'MUTATO';
    first[0].acceptableAnswers?.push('nope');
    first.pop();

    const again = getProductionExercisesForChapter('luca-a-roma-01');
    expect(again).toHaveLength(4);
    expect(again[0].promptEn).toBe(originalPrompt);
    expect(again[0].expectedIt).toBe(originalExpected);
    expect(again[0].promptEn).not.toBe('MUTATED');
  });
});

describe('Phase 12D reveal and continue flow', () => {
  it('strips Say it in Italian from the English prompt', () => {
    const view = productionCardView(sampleExercise(), 0, 4, false);
    expect(view.promptEn).toBe("I'm hungry.");
    expect(view.promptEn).not.toMatch(/say it in italian/i);
  });

  it('presents clean authored English prompts and expected Italian', () => {
    const display = productionDisplayFromStory(
      sampleExercise({ level: 'A1', promptEn: "How are you? Say it in Italian.", expectedIt: 'Come stai?' }),
    );
    expect(display.promptEn).toBe('How are you?');
    expect(display.expectedIt).toBe('Come stai?');
  });

  it('keeps A1 production clean without mutating authored phrases into dictionary glosses', () => {
    const bundle = loadBundle();
    const sentence = [...bundle.chapters.values()]
      .flatMap((chapter) => chapter.paragraphs.flatMap((paragraph) => paragraph.sentences))
      .find((row) => row.id === 's01' && row.text.includes('arriva'));
    expect(sentence).toBeTruthy();

    const exercise = sampleExercise({
      exerciseId: 'luca-a-roma-ch01-prod-01',
      sourceSentenceId: 's01',
      promptEn: 'I arrive in Rome.',
      expectedIt: 'Arrivo a Roma.',
      acceptableAnswers: ['Io arrivo a Roma.'],
      focus: ['present', 'arrival'],
      level: 'A1',
    });

    const display = productionDisplayFromStory(exercise, sentence, {
      storySentence: sentence,
      lexiconById: bundle.lexiconById,
    });
    expect(display.promptEn).toBe('I arrive in Rome.');
    expect(display.expectedIt).toBe('Arrivo a Roma.');

    const view = productionCardView(exercise, 0, 4, true, sentence, {
      storySentence: sentence,
      lexiconById: bundle.lexiconById,
    });
    expect(view.wordFocused).toBe(false);
    expect(view.promptEn).toBe('I arrive in Rome.');
  });

  it('keeps authored two-word A1 chunks like Ho fame', () => {
    const display = productionDisplayFromStory(sampleExercise(), {
      text: 'Luca ha fame.',
      english: 'Luca is hungry.',
    });
    expect(display.promptEn).toBe("I'm hungry.");
    expect(display.expectedIt).toBe('Ho fame.');
  });

  it('shows English before reveal and hides Italian', () => {
    const view = productionCardView(sampleExercise(), 0, 4, false);
    expect(view.promptEn).toBe("I'm hungry.");
    expect(view.expectedIt).toBeNull();
    expect(view.acceptableAnswers).toEqual([]);
    expect(view.showAnswerVisible).toBe(true);
    expect(view.continueVisible).toBe(false);
    expect(view.howDidYouDoVisible).toBe(false);
  });

  it('reveals expected Italian after Show answer', () => {
    const view = productionCardView(sampleExercise(), 0, 4, true);
    expect(view.promptEn).toBe("I'm hungry.");
    expect(view.expectedIt).toBe('Ho fame.');
    expect(view.showAnswerVisible).toBe(false);
    expect(view.continueVisible).toBe(true);
    expect(view.howDidYouDoVisible).toBe(true);
  });

  it('renders acceptableAnswers only after reveal, when present and distinct', () => {
    const withAlts = productionCardView(
      sampleExercise({ expectedIt: 'Ho fame.', acceptableAnswers: ['Io ho fame.', 'Ho fame.'] }),
      1,
      4,
      true,
    );
    // Exact duplicates of expectedIt are filtered out.
    expect(withAlts.acceptableAnswers).toEqual(['Io ho fame.']);

    const withoutAlts = productionCardView(
      sampleExercise({ acceptableAnswers: undefined, expectedIt: 'Buongiorno.', promptEn: 'Good morning.' }),
      1,
      4,
      true,
    );
    expect(withoutAlts.acceptableAnswers).toEqual([]);

    const hiddenAlts = productionCardView(sampleExercise(), 1, 4, false);
    expect(hiddenAlts.acceptableAnswers).toEqual([]);
  });

  it('Continue advances to the next exercise', () => {
    expect(advanceProduction(0, 4)).toEqual({ index: 1, done: false });
    expect(advanceProduction(2, 4)).toEqual({ index: 3, done: false });
  });

  it('final exercise exits to chapter completion', () => {
    const start = afterComprehensionResults(getProductionExercisesForChapter('luca-a-roma-05'));
    expect(start.action).toBe('show_production');
    if (start.action !== 'show_production') return;

    let index = 0;
    for (let step = 0; step < 3; step += 1) {
      const next = advanceProduction(index, start.exercises.length);
      expect(next.done).toBe(false);
      if (!next.done) index = next.index;
    }
    expect(advanceProduction(index, start.exercises.length)).toEqual({ done: true });
  });

  it('skipping production still completes the chapter', () => {
    expect(skipProduction()).toEqual({ action: 'complete_chapter', skipped: true });
    expect(afterComprehensionResults([]).action).toBe('complete_chapter');
  });

  it('missing production exercises do not block chapter completion', async () => {
    const bundle = loadBundle();
    const service = new ProgressService(
      new MemoryReadingProgressRepository(),
      bundle.story,
      bundle.chapters,
    );
    const c1 = [...bundle.chapters.values()].find((c) => c.number === 1)!;
    await service.openChapter(c1.id);

    expect(afterComprehensionResults([])).toEqual({ action: 'complete_chapter' });

    const answers = c1.questions.map((q) => ({
      questionId: q.id,
      correct: true,
      attempts: 1,
    }));
    const progress = await service.finishComprehensionAndComplete(c1.id, answers);
    expect(progress.completedChapterIds).toContain(c1.id);
    expect(progress.comprehensionByChapter[c1.id]?.completedAt).toBeTruthy();
  });
});
