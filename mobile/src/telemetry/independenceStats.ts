import type { ReadingEvent } from '@/src/telemetry/types';

export type ChapterIndependence = {
  storyId: string;
  chapterId: string;
  tokensRead: number;
  lookups: number;
  lookupRate: number;
};

export type IndependenceSnapshot = {
  chapters: ChapterIndependence[];
  tokensRead: number;
  lookups: number;
  lookupsPer100Words: number;
  lookupChangePct: number | null;
  headline: string;
};

const LOOKUP_TYPES = new Set(['word_lookup', 'phrase_lookup']);

function rate(lookups: number, tokens: number) {
  if (tokens <= 0) return 0;
  return lookups / tokens;
}

export function deriveIndependence(events: ReadingEvent[], now = new Date()): IndependenceSnapshot {
  const byChapter = new Map<string, ChapterIndependence>();
  for (const event of events) {
    if (!event.chapterId) continue;
    const storyId = event.storyId ?? 'unknown';
    const key = `${storyId}:${event.chapterId}`;
    const row =
      byChapter.get(key) ??
      ({ storyId, chapterId: event.chapterId, tokensRead: 0, lookups: 0, lookupRate: 0 } satisfies ChapterIndependence);
    if (event.type === 'words_read') {
      row.tokensRead += event.tokensRead ?? 0;
    }
    if (LOOKUP_TYPES.has(event.type)) {
      row.lookups += 1;
    }
    byChapter.set(key, row);
  }

  const chapters = [...byChapter.values()].map((row) => ({
    ...row,
    lookupRate: rate(row.lookups, row.tokensRead),
  }));

  const tokensRead = chapters.reduce((sum, row) => sum + row.tokensRead, 0);
  const lookups = chapters.reduce((sum, row) => sum + row.lookups, 0);
  const lookupsPer100Words = tokensRead > 0 ? (lookups / tokensRead) * 100 : 0;

  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recent = events.filter((event) => event.at >= monthAgo);
  const recentLookups = recent.filter((event) => LOOKUP_TYPES.has(event.type)).length;
  const recentTokens = recent
    .filter((event) => event.type === 'words_read')
    .reduce((sum, event) => sum + (event.tokensRead ?? 0), 0);
  const recentRate = rate(recentLookups, recentTokens);

  const firstAt = events[0]?.at;
  let lookupChangePct: number | null = null;
  if (firstAt) {
    const startEnd = new Date(new Date(firstAt).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const early = events.filter((event) => event.at <= startEnd);
    const earlyLookups = early.filter((event) => LOOKUP_TYPES.has(event.type)).length;
    const earlyTokens = early
      .filter((event) => event.type === 'words_read')
      .reduce((sum, event) => sum + (event.tokensRead ?? 0), 0);
    const earlyRate = rate(earlyLookups, earlyTokens);
    if (earlyRate > 0 && recentTokens > 0) {
      lookupChangePct = ((recentRate - earlyRate) / earlyRate) * 100;
    }
  }

  let headline = 'Keep reading. Independence is measured against words you actually meet.';
  if (lookupChangePct != null) {
    const abs = Math.round(Math.abs(lookupChangePct));
    if (lookupChangePct < -3) {
      headline = `You looked up ${abs}% fewer words this month than when you started.`;
    } else if (lookupChangePct > 3) {
      headline = `Lookups are up ${abs}% this month — that can mean harder chapters, not less skill.`;
    } else {
      headline = 'Your lookup rate is steady relative to how much you read.';
    }
  } else if (tokensRead > 0) {
    headline = `You looked up ${lookupsPer100Words.toFixed(0)} words per 100 words read.`;
  }

  return {
    chapters,
    tokensRead,
    lookups,
    lookupsPer100Words,
    lookupChangePct,
    headline,
  };
}
