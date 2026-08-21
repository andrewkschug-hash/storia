/**
 * Phase 12H.1 — adversarial QA of scoreProductionAnswer.
 * Test-only. Does not modify overlay JSON, UI, audio, or STT.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import type { ProductionExercise, ProductionExercisesFile } from '@/src/content/schemas';
import { normalizeProductionText } from '@/src/production/normalize';
import { scoreProductionAnswer, type ProductionScoreResult } from '@/src/production/score';

const here = fileURLToPath(new URL('.', import.meta.url));
const overlay = JSON.parse(
  readFileSync(join(here, '../../../content/stories/luca-a-roma/production-exercises.json'), 'utf8'),
) as ProductionExercisesFile;

function byId(id: string): ProductionExercise {
  const exercise = overlay.exercises.find((item) => item.exerciseId === id);
  if (!exercise) throw new Error(`missing ${id}`);
  return exercise;
}

function synthetic(
  partial: Pick<ProductionExercise, 'promptEn' | 'expectedIt' | 'match'> & Partial<ProductionExercise>,
): ProductionExercise {
  return {
    exerciseId: partial.exerciseId ?? 'synthetic-12h1',
    storyId: 'luca-a-roma',
    chapterId: 'luca-a-roma-01',
    sourceSentenceId: 's01',
    level: 'A1',
    ...partial,
  };
}

function assertContract(result: ProductionScoreResult, mode: ProductionExercise['match']) {
  expect(result.result).toBeTruthy();
  expect(result.status).toBe(result.result);
  expect(result.reason).toBeTruthy();
  expect(result.mode).toBe(mode);
  expect(result.result).not.toBeNull();
  expect(result.reason).not.toBeNull();
}

describe('12H.1 person', () => {
  it('rejects related-person substitutions on Arrivo a Roma', () => {
    const arrive = byId('luca-a-roma-ch01-prod-01');
    expect(scoreProductionAnswer(arrive, 'Arrivo a Roma.').result).toBe('correct');
    expect(scoreProductionAnswer(arrive, 'Arrivi a Roma.').result).toBe('incorrect');
    expect(scoreProductionAnswer(arrive, 'Arriviamo a Roma.').result).toBe('incorrect');
  });

  it('rejects hai/ha for Ho fame', () => {
    const fame = byId('luca-a-roma-ch01-prod-02');
    expect(scoreProductionAnswer(fame, 'Ho fame.').result).toBe('correct');
    expect(scoreProductionAnswer(fame, 'Hai fame.').result).toBe('incorrect');
    expect(scoreProductionAnswer(fame, 'Ha fame.').result).toBe('incorrect');
  });

  it('rejects Devo when expected is Devi, and Devi when expected is Devo', () => {
    const youLeave = byId('luca-a-roma-ch14-prod-01');
    const iLeave = byId('luca-a-roma-ch14-prod-02');
    expect(scoreProductionAnswer(youLeave, 'Devi partire.').result).toBe('correct');
    expect(scoreProductionAnswer(youLeave, 'Devo partire.').result).toBe('incorrect');
    expect(scoreProductionAnswer(iLeave, 'Devo partire presto.').result).toBe('correct');
    expect(scoreProductionAnswer(iLeave, 'Devi partire presto.').result).toBe('incorrect');
  });
});

describe('12H.1 tense', () => {
  it('keeps passato prossimo; rejects present, imperfect, and future', () => {
    const arrived = byId('luca-a-roma-ch25-prod-01');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivato presto.').result).toBe('correct');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivata presto.').result).toBe('correct');
    expect(scoreProductionAnswer(arrived, 'Luca arriva presto.').result).toBe('incorrect');
    expect(scoreProductionAnswer(arrived, 'Luca arrivava presto.').result).toBe('incorrect');
    expect(scoreProductionAnswer(arrived, 'Luca arriverà presto.').result).toBe('incorrect');
  });
});

describe('12H.1 polarity', () => {
  it('treats missing non as incorrect', () => {
    const polarity = synthetic({
      promptEn: "I'm not coming.",
      expectedIt: 'Non vengo.',
      match: 'flexible',
    });
    expect(scoreProductionAnswer(polarity, 'Non vengo.').result).toBe('correct');
    expect(scoreProductionAnswer(polarity, 'Vengo.').result).toBe('incorrect');
    expect(scoreProductionAnswer(polarity, 'Vengo.').reason).toBe('wrong_polarity');
  });

  it('rejects flipped se-clause polarity', () => {
    const se = byId('luca-a-roma-ch29-prod-03');
    expect(scoreProductionAnswer(se, 'Se la gente non viene, chiude.').result).toBe('correct');
    expect(scoreProductionAnswer(se, 'Se la gente viene, chiude.').result).toBe('incorrect');
    expect(scoreProductionAnswer(se, 'Se la gente viene, non chiude.').result).toBe('incorrect');
  });
});

describe('12H.1 gender', () => {
  it('allows nuovo/nuova when the prompt leaves gender open', () => {
    const neu = byId('luca-a-roma-ch05-prod-03');
    expect(scoreProductionAnswer(neu, 'Sei nuovo a Roma?').result).toBe('correct');
    expect(scoreProductionAnswer(neu, 'Sei nuova a Roma.').result).toBe('correct');
  });

  it('allows arrivato/arrivata for Luca arrived early', () => {
    const arrived = byId('luca-a-roma-ch25-prod-01');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivato presto.').result).toBe('correct');
    expect(scoreProductionAnswer(arrived, 'Luca è arrivata presto.').result).toBe('correct');
  });

  it('does not score opposite gender as correct when the prompt specifies she', () => {
    const sheArrived = synthetic({
      promptEn: 'She arrived early.',
      expectedIt: 'È arrivata presto.',
      match: 'flexible',
    });
    expect(scoreProductionAnswer(sheArrived, 'È arrivata presto.').result).toBe('correct');
    expect(scoreProductionAnswer(sheArrived, 'È arrivato presto.').result).not.toBe('correct');
  });
});

describe('12H.1 subject drop', () => {
  it('accepts Ho pochi soldi for Io ho pochi soldi', () => {
    const money = byId('luca-a-roma-ch13-prod-02');
    expect(scoreProductionAnswer(money, 'Io ho pochi soldi.').result).toBe('correct');
    expect(scoreProductionAnswer(money, 'Ho pochi soldi.').result).toBe('correct');
    expect(scoreProductionAnswer(money, 'Hai pochi soldi.').result).toBe('incorrect');
  });

  it('does not treat person substitution as subject drop', () => {
    const leave = byId('luca-a-roma-ch14-prod-01');
    expect(scoreProductionAnswer(leave, 'Tu devi partire.').result).toBe('correct');
    expect(scoreProductionAnswer(leave, 'Devo partire.').result).toBe('incorrect');
  });
});

describe('12H.1 word order', () => {
  it('allows authored time-adverb movement only', () => {
    const work = byId('luca-a-roma-ch09-prod-03');
    const family = byId('luca-a-roma-ch24-prod-01');
    const arrived = byId('luca-a-roma-ch25-prod-01');
    expect(scoreProductionAnswer(work, 'Domani lavoro.').result).toBe('correct');
    expect(scoreProductionAnswer(work, 'Lavoro domani.').result).toBe('correct');
    expect(scoreProductionAnswer(family, 'Luca oggi resta a casa e parla con la famiglia.').result).toBe(
      'correct',
    );
    expect(scoreProductionAnswer(work, 'Lavoro io domani.').result).toBe('incorrect');
    expect(scoreProductionAnswer(arrived, 'Presto Luca è arrivato.').result).toBe('incorrect');
    expect(scoreProductionAnswer(family, 'Non resta a casa oggi.').result).toBe('incorrect');
  });
});

describe('12H.1 articles and prepositions', () => {
  it('accepts only authored article/preposition variants', () => {
    const station = byId('luca-a-roma-ch16-prod-01');
    const ticket = byId('luca-a-roma-ch13-prod-03');
    expect(scoreProductionAnswer(station, 'Andiamo in stazione.').result).toBe('correct');
    expect(scoreProductionAnswer(station, 'Andiamo nella stazione.').result).toBe('incorrect');
    expect(scoreProductionAnswer(ticket, 'Io voglio comprare il biglietto.').result).toBe('correct');
    expect(scoreProductionAnswer(ticket, 'Voglio comprare la biglietto.').result).toBe('incorrect');
  });
});

describe('12H.1 normalization', () => {
  it('accepts harmless case, punct, quotes, and apostrophe variants', () => {
    const thanks = synthetic({ promptEn: 'Thank you.', expectedIt: 'Grazie.', match: 'exact' });
    const ce = byId('luca-a-roma-ch04-prod-03');
    const dove = byId('luca-a-roma-ch18-prod-03');
    expect(scoreProductionAnswer(thanks, 'Grazie').result).toBe('correct');
    expect(scoreProductionAnswer(thanks, 'grazie.').result).toBe('correct');
    expect(scoreProductionAnswer(thanks, 'GRAZIE!').result).toBe('correct');
    expect(scoreProductionAnswer(thanks, '"Grazie"').result).toBe('correct');
    expect(scoreProductionAnswer(ce, "C'è una porta.").result).toBe('correct');
    expect(scoreProductionAnswer(ce, "C'e una porta.").result).toBe('correct');
    expect(scoreProductionAnswer(ce, 'c’è una porta').result).toBe('correct');
    expect(scoreProductionAnswer(ce, "C’E una porta").result).toBe('correct');
    expect(scoreProductionAnswer(dove, "Dov'è la valigia?").result).toBe('correct');
    expect(scoreProductionAnswer(dove, "Dov'e la valigia?").result).toBe('correct');
    expect(scoreProductionAnswer(dove, 'dov’è la valigia').result).toBe('correct');
  });

  it('does not collapse è/e, ho/ha, or drop non', () => {
    const rome = byId('luca-a-roma-ch02-prod-03');
    const fame = byId('luca-a-roma-ch01-prod-02');
    expect(normalizeProductionText('È a Roma.')).not.toBe(normalizeProductionText('E a Roma.'));
    expect(normalizeProductionText('Ho fame.')).not.toBe(normalizeProductionText('Ha fame.'));
    expect(normalizeProductionText('Ho fame.')).not.toBe(normalizeProductionText('O fame.'));
    expect(normalizeProductionText('Non vengo.')).toContain('non');
    expect(scoreProductionAnswer(rome, 'Roma e grande.').result).not.toBe('correct');
    expect(scoreProductionAnswer(fame, 'Ha fame.').result).toBe('incorrect');
  });
});

describe('12H.1 accents / almost', () => {
  it('marks Perché no vs Perche no as correct vs almost', () => {
    const why = byId('luca-a-roma-ch15-prod-03');
    expect(why.match).toBe('exact');
    expect(scoreProductionAnswer(why, 'Perché no?').result).toBe('correct');
    expect(scoreProductionAnswer(why, 'Perche no?').result).toBe('almost');
    expect(scoreProductionAnswer(why, 'Perche no?').reason).toBe('minor_recognition_like_difference');
    expect(scoreProductionAnswer(why, 'Perche').result).toBe('incorrect');
  });
});

describe('spelling leniency', () => {
  it('marks single-letter typos as almost and returns matchedIt', () => {
    const fame = byId('luca-a-roma-ch01-prod-02');
    const typo = scoreProductionAnswer(fame, 'Ho famme');
    expect(typo.result).toBe('almost');
    expect(typo.reason).toBe('minor_spelling');
    expect(typo.matchedIt).toBeTruthy();
  });

  it('does not treat person swaps as spelling almost', () => {
    const fame = byId('luca-a-roma-ch01-prod-02');
    expect(scoreProductionAnswer(fame, 'Ha fame.').result).toBe('incorrect');
    expect(scoreProductionAnswer(fame, 'Ha fame.').reason).toBe('wrong_person');
  });
});

describe('12H.1 extra words', () => {
  it('rejects unauthored additions in exact and flexible modes', () => {
    const thanks = synthetic({ promptEn: 'Thank you.', expectedIt: 'Grazie.', match: 'exact' });
    const fame = byId('luca-a-roma-ch01-prod-02');
    expect(scoreProductionAnswer(thanks, 'Grazie mille').result).toBe('incorrect');
    expect(scoreProductionAnswer(fame, 'Ho molta fame.').result).toBe('incorrect');
    expect(scoreProductionAnswer(fame, 'Ho fame oggi.').result).toBe('incorrect');
    expect(scoreProductionAnswer(fame, 'Ho davvero fame.').result).toBe('incorrect');
  });
});

describe('12H.1 missing words', () => {
  it('rejects a partial answer when both hunger and thirst are required', () => {
    const both = byId('luca-a-roma-ch17-prod-03');
    expect(scoreProductionAnswer(both, 'Ho sete e fame.').result).toBe('correct');
    expect(scoreProductionAnswer(both, 'Ho fame e sete.').result).toBe('correct');
    expect(scoreProductionAnswer(both, 'Ho fame.').result).toBe('incorrect');
    expect(scoreProductionAnswer(both, 'Ho sete.').result).toBe('incorrect');
  });
});

describe('12H.1 semantic slot safety', () => {
  it('adversarially tests se + people + not-come + close', () => {
    const se = byId('luca-a-roma-ch29-prod-03');
    expect(se.match).toBe('semantic');
    expect(scoreProductionAnswer(se, 'Se la gente non viene, il caffè chiude.').result).toBe('correct');
    expect(scoreProductionAnswer(se, 'Se la gente non viene, chiude.').result).toBe('correct');
    expect(scoreProductionAnswer(se, 'Se le persone non vengono, il caffè chiude.').result).toBe('correct');
    expect(scoreProductionAnswer(se, 'Se la gente viene, chiude.').result).toBe('incorrect');
    expect(scoreProductionAnswer(se, 'Se la gente non viene.').result).toBe('incorrect');
    expect(scoreProductionAnswer(se, 'La gente non viene.').result).toBe('incorrect');
    expect(scoreProductionAnswer(se, 'Se la gente viene, non chiude.').result).toBe('incorrect');
    expect(scoreProductionAnswer(se, 'Se il caffè chiude, la gente non viene.').result).toBe('incorrect');
    expect(scoreProductionAnswer(se, 'Se io non vengo, chiude.').result).toBe('incorrect');
    expect(scoreProductionAnswer(se, 'Se la gente non veniva, chiudeva.').result).toBe('incorrect');
  });

  it('adversarially tests need + plan', () => {
    const plan = byId('luca-a-roma-ch31-prod-04');
    expect(plan.match).toBe('semantic');
    expect(scoreProductionAnswer(plan, 'Ci serve un piano.').result).toBe('correct');
    expect(scoreProductionAnswer(plan, 'Dobbiamo fare un piano.').result).toBe('correct');
    expect(scoreProductionAnswer(plan, 'Un piano aiuta.').result).toBe('incorrect');
    expect(scoreProductionAnswer(plan, 'Il piano non serve.').result).toBe('incorrect');
    expect(scoreProductionAnswer(plan, 'Dobbiamo partire.').result).toBe('incorrect');
    expect(scoreProductionAnswer(plan, 'Ci serviva un piano.').result).toBe('incorrect');
    expect(scoreProductionAnswer(plan, 'Devo fare un piano.').result).toBe('incorrect');
  });
});

describe('12H.1 acceptableAnswers audit', () => {
  it('scores every authored alternative as correct', () => {
    for (const exercise of overlay.exercises) {
      for (const alt of exercise.acceptableAnswers ?? []) {
        const result = scoreProductionAnswer(exercise, alt);
        expect(result.result, `${exercise.exerciseId} :: ${alt}`).toBe('correct');
      }
    }
  });
});

describe('12H.1 unrecognized vs incorrect', () => {
  it('reserves unrecognized for empty or non-Italian input', () => {
    const fame = byId('luca-a-roma-ch01-prod-02');
    expect(scoreProductionAnswer(fame, '').result).toBe('unrecognized');
    expect(scoreProductionAnswer(fame, '   ').reason).toBe('empty_input');
    expect(scoreProductionAnswer(fame, '!!!').reason).toBe('empty_input');
    expect(scoreProductionAnswer(fame, '123').reason).toBe('unsupported_input');
    expect(scoreProductionAnswer(fame, '😀').reason).toBe('unsupported_input');
    expect(scoreProductionAnswer(fame, 'Hai fame.').result).toBe('incorrect');
    expect(scoreProductionAnswer(fame, 'Hai fame.').result).not.toBe('unrecognized');
  });
});

describe('12H.1 result contract', () => {
  it('always returns result, status, reason, and mode with status === result', () => {
    const probes = ['Arrivo a Roma.', 'Hai fame.', '', '123', 'Perche no?', 'Ho molta fame.'];
    for (const exercise of overlay.exercises) {
      assertContract(scoreProductionAnswer(exercise, exercise.expectedIt), exercise.match);
      for (const probe of probes) {
        assertContract(scoreProductionAnswer(exercise, probe), exercise.match);
      }
    }
  });
});
