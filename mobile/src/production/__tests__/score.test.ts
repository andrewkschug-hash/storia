import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import type { ProductionExercise, ProductionExercisesFile } from '@/src/content/schemas';
import { getProductionExercisesForChapter } from '@/src/content/productionExercises';
import {
  countProductionSentences,
  countProductionWords,
  scoreProductionAnswer,
} from '@/src/production/score';

const here = fileURLToPath(new URL('.', import.meta.url));
const overlay = JSON.parse(
  readFileSync(join(here, '../../../content/stories/luca-a-roma/production-exercises.json'), 'utf8'),
) as ProductionExercisesFile;

function byId(id: string): ProductionExercise {
  const exercise = overlay.exercises.find((item) => item.exerciseId === id);
  if (!exercise) throw new Error(`missing ${id}`);
  return exercise;
}

function synthetic(partial: Pick<ProductionExercise, 'promptEn' | 'expectedIt' | 'match'> & Partial<ProductionExercise>): ProductionExercise {
  return {
    exerciseId: partial.exerciseId ?? 'synthetic',
    storyId: 'luca-a-roma',
    chapterId: 'luca-a-roma-01',
    sourceSentenceId: 's01',
    acceptableAnswers: partial.acceptableAnswers,
    semantic: partial.semantic,
    level: 'A1',
    ...partial,
  };
}

describe('scoreProductionAnswer overlay coverage', () => {
  it('scores every expectedIt as correct', () => {
    for (const exercise of overlay.exercises) {
      const result = scoreProductionAnswer(exercise, exercise.expectedIt);
      expect(result.result, exercise.exerciseId).toBe('correct');
      expect(result.status, exercise.exerciseId).toBe('correct');
      expect(result.mode, exercise.exerciseId).toBe(exercise.match);
    }
  });

  it('scores every authored acceptableAnswer as correct', () => {
    for (const exercise of overlay.exercises) {
      for (const alt of exercise.acceptableAnswers ?? []) {
        const result = scoreProductionAnswer(exercise, alt);
        expect(result.result, `${exercise.exerciseId} :: ${alt}`).toBe('correct');
      }
    }
  });

  it('ignores punctuation and apostrophe unicode on canonical answers', () => {
    const fame = byId('luca-a-roma-ch01-prod-02');
    expect(scoreProductionAnswer(fame, '  HO FAME!!!  ').result).toBe('correct');
    const ce = byId('luca-a-roma-ch04-prod-03');
    expect(scoreProductionAnswer(ce, 'C’è una porta').result).toBe('correct');
    const dove = byId('luca-a-roma-ch18-prod-03');
    expect(scoreProductionAnswer(dove, "Dov'è la valigia?").result).toBe('correct');
    expect(scoreProductionAnswer(dove, 'Dove è la valigia?').result).toBe('correct');
  });

  it('returns unrecognized for empty transcripts', () => {
    const fame = byId('luca-a-roma-ch01-prod-02');
    expect(scoreProductionAnswer(fame, '   ').result).toBe('unrecognized');
    expect(scoreProductionAnswer(fame, '').reason).toBe('empty_input');
    expect(scoreProductionAnswer(fame, '123').reason).toBe('unsupported_input');
  });

  it('documents long or multi-act targets without failing them', () => {
    const flagged = overlay.exercises.filter(
      (exercise) =>
        countProductionWords(exercise.expectedIt) > 12 || countProductionSentences(exercise.expectedIt) > 2,
    );
    expect(flagged.map((exercise) => exercise.exerciseId)).toEqual(
      expect.arrayContaining(['luca-a-roma-ch37-prod-02', 'luca-a-roma-ch39-prod-01']),
    );
    for (const exercise of flagged) {
      expect(scoreProductionAnswer(exercise, exercise.expectedIt).result).toBe('correct');
    }
  });
});

describe('STEP 11 scoring matrix', () => {
  it('exact: Grazie variants', () => {
    const exercise = synthetic({
      promptEn: 'Thank you.',
      expectedIt: 'Grazie.',
      match: 'exact',
    });
    expect(scoreProductionAnswer(exercise, 'Grazie.').result).toBe('correct');
    expect(scoreProductionAnswer(exercise, 'Grazie.').reason).toBe('exact_match');
    expect(scoreProductionAnswer(exercise, 'grazie').result).toBe('correct');
    expect(scoreProductionAnswer(exercise, 'Grazie!').result).toBe('correct');
    expect(scoreProductionAnswer(exercise, 'Grazie mille').result).toBe('incorrect');
    expect(scoreProductionAnswer(exercise, 'Grazie mille').reason).toBe('extra_required_content');
  });

  it('subject drop: Io sono Luca', () => {
    const exercise = synthetic({
      promptEn: 'I am Luca.',
      expectedIt: 'Io sono Luca.',
      match: 'flexible',
    });
    expect(scoreProductionAnswer(exercise, 'Sono Luca.').result).toBe('correct');
    expect(scoreProductionAnswer(exercise, 'Sono Luca.').reason).toBe('subject_drop');
    expect(scoreProductionAnswer(exercise, 'Io sono Luca.').result).toBe('correct');
    expect(scoreProductionAnswer(exercise, 'Sei Luca.').result).toBe('incorrect');
    expect(scoreProductionAnswer(exercise, 'Sei Luca.').reason).toBe('wrong_person');
  });

  it('gender: arrivato/arrivata when unspecified, wrong tense rejected', () => {
    const arrived = byId('luca-a-roma-ch25-prod-01');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivato presto.').result).toBe('correct');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivata presto.').result).toBe('correct');
    expect(scoreProductionAnswer(arrived, 'Luca arriva presto.').result).toBe('incorrect');
    expect(scoreProductionAnswer(arrived, 'Luca arriva presto.').reason).not.toBe('correct');
  });

  it('tense: passato prossimo vs present (A2 ch25)', () => {
    const arrived = byId('luca-a-roma-ch25-prod-01');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivato presto.').result).toBe('correct');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivata presto.').result).toBe('correct');
    expect(scoreProductionAnswer(arrived, 'Luca arriva presto.').result).toBe('incorrect');
    expect(scoreProductionAnswer(arrived, 'Luca arriva presto.').reason).not.toBe('correct');
  });

  it('polarity: Non vengo vs Vengo', () => {
    const exercise = synthetic({
      promptEn: "I'm not coming.",
      expectedIt: 'Non vengo.',
      match: 'flexible',
    });
    expect(scoreProductionAnswer(exercise, 'Non vengo.').result).toBe('correct');
    expect(scoreProductionAnswer(exercise, 'Vengo.').result).toBe('incorrect');
    expect(scoreProductionAnswer(exercise, 'Vengo.').reason).toBe('wrong_polarity');
  });

  it("apostrophe: c'e matches c'è", () => {
    const ce = byId('luca-a-roma-ch04-prod-03');
    const result = scoreProductionAnswer(ce, "c'e una porta");
    expect(result.result).toBe('correct');
    expect(result.reason).toBe('apostrophe_normalization');
  });

  it('word order: Domani lavoro / Lavoro domani', () => {
    const work = byId('luca-a-roma-ch09-prod-03');
    expect(scoreProductionAnswer(work, 'Domani lavoro.').result).toBe('correct');
    expect(scoreProductionAnswer(work, 'Lavoro domani.').result).toBe('correct');
    expect(scoreProductionAnswer(work, 'Lavoro domani.').reason).toMatch(/word_order_variant|acceptable_answer/);
  });

  it('wrong person: Ho fame vs Hai fame', () => {
    const fame = byId('luca-a-roma-ch01-prod-02');
    expect(scoreProductionAnswer(fame, 'Ho fame.').result).toBe('correct');
    expect(scoreProductionAnswer(fame, 'Hai fame.').result).toBe('incorrect');
    expect(scoreProductionAnswer(fame, 'Hai fame.').reason).toBe('wrong_person');
  });

  it('semantic: rejects missing concept, wrong polarity, wrong person', () => {
    const se = byId('luca-a-roma-ch29-prod-03');
    expect(se.match).toBe('semantic');
    expect(scoreProductionAnswer(se, 'Se la gente non viene, il caffè chiude.').result).toBe('correct');
    expect(scoreProductionAnswer(se, 'Se la gente viene, il caffè chiude.').reason).toBe('wrong_polarity');
    expect(scoreProductionAnswer(se, 'Il caffè chiude.').reason).toBe('missing_required_content');
    const plan = byId('luca-a-roma-ch31-prod-04');
    expect(scoreProductionAnswer(plan, 'Un piano aiuta.').reason).toBe('missing_required_content');
    expect(scoreProductionAnswer(plan, 'Il piano non serve.').reason).toBe('wrong_polarity');
  });
});

describe('scoreProductionAnswer adversarial overlay cases', () => {
  it('accepts subject-drop for Ho fame and rejects wrong need', () => {
    const fame = byId('luca-a-roma-ch01-prod-02');
    expect(scoreProductionAnswer(fame, 'Io ho fame.').result).toBe('correct');
    expect(scoreProductionAnswer(fame, 'Ha fame.').result).toBe('incorrect');
    expect(scoreProductionAnswer(fame, 'Ho sete.').result).toBe('incorrect');
  });

  it('accepts PP gender and rejects wrong verb', () => {
    const arrived = byId('luca-a-roma-ch25-prod-01');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivata presto.').result).toBe('correct');
    expect(scoreProductionAnswer(arrived, 'Luca è andato presto.').result).toBe('incorrect');
  });

  it('accepts arrivato/arrivata for Luca arrived early', () => {
    const arrived = byId('luca-a-roma-ch25-prod-01');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivato presto.').result).toBe('correct');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivata presto.').result).toBe('correct');
  });

  it('enforces se-clause polarity and required slots', () => {
    const se = byId('luca-a-roma-ch29-prod-03');
    expect(scoreProductionAnswer(se, 'Se le persone non vengono, il caffè chiude.').result).toBe('correct');
    expect(scoreProductionAnswer(se, 'Se la gente non viene, il caffè non chiude.').result).toBe(
      'incorrect',
    );
    expect(scoreProductionAnswer(se, 'La gente non viene.').result).toBe('incorrect');
  });

  it('requires a need slot for we need a plan', () => {
    const plan = byId('luca-a-roma-ch31-prod-04');
    expect(scoreProductionAnswer(plan, 'Ci serve un piano.').result).toBe('correct');
    expect(scoreProductionAnswer(plan, 'Dobbiamo fare un piano.').result).toBe('correct');
    expect(scoreProductionAnswer(plan, 'Abbiamo bisogno di un piano.').result).toBe('correct');
  });

  it('does not accept wrong person on you have to leave', () => {
    const leave = byId('luca-a-roma-ch14-prod-01');
    expect(scoreProductionAnswer(leave, 'Devi partire.').result).toBe('correct');
    expect(scoreProductionAnswer(leave, 'Tu devi partire.').result).toBe('correct');
    expect(scoreProductionAnswer(leave, 'Devo partire.').result).toBe('incorrect');
  });

  it('accepts learner gender on Sei nuovo/nuova', () => {
    const neu = byId('luca-a-roma-ch05-prod-03');
    expect(scoreProductionAnswer(neu, 'Sei nuovo a Roma?').result).toBe('correct');
    expect(scoreProductionAnswer(neu, 'Sei nuova a Roma?').result).toBe('correct');
  });

  it('does not treat arbitrary paraphrases as correct', () => {
    const home = byId('luca-a-roma-ch20-prod-01');
    expect(scoreProductionAnswer(home, 'Sono a casa.').result).toBe('correct');
    expect(scoreProductionAnswer(home, 'Abito a Roma e sto bene.').result).toBe('incorrect');
    const exact = byId('luca-a-roma-ch01-prod-04');
    expect(scoreProductionAnswer(exact, 'Buongiorno.').result).toBe('correct');
    expect(scoreProductionAnswer(exact, 'Buonasera.').result).toBe('incorrect');
  });

  it('uses Vorrei as the bread-and-water target', () => {
    const bread = byId('luca-a-roma-ch23-prod-01');
    expect(bread.expectedIt).toBe('Vorrei pane e acqua.');
    expect(bread.promptEn).toBe("I'd like bread and water.");
    expect(scoreProductionAnswer(bread, 'Vorrei pane e acqua.').result).toBe('correct');
    expect(scoreProductionAnswer(bread, 'Pane e acqua, grazie.').result).toBe('correct');
    expect(scoreProductionAnswer(bread, 'Voglio una pizza.').result).toBe('incorrect');
  });

  it('treats missing accent on perché as almost, not correct', () => {
    const exercise = synthetic({
      promptEn: 'Why?',
      expectedIt: 'Perché?',
      match: 'exact',
    });
    expect(scoreProductionAnswer(exercise, 'Perché?').result).toBe('correct');
    expect(scoreProductionAnswer(exercise, 'Perche?').result).toBe('almost');
    expect(scoreProductionAnswer(exercise, 'Perche?').reason).toBe('minor_recognition_like_difference');
  });
});

describe('Phase 12H overlay loader still clones', () => {
  it('does not expose overlay mutations through chapter loading', () => {
    const first = getProductionExercisesForChapter('luca-a-roma-01');
    first[0].promptEn = 'MUTATED';
    first[0].expectedIt = 'MUTATED';
    const again = getProductionExercisesForChapter('luca-a-roma-01');
    expect(again[0].promptEn).toBe('I arrive in Rome.');
    expect(again[0].expectedIt).toBe('Arrivo a Roma.');
  });
});
