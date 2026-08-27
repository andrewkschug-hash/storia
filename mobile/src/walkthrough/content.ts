/** Isolated demo copy for the public walkthrough. Not Luca chapter JSON. */

export type WalkthroughGloss = {
  surface: string;
  gloss: string;
};

/** Every tapable reading token has a short contextual gloss. */
export const WALKTHROUGH_GLOSS: Record<string, WalkthroughGloss> = {
  luca: {
    surface: 'Luca',
    gloss: 'Luca, the young man who just arrived in Rome.',
  },
  entra: {
    surface: 'entra',
    gloss: 'to enter / goes in',
  },
  nel: {
    surface: 'nel',
    gloss: 'in the',
  },
  bar: {
    surface: 'bar',
    gloss: 'bar / café',
  },
  guarda: {
    surface: 'guarda',
    gloss: '(he) looks / watches',
  },
  intorno: {
    surface: 'intorno',
    gloss: 'around',
  },
};

export const WALKTHROUGH_READING = [
  { id: 's1', text: 'Luca entra nel bar.', tokens: ['Luca', 'entra', 'nel', 'bar.'] },
  { id: 's2', text: 'Guarda intorno.', tokens: ['Guarda', 'intorno.'] },
] as const;

export const WALKTHROUGH_QUESTION = {
  promptIt: 'Dove entra Luca?',
  promptEn: 'Where does Luca go in?',
  options: ['Nel bar', 'A casa', 'Alla stazione'] as const,
  correctIndex: 0,
};

export const WALKTHROUGH_PRODUCTION = {
  promptEn: 'I am hungry.',
  expectedIt: 'Ho fame.',
};

export const WALKTHROUGH_CHAPTERS = [
  { number: 1, title: 'Meet Luca' },
  { number: 2, title: 'Luca explores Rome' },
  { number: 3, title: 'He meets new people' },
] as const;

export function normalizeWalkthroughToken(token: string): string {
  return token.replace(/[.,!?]+$/g, '').toLowerCase();
}

export function getWalkthroughGloss(token: string): WalkthroughGloss | null {
  return WALKTHROUGH_GLOSS[normalizeWalkthroughToken(token)] ?? null;
}
