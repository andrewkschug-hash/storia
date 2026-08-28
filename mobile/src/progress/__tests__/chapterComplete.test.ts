import { describe, expect, it } from 'vitest';

import {
  chapterCompleteView,
  comprehensionResultsContinueLabel,
} from '@/src/progress/chapterComplete';

describe('chapter complete copy', () => {
  it('points to the next chapter after finishing one', () => {
    expect(chapterCompleteView(1, 2)).toEqual({
      headline: 'Chapter 1 completed!',
      detail: 'Continue to Chapter 2.',
      button: 'Continue to Chapter 2',
    });
  });

  it('describes grammar and recap before the next chapter at batch boundaries', () => {
    expect(chapterCompleteView(5, 6)).toEqual({
      headline: 'Chapter 5 completed!',
      detail: 'Next: a short grammar note and word recap for Chapters 1–5, then Chapter 6.',
      button: 'Continue',
    });
  });

  it('mentions speak scene and level gate at milestone batch ends', () => {
    expect(chapterCompleteView(15, 16).detail).toContain('retell "Help Marco"');
    expect(chapterCompleteView(20, 21).detail).toContain('choose what to read next');
    expect(chapterCompleteView(24, 25).detail).toContain('retell "Sunday Call"');
    expect(chapterCompleteView(24, 25).detail).toContain('choose what to read next');
  });

  it('still routes batch-end learners through milestones when the story ends', () => {
    expect(chapterCompleteView(40, null).detail).toContain('retell "Luca Chooses Rome"');
    expect(chapterCompleteView(40, null).detail).toContain('A2 → B1 readiness check');
    expect(chapterCompleteView(40, null).detail).toContain('then home');
  });

  it('sends the learner home after the last chapter of short stories', () => {
    expect(chapterCompleteView(6, null)).toEqual({
      headline: 'Chapter 6 completed!',
      detail: 'You’ve finished this story.',
      button: 'Back to home',
    });
  });

  it('renders grand season finale celebration for Luca a Roma Chapter 70', () => {
    expect(chapterCompleteView(70, null, 'luca-a-roma')).toEqual({
      headline: '✦ Percorso B1+ completato!',
      detail: 'Hai completato tutti i 70 capitoli di Luca a Roma (40.000+ parole) e costruito una solida esperienza di lettura a livello B1+. Prosegui per l’ultima revisione e apri il tuo quaderno.',
      button: 'Completa il percorso',
    });
  });
});

describe('comprehension results continue label', () => {
  it('does not promise the next chapter when grammar is next', () => {
    expect(comprehensionResultsContinueLabel(5, 6, false)).toBe('Continue');
  });

  it('keeps the story label between ordinary chapters', () => {
    expect(comprehensionResultsContinueLabel(4, 5, false)).toBe('Continue story');
  });
});
