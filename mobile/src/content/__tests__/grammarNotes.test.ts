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

  it('authors A2 reading/reference grammar for 36-40', () => {
    const note = grammarNoteForBatch(36, 40);
    expect(note?.title).toMatch(/Reading clearly/i);
    const joined = note!.steps.map((s) => s.explanation + s.examples.map((e) => e.italian).join(' ')).join('\n');
    expect(joined).toMatch(/le ha detto/i);
    expect(joined).not.toMatch(/Le persone entrano/i);
    expect(joined.toLowerCase()).not.toMatch(/most recent person/);
  });

  it('authors B1 grammar notes for batches 41-45, 46-50, and 51-55', () => {
    for (const [start, end] of [[41, 45], [46, 50], [51, 55]]) {
      const note = grammarNoteForBatch(start, end, 'luca-a-roma');
      expect(note).toBeTruthy();
      expect(note!.steps.length).toBe(3);
      expect(note!.practice.length).toBe(3);
      for (const step of note!.steps) {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.explanation.length).toBeGreaterThan(20);
        expect(step.rule.length).toBeGreaterThan(0);
        expect(step.examples.length).toBeGreaterThanOrEqual(2);
      }
      for (const q of note!.practice) {
        expect(q.choices.length).toBe(3);
        expect(q.correctIndex).toBe(0);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    }
    expect(grammarNoteForBatch(41, 45)?.title).toContain('shifts in perspective');
    expect(grammarNoteForBatch(46, 50)?.title).toContain('Comparing possibilities');
    expect(grammarNoteForBatch(51, 55)?.title).toContain('Negotiating proposals');
  });
});
