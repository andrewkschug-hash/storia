import { describe, expect, it } from 'vitest';
import type { SpeakScene } from '@/src/progress/types';
import {
  createDialogueState,
  incrementHintLevel,
  recordVoteAndAdvance,
  startScene,
  submitLearnerResponse,
  togglePartnerEnglish,
} from '../dialogueMachine';
import { speakTurnToExercise } from '@/src/content/speakScenes';

const mockScene: SpeakScene = {
  id: 'test-scene-01',
  storyId: 'luca-a-roma',
  batchEnd: 15,
  title: 'Test Scene',
  summaryEn: 'A test conversational scene.',
  sourceRange: { start: 11, end: 15 },
  turns: [
    {
      id: 'turn-1',
      speakerId: 'sofia',
      speakerName: 'Sofia',
      it: 'Come possiamo aiutare Marco?',
      en: 'How can we help Marco?',
      learnerTurn: {
        role: 'Luca',
        objectiveEn: 'Tell Sofia you want to buy the train ticket for Marco.',
        intent: 'offer_help',
        hintKeywords: ['comprare', 'biglietto', 'Marco'],
        hintScaffold: 'Voglio ______ il biglietto per Marco.',
        targetIt: 'Voglio comprare il biglietto per Marco.',
        acceptableAnswers: ['Voglio comprare il biglietto.'],
      },
    },
    {
      id: 'turn-2',
      speakerId: 'sofia',
      speakerName: 'Sofia',
      it: 'Va bene! Quanto costa il biglietto?',
      en: 'All right! How much does the ticket cost?',
      learnerTurn: {
        role: 'Luca',
        objectiveEn: 'Say that the ticket costs twenty euros.',
        intent: 'explain_problem',
        targetIt: 'Il biglietto costa venti euro.',
        acceptableAnswers: ['Costa venti euro.'],
      },
    },
  ],
};

describe('SpeakScene Dialogue State Machine', () => {
  it('initializes in intro stage with empty history', () => {
    const initial = createDialogueState(mockScene);
    expect(initial.stage).toBe('intro');
    expect(initial.turnIndex).toBe(0);
    expect(initial.history).toHaveLength(0);
  });

  it('starts scene by adding first partner line to history and entering learner_prompt', () => {
    const initial = createDialogueState(mockScene);
    const started = startScene(initial, mockScene);
    expect(started.stage).toBe('learner_prompt');
    expect(started.turnIndex).toBe(0);
    expect(started.history).toHaveLength(1);
    expect(started.history[0].kind).toBe('partner');
    expect(started.history[0].it).toBe('Come possiamo aiutare Marco?');
  });

  it('steps through hint levels from 0 to 3 without exceeding 3', () => {
    let state = startScene(createDialogueState(mockScene), mockScene);
    expect(state.hintLevel).toBe(0);
    state = incrementHintLevel(state);
    expect(state.hintLevel).toBe(1);
    state = incrementHintLevel(state);
    expect(state.hintLevel).toBe(2);
    state = incrementHintLevel(state);
    expect(state.hintLevel).toBe(3);
    state = incrementHintLevel(state);
    expect(state.hintLevel).toBe(3);
  });

  it('toggles partner English translation visibility', () => {
    let state = startScene(createDialogueState(mockScene), mockScene);
    expect(state.partnerEnglishVisible).toBe(false);
    state = togglePartnerEnglish(state);
    expect(state.partnerEnglishVisible).toBe(true);
    state = togglePartnerEnglish(state);
    expect(state.partnerEnglishVisible).toBe(false);
  });

  it('submits learner response and scores it correctly into feedback stage', () => {
    const started = startScene(createDialogueState(mockScene), mockScene);
    const exercise = speakTurnToExercise(mockScene, mockScene.turns[0]);
    const feedback = submitLearnerResponse(
      started,
      'Voglio comprare il biglietto per Marco.',
      'type',
      exercise,
    );
    expect(feedback.stage).toBe('feedback');
    expect(feedback.score?.result).toBe('correct');
    expect(feedback.draft).toBe('Voglio comprare il biglietto per Marco.');
  });

  it('advances to next partner turn after recording self-assessment vote', () => {
    const started = startScene(createDialogueState(mockScene), mockScene);
    const exercise = speakTurnToExercise(mockScene, mockScene.turns[0]);
    const feedback = submitLearnerResponse(
      started,
      'Voglio comprare il biglietto per Marco.',
      'type',
      exercise,
    );
    const next = recordVoteAndAdvance(feedback, 'got_it', mockScene);
    expect(next.stage).toBe('learner_prompt');
    expect(next.turnIndex).toBe(1);
    // History should now contain: 1st partner line, 1st learner response, 2nd partner line
    expect(next.history).toHaveLength(3);
    expect(next.history[0].kind).toBe('partner');
    expect(next.history[1].kind).toBe('learner');
    expect(next.history[2].kind).toBe('partner');
    expect(next.history[2].it).toBe('Va bene! Quanto costa il biglietto?');
  });

  it('reaches summary stage after final turn is voted', () => {
    let state = startScene(createDialogueState(mockScene), mockScene);
    // Turn 1
    const ex1 = speakTurnToExercise(mockScene, mockScene.turns[0]);
    state = submitLearnerResponse(state, 'Voglio comprare il biglietto.', 'type', ex1);
    state = recordVoteAndAdvance(state, 'got_it', mockScene);

    // Turn 2
    const ex2 = speakTurnToExercise(mockScene, mockScene.turns[1]);
    state = submitLearnerResponse(state, 'Costa venti euro.', 'speak', ex2);
    state = recordVoteAndAdvance(state, 'got_it', mockScene);

    expect(state.stage).toBe('summary');
    expect(state.history).toHaveLength(4);
  });
});
