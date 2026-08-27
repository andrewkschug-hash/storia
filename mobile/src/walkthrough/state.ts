import { normalizeWalkthroughToken } from '@/src/walkthrough/content';

export type WalkthroughStep =
  | 'intro'
  | 'reading'
  | 'dictionary'
  | 'listening'
  | 'comprehension'
  | 'production'
  | 'complete';

export type WalkthroughAssessment = 'got_it' | 'almost' | 'not_yet';

export type WalkthroughState = {
  step: WalkthroughStep;
  tappedToken: string | null;
  comprehensionChoice: number | null;
  productionRevealed: boolean;
  productionAssessment: WalkthroughAssessment | null;
};

const ORDER: WalkthroughStep[] = [
  'intro',
  'reading',
  'dictionary',
  'listening',
  'comprehension',
  'production',
  'complete',
];

export function createWalkthroughState(): WalkthroughState {
  return {
    step: 'intro',
    tappedToken: null,
    comprehensionChoice: null,
    productionRevealed: false,
    productionAssessment: null,
  };
}

export function tapWalkthroughToken(state: WalkthroughState, token: string): WalkthroughState {
  const surface = normalizeWalkthroughToken(token);
  if (state.step !== 'reading' && state.step !== 'dictionary') return state;
  return {
    ...state,
    step: 'dictionary',
    tappedToken: surface,
  };
}

export function chooseComprehension(state: WalkthroughState, index: number): WalkthroughState {
  if (state.step !== 'comprehension') return state;
  return { ...state, comprehensionChoice: index };
}

export function revealProduction(state: WalkthroughState): WalkthroughState {
  if (state.step !== 'production') return state;
  return { ...state, productionRevealed: true };
}

export function assessProduction(
  state: WalkthroughState,
  assessment: WalkthroughAssessment,
): WalkthroughState {
  if (state.step !== 'production' || !state.productionRevealed) return state;
  return { ...state, productionAssessment: assessment };
}

export function canAdvanceWalkthrough(state: WalkthroughState): boolean {
  switch (state.step) {
    case 'intro':
      return true;
    case 'reading':
      return false;
    case 'dictionary':
      return Boolean(state.tappedToken);
    case 'listening':
      return true;
    case 'comprehension':
      return state.comprehensionChoice !== null;
    case 'production':
      return state.productionAssessment !== null;
    case 'complete':
      return false;
  }
}

export function advanceWalkthrough(state: WalkthroughState): WalkthroughState {
  if (!canAdvanceWalkthrough(state)) return state;
  const index = ORDER.indexOf(state.step);
  const next = ORDER[index + 1];
  if (!next) return state;
  if (state.step === 'reading') {
    return state;
  }
  return { ...state, step: next };
}

/** From reading, continue without a tap is blocked; after dictionary, advances to listening. */
export function continueFromReading(state: WalkthroughState): WalkthroughState {
  if (state.step === 'dictionary' && state.tappedToken) {
    return { ...state, step: 'listening' };
  }
  if (state.step === 'reading') {
    return state;
  }
  return advanceWalkthrough(state);
}

export function skipToComprehension(state: WalkthroughState): WalkthroughState {
  if (state.step !== 'reading' && state.step !== 'dictionary' && state.step !== 'listening') return state;
  return { ...state, step: 'comprehension' };
}

export function walkthroughProgressLabel(step: WalkthroughStep): string {
  const labels: Record<WalkthroughStep, string> = {
    intro: '1 of 6',
    reading: '2 of 6',
    dictionary: '2 of 6',
    listening: '3 of 6',
    comprehension: '4 of 6',
    production: '5 of 6',
    complete: '6 of 6',
  };
  return labels[step];
}
