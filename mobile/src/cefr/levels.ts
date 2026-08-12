export const CEFR_LEVELS = ['A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1'] as const;
export type CEFRLevel = (typeof CEFR_LEVELS)[number];
export type MajorCEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

const ALIASES: Record<string, CEFRLevel> = {
  A1: 'A1',
  'A1+': 'A1+',
  A1_PLUS: 'A1+',
  A1PLUS: 'A1+',
  A2: 'A2',
  'A2+': 'A2+',
  A2_PLUS: 'A2+',
  A2PLUS: 'A2+',
  B1: 'B1',
  'B1+': 'B1+',
  B1_PLUS: 'B1+',
  B1PLUS: 'B1+',
  B2: 'B2',
  'B2+': 'B2+',
  B2_PLUS: 'B2+',
  B2PLUS: 'B2+',
  C1: 'C1',
};

export function isCEFRLevel(value: string): value is CEFRLevel {
  return (CEFR_LEVELS as readonly string[]).includes(value);
}

export function parseCEFRLevel(value: string): CEFRLevel {
  const mapped = ALIASES[value.trim().toUpperCase().replace(/\s+/g, '')];
  if (!mapped) throw new Error(`Invalid CEFR level "${value}"`);
  return mapped;
}

export function cefrRank(level: CEFRLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

export function majorCEFRLevel(level: CEFRLevel): MajorCEFRLevel {
  if (level === 'A1' || level === 'A1+') return 'A1';
  if (level === 'A2' || level === 'A2+') return 'A2';
  if (level === 'B1' || level === 'B1+') return 'B1';
  if (level === 'B2' || level === 'B2+') return 'B2';
  return 'C1';
}

export function nextCEFRLevel(level: CEFRLevel): CEFRLevel | null {
  const i = cefrRank(level);
  return i < 0 || i >= CEFR_LEVELS.length - 1 ? null : CEFR_LEVELS[i + 1];
}

export function previousCEFRLevel(level: CEFRLevel): CEFRLevel | null {
  const i = cefrRank(level);
  return i <= 0 ? null : CEFR_LEVELS[i - 1];
}

/** Adjacent step only. Same level is allowed. Skipping (A1 → B1) is not. */
export function canTransition(from: CEFRLevel, to: CEFRLevel): boolean {
  const delta = cefrRank(to) - cefrRank(from);
  return delta === 0 || delta === 1;
}

export function cefrDistance(a: CEFRLevel, b: CEFRLevel): number {
  return Math.abs(cefrRank(a) - cefrRank(b));
}

/** Map a 0–100 difficulty score onto a CEFR band. */
export function cefrFromScore(score: number): CEFRLevel {
  if (score < 22) return 'A1';
  if (score < 32) return 'A1+';
  if (score < 45) return 'A2';
  if (score < 55) return 'A2+';
  if (score < 68) return 'B1';
  if (score < 78) return 'B1+';
  if (score < 86) return 'B2';
  if (score < 93) return 'B2+';
  return 'C1';
}

export const CEFR_LABELS: Record<MajorCEFRLevel, string> = {
  A1: 'Simple everyday stories',
  A2: 'Longer adventures and conversations',
  B1: 'More natural conversations and complex situations',
  B2: 'Rich, natural Italian',
  C1: 'Authentic Italian storytelling',
};
