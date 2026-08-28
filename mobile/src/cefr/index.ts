export {
  CEFR_LEVELS,
  CEFR_LABELS,
  canTransition,
  cefrDistance,
  cefrFromScore,
  cefrRank,
  isCEFRLevel,
  majorCEFRLevel,
  nextCEFRLevel,
  parseCEFRLevel,
  previousCEFRLevel,
  type CEFRLevel,
  type MajorCEFRLevel,
} from '@/src/cefr/levels';
export { CEFR_PROFILES, profileFor, type CefrContentProfile } from '@/src/cefr/profiles';
export { measureSentence, type SentenceComplexity } from '@/src/cefr/sentence';
export { enrichLexiconEntry, deriveCefrMetadata } from '@/src/cefr/lexicon';
export {
  combineDifficulty,
  fitAgainstTarget,
  DIFFICULTY_WEIGHTS,
  type DifficultyBreakdown,
  type TargetFit,
} from '@/src/cefr/score';
export { analyzeChapter, auditStoryCefr, type ChapterCefrAudit } from '@/src/cefr/chapter';
export {
  evaluateLevelReadiness,
  readinessFromLearner,
  chooseLevel,
  familiaritySurvivesTransition,
  type LevelReadiness,
  type ReadinessStatus,
} from '@/src/cefr/readiness';
export { LevelReadinessService } from '@/src/cefr/LevelReadinessService';

import { getContentBundle } from '@/src/content';
import { LevelReadinessService } from '@/src/cefr/LevelReadinessService';
import { getProgressService } from '@/src/progress';

let readinessService: LevelReadinessService | null = null;

export function getLevelReadinessService(): LevelReadinessService {
  if (!readinessService) {
    readinessService = new LevelReadinessService(getContentBundle(), getProgressService());
  }
  return readinessService;
}

/** @internal tests */
export function __resetLevelReadinessService() {
  readinessService = null;
}
export {
  DEFAULT_LUCA_ARCS,
  parseArcs,
  arcForChapter,
  assignChapterArc,
  type StoryArc,
} from '@/src/cefr/arcs';
export {
  A1_CROSS_STORY_THRESHOLDS,
  A1_DOMAIN_GROUPS,
  COMPREHENSION_PASS_SCORE,
  a1ChaptersForStory,
  collectA1ReadinessSignals,
  evaluateCrossStoryA1Readiness,
  vocabularySupportFromState,
  type A1DomainGroupEvidence,
  type A1ReadinessSignal,
  type CrossStoryA1Metrics,
  type CrossStoryA1Readiness,
} from '@/src/cefr/crossStoryReadiness';
export { evaluateLearnerCrossStoryA1 } from '@/src/cefr/a1LearnerReadiness';
export {
  createArcAuthoringTemplate,
  type ArcAuthoringTemplate,
} from '@/src/cefr/authoring';
export {
  questionTypeCEFR,
  comprehensionDifficultyScore,
  comprehensionFitsLevel,
} from '@/src/cefr/comprehension';
export {
  B1_ASSESSMENT_PASSAGE,
  B1_DIAGNOSTIC_ITEMS,
  scoreB1Diagnostic,
  calculateB1LongitudinalEvidence,
  evaluateA2ToB1Readiness,
  type B1DiagnosticItem,
  type B1DiagnosticItemResult,
  type B1DiagnosticResult,
  type B1DiagnosticSection,
  type B1HardFloors,
  type B1LongitudinalEvidence,
  type A2ToB1ReadinessEvaluation,
} from '@/src/cefr/b1Readiness';
export {
  A2_B1_READINESS_ASSESSMENT,
  type A2ReadinessAssessmentData,
  type A2ReadinessChoiceQuestion,
  type A2ReadinessDomain,
  type A2ReadinessProductionQuestion,
  type A2ReadinessQuestion,
} from '@/src/cefr/a2ReadinessAssessment';
export {
  evaluateA2Readiness,
  scoreMultipleChoice,
  scoreProduction,
  type A2DomainResult,
  type A2LearnerAnswer,
  type A2QuestionResult,
  type A2ReadinessEvaluation,
} from '@/src/cefr/a2ReadinessService';
export {
  buildLevelGatesForStory,
  getLevelGate,
  getGateForChapter,
  isLevelGateUnlocked,
  type LevelGate,
  type LevelGateBypass,
  type LevelGatePrerequisite,
} from '@/src/cefr/levelGates';
export {
  A1_PLUS_READINESS_ASSESSMENT,
  A2_READINESS_ASSESSMENT,
  B1_READINESS_ASSESSMENT,
  B1_PLUS_READINESS_ASSESSMENT,
  READINESS_ASSESSMENTS_BY_LEVEL,
  getReadinessAssessmentForLevel,
  evaluateReadinessAssessment,
  scoreMultipleChoiceQuestion,
  scoreProductionQuestion,
  type ReadinessAssessmentData,
  type ReadinessChoiceQuestion,
  type ReadinessDomain,
  type ReadinessEvaluation,
  type ReadinessOutcome,
  type ReadinessProductionQuestion,
  type ReadinessQuestion,
  type ReadinessQuestionResult,
  type DomainScoreResult,
  type LearnerAnswer,
} from '@/src/cefr/readinessAssessments';


