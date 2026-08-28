import { describe, expect, it } from 'vitest';
import {
  buildLevelGatesForStory,
  getGateForChapter,
  getLevelGate,
  isLevelGateUnlocked,
} from '@/src/cefr/levelGates';
import { DEFAULT_LUCA_ARCS } from '@/src/cefr/arcs';
import { LUCA_STORY_ID } from '@/src/content/catalog';

describe('LevelGate curriculum system', () => {
  it('derives level gates directly from StoryArc definitions without hardcoded ranges', () => {
    const gates = buildLevelGatesForStory(DEFAULT_LUCA_ARCS, LUCA_STORY_ID);
    expect(gates.length).toBeGreaterThanOrEqual(3);

    const a1PlusGate = gates.find((g) => g.level === 'A1+');
    expect(a1PlusGate).toBeDefined();
    expect(a1PlusGate?.targetChapterNumber).toBe(21);
    expect(a1PlusGate?.prerequisite.previousLevel).toBe('A1');
    expect(a1PlusGate?.prerequisite.requiredChapterNumber).toBe(20);
    expect(a1PlusGate?.bypass.testId).toBe('readiness-a1-plus');

    const a2Gate = gates.find((g) => g.level === 'A2');
    expect(a2Gate).toBeDefined();
    expect(a2Gate?.targetChapterNumber).toBe(25);
    expect(a2Gate?.prerequisite.previousLevel).toBe('A1+');
    expect(a2Gate?.prerequisite.requiredChapterNumber).toBe(24);
    expect(a2Gate?.chapterRangeText).toBe('Chapters 25–40');
    expect(a2Gate?.bypass.testId).toBe('readiness-a2');

    const b1Gate = gates.find((g) => g.level === 'B1');
    expect(b1Gate).toBeDefined();
    expect(b1Gate?.targetChapterNumber).toBe(41);
    expect(b1Gate?.prerequisite.previousLevel).toBe('A2');
  });

  it('retrieves specific level gates by level and chapter', () => {
    const a2Gate = getLevelGate('A2');
    expect(a2Gate?.id).toBe('luca-a-roma:A2');
    expect(a2Gate?.targetChapterNumber).toBe(25);

    const gateAt25 = getGateForChapter(25);
    expect(gateAt25?.level).toBe('A2');

    const gateAt26 = getGateForChapter(26);
    expect(gateAt26).toBeUndefined(); // Ch 26 is not an entry gate
  });

  it('determines unlocked state via demonstrated test-out or prerequisite completion', () => {
    const a2Gate = getLevelGate('A2')!;
    const chaptersById = new Map([
      ['luca-a-roma-20', { id: 'luca-a-roma-20', number: 20 }],
      ['luca-a-roma-24', { id: 'luca-a-roma-24', number: 24 }],
      ['luca-a-roma-25', { id: 'luca-a-roma-25', number: 25 }],
    ]);

    // Initial state: locked
    expect(
      isLevelGateUnlocked(
        a2Gate,
        { unlockedLevelGates: [], completedChapterIds: [] },
        chaptersById,
      ),
    ).toBe(false);

    // Bypassed via readiness test: unlocked
    expect(
      isLevelGateUnlocked(
        a2Gate,
        { unlockedLevelGates: ['luca-a-roma:A2'], completedChapterIds: [] },
        chaptersById,
      ),
    ).toBe(true);

    // Completed prerequisite sequentially: unlocked
    expect(
      isLevelGateUnlocked(
        a2Gate,
        { unlockedLevelGates: [], completedChapterIds: ['luca-a-roma-24'] },
        chaptersById,
      ),
    ).toBe(true);
  });
});
