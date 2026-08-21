import { describe, expect, it } from 'vitest';

import {
  listenCompleteCopy,
  passInstructionCopy,
  readToListenTransitionCopy,
} from '@/src/reader/readerPassCopy';

describe('reader pass copy', () => {
  it('uses detailed read instructions for early chapters', () => {
    const copy = passInstructionCopy('read', 'A1', true);
    expect(copy.phaseLabel).toBe('PASS 1 · READ');
    expect(copy.headline).toBe('Prima leggi.');
    expect(copy.body).toMatch(/Read the story yourself first/);
    expect(copy.continueLabel).toBe('Continue');
  });

  it('uses compact labels after the learner knows the flow', () => {
    const copy = passInstructionCopy('listen', 'A2', false);
    expect(copy.phaseLabel).toBe('2 Listen');
    expect(copy.compactLabel).toBe('1 Read → 2 Listen');
    expect(copy.body).toMatch(/without translating every sentence/);
  });

  it('varies listen guidance by CEFR level', () => {
    expect(passInstructionCopy('listen', 'A1', true).body).toMatch(/follow along with the text/);
    expect(passInstructionCopy('listen', 'A1+', true).body).toMatch(/main idea/);
    expect(passInstructionCopy('listen', 'B1', true).body).toMatch(/important details/);
  });

  it('offers a skippable listen prompt after reading', () => {
    const detailed = readToListenTransitionCopy(true);
    expect(detailed.headline).toBe('Bene. Ora ascolta.');
    expect(detailed.actionLabel).toBe('Ascolta la storia →');
    expect(detailed.skipLabel).toBe('Skip for now');
    expect(detailed.body).toMatch(/skip/i);

    const compact = readToListenTransitionCopy(false);
    expect(compact.headline).toBe('Ready to listen?');
    expect(compact.skipLabel).toBe('Skip for now');
  });

  it('shows listen completion before comprehension', () => {
    const copy = listenCompleteCopy(true);
    expect(copy.headline).toBe('Ascolto completato');
    expect(copy.continueLabel).toBe('Continue →');
  });
});
