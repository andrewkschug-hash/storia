import type { CEFRLevel } from '@/src/cefr/levels';
import { parseCEFRLevel } from '@/src/cefr/levels';
import { profileFor } from '@/src/cefr/profiles';
import type { ComprehensionQuestionType } from '@/src/content/schemas';

export type AudioAuthoringStatus =
  | 'not_generated'
  | 'generating'
  | 'review_required'
  | 'approved';

export type ArcAuthoringTemplate = {
  targetCEFR: CEFRLevel;
  title: string;
  titleIt: string;
  storyObjective: string;
  narrativeStage: string;
  targetVocabularySize: number;
  vocabularyReuseGoal: number;
  sentenceComplexityTarget: {
    averageWordCount: number;
    maxClauses: number;
  };
  characters: string[];
  locations: string[];
  comprehensionTypes: ComprehensionQuestionType[];
  adaptiveOpportunities: string[];
  audioStatus: AudioAuthoringStatus;
  chapters: never[];
};

export function createArcAuthoringTemplate(partial: {
  targetCEFR: string;
  title: string;
  titleIt?: string;
  storyObjective: string;
  characters: string[];
  locations: string[];
  adaptiveOpportunities?: string[];
}): ArcAuthoringTemplate {
  const targetCEFR = parseCEFRLevel(partial.targetCEFR);
  const profile = profileFor(targetCEFR);
  const comprehensionTypes: ComprehensionQuestionType[] =
    targetCEFR === 'A1' || targetCEFR === 'A1+'
      ? ['direct', 'character']
      : targetCEFR === 'A2' || targetCEFR === 'A2+'
        ? ['direct', 'event', 'sequence']
        : targetCEFR === 'B1' || targetCEFR === 'B1+'
          ? ['event', 'sequence', 'inference']
          : ['inference'];

  return {
    targetCEFR,
    title: partial.title,
    titleIt: partial.titleIt ?? partial.title,
    storyObjective: partial.storyObjective,
    narrativeStage: profile.narrativeStage,
    targetVocabularySize: profile.targetVocabularySize,
    vocabularyReuseGoal: profile.repetitionTarget,
    sentenceComplexityTarget: {
      averageWordCount: profile.averageSentenceLength,
      maxClauses: Math.ceil(profile.maximumSentenceComplexity),
    },
    characters: partial.characters,
    locations: partial.locations,
    comprehensionTypes,
    adaptiveOpportunities: partial.adaptiveOpportunities ?? [],
    audioStatus: 'not_generated',
    chapters: [],
  };
}
