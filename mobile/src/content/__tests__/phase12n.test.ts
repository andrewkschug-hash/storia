import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import type { ProductionExercise, ProductionExercisesFile } from '@/src/content/schemas';
import {
  getProductionExercises,
  getProductionExercisesForChapter,
} from '@/src/content/productionExercises';
import {
  validateProductionExercises,
  type ProductionValidationContext,
} from '@/src/content/validateProductionExercises';
import { scoreProductionAnswer } from '@/src/production/score';

const here = fileURLToPath(new URL('.', import.meta.url));
const storiesRoot = join(here, '../../../content/stories');

const PRE_ROME_IDS = [
  'luca-prima-di-roma-01',
  'luca-prima-di-roma-02',
  'luca-prima-di-roma-03',
  'luca-prima-di-roma-04',
  'luca-prima-di-roma-05',
] as const;

function loadStoryOverlay(storyId: string): ProductionExercisesFile {
  return JSON.parse(readFileSync(join(storiesRoot, storyId, 'production-exercises.json'), 'utf8'));
}

function loadContext(storyId: string): ProductionValidationContext {
  const storyPath = join(storiesRoot, storyId);
  const manifest = JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')) as {
    chapters: { id: string }[];
  };
  const sentencesByChapter = new Map<string, Map<string, string>>();
  for (const file of readdirSync(join(storyPath, 'chapters')).filter((name) => name.endsWith('.json'))) {
    const chapter = JSON.parse(readFileSync(join(storyPath, 'chapters', file), 'utf8')) as {
      id: string;
      paragraphs: { sentences: { id: string; text: string }[] }[];
    };
    const sentences = new Map<string, string>();
    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) sentences.set(sentence.id, sentence.text);
    }
    sentencesByChapter.set(chapter.id, sentences);
  }
  return {
    storyId,
    chapterIds: new Set(manifest.chapters.map((chapter) => chapter.id)),
    sentencesByChapter,
    expectedLevel: storyId === 'luca-a-roma' ? undefined : 'A1',
    minChapter: storyId === 'luca-a-roma' ? 1 : undefined,
    maxChapter: storyId === 'luca-a-roma' ? 40 : undefined,
  };
}

function byId(storyId: string, exerciseId: string): ProductionExercise {
  const exercise = loadStoryOverlay(storyId).exercises.find((item) => item.exerciseId === exerciseId);
  if (!exercise) throw new Error(`missing ${exerciseId}`);
  return exercise;
}

describe('Phase 12N pre-Rome production overlays', () => {
  const overlays = PRE_ROME_IDS.map((storyId) => ({ storyId, file: loadStoryOverlay(storyId) }));
  const allPreRome = overlays.flatMap((row) => row.file.exercises);

  it('validates every new overlay against its story chapters', () => {
    for (const storyId of PRE_ROME_IDS) {
      const result = validateProductionExercises(loadStoryOverlay(storyId), loadContext(storyId));
      expect(result.ok, storyId).toBe(true);
      expect(result.issues, storyId).toEqual([]);
      expect(result.exerciseCount, storyId).toBeGreaterThan(0);
      expect(result.levelCounts.A1).toBe(result.exerciseCount);
    }
  });

  it('keeps Luca production valid and unchanged in count', () => {
    const luca = loadStoryOverlay('luca-a-roma');
    const result = validateProductionExercises(luca, loadContext('luca-a-roma'));
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.exerciseCount).toBe(160);
    expect(getProductionExercises('luca-a-roma')).toHaveLength(160);
  });

  it('covers all five pre-Rome stories with 2–4 exercises per chapter', () => {
    expect(overlays.map((row) => row.storyId)).toEqual([...PRE_ROME_IDS]);
    expect(allPreRome.length).toBeGreaterThanOrEqual(80);
    expect(allPreRome.length).toBeLessThanOrEqual(120);

    for (const { storyId, file } of overlays) {
      expect(file.storyId).toBe(storyId);
      expect(file.exercises.every((exercise) => exercise.storyId === storyId)).toBe(true);
      const context = loadContext(storyId);
      for (const chapterId of context.chapterIds) {
        const count = file.exercises.filter((exercise) => exercise.chapterId === chapterId).length;
        expect(count, chapterId).toBeGreaterThanOrEqual(2);
        expect(count, chapterId).toBeLessThanOrEqual(4);
      }
    }
  });

  it('gives every exercise a valid chapter, source sentence, and expected answer', () => {
    for (const { storyId, file } of overlays) {
      const context = loadContext(storyId);
      for (const exercise of file.exercises) {
        expect(exercise.expectedIt.trim().length, exercise.exerciseId).toBeGreaterThan(0);
        expect(exercise.promptEn.trim().length, exercise.exerciseId).toBeGreaterThan(0);
        expect(context.chapterIds.has(exercise.chapterId), exercise.chapterId).toBe(true);
        const source = context.sentencesByChapter.get(exercise.chapterId)?.get(exercise.sourceSentenceId);
        expect(source, `${exercise.exerciseId} source`).toBeTruthy();
        for (const alt of exercise.acceptableAnswers ?? []) {
          expect(alt.trim(), `${exercise.exerciseId} alt`).not.toBe('');
          expect(alt.trim(), `${exercise.exerciseId} alt`).not.toBe(exercise.expectedIt.trim());
        }
      }
    }
  });

  it('has unique exercise IDs across pre-Rome and Luca', () => {
    const ids = [
      ...allPreRome.map((exercise) => exercise.exerciseId),
      ...loadStoryOverlay('luca-a-roma').exercises.map((exercise) => exercise.exerciseId),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('loads through getProductionExercisesForChapter', () => {
    const first = getProductionExercisesForChapter('luca-prima-di-roma-01-01');
    expect(first.length).toBeGreaterThanOrEqual(2);
    expect(first.every((exercise) => exercise.storyId === 'luca-prima-di-roma-01')).toBe(true);
    expect(getProductionExercises('luca-prima-di-roma-03').length).toBeGreaterThan(0);
  });
});

describe('Phase 12N scoring', () => {
  it('scores every expectedIt and acceptable answer as correct', () => {
    for (const storyId of PRE_ROME_IDS) {
      for (const exercise of loadStoryOverlay(storyId).exercises) {
        expect(scoreProductionAnswer(exercise, exercise.expectedIt).result, exercise.exerciseId).toBe(
          'correct',
        );
        for (const alt of exercise.acceptableAnswers ?? []) {
          expect(scoreProductionAnswer(exercise, alt).result, `${exercise.exerciseId} :: ${alt}`).toBe(
            'correct',
          );
        }
      }
    }
  });

  it('scores exact answers without extra words', () => {
    const greeting = byId('luca-prima-di-roma-01', 'luca-prima-di-roma-01-ch01-prod-03');
    expect(greeting.match).toBe('exact');
    expect(scoreProductionAnswer(greeting, 'Buongiorno.').result).toBe('correct');
    expect(scoreProductionAnswer(greeting, 'buongiorno').result).toBe('correct');
    expect(scoreProductionAnswer(greeting, 'Buongiorno Luca').result).toBe('incorrect');
  });

  it('scores intended flexible answers including subject drop', () => {
    const name = byId('luca-prima-di-roma-01', 'luca-prima-di-roma-01-ch01-prod-01');
    expect(scoreProductionAnswer(name, 'Mi chiamo Luca.').result).toBe('correct');
    expect(scoreProductionAnswer(name, 'Io mi chiamo Luca.').result).toBe('correct');
    const leave = byId('luca-prima-di-roma-05', 'luca-prima-di-roma-05-ch06-prod-01');
    expect(scoreProductionAnswer(leave, 'Domani parto.').result).toBe('correct');
    expect(scoreProductionAnswer(leave, 'Parto domani.').result).toBe('correct');
  });

  it('allows gender when the English prompt is open', () => {
    const ready = byId('luca-prima-di-roma-02', 'luca-prima-di-roma-02-ch01-prod-04');
    expect(ready.promptEn).toBe('I have to be ready.');
    expect(scoreProductionAnswer(ready, 'Devo essere pronta.').result).toBe('correct');
    expect(scoreProductionAnswer(ready, 'Devo essere pronto.').result).toBe('correct');
  });

  it('normalizes accents and apostrophes', () => {
    const kitchen = byId('luca-prima-di-roma-01', 'luca-prima-di-roma-01-ch04-prod-02');
    expect(scoreProductionAnswer(kitchen, "C'è una cucina.").result).toBe('correct');
    expect(scoreProductionAnswer(kitchen, 'C’è una cucina.').result).toBe('correct');
    expect(scoreProductionAnswer(kitchen, "c'e una cucina").result).toBe('correct');
    const pharmacy = byId('luca-prima-di-roma-04', 'luca-prima-di-roma-04-ch01-prod-01');
    expect(scoreProductionAnswer(pharmacy, "Dov'è la farmacia?").result).toBe('correct');
    expect(scoreProductionAnswer(pharmacy, 'Dove è la farmacia?').result).toBe('correct');
  });

  it('rejects wrong tense', () => {
    const ticket = byId('luca-prima-di-roma-04', 'luca-prima-di-roma-04-ch05-prod-03');
    expect(scoreProductionAnswer(ticket, 'Luca compra un biglietto.').result).toBe('correct');
    expect(scoreProductionAnswer(ticket, 'Luca ha comprato un biglietto.').result).toBe('incorrect');
    expect(scoreProductionAnswer(ticket, 'Luca ha comprato un biglietto.').reason).toBe('wrong_tense');
  });

  it('rejects wrong person', () => {
    const age = byId('luca-prima-di-roma-01', 'luca-prima-di-roma-01-ch02-prod-01');
    expect(scoreProductionAnswer(age, 'Ho ventiquattro anni.').result).toBe('correct');
    expect(scoreProductionAnswer(age, 'Hai ventiquattro anni.').result).toBe('incorrect');
    expect(scoreProductionAnswer(age, 'Hai ventiquattro anni.').reason).toBe('wrong_person');
  });

  it('rejects wrong polarity', () => {
    const like = byId('luca-prima-di-roma-05', 'luca-prima-di-roma-05-ch03-prod-01');
    expect(scoreProductionAnswer(like, 'Mi piace la musica.').result).toBe('correct');
    expect(scoreProductionAnswer(like, 'Non mi piace la musica.').result).toBe('incorrect');
    expect(scoreProductionAnswer(like, 'Non mi piace la musica.').reason).toBe('wrong_polarity');
  });

  it('rejects missing required words', () => {
    const bread = byId('luca-prima-di-roma-03', 'luca-prima-di-roma-03-ch02-prod-01');
    expect(scoreProductionAnswer(bread, 'Vorrei del pane per favore.').result).toBe('correct');
    expect(scoreProductionAnswer(bread, 'Vorrei.').result).toBe('incorrect');
    expect(scoreProductionAnswer(bread, 'Vorrei del latte.').result).toBe('incorrect');
  });
});

describe('Phase 12N semantic adversarial', () => {
  it('accepts natural vorrei + pane formulations and rejects unrelated meaning', () => {
    const bread = byId('luca-prima-di-roma-03', 'luca-prima-di-roma-03-ch02-prod-01');
    expect(bread.match).toBe('semantic');
    expect(scoreProductionAnswer(bread, 'Vorrei del pane per favore.').result).toBe('correct');
    expect(scoreProductionAnswer(bread, 'Vorrei del pane.').result).toBe('correct');
    expect(scoreProductionAnswer(bread, 'Vorrei pane per favore.').result).toBe('correct');
    expect(scoreProductionAnswer(bread, 'Vorrei del pane, per favore.').result).toBe('correct');
    expect(scoreProductionAnswer(bread, 'Vorrei del latte.').result).toBe('incorrect');
    expect(scoreProductionAnswer(bread, 'Voglio del pane.').result).toBe('incorrect');
    expect(scoreProductionAnswer(bread, 'Vorresti del pane.').result).toBe('incorrect');
    expect(scoreProductionAnswer(bread, 'Non vorrei del pane.').result).toBe('incorrect');
    expect(scoreProductionAnswer(bread, 'Il pane costa due euro.').result).toBe('incorrect');
  });

  it('accepts invitation variants and rejects wrong person, polarity, or missing Saturday', () => {
    const invite = byId('luca-prima-di-roma-05', 'luca-prima-di-roma-05-ch02-prod-01');
    expect(invite.match).toBe('semantic');
    expect(scoreProductionAnswer(invite, 'Vieni sabato?').result).toBe('correct');
    expect(scoreProductionAnswer(invite, 'Vuoi venire sabato?').result).toBe('correct');
    expect(scoreProductionAnswer(invite, 'Vengo sabato.').result).toBe('incorrect');
    expect(scoreProductionAnswer(invite, 'Non vieni sabato?').result).toBe('incorrect');
    expect(scoreProductionAnswer(invite, 'Vieni a Roma?').result).toBe('incorrect');
    expect(scoreProductionAnswer(invite, 'Sabato c’è la festa.').result).toBe('incorrect');
  });
});
