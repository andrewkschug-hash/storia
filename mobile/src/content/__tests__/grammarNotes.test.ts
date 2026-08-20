import { describe, expect, it } from 'vitest';

import {
  grammarNoteForBatch,
  grammarNoteForChapter,
  isLessonBatchEnd,
} from '@/src/content/lessonBatches';

describe('grammar notes', () => {
  it('returns a stepped lesson at each batch end', () => {
    for (const end of [5, 10, 15, 20]) {
      expect(isLessonBatchEnd(end)).toBe(true);
      const note = grammarNoteForChapter(end);
      expect(note).toBeTruthy();
      expect(note!.steps.length).toBeGreaterThanOrEqual(1);
      expect(note!.practice.length).toBeGreaterThanOrEqual(1);
      for (const step of note!.steps) {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.explanation.length).toBeGreaterThan(20);
        expect(step.rule.length).toBeGreaterThan(0);
        expect(step.examples.length).toBeGreaterThan(0);
      }
      for (const q of note!.practice) {
        expect(q.choices.length).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.choices.length);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    }
  });

  it('covers batches 1-5 through 16-20 with specific titles', () => {
    expect(grammarNoteForBatch(1, 5)?.title).toBe('Essere and avere');
    expect(grammarNoteForBatch(6, 10)?.title).toBe('Volere and cercare');
    expect(grammarNoteForBatch(11, 15)?.title).toBe('Prepositions: a, in, con, per');
    expect(grammarNoteForBatch(16, 20)?.title).toBe('Time words and movement verbs');
  });

  it('authors hometown grammar for chapters 1–5 of each pre-Rome story', () => {
    expect(grammarNoteForBatch(1, 5, 'luca-prima-di-roma-01')?.title).toContain('Sono');
    expect(grammarNoteForBatch(1, 5, 'luca-prima-di-roma-03')?.title).toContain('quanto costa');
    expect(grammarNoteForChapter(5, 'luca-prima-di-roma-04')).toBeTruthy();
    expect(grammarNoteForBatch(1, 5, 'luca-a-roma')?.title).toBe('Essere and avere');
  });
});
