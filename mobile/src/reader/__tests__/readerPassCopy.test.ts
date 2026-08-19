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
    expect(copy.body).toMatch(/Tap words whenever you need help/);
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

  it('uses a dedicated read-to-listen transition screen for early chapters', () => {
    const copy = readToListenTransitionCopy(true);
    expect(copy.headline).toBe('Bene. Ora ascolta.');
    expect(copy.body).toMatch(/notice how it sounds/);
    expect(copy.actionLabel).toBe('Ascolta la storia →');
  });

  it('shows listen completion before comprehension', () => {
    const copy = listenCompleteCopy(true);
    expect(copy.headline).toBe('Ascolto completato');
    expect(copy.continueLabel).toBe('Continue →');
  });
});
