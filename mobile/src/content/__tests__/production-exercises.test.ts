import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import type { ProductionExercisesFile } from '@/src/content/schemas';
import {
  productionLevelForChapter,
  validateProductionExercises,
  type ProductionValidationContext,
} from '@/src/content/validateProductionExercises';
import { productionCardView } from '@/src/production/flow';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '../../../content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

function loadContext(): ProductionValidationContext {
  const manifest = JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')) as {
    chapters: { id: string }[];
  };
  const sentencesByChapter = new Map<string, Map<string, string>>();
  for (const file of readdirSync(chaptersDir).filter((f) => f.endsWith('.json'))) {
    const chapter = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8')) as {
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
    storyId: 'luca-a-roma',
    chapterIds: new Set(manifest.chapters.map((c) => c.id)),
    sentencesByChapter,
    minChapter: 1,
    maxChapter: 40,
  };
}

function loadDataset(): ProductionExercisesFile {
  return JSON.parse(readFileSync(join(storyPath, 'production-exercises.json'), 'utf8'));
}

function firstValid(): ProductionExercisesFile['exercises'][number] {
  return structuredClone(loadDataset().exercises[0]);
}

describe('Luca production exercises', () => {
  const context = loadContext();
  const dataset = loadDataset();

  it('valid exercises pass', () => {
    const result = validateProductionExercises(dataset, context);
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.exerciseCount).toBeGreaterThanOrEqual(120);
    expect(result.exerciseCount).toBeLessThanOrEqual(200);
    expect(Object.keys(result.chapterCounts)).toHaveLength(40);
    expect(result.levelCounts.A1).toBeGreaterThan(0);
    expect(result.levelCounts['A1+']).toBeGreaterThan(0);
    expect(result.levelCounts.A2).toBeGreaterThan(0);
  });

  it('keeps 3–5 exercises per Luca chapter', () => {
    for (let n = 1; n <= 40; n += 1) {
      const id = `luca-a-roma-${String(n).padStart(2, '0')}`;
      const count = dataset.exercises.filter((e) => e.chapterId === id).length;
      expect(count, id).toBeGreaterThanOrEqual(3);
      expect(count, id).toBeLessThanOrEqual(5);
      expect(dataset.exercises.filter((e) => e.chapterId === id).every((e) => e.level === productionLevelForChapter(n))).toBe(
        true,
      );
    }
  });

  it('invalid chapter fails', () => {
    const exercise = firstValid();
    exercise.chapterId = 'luca-a-roma-99';
    exercise.exerciseId = 'bad-chapter';
    const result = validateProductionExercises(
      { storyId: 'luca-a-roma', exercises: [exercise] },
      context,
    );
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => /unknown chapterId|outside Luca/.test(i.message))).toBe(true);
  });

  it('invalid sentence ID fails', () => {
    const exercise = firstValid();
    exercise.sourceSentenceId = 's99';
    exercise.exerciseId = 'bad-sentence';
    const result = validateProductionExercises(
      { storyId: 'luca-a-roma', exercises: [exercise] },
      context,
    );
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes('does not exist'))).toBe(true);
  });

  it('duplicate exercise ID fails', () => {
    const a = firstValid();
    const b = structuredClone(a);
    b.sourceSentenceId = dataset.exercises[1].sourceSentenceId;
    b.expectedIt = dataset.exercises[1].expectedIt;
    b.chapterId = dataset.exercises[1].chapterId;
    const result = validateProductionExercises(
      { storyId: 'luca-a-roma', exercises: [a, b] },
      context,
    );
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes('duplicate exerciseId'))).toBe(true);
  });

  it('missing English fails', () => {
    const exercise = firstValid();
    exercise.promptEn = '';
    const result = validateProductionExercises(
      { storyId: 'luca-a-roma', exercises: [exercise] },
      context,
    );
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path.includes('promptEn'))).toBe(true);
  });

  it('missing Italian fails', () => {
    const exercise = firstValid();
    exercise.expectedIt = '';
    const result = validateProductionExercises(
      { storyId: 'luca-a-roma', exercises: [exercise] },
      context,
    );
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path.includes('expectedIt'))).toBe(true);
  });

  it('requires match on every exercise', () => {
    expect(dataset.exercises.every((e) => e.match === 'exact' || e.match === 'flexible' || e.match === 'semantic')).toBe(
      true,
    );
    const result = validateProductionExercises(dataset, context);
    expect(result.matchCounts.exact).toBeGreaterThan(0);
    expect(result.matchCounts.flexible).toBeGreaterThan(0);
    expect(result.matchCounts.semantic).toBeGreaterThan(0);
    expect(result.matchCounts.exact + result.matchCounts.flexible + result.matchCounts.semantic).toBe(
      result.exerciseCount,
    );
  });

  it('rejects a missing match field', () => {
    const exercise = firstValid();
    delete (exercise as { match?: string }).match;
    exercise.exerciseId = 'missing-match';
    const result = validateProductionExercises(
      { storyId: 'luca-a-roma', exercises: [exercise] },
      context,
    );
    expect(result.ok).toBe(false);
  });

  it('allows expectedIt to differ from the source sentence', () => {
    const exercise = firstValid();
    exercise.expectedIt = 'Arrivo a Roma.';
    exercise.promptEn = 'I arrive in Rome.';
    exercise.match = 'flexible';
    exercise.acceptableAnswers = ['Io arrivo a Roma.'];
    const result = validateProductionExercises(
      { storyId: 'luca-a-roma', exercises: [exercise] },
      context,
    );
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('keeps communicative targets distinct from story recitation', () => {
    const source = context.sentencesByChapter.get('luca-a-roma-01')?.get('s01');
    const exercise = dataset.exercises.find((e) => e.exerciseId === 'luca-a-roma-ch01-prod-01');
    expect(source).toBe('Luca arriva a Roma.');
    expect(exercise?.expectedIt).toBe('Luca arriva a Roma.');
    expect(exercise?.promptEn).toBe('Luca arrives in Rome.');
    expect(exercise?.acceptableAnswers).toContain('Arriva a Roma.');
    expect(exercise?.match).toBe('flexible');
  });

  it('introduces passato prossimo production in A2 (not frozen A1+ bridge)', () => {
    const a1PlusPp = dataset.exercises.filter(
      (e) => e.level === 'A1+' && e.focus?.includes('passato_prossimo'),
    );
    expect(a1PlusPp).toHaveLength(0);

    const a2Pp = dataset.exercises.filter(
      (e) => e.level === 'A2' && e.focus?.includes('passato_prossimo'),
    );
    expect(a2Pp.length).toBeGreaterThanOrEqual(1);
  });

  it('lists more acceptable answers after the redesign', () => {
    const result = validateProductionExercises(dataset, context);
    expect(result.ok).toBe(true);
    expect(result.alternativeCount).toBeGreaterThanOrEqual(40);
    expect(dataset.version).toBe(3);
  });

  it('still requires a real source sentence in the chapter', () => {
    const exercise = firstValid();
    exercise.sourceSentenceId = 's99';
    exercise.exerciseId = 'bad-source';
    exercise.expectedIt = 'Arrivo a Roma.';
    const result = validateProductionExercises(
      { storyId: 'luca-a-roma', exercises: [exercise] },
      context,
    );
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes('does not exist'))).toBe(true);
  });

  it('ch27 production does not target imperfetto forms', () => {
    const IMP_RE =
      /\b(era|erano|aveva|faceva|restava|ascoltava|pensava|stava|voleva|sorrideva|parlava|c'era|c'erano)\b/i;
    const ch27 = dataset.exercises.filter((e) => e.chapterId === 'luca-a-roma-27');
    expect(ch27.length).toBeGreaterThanOrEqual(4);
    for (const ex of ch27) {
      expect(ex.expectedIt, ex.exerciseId).not.toMatch(IMP_RE);
      for (const alt of ex.acceptableAnswers ?? []) {
        expect(alt, ex.exerciseId).not.toMatch(IMP_RE);
      }
    }
  });

  it('enforces PRODUCTION_SOURCE_ALIGNMENT invariant across all production overlays', () => {
    const lexiconRaw = JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8'));
    const lexiconById = new Map(lexiconRaw.lexicon.map((l: any) => [l.lemmaId, l]));
    const copulas = new Set(['è', 'sono', 'siamo', 'sei', 'siete', 'era', 'erano', 'stato', 'stata', 'sarà', 'ho', 'ha', 'abbiamo', 'avete']);

    const allStoryIds = [
      'luca-prima-di-roma-01',
      'luca-prima-di-roma-02',
      'luca-prima-di-roma-03',
      'luca-prima-di-roma-04',
      'luca-prima-di-roma-05',
      'luca-a-roma',
    ];

    for (const storyId of allStoryIds) {
      const sDir = join(root, 'stories', storyId);
      const prodJson = JSON.parse(readFileSync(join(sDir, 'production-exercises.json'), 'utf8'));
      const sChaptersDir = join(sDir, 'chapters');

      const sentsById = new Map<string, any>();
      for (const file of readdirSync(sChaptersDir).filter((f) => f.endsWith('.json'))) {
        const ch = JSON.parse(readFileSync(join(sChaptersDir, file), 'utf8'));
        for (const p of ch.paragraphs || []) {
          for (const s of p.sentences || []) {
            let tokens = s.tokens;
            if (!tokens && s.lemmas) {
              const words = s.text.replace(/[.,;:!?…"'«»]+/g, ' ').trim().split(/\s+/);
              tokens = s.lemmas.map((l: string, idx: number) => ({ lemmaId: l, surface: words[idx] || l }));
            }
            sentsById.set(`${ch.id}:${s.id}`, { ...s, tokens });
          }
        }
      }

      for (let i = 0; i < prodJson.exercises.length; i++) {
        const ex = prodJson.exercises[i];
        const source = ex.sourceSentenceId ? sentsById.get(`${ex.chapterId}:${ex.sourceSentenceId}`) : null;

        // 1. sourceSentenceId must exist in the chapter
        expect(source, `${ex.exerciseId}: source sentence missing`).toBeDefined();

        // 2. Target sentence length must not be runaway (>20 words)
        const sourceWords = source.text.trim().split(/\s+/).length;
        expect(sourceWords, `${ex.exerciseId}: runaway sentence length (${sourceWords})`).toBeLessThanOrEqual(20);

        // 3. Render through productionCardView
        const view = productionCardView(ex, i, prodJson.exercises.length, true, source, {
          storySentence: source,
          lexiconById,
        });

        // 4. Invariant: prompt is never "be" or "to be"
        const promptLower = (view.promptEn || '').toLowerCase().trim();
        expect(promptLower, `${ex.exerciseId}: promptEn is "be"`).not.toBe('be');
        expect(promptLower, `${ex.exerciseId}: promptEn is "to be"`).not.toBe('to be');

        // 5. Invariant: target is never a bare copula / auxiliary
        const expectedClean = (view.expectedIt || '').toLowerCase().trim();
        expect(copulas.has(expectedClean), `${ex.exerciseId}: bare copula target "${expectedClean}"`).toBe(false);

        // 6. Invariant: no 1st-person prompt for 3rd-person narration in A1
        const isFirstPersonPrompt = /\b(i|i'm|my|me)\b/i.test(view.promptEn || '') || /\b(i|i'm|my|me)\b/i.test(ex.promptEn || '');
        const isThirdPersonNarration = source && !source.speakerId && source.kind === 'narration' && /\b(luca|chiara|marta|paolo|sofia|marco|davide|elisa|lui|lei)\b/i.test(source.text);
        if (ex.level === 'A1') {
          expect(
            isFirstPersonPrompt && isThirdPersonNarration,
            `${ex.exerciseId}: 1st-person prompt "${view.promptEn}" for 3rd-person narration "${source.text}"`,
          ).toBe(false);
        }
      }
    }
  });
});
