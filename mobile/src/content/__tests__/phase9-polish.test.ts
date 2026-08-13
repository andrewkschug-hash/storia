import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getContentBundle } from '@/src/content';
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
  resetOnboarding,
} from '@/src/onboarding/storage';
import {
  hasSeenReaderTip,
  markReaderTipSeen,
  resetReaderTip,
} from '@/src/reader/storage';
import { buildChapterRecap } from '@/src/content/chapterRecap';
import {
  comprehensionUsesItalianPrompt,
  recapBilingual,
  recapItalianPrimary,
  scaffoldingBand,
} from '@/src/content/scaffolding';
import { ReviewService } from '@/src/review/ReviewService';

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: async (key: string) => {
        store.delete(key);
      },
    },
  };
});

describe('Phase 9 onboarding', () => {
  const email = 'learner@example.com';

  beforeEach(async () => {
    await resetOnboarding(email);
  });

  it('starts incomplete on first run', async () => {
    expect(await hasCompletedOnboarding(email)).toBe(false);
  });

  it('persists completion per account', async () => {
    await markOnboardingComplete(email);
    expect(await hasCompletedOnboarding(email)).toBe(true);
    expect(await hasCompletedOnboarding('other@example.com')).toBe(false);
  });

  it('can reset for development', async () => {
    await markOnboardingComplete(email);
    await resetOnboarding(email);
    expect(await hasCompletedOnboarding(email)).toBe(false);
  });

  it('migrates legacy device-wide flag onto the account', async () => {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem('storia.hasCompletedOnboarding', '1');
    expect(await hasCompletedOnboarding(email)).toBe(true);
    expect(await AsyncStorage.getItem('storia.hasCompletedOnboarding')).toBeNull();
    expect(await AsyncStorage.getItem('storia.hasCompletedOnboarding:learner@example.com')).toBe('1');
  });
});

describe('reader tip preference', () => {
  beforeEach(async () => {
    await resetReaderTip();
  });

  it('is unseen on first chapter visit', async () => {
    expect(await hasSeenReaderTip()).toBe(false);
  });

  it('persists dismissal', async () => {
    await markReaderTipSeen();
    expect(await hasSeenReaderTip()).toBe(true);
  });
});

describe('Phase 9 scaffolding fade', () => {
  it('maps chapter bands for English fade', () => {
    expect(scaffoldingBand(3)).toBe('a1_early');
    expect(scaffoldingBand(8)).toBe('a1_mid');
    expect(scaffoldingBand(13)).toBe('a1_late');
    expect(scaffoldingBand(22)).toBe('a1_plus');
    expect(scaffoldingBand(30)).toBe('a2');
  });

  it('introduces Italian comprehension from chapter 6', () => {
    expect(comprehensionUsesItalianPrompt(5)).toBe(false);
    expect(comprehensionUsesItalianPrompt(6)).toBe(true);
  });

  it('ramps questionIt across A1 chapters', () => {
    const chapters = [...getContentBundle().chapters.values()]
      .filter((c) => c.number >= 1 && c.number <= 20)
      .sort((a, b) => a.number - b.number);
    expect(chapters).toHaveLength(20);
    for (const ch of chapters) {
      const withIt = ch.questions.filter((q) => !!q.questionIt).length;
      if (ch.number <= 5) expect(withIt).toBe(0);
      else if (ch.number <= 10) expect(withIt).toBe(1);
      else if (ch.number <= 15) expect(withIt).toBe(2);
      else expect(withIt).toBe(3);
    }
  });

  it('uses Italian-first recap from chapter 11', () => {
    expect(recapItalianPrimary(10)).toBe(false);
    expect(recapItalianPrimary(11)).toBe(true);
    expect(recapBilingual(8)).toBe(true);
    expect(recapBilingual(16)).toBe(true);
  });
});

describe('Phase 9 review nudge', () => {
  it('builds optional chapter review copy', () => {
    const bundle = {
      chapters: new Map([
        [
          'luca-a-roma-01',
          {
            id: 'luca-a-roma-01',
            number: 1,
            paragraphs: [
              {
                sentences: [{ tokens: [{ lemmaId: 'casa' }, { lemmaId: 'luca' }] }],
              },
            ],
          },
        ],
      ]),
      lexicon: [{ lemmaId: 'casa', introducedChapter: 1, italian: 'casa', english: 'house' }],
    } as never;
    const copy = new ReviewService(bundle).chapterNudgeCopy(1, bundle, { lemmas: {}, phrases: {} });
    expect(copy.readyCount).toBeGreaterThan(0);
    expect(copy.headline).toMatch(/from this chapter/);
  });
});

describe('Phase 9 Italian recap anchors', () => {
  it('includes italianFacts from story sentences', () => {
    const chapter = {
      number: 12,
      title: 'T',
      titleIt: 'T',
      events: [{ rememberedFacts: ['Luca helps Marco'] }],
      paragraphs: [
        {
          sentences: [
            { text: 'Luca aiuta Marco.', tokens: [], phrases: [] },
            { text: 'Sono amici.', tokens: [], phrases: [] },
            { text: 'Roma è bella.', tokens: [], phrases: [] },
          ],
        },
      ],
    } as never;
    const recap = buildChapterRecap(chapter, new Map());
    expect(recap.italianFacts.length).toBeGreaterThan(0);
    expect(recap.italianPrimary).toBe(true);
  });
});
