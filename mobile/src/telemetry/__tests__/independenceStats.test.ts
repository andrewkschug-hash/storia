import { describe, expect, it } from 'vitest';

import { countChapterTokens } from '@/src/telemetry/chapterTokens';
import { deriveIndependence } from '@/src/telemetry/independenceStats';
import type { ReadingEvent } from '@/src/telemetry/types';

function ev(partial: Partial<ReadingEvent> & Pick<ReadingEvent, 'type'>): ReadingEvent {
  return {
    id: partial.id ?? 'e',
    at: partial.at ?? '2026-01-01T00:00:00.000Z',
    type: partial.type,
    storyId: partial.storyId ?? 's',
    chapterId: partial.chapterId ?? 'c1',
    tokensRead: partial.tokensRead,
  };
}

describe('reading independence stats', () => {
  it('derives lookup rate from events, not from UI state', () => {
    const snapshot = deriveIndependence([
      ev({ type: 'words_read', tokensRead: 42, chapterId: 'c1' }),
      ev({ type: 'word_lookup', chapterId: 'c1' }),
      ev({ type: 'word_lookup', chapterId: 'c1' }),
      ev({ type: 'words_read', tokensRead: 50, chapterId: 'c10', at: '2026-02-01T00:00:00.000Z' }),
      ev({ type: 'word_lookup', chapterId: 'c10', at: '2026-02-01T00:00:00.000Z' }),
    ]);
    const ch1 = snapshot.chapters.find((row) => row.chapterId === 'c1')!;
    expect(ch1.tokensRead).toBe(42);
    expect(ch1.lookups).toBe(2);
    expect(ch1.lookupRate).toBeCloseTo(2 / 42);
    expect(snapshot.tokensRead).toBe(92);
    expect(snapshot.lookups).toBe(3);
  });

  it('does not treat audio or dictionary-open as lookups', () => {
    const snapshot = deriveIndependence([
      ev({ type: 'words_read', tokensRead: 100 }),
      ev({ type: 'dictionary_opened' }),
      ev({ type: 'audio_played' }),
      ev({ type: 'word_tapped' }),
      ev({ type: 'word_lookup' }),
    ]);
    expect(snapshot.lookups).toBe(1);
    expect(snapshot.lookupsPer100Words).toBe(1);
  });

  it('reports fewer lookups vs an earlier window when the rate drops', () => {
    const now = new Date('2026-03-20T00:00:00.000Z');
    const snapshot = deriveIndependence(
      [
        ev({ type: 'words_read', tokensRead: 100, at: '2026-01-01T00:00:00.000Z' }),
        ev({ type: 'word_lookup', at: '2026-01-01T00:00:00.000Z' }),
        ev({ type: 'word_lookup', at: '2026-01-02T00:00:00.000Z' }),
        ev({ type: 'word_lookup', at: '2026-01-03T00:00:00.000Z' }),
        ev({ type: 'words_read', tokensRead: 100, at: '2026-03-10T00:00:00.000Z' }),
        ev({ type: 'word_lookup', at: '2026-03-10T00:00:00.000Z' }),
      ],
      now,
    );
    expect(snapshot.lookupChangePct).not.toBeNull();
    expect(snapshot.lookupChangePct!).toBeLessThan(0);
    expect(snapshot.headline).toMatch(/fewer words/i);
  });

  it('counts tokens from chapter structure', () => {
    expect(
      countChapterTokens({
        paragraphs: [
          { sentences: [{ tokens: [1, 2, 3] }, { tokens: [4] }] },
          { sentences: [{ tokens: [5, 6] }] },
        ],
      }),
    ).toBe(6);
  });
});
