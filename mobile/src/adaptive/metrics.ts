import { ADAPTIVE_CONFIG } from '@/src/adaptive/config';
import type { EncounterSignal } from '@/src/vocabulary/types';

export function tapRate(tapCount: number, encounterCount: number): number {
  if (encounterCount <= 0) return 0;
  return tapCount / encounterCount;
}

export function recentTapRate(
  recentEncounters: EncounterSignal[],
  window = ADAPTIVE_CONFIG.recentWindow,
): { rate: number; taps: number; window: number } {
  const slice = recentEncounters.slice(-window);
  if (slice.length === 0) return { rate: 0, taps: 0, window: 0 };
  const taps = slice.filter((s) => s.tapped).length;
  return { rate: taps / slice.length, taps, window: slice.length };
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
