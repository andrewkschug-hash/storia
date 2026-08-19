import { describe, expect, it } from 'vitest';

import {
  countGuidedChaptersCompleted,
  isGuidedSequenceComplete,
  isListenPassComplete,
  isReadPassComplete,
  migrateLegacyChapterPasses,
  resolveReaderPass,
  shouldUseDetailedPassInstructions,
  withPassComplete,
} from '@/src/progress/chapterPass';
import { createInitialProgress, normalizeProgress } from '@/src/progress/types';

const CH1 = 'luca-a-roma-01';
const CH2 = 'luca-a-roma-02';

function progress() {
  return createInitialProgress('luca-a-roma', CH1);
}

describe('chapter pass state', () => {
  it('starts new chapters in guided read pass', () => {
    const resolved = resolveReaderPass(progress(), CH1);
    expect(resolved.pass).toBe('read');
    expect(resolved.guidance).toBe('guided');
    expect(isReadPassComplete(resolved.passes)).toBe(false);
  });

  it('moves to guided listen after read is complete', () => {
    const afterRead = withPassComplete(progress(), CH1, 'read');
    const resolved = resolveReaderPass(afterRead, CH1);
    expect(resolved.pass).toBe('listen');
    expect(resolved.guidance).toBe('guided');
  });

  it('uses free mode after both passes are complete', () => {
    let record = withPassComplete(progress(), CH1, 'read');
    record = withPassComplete(record, CH1, 'listen');
    const resolved = resolveReaderPass(record, CH1);
    expect(resolved.guidance).toBe('free');
    expect(isGuidedSequenceComplete(resolved.passes)).toBe(true);
  });

  it('does not force guided sequence again on revisit', () => {
    let record = withPassComplete(progress(), CH1, 'read');
    record = withPassComplete(record, CH1, 'listen');
    const resolved = resolveReaderPass(record, CH1, { listenRequested: true });
    expect(resolved.guidance).toBe('free');
    expect(resolved.pass).toBe('listen');
  });

  it('supports explicit replay mode from comprehension', () => {
    const resolved = resolveReaderPass(progress(), CH1, { listenRequested: true, replay: true });
    expect(resolved.guidance).toBe('free');
    expect(resolved.pass).toBe('listen');
  });

  it('ignores listen request during first read pass', () => {
    const resolved = resolveReaderPass(progress(), CH1, { listenRequested: true });
    expect(resolved.pass).toBe('read');
    expect(resolved.guidance).toBe('guided');
  });

  it('persists read and listen completion timestamps', () => {
    const readDone = withPassComplete(progress(), CH1, 'read', '2026-01-01T00:00:00.000Z');
    expect(isReadPassComplete(readDone.passesByChapter?.[CH1] ?? {})).toBe(true);
    expect(isListenPassComplete(readDone.passesByChapter?.[CH1] ?? {})).toBe(false);

    const bothDone = withPassComplete(readDone, CH1, 'listen', '2026-01-02T00:00:00.000Z');
    expect(bothDone.passesByChapter?.[CH1]?.listen?.completedAt).toBe('2026-01-02T00:00:00.000Z');
  });

  it('backfills passes from legacy comprehension completion', () => {
    const legacy = {
      ...progress(),
      comprehensionByChapter: {
        [CH2]: {
          attempted: 3,
          correct: 3,
          incorrect: 0,
          score: 1,
          completedAt: '2026-01-03T00:00:00.000Z',
          answers: [],
        },
      },
    };
    const migrated = migrateLegacyChapterPasses(legacy);
    expect(migrated.passesByChapter?.[CH2]?.read?.completedAt).toBe('2026-01-03T00:00:00.000Z');
    expect(migrated.passesByChapter?.[CH2]?.listen?.completedAt).toBe('2026-01-03T00:00:00.000Z');
  });

  it('normalizes progress with legacy pass migration', () => {
    const normalized = normalizeProgress({
      ...progress(),
      comprehensionByChapter: {
        [CH1]: {
          attempted: 2,
          correct: 2,
          incorrect: 0,
          score: 1,
          completedAt: '2026-01-04T00:00:00.000Z',
          answers: [],
        },
      },
    });
    expect(normalized.passesByChapter?.[CH1]?.read?.completedAt).toBeTruthy();
  });

  it('switches to compact instructions after three guided chapters', () => {
    let record = progress();
    for (const chapterId of [CH1, CH2, 'luca-a-roma-03']) {
      record = withPassComplete(record, chapterId, 'read');
      record = withPassComplete(record, chapterId, 'listen');
    }
    expect(countGuidedChaptersCompleted(record)).toBe(3);
    expect(shouldUseDetailedPassInstructions(record)).toBe(false);
  });
});
