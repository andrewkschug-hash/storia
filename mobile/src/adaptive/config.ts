export const ADAPTIVE_CONFIG = {
  recentWindow: 6,
  minEncountersForTapRate: 4,
  maxReinforcementsPerChapter: 3,
  maxConsecutiveChapterHits: 2,
  maxRepeatsPerTargetPerChapter: 1,
  skipIfNaturalCount: 3,
  upcomingPenalty: 0.22,
  overexposurePenalty: 0.2,
  weights: {
    struggle: 0.34,
    importance: 0.18,
    recency: 0.14,
    storyRelevance: 0.14,
    phraseRelevance: 0.1,
  },
} as const;

/** High-value items the engine is allowed to reinforce. */
export const ADAPTIVE_LEMMA_TARGETS = [
  'aspettare',
  'mangiare',
  'cercare',
  'trovare',
  'andare',
  'volere',
  'potere',
  'avere',
  'essere',
  'casa',
  'lavoro',
  'vicino',
  'camminare',
  'aiutare',
  'vivere',
  'entrare',
  'affitto',
] as const;

export const ADAPTIVE_PHRASE_TARGETS = [
  'ha_fame',
  'va_bene',
  'non_lo_so',
  'come_stai',
  'ci_vediamo',
] as const;

export const ADAPTIVE_LEMMA_SET = new Set<string>(ADAPTIVE_LEMMA_TARGETS);
export const ADAPTIVE_PHRASE_SET = new Set<string>(ADAPTIVE_PHRASE_TARGETS);
