import type { CEFRLevel } from '@/src/cefr/levels';
import type { ReaderPassMode } from '@/src/progress/chapterPass';

export type PassInstructionCopy = {
  phaseLabel: string;
  headline: string;
  body: string;
  continueLabel: string;
  compactLabel: string;
};

export type ReadToListenTransitionCopy = {
  phaseLabel: string;
  headline: string;
  body: string;
  actionLabel: string;
};

export type ListenCompleteCopy = {
  phaseLabel: string;
  headline: string;
  body: string;
  continueLabel: string;
};

function listenHintForLevel(level: CEFRLevel): string {
  if (level === 'A1') return 'Listen and follow along with the text.';
  if (level === 'A1+') return 'Listen and try to understand the main idea.';
  if (level === 'A2' || level === 'A2+') return 'Listen without translating every sentence.';
  return 'Listen for the main idea and important details.';
}

export function passInstructionCopy(
  pass: ReaderPassMode,
  cefrLevel: CEFRLevel,
  detailed: boolean,
): PassInstructionCopy {
  const listenHint = listenHintForLevel(cefrLevel);

  if (pass === 'read') {
    return {
      phaseLabel: detailed ? 'PASS 1 · READ' : '1 Read',
      headline: detailed ? 'Prima leggi.' : 'Read',
      body: detailed
        ? 'Read the story yourself first. Tap words whenever you need help.'
        : 'Read the chapter, then listen.',
      continueLabel: detailed ? 'Continue' : 'Continue to listening',
      compactLabel: '1 Read → 2 Listen',
    };
  }

  return {
    phaseLabel: detailed ? 'PASS 2 · LISTEN' : '2 Listen',
    headline: detailed ? 'Ora ascolta.' : 'Listen',
    body: listenHint,
    continueLabel: 'Continue',
    compactLabel: '1 Read → 2 Listen',
  };
}

export function readToListenTransitionCopy(detailed: boolean): ReadToListenTransitionCopy {
  if (!detailed) {
    return {
      phaseLabel: '2 Listen',
      headline: 'Listen',
      body: listenHintForLevel('A1'),
      actionLabel: 'Ascolta la storia →',
    };
  }
  return {
    phaseLabel: 'PASS 2 · LISTEN',
    headline: 'Bene. Ora ascolta.',
    body: "You've read the story. Now listen to the Italian and notice how it sounds.",
    actionLabel: 'Ascolta la storia →',
  };
}

export function listenCompleteCopy(detailed: boolean): ListenCompleteCopy {
  return {
    phaseLabel: detailed ? 'PASS 2 · LISTEN' : '2 Listen',
    headline: 'Ascolto completato',
    body: detailed
      ? 'You listened to the whole chapter. When you are ready, continue to check your understanding.'
      : 'Ready for the next step.',
    continueLabel: 'Continue →',
  };
}
