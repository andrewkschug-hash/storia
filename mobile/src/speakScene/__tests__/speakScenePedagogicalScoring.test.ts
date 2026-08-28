import { describe, expect, it } from 'vitest';
import { getSpeakSceneById, speakTurnToExercise } from '@/src/content/speakScenes';
import { scoreProductionAnswer } from '@/src/production/score';
import {
  createDialogueState,
  incrementHintLevel,
  recordVoteAndAdvance,
  startScene,
  submitLearnerResponse,
  togglePartnerEnglish,
} from '../dialogueMachine';

describe('Speak the Scene Pedagogical Scoring & Dialogue Paths', () => {
  const scene15 = getSpeakSceneById('luca-a-roma-speak-15')!;
  const scene24 = getSpeakSceneById('luca-a-roma-speak-24')!;

  describe('Scene 15: Help Marco (Communicative vs Memorization Scoring)', () => {
    const turn1 = scene15.turns[0]; // Ask what is wrong
    const turn2 = scene15.turns[1]; // Offer help
    const turn3 = scene15.turns[2]; // Propose buying ticket
    const turn4 = scene15.turns[3]; // Agree to go together

    it('Turn 1 accepts natural communicative variants for asking what is wrong', () => {
      const ex = speakTurnToExercise(scene15, turn1);
      expect(scoreProductionAnswer(ex, "Cosa c'è?").result).toBe('correct');
      expect(scoreProductionAnswer(ex, "Che cosa c'è?").result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Cosa succede?').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Che cosa succede?').result).toBe('correct');
    });

    it('Turn 1 rejects off-target phrases', () => {
      const ex = speakTurnToExercise(scene15, turn1);
      expect(scoreProductionAnswer(ex, 'Cosa fai?').result).toBe('incorrect');
    });

    it('Turn 2 accepts multiple ways to offer help', () => {
      const ex = speakTurnToExercise(scene15, turn2);
      expect(scoreProductionAnswer(ex, 'Possiamo aiutare.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Possiamo aiutare Marco.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Io posso aiutare.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Possiamo dare una mano.').result).toBe('correct');
    });

    it('Turn 2 rejects negative polarity when intent is offer_help', () => {
      const ex = speakTurnToExercise(scene15, turn2);
      const res = scoreProductionAnswer(ex, 'Non possiamo aiutare.');
      expect(res.result).toBe('incorrect');
      expect(res.reason).toBe('wrong_polarity');
    });

    it('Turn 3 accepts proactive ticket purchase proposals', () => {
      const ex = speakTurnToExercise(scene15, turn3);
      expect(scoreProductionAnswer(ex, 'Voglio comprare il biglietto.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Compro io il biglietto.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Posso comprare il biglietto.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Voglio comprare un biglietto.').result).toBe('correct');
    });

    it('Turn 3 rejects passive statement without buying/helping', () => {
      const ex = speakTurnToExercise(scene15, turn3);
      // "Voglio il biglietto" misses the verb comprare/proactive concept
      const res = scoreProductionAnswer(ex, 'Voglio il biglietto.');
      expect(res.result).toBe('incorrect');
      expect(res.reason).toBe('missing_required_content');
    });

    it('Turn 4 accepts enthusiastic agreement to go together', () => {
      const ex = speakTurnToExercise(scene15, turn4);
      expect(scoreProductionAnswer(ex, 'Sì, andiamo insieme.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Andiamo insieme.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Va bene, andiamo insieme.').result).toBe('correct');
    });
  });

  describe('Scene 24: Sunday Call (Interactive Reassurance)', () => {
    const turn1 = scene24.turns[0];
    const turn2 = scene24.turns[1];
    const turn3 = scene24.turns[2];
    const turn4 = scene24.turns[3];

    it('Turn 1 accepts comforting well-being responses', () => {
      const ex = speakTurnToExercise(scene24, turn1);
      expect(scoreProductionAnswer(ex, 'Bene, grazie. Sto bene a Roma.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Sto bene a Roma.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Tutto bene, grazie. Sto bene a Roma.').result).toBe('correct');
    });

    it('Turn 2 confirms home and job at the café', () => {
      const ex = speakTurnToExercise(scene24, turn2);
      expect(scoreProductionAnswer(ex, 'Ho una casa e un lavoro al caffè.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Ho trovato casa e lavoro al caffè.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Ho una casa e un lavoro.').result).toBe('correct');
    });

    it('Turn 3 reassures that Luca is not alone and has friends', () => {
      const ex = speakTurnToExercise(scene24, turn3);
      expect(scoreProductionAnswer(ex, 'Non sono solo, ho amici come Sofia e Giulia.').result).toBe(
        'correct',
      );
      expect(scoreProductionAnswer(ex, 'Ho amici come Sofia e Giulia.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Non sono solo, ho amici.').result).toBe('correct');
    });

    it('Turn 4 sends love and confirms calling next Sunday', () => {
      const ex = speakTurnToExercise(scene24, turn4);
      expect(scoreProductionAnswer(ex, 'Sì, a domenica! Ti voglio bene, mamma.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'Ti voglio bene, mamma.').result).toBe('correct');
      expect(scoreProductionAnswer(ex, 'A domenica, mamma! Ti voglio bene.').result).toBe('correct');
    });
  });

  describe('Scene 20: Back in Rome (Celebration & Life in Rome)', () => {
    const scene20 = getSpeakSceneById('luca-a-roma-speak-20')!;
    it('handles all 4 turns with rich communicative variants', () => {
      const ex1 = speakTurnToExercise(scene20, scene20.turns[0]);
      expect(scoreProductionAnswer(ex1, 'Come sta tua mamma?').result).toBe('correct');

      const ex2 = speakTurnToExercise(scene20, scene20.turns[1]);
      expect(scoreProductionAnswer(ex2, 'Prendiamo un caffè insieme?').result).toBe('correct');

      const ex3 = speakTurnToExercise(scene20, scene20.turns[2]);
      expect(scoreProductionAnswer(ex3, 'Ora ho una casa, un lavoro e amici.').result).toBe('correct');

      const ex4 = speakTurnToExercise(scene20, scene20.turns[3]);
      expect(scoreProductionAnswer(ex4, 'Sono felice a Roma, questa è casa.').result).toBe('correct');
    });
  });

  describe('Scene 27: Sofia’s Opinion (Addressing Fear with a Plan)', () => {
    const scene27 = getSpeakSceneById('luca-a-roma-speak-27')!;
    it('handles generative agency turns', () => {
      const ex1 = speakTurnToExercise(scene27, scene27.turns[0]);
      expect(scoreProductionAnswer(ex1, "Io penso all'affitto e al lavoro ogni giorno.").result).toBe(
        'correct',
      );

      const ex2 = speakTurnToExercise(scene27, scene27.turns[1]);
      expect(scoreProductionAnswer(ex2, 'Ho paura, e la paura parla prima.').result).toBe('correct');

      const ex3 = speakTurnToExercise(scene27, scene27.turns[2]);
      expect(scoreProductionAnswer(ex3, 'Dobbiamo fare un piano, non solo aspettare.').result).toBe(
        'correct',
      );

      const ex4 = speakTurnToExercise(scene27, scene27.turns[3]);
      expect(scoreProductionAnswer(ex4, "Andiamo da Nonna Rosa. Magari lei ha un'idea.").result).toBe(
        'correct',
      );

      const ex5 = speakTurnToExercise(scene27, scene27.turns[4]);
      expect(scoreProductionAnswer(ex5, 'Sì, andiamo insieme da lei!').result).toBe('correct');
    });
  });

  describe('Scene 30: A Small Plan (Pitching & Negotiation)', () => {
    const scene30 = getSpeakSceneById('luca-a-roma-speak-30')!;
    it('handles multi-turn negotiation with the owner', () => {
      const ex1 = speakTurnToExercise(scene30, scene30.turns[0]);
      expect(scoreProductionAnswer(ex1, "Abbiamo un'idea: una piccola festa per il quartiere.").result).toBe(
        'correct',
      );

      const ex2 = speakTurnToExercise(scene30, scene30.turns[1]);
      expect(scoreProductionAnswer(ex2, 'Sabato c\'è caffè, pane e amici. Costa poco.').result).toBe(
        'correct',
      );

      const ex3 = speakTurnToExercise(scene30, scene30.turns[2]);
      expect(scoreProductionAnswer(ex3, 'Dobbiamo dire alle persone del quartiere.').result).toBe(
        'correct',
      );

      const ex4 = speakTurnToExercise(scene30, scene30.turns[3]);
      expect(scoreProductionAnswer(ex4, 'Va bene, proviamo sabato. Se non funziona, lei decide dopo.').result).toBe(
        'correct',
      );

      const ex5 = speakTurnToExercise(scene30, scene30.turns[4]);
      expect(scoreProductionAnswer(ex5, 'Se la gente viene, dobbiamo essere pronti.').result).toBe(
        'correct',
      );
    });
  });

  describe('Scene 35: The Cafe Fills Up (Event Execution)', () => {
    const scene35 = getSpeakSceneById('luca-a-roma-speak-35')!;
    it('handles welcoming and coordinating a bustling cafe', () => {
      const ex1 = speakTurnToExercise(scene35, scene35.turns[0]);
      expect(scoreProductionAnswer(ex1, 'Abbiamo fatto il nostro lavoro. Adesso aspettiamo le persone.').result).toBe(
        'correct',
      );

      const ex2 = speakTurnToExercise(scene35, scene35.turns[1]);
      expect(scoreProductionAnswer(ex2, 'Buongiorno Nonna Rosa! Entrate, c\'è posto per tutti!').result).toBe(
        'correct',
      );

      const ex3 = speakTurnToExercise(scene35, scene35.turns[2]);
      expect(scoreProductionAnswer(ex3, 'Marco resta alla porta, noi prepariamo il caffè!').result).toBe(
        'correct',
      );

      const ex4 = speakTurnToExercise(scene35, scene35.turns[3]);
      expect(scoreProductionAnswer(ex4, 'Al quartiere serve quel caffè!').result).toBe('correct');

      const ex5 = speakTurnToExercise(scene35, scene35.turns[4]);
      expect(scoreProductionAnswer(ex5, 'Se vi piace, tornate! Anche lunedì, anche giovedì.').result).toBe(
        'correct',
      );

      const ex6 = speakTurnToExercise(scene35, scene35.turns[5]);
      expect(scoreProductionAnswer(ex6, 'Insieme risolviamo il problema!').result).toBe('correct');
    });
  });

  describe('Scene 40: Luca Chooses Rome (Culmination Decision)', () => {
    const scene40 = getSpeakSceneById('luca-a-roma-speak-40')!;
    it('handles career negotiation and defining self-determination', () => {
      const ex1 = speakTurnToExercise(scene40, scene40.turns[0]);
      expect(
        scoreProductionAnswer(ex1, 'Voglio più ore, ma lunedì e mercoledì sera voglio tempo libero.').result,
      ).toBe('correct');

      const ex2 = speakTurnToExercise(scene40, scene40.turns[1]);
      expect(scoreProductionAnswer(ex2, 'Grazie! L\'orario qui mi va bene.').result).toBe('correct');

      const ex3 = speakTurnToExercise(scene40, scene40.turns[2]);
      expect(scoreProductionAnswer(ex3, 'La proposta è buona, ma ho detto di no.').result).toBe('correct');

      const ex4 = speakTurnToExercise(scene40, scene40.turns[3]);
      expect(
        scoreProductionAnswer(ex4, 'Per adesso resto a Roma. Questo lavoro, questa casa, queste persone.').result,
      ).toBe('correct');

      const ex5 = speakTurnToExercise(scene40, scene40.turns[4]);
      expect(scoreProductionAnswer(ex5, 'Brindiamo insieme! Per adesso questa è casa.').result).toBe(
        'correct',
      );
    });
  });

  describe('Complete User Experience Path Verification', () => {
    it('Happy Path: Complete Scene 15 cleanly through all turns', () => {
      let state = startScene(createDialogueState(scene15), scene15);
      expect(state.stage).toBe('learner_prompt');
      expect(state.history).toHaveLength(1);

      // Turn 1
      let ex = speakTurnToExercise(scene15, scene15.turns[0]);
      state = submitLearnerResponse(state, "Cosa c'è?", 'type', ex);
      expect(state.stage).toBe('feedback');
      expect(state.score?.result).toBe('correct');
      state = recordVoteAndAdvance(state, 'got_it', scene15);

      // Turn 2
      ex = speakTurnToExercise(scene15, scene15.turns[1]);
      state = submitLearnerResponse(state, 'Possiamo aiutare.', 'type', ex);
      state = recordVoteAndAdvance(state, 'got_it', scene15);

      // Turn 3
      ex = speakTurnToExercise(scene15, scene15.turns[2]);
      state = submitLearnerResponse(state, 'Voglio comprare il biglietto.', 'speak', ex);
      state = recordVoteAndAdvance(state, 'got_it', scene15);

      // Turn 4
      ex = speakTurnToExercise(scene15, scene15.turns[3]);
      state = submitLearnerResponse(state, 'Sì, andiamo insieme.', 'type', ex);
      state = recordVoteAndAdvance(state, 'got_it', scene15);

      expect(state.stage).toBe('summary');
      expect(state.history).toHaveLength(8); // 4 partner turns + 4 learner turns
    });

    it('Scaffolding Ladder Path: Levels 0 -> 1 -> 2 -> 3 before answering', () => {
      let state = startScene(createDialogueState(scene15), scene15);
      expect(state.hintLevel).toBe(0);

      // Tap hint -> Level 1 (keywords)
      state = incrementHintLevel(state);
      expect(state.hintLevel).toBe(1);

      // Tap hint -> Level 2 (cloze)
      state = incrementHintLevel(state);
      expect(state.hintLevel).toBe(2);

      // Tap hint -> Level 3 (model response + audio)
      state = incrementHintLevel(state);
      expect(state.hintLevel).toBe(3);

      const ex = speakTurnToExercise(scene15, scene15.turns[0]);
      state = submitLearnerResponse(state, "Cosa c'è?", 'speak', ex);
      expect(state.stage).toBe('feedback');
      expect(state.score?.result).toBe('correct');
    });

    it('Translation Toggle Path: English translation is hidden by default and toggleable', () => {
      let state = startScene(createDialogueState(scene15), scene15);
      expect(state.partnerEnglishVisible).toBe(false);

      // Tap to translate
      state = togglePartnerEnglish(state);
      expect(state.partnerEnglishVisible).toBe(true);

      // Tap to hide
      state = togglePartnerEnglish(state);
      expect(state.partnerEnglishVisible).toBe(false);
    });
  });
});
