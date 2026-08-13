import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { loadContentBundle } from '@/src/content/loadContentBundle';
import { ComprehensionQuestionSchema } from '@/src/content/schemas';
import { evaluateAnswer, scoreAnswers } from '@/src/comprehension/evaluate';
import { shuffleQuestionChoices } from '@/src/comprehension/shuffle';
import { ProgressService } from '@/src/progress/ProgressService';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';

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

describe('Phase 4 comprehension content', () => {
  const bundle = loadBundle();

  it('loads valid questions for all chapters', () => {
    expect(bundle.chapters.size).toBe(40);
    let total = 0;
    for (const chapter of bundle.chapters.values()) {
      expect(chapter.questions.length).toBeGreaterThanOrEqual(2);
      expect(chapter.questions.length).toBeLessThanOrEqual(4);
      total += chapter.questions.length;
      for (const q of chapter.questions) {
        expect(q.chapterId).toBe(chapter.id);
        expect(q.correctChoice).toBeLessThan(q.choices.length);
      }
    }
    expect(total).toBe(120);
  });

  it('accepts a valid question schema', () => {
    const q = ComprehensionQuestionSchema.parse({
      id: 'ch01_q01',
      chapterId: 'luca-a-roma-01',
      type: 'direct',
      question: 'Where does Luca arrive?',
      choices: ['In Rome', 'In Milan', 'In Naples'],
      correctChoice: 0,
      explanation: 'He arrives in Rome.',
      difficulty: 1,
    });
    expect(q.id).toBe('ch01_q01');
  });

  it('rejects an invalid question (correctChoice out of range)', () => {
    expect(() =>
      ComprehensionQuestionSchema.parse({
        id: 'bad',
        chapterId: 'luca-a-roma-01',
        type: 'direct',
        question: 'Bad?',
        choices: ['A', 'B'],
        correctChoice: 5,
        explanation: 'Nope',
        difficulty: 1,
      }),
    ).toThrow();
  });
});

describe('Phase 4 answer evaluation', () => {
  const bundle = loadBundle();
  const question = [...bundle.chapters.values()][0].questions[0];

  it('evaluates a correct answer', () => {
    const result = evaluateAnswer(question, question.correctChoice);
    expect(result.correct).toBe(true);
    expect(result.explanation).toBe(question.explanation);
  });

  it('evaluates an incorrect answer', () => {
    const wrong = (question.correctChoice + 1) % question.choices.length;
    const result = evaluateAnswer(question, wrong);
    expect(result.correct).toBe(false);
    expect(result.correctChoice).toBe(question.correctChoice);
  });

  it('scores mixed answers', () => {
    const scored = scoreAnswers([
      { correct: true, attempts: 1 },
      { correct: false, attempts: 2 },
      { correct: true, attempts: 1 },
    ]);
    expect(scored.correct).toBe(2);
    expect(scored.incorrect).toBe(1);
    expect(scored.attempted).toBe(4);
    expect(scored.score).toBeCloseTo(2 / 3);
  });

  it('shuffles choices without changing which answer is correct', () => {
    const original = ['In Rome', 'In Milan', 'In Naples'];
    const shuffled = shuffleQuestionChoices(original, 0, () => 0);
    expect(shuffled.choices).not.toEqual(original);
    expect(shuffled.choices).toHaveLength(3);
    expect(new Set(shuffled.choices)).toEqual(new Set(original));
    expect(shuffled.choices[shuffled.correctChoice]).toBe('In Rome');
    expect(shuffled.correctChoice).not.toBe(0);

    const evaluated = evaluateAnswer(
      { ...question, choices: shuffled.choices, correctChoice: shuffled.correctChoice },
      shuffled.correctChoice,
    );
    expect(evaluated.correct).toBe(true);
  });
});

describe('Phase 4 comprehension progress', () => {
  it('cannot complete a chapter before comprehension', async () => {
    const bundle = loadBundle();
    const repo = new MemoryReadingProgressRepository();
    const service = new ProgressService(repo, bundle.story, bundle.chapters);
    const c1 = bundle.story.chapters[0].id;
    await expect(service.completeChapter(c1)).rejects.toThrow(/comprehension/i);
  });

  it('finishing comprehension unlocks the next chapter and persists', async () => {
    const bundle = loadBundle();
    const repo = new MemoryReadingProgressRepository();
    const service = new ProgressService(repo, bundle.story, bundle.chapters);
    const c1 = bundle.chapters.get(bundle.story.chapters[0].id)!;
    const c2 = bundle.story.chapters[1];

    const answers = c1.questions.map((q) => ({
      questionId: q.id,
      correct: true,
      attempts: 1,
    }));

    await service.finishComprehensionAndComplete(c1.id, answers);

    const progress = await service.getOrCreate();
    expect(progress.completedChapterIds).toContain(c1.id);
    expect(progress.comprehensionByChapter[c1.id]?.completedAt).toBeTruthy();
    expect(progress.comprehensionByChapter[c1.id]?.correct).toBe(3);
    expect(await service.getChapterStatus(c2.id)).toMatch(/available|in_progress/);

    const service2 = new ProgressService(repo, bundle.story, bundle.chapters);
    const again = await service2.getOrCreate();
    expect(again.comprehensionByChapter[c1.id]?.score).toBe(1);
    expect(again.completedChapterIds).toContain(c1.id);
  });

  it('retry is represented by attempts > 1 without blocking completion', async () => {
    const bundle = loadBundle();
    const repo = new MemoryReadingProgressRepository();
    const service = new ProgressService(repo, bundle.story, bundle.chapters);
    const c1 = bundle.chapters.get(bundle.story.chapters[0].id)!;

    const answers = c1.questions.map((q, i) => ({
      questionId: q.id,
      correct: true,
      attempts: i === 0 ? 2 : 1,
    }));

    await service.recordComprehension(c1.id, answers);
    const progress = await service.completeChapter(c1.id);
    expect(progress.comprehensionByChapter[c1.id]?.attempted).toBe(4);
    expect(progress.completedChapterIds).toContain(c1.id);
  });
});
