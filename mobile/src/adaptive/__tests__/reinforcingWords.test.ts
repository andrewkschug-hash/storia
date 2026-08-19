import { describe, expect, it } from 'vitest';

import { selectReinforcingWords } from '@/src/adaptive/reinforcingWords';
import type { AdaptiveItem, AdaptiveLearnerProfile } from '@/src/adaptive/types';

function item(
  italian: string,
  state: AdaptiveItem['state'],
  priority: number,
): AdaptiveItem {
  return {
    kind: 'lemma',
    id: italian,
    italian,
    state,
    priority,
    factors: {
      struggle: 0,
      importance: 0,
      recency: 0,
      storyRelevance: 0,
      phraseRelevance: 0,
      upcoming: 0,
      overexposure: 0,
    },
    encounterCount: 5,
    tapCount: 2,
    tapRate: 0.4,
    recentTaps: 1,
    recentWindow: 5,
    recentTapRate: 0.2,
    saved: false,
    reasons: [],
  };
}

function profile(items: AdaptiveItem[]): AdaptiveLearnerProfile {
  return {
    readingLevel: 'beginner',
    currentCEFRLevel: 'A1',
    estimatedCEFRConfidence: 0.5,
    vocabularyStrength: 0.5,
    phraseStrength: 0.5,
    comprehensionStrength: 0.5,
    averageTapRate: 0.2,
    recentTapRate: 0.2,
    recentComprehensionScore: 0.5,
    readingCompletionRate: 0.2,
    preferredReinforcementCount: 2,
    questionBias: 'balanced',
    averageSentenceLength: 8,
    averageSentenceDifficulty: 25,
    averageChapterDifficulty: 30,
    adaptiveItems: items,
    lastUpdatedAt: new Date().toISOString(),
  };
}

describe('selectReinforcingWords', () => {
  it('returns reinforce and recovering items by priority', () => {
    const words = selectReinforcingWords(
      profile([
        item('casa', 'stable', 0.9),
        item('partire', 'reinforce', 0.8),
        item('lavoro', 'recovering', 0.7),
        item('tornare', 'reinforce', 0.6),
        item('essere', 'normal', 0.5),
      ]),
    );
    expect(words).toEqual(['partire', 'lavoro', 'tornare']);
  });

  it('respects the limit', () => {
    const words = selectReinforcingWords(
      profile([
        item('a', 'reinforce', 0.9),
        item('b', 'reinforce', 0.8),
        item('c', 'recovering', 0.7),
      ]),
      2,
    );
    expect(words).toEqual(['a', 'b']);
  });
});
