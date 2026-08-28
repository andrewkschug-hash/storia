import { describe, expect, it } from 'vitest';
import { calculateReaderScrollTarget, isHeaderTarget } from '@/src/reader/readerScroll';
import type { Chapter } from '@/src/content/schemas';

describe('readerScroll helper', () => {
  const mockChapter = {
    id: 'luca-01',
    storyId: 'luca-a-roma',
    number: 1,
    titleIt: 'Arrivo a Roma',
    titleEn: 'Arrival in Rome',
    paragraphs: [
      {
        id: 'p1',
        sentences: [
          { id: 's1', text: 'First sentence', kind: 'narration', tokens: [] },
          { id: 's2', text: 'Second sentence', kind: 'narration', tokens: [] },
        ],
      },
      {
        id: 'p2',
        sentences: [
          { id: 's3', text: 'Third sentence', kind: 'narration', tokens: [] },
          { id: 's4', text: 'Fourth sentence', kind: 'narration', tokens: [] },
        ],
      },
    ],
  } as unknown as Chapter;

  const mockLayout = {
    bodyY: 100,
    paragraphY: {
      p1: 0,
      p2: 200,
    },
    sentenceY: {
      s1: 0,
      s2: 60,
      s3: 0,
      s4: 80,
    },
  };

  it('recognizes header targets', () => {
    expect(isHeaderTarget('header', mockChapter)).toBe(true);
    expect(isHeaderTarget('header:luca-01', mockChapter)).toBe(true);
    expect(isHeaderTarget('header:1', mockChapter)).toBe(true);
    expect(isHeaderTarget('s1', mockChapter)).toBe(false);
    expect(isHeaderTarget(null, mockChapter)).toBe(false);
  });

  it('returns 0 for header targets so header is scrolled to top', () => {
    const target = calculateReaderScrollTarget({
      targetId: 'header:luca-01',
      chapter: mockChapter,
      ...mockLayout,
      viewportHeight: 600,
    });
    expect(target).toBe(0);
  });

  it('calculates scroll offset for sentence in first paragraph', () => {
    // s1: bodyY(100) + p1(0) + s1(0) = 100.
    // viewport 600 => focus offset = 150.
    // 100 - 150 = -50 => clamped to 0.
    const target1 = calculateReaderScrollTarget({
      targetId: 's1',
      chapter: mockChapter,
      ...mockLayout,
      viewportHeight: 600,
    });
    expect(target1).toBe(0);

    // s2: bodyY(100) + p1(0) + s2(60) = 160.
    // 160 - 150 = 10.
    const target2 = calculateReaderScrollTarget({
      targetId: 's2',
      chapter: mockChapter,
      ...mockLayout,
      viewportHeight: 600,
    });
    expect(target2).toBe(10);
  });

  it('calculates scroll offset across multiple paragraphs', () => {
    // s3: bodyY(100) + p2(200) + s3(0) = 300.
    // viewport 600 => focus offset = 150.
    // 300 - 150 = 150.
    const target3 = calculateReaderScrollTarget({
      targetId: 's3',
      chapter: mockChapter,
      ...mockLayout,
      viewportHeight: 600,
    });
    expect(target3).toBe(150);

    // s4: bodyY(100) + p2(200) + s4(80) = 380.
    // 380 - 150 = 230.
    const target4 = calculateReaderScrollTarget({
      targetId: 's4',
      chapter: mockChapter,
      ...mockLayout,
      viewportHeight: 600,
    });
    expect(target4).toBe(230);
  });

  it('returns null if target sentence or layout is not found', () => {
    expect(
      calculateReaderScrollTarget({
        targetId: 'non-existent',
        chapter: mockChapter,
        ...mockLayout,
        viewportHeight: 600,
      }),
    ).toBeNull();

    expect(
      calculateReaderScrollTarget({
        targetId: 's1',
        chapter: mockChapter,
        bodyY: 100,
        paragraphY: {},
        sentenceY: {},
        viewportHeight: 600,
      }),
    ).toBeNull();
  });
});
