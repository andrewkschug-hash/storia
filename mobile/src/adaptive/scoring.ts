import {
  ADAPTIVE_CONFIG,
  ADAPTIVE_LEMMA_SET,
  ADAPTIVE_PHRASE_SET,
} from '@/src/adaptive/config';
import { clamp01, recentTapRate, round2, tapRate } from '@/src/adaptive/metrics';
import type {
  AdaptiveItem,
  AdaptiveScoreFactors,
  ExposureState,
} from '@/src/adaptive/types';
import type { LexiconEntry } from '@/src/content/schemas';
import type { LemmaEncounter, PhraseEncounter } from '@/src/vocabulary/types';

export type ScoreContext = {
  upcomingLemmaIds: Set<string>;
  upcomingPhraseIds: Set<string>;
  currentChapterLemmaIds: Set<string>;
  currentChapterPhraseIds: Set<string>;
  variantLemmaIds: Set<string>;
  variantPhraseIds: Set<string>;
  recentHitChapterNumbers: Record<string, number[]>;
  now?: Date;
};

export function scoreLemma(
  row: LemmaEncounter,
  entry: LexiconEntry | undefined,
  ctx: ScoreContext,
): AdaptiveItem {
  const italian = entry?.italian ?? row.lemmaId;
  return scoreItem({
    kind: 'lemma',
    id: row.lemmaId,
    italian,
    row,
    frequency: entry?.frequency ?? 'medium',
    inTargetList: ADAPTIVE_LEMMA_SET.has(row.lemmaId),
    upcoming: ctx.upcomingLemmaIds.has(row.lemmaId),
    inCurrent: ctx.currentChapterLemmaIds.has(row.lemmaId),
    inVariant: ctx.variantLemmaIds.has(row.lemmaId),
    recentHitChapters: ctx.recentHitChapterNumbers[row.lemmaId] ?? [],
    now: ctx.now,
  });
}

export function scorePhrase(row: PhraseEncounter, ctx: ScoreContext): AdaptiveItem {
  return scoreItem({
    kind: 'phrase',
    id: row.phraseId,
    italian: row.surface,
    row,
    frequency: 'high',
    inTargetList: ADAPTIVE_PHRASE_SET.has(row.phraseId),
    upcoming: ctx.upcomingPhraseIds.has(row.phraseId),
    inCurrent: ctx.currentChapterPhraseIds.has(row.phraseId),
    inVariant: ctx.variantPhraseIds.has(row.phraseId),
    recentHitChapters: ctx.recentHitChapterNumbers[row.phraseId] ?? [],
    now: ctx.now,
  });
}

function scoreItem(args: {
  kind: 'lemma' | 'phrase';
  id: string;
  italian: string;
  row: LemmaEncounter | PhraseEncounter;
  frequency: string;
  inTargetList: boolean;
  upcoming: boolean;
  inCurrent: boolean;
  inVariant: boolean;
  recentHitChapters: number[];
  now?: Date;
}): AdaptiveItem {
  const { weights } = ADAPTIVE_CONFIG;
  const lifetime = tapRate(args.row.tapCount, args.row.encounterCount);
  const recent = recentTapRate(args.row.recentEncounters);
  const reasons: string[] = [];

  const struggle = struggleScore(args.row.encounterCount, lifetime, recent.rate);
  if (struggle >= 0.5) reasons.push('High recent tap rate');
  else if (struggle >= 0.3) reasons.push('Still needs help');

  let importance = args.frequency === 'high' ? 0.7 : args.frequency === 'low' ? 0.25 : 0.45;
  if (args.row.saved) {
    importance = Math.min(1, importance + 0.25);
    reasons.push('Saved');
  }
  if (args.inTargetList) importance = Math.min(1, importance + 0.2);
  if (args.kind === 'phrase') importance = Math.min(1, importance + 0.1);

  const recency = recencyScore(args.row.lastEncounteredAt, args.now);
  const storyRelevance = args.inVariant ? 1 : args.inCurrent ? 0.4 : 0;
  const phraseRelevance = args.kind === 'phrase' ? 1 : 0;
  const upcoming = args.upcoming ? 1 : 0;
  if (args.upcoming) reasons.push('Upcoming story already contains this');

  const overexposure = overexposureScore(args.recentHitChapters);
  if (overexposure > 0.5) reasons.push('Recently reinforced');

  const raw =
    struggle * weights.struggle +
    importance * weights.importance +
    recency * weights.recency +
    storyRelevance * weights.storyRelevance +
    phraseRelevance * weights.phraseRelevance -
    upcoming * ADAPTIVE_CONFIG.upcomingPenalty -
    overexposure * ADAPTIVE_CONFIG.overexposurePenalty;

  const priority = round2(clamp01(raw));
  const factors: AdaptiveScoreFactors = {
    struggle: round2(struggle),
    importance: round2(importance),
    recency: round2(recency),
    storyRelevance: round2(storyRelevance),
    phraseRelevance: round2(phraseRelevance),
    upcoming: round2(upcoming),
    overexposure: round2(overexposure),
  };

  return {
    kind: args.kind,
    id: args.id,
    italian: args.italian,
    state: exposureState(args.row.encounterCount, lifetime, recent.rate, struggle),
    priority,
    factors,
    encounterCount: args.row.encounterCount,
    tapCount: args.row.tapCount,
    tapRate: round2(lifetime),
    recentTaps: recent.taps,
    recentWindow: recent.window,
    recentTapRate: round2(recent.rate),
    saved: args.row.saved,
    reasons,
  };
}

export function struggleScore(
  encounterCount: number,
  lifetimeTapRate: number,
  recentRate: number,
): number {
  if (encounterCount < ADAPTIVE_CONFIG.minEncountersForTapRate) {
    return clamp01(lifetimeTapRate * 0.25);
  }
  return clamp01(lifetimeTapRate * 0.35 + recentRate * 0.65);
}

function recencyScore(lastEncounteredAt: string | null, now?: Date): number {
  if (!lastEncounteredAt) return 0.2;
  const then = new Date(lastEncounteredAt).getTime();
  if (Number.isNaN(then)) return 0.2;
  const days = Math.max(0, ((now ?? new Date()).getTime() - then) / (1000 * 60 * 60 * 24));
  if (days <= 2) return 1;
  if (days <= 7) return 0.6;
  if (days <= 21) return 0.3;
  return 0.1;
}

function overexposureScore(recentHitChapters: number[]): number {
  if (recentHitChapters.length === 0) return 0;
  const last = recentHitChapters.slice(-ADAPTIVE_CONFIG.maxConsecutiveChapterHits);
  if (last.length >= ADAPTIVE_CONFIG.maxConsecutiveChapterHits) return 1;
  if (last.length === 1) return 0.45;
  return 0.2;
}

export function exposureState(
  encounterCount: number,
  lifetimeTapRate: number,
  recentRate: number,
  struggle: number,
): ExposureState {
  if (encounterCount >= 12 && recentRate <= 0.1 && lifetimeTapRate <= 0.15) return 'mastered';
  if (encounterCount >= 8 && recentRate <= 0.2 && lifetimeTapRate <= 0.25) return 'stable';
  if (
    encounterCount >= ADAPTIVE_CONFIG.minEncountersForTapRate &&
    lifetimeTapRate >= 0.35 &&
    recentRate <= 0.25 &&
    recentRate + 0.2 < lifetimeTapRate
  ) {
    return 'recovering';
  }
  if (struggle >= 0.35 && encounterCount >= ADAPTIVE_CONFIG.minEncountersForTapRate) return 'reinforce';
  return 'normal';
}
