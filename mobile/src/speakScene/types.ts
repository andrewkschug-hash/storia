import type {
  ProductionScoreResult,
  ProductionScoreStatus,
} from '@/src/production/score';
import type { SpeakScene, SpeakSceneTurn } from '@/src/content/schemas';
import type { SpeakSceneVote } from '@/src/progress/types';

export type DialogueStage =
  | 'intro'
  | 'partner_turn'
  | 'learner_prompt'
  | 'evaluating'
  | 'feedback'
  | 'self_assessment'
  | 'summary';

export type HintLevel = 0 | 1 | 2 | 3;

export type DialogueHistoryItem =
  | {
      id: string;
      kind: 'partner';
      speakerId: string;
      speakerName: string;
      it: string;
      en: string;
      audioId?: string;
    }
  | {
      id: string;
      kind: 'learner';
      role: string;
      learnerText: string;
      targetIt: string;
      score: ProductionScoreStatus;
      vote?: SpeakSceneVote;
    };

export type DialogueState = {
  stage: DialogueStage;
  turnIndex: number;
  hintLevel: HintLevel;
  draft: string;
  inputMode: 'type' | 'speak';
  score: ProductionScoreResult | null;
  vote: SpeakSceneVote | null;
  history: DialogueHistoryItem[];
  partnerAudioPlaying: boolean;
  partnerEnglishVisible: boolean;
  revealedTranslations: Record<string, boolean>;
};
