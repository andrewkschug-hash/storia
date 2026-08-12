export type ReadingLevel = 'beginner_early' | 'beginner' | 'beginner_plus';
export type ExposureState = 'normal' | 'reinforce' | 'recovering' | 'stable' | 'mastered';
export type QuestionBias = 'direct' | 'balanced' | 'inference';

export type AdaptiveScoreFactors = {
  struggle: number;
  importance: number;
  recency: number;
  storyRelevance: number;
  phraseRelevance: number;
  upcoming: number;
  overexposure: number;
};

export type AdaptiveItem = {
  kind: 'lemma' | 'phrase';
  id: string;
  italian: string;
  state: ExposureState;
  priority: number;
  factors: AdaptiveScoreFactors;
  encounterCount: number;
  tapCount: number;
  tapRate: number;
  recentTaps: number;
  recentWindow: number;
  recentTapRate: number;
  saved: boolean;
  reasons: string[];
};

export type AdaptiveLearnerProfile = {
  readingLevel: ReadingLevel;
  currentCEFRLevel: string;
  estimatedCEFRConfidence: number;
  vocabularyStrength: number;
  phraseStrength: number;
  comprehensionStrength: number;
  averageTapRate: number;
  recentTapRate: number;
  recentComprehensionScore: number;
  readingCompletionRate: number;
  preferredReinforcementCount: number;
  questionBias: QuestionBias;
  averageSentenceLength: number;
  averageSentenceDifficulty: number;
  averageChapterDifficulty: number;
  adaptiveItems: AdaptiveItem[];
  lastUpdatedAt: string;
};

export type AdaptationLog = {
  at: string;
  chapterId: string;
  chapterNumber: number;
  sentenceId: string;
  sceneId: string;
  selectedVariantId: string;
  reinforcedLemmas: string[];
  reinforcedPhrases: string[];
  reason: string;
  priority: number;
  rejected: { variantId: string; reason: string }[];
};

export type AdaptiveHit = {
  kind: 'lemma' | 'phrase';
  id: string;
  chapterId: string;
  chapterNumber: number;
};

export type AdaptivePersistedState = {
  logs: AdaptationLog[];
  recentHits: AdaptiveHit[];
  lastProfile: AdaptiveLearnerProfile | null;
  lastUpdatedAt: string | null;
};

export function createEmptyAdaptiveState(): AdaptivePersistedState {
  return { logs: [], recentHits: [], lastProfile: null, lastUpdatedAt: null };
}
