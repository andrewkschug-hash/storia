import type { ProductionExercise, SpeakScene, SpeakSceneTurn } from '@/src/content/schemas';
import { scoreProductionAnswer } from '@/src/production/score';
import type { SpeakSceneVote } from '@/src/progress/types';
import type { DialogueHistoryItem, DialogueState, HintLevel } from './types';

export function createDialogueState(scene?: SpeakScene | null): DialogueState {
  return {
    stage: 'intro',
    turnIndex: 0,
    hintLevel: 0,
    draft: '',
    inputMode: 'type',
    score: null,
    vote: null,
    history: [],
    partnerAudioPlaying: false,
    partnerEnglishVisible: false,
  };
}

export function startScene(state: DialogueState, scene: SpeakScene): DialogueState {
  const firstTurn = scene.turns?.[0];
  const history: DialogueHistoryItem[] = firstTurn
    ? [
        {
          id: `${firstTurn.id}-partner`,
          kind: 'partner',
          speakerId: firstTurn.speakerId,
          speakerName: firstTurn.speakerName,
          it: firstTurn.it,
          en: firstTurn.en,
          audioId: firstTurn.audioId,
        },
      ]
    : [];

  return {
    ...state,
    stage: 'learner_prompt',
    turnIndex: 0,
    hintLevel: 0,
    draft: '',
    score: null,
    vote: null,
    history,
    partnerAudioPlaying: false,
    partnerEnglishVisible: false,
  };
}

export function incrementHintLevel(state: DialogueState): DialogueState {
  const nextLevel = Math.min(3, state.hintLevel + 1) as HintLevel;
  return {
    ...state,
    hintLevel: nextLevel,
  };
}

export function togglePartnerEnglish(state: DialogueState): DialogueState {
  return {
    ...state,
    partnerEnglishVisible: !state.partnerEnglishVisible,
  };
}

export function setPartnerAudioPlaying(state: DialogueState, playing: boolean): DialogueState {
  return {
    ...state,
    partnerAudioPlaying: playing,
  };
}

export function submitLearnerResponse(
  state: DialogueState,
  text: string,
  inputMode: 'type' | 'speak',
  exercise: ProductionExercise,
): DialogueState {
  const trimmed = text.trim();
  const scored = scoreProductionAnswer(exercise, trimmed);

  return {
    ...state,
    stage: 'feedback',
    draft: trimmed,
    inputMode,
    score: scored,
  };
}

export function proceedToSelfAssessment(state: DialogueState): DialogueState {
  return {
    ...state,
    stage: 'self_assessment',
  };
}

export function recordVoteAndAdvance(
  state: DialogueState,
  vote: SpeakSceneVote,
  scene: SpeakScene,
): DialogueState {
  const turns = scene.turns ?? [];
  const currentTurn = turns[state.turnIndex];
  if (!currentTurn) return state;

  const learnerItem: DialogueHistoryItem = {
    id: `${currentTurn.id}-learner`,
    kind: 'learner',
    role: currentTurn.learnerTurn?.role ?? 'Luca',
    learnerText: state.draft,
    targetIt: state.score?.matchedIt ?? currentTurn.learnerTurn?.targetIt ?? currentTurn.it,
    score: state.score?.result ?? 'correct',
    vote,
  };

  const nextIndex = state.turnIndex + 1;
  const isDone = nextIndex >= turns.length;

  if (isDone) {
    return {
      ...state,
      stage: 'summary',
      vote,
      history: [...state.history, learnerItem],
    };
  }

  const nextTurn = turns[nextIndex];
  const nextPartnerItem: DialogueHistoryItem = {
    id: `${nextTurn.id}-partner`,
    kind: 'partner',
    speakerId: nextTurn.speakerId,
    speakerName: nextTurn.speakerName,
    it: nextTurn.it,
    en: nextTurn.en,
    audioId: nextTurn.audioId,
  };

  return {
    ...state,
    stage: 'learner_prompt',
    turnIndex: nextIndex,
    hintLevel: 0,
    draft: '',
    score: null,
    vote: null,
    history: [...state.history, learnerItem, nextPartnerItem],
    partnerAudioPlaying: false,
    partnerEnglishVisible: false,
  };
}
