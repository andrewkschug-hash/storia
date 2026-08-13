/**
 * Guardrails for A2 audio range + sentence.id usage.
 * Run: node --test scripts/__tests__/a2-audio-common.test.cjs
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  parseA2Range,
  collectClipPlan,
  chapterNumberFromContentId,
  isA1ContentId,
  isA2ContentId,
} = require('../a2-audio-common');

describe('parseA2Range', () => {
  it('defaults to 21–40', () => {
    const r = parseA2Range([]);
    assert.equal(r.from, 21);
    assert.equal(r.to, 40);
    assert.equal(r.generate, false);
  });

  it('fails below 21', () => {
    assert.throws(() => parseA2Range(['--from=20', '--to=24']), /outside/);
  });

  it('fails above 40', () => {
    assert.throws(() => parseA2Range(['--from=21', '--to=41']), /outside/);
  });

  it('requires --generate for TTS', () => {
    assert.equal(parseA2Range(['--from=21', '--to=24']).generate, false);
    assert.equal(parseA2Range(['--generate']).generate, true);
  });
});

describe('contentId helpers', () => {
  it('parses chapter numbers from actual ids', () => {
    assert.equal(chapterNumberFromContentId('sentence:luca-a-roma-40:s53:standard'), 40);
    assert.equal(isA1ContentId('sentence:luca-a-roma-20:s01:standard'), true);
    assert.equal(isA2ContentId('sentence:luca-a-roma-21:s01:standard'), true);
    assert.equal(isA2ContentId('sentence:luca-a-roma-20:s01:standard'), false);
  });
});

describe('authored clip plan uses sentence.id', () => {
  it('counts 872 standard + 34 extended for 21–40', () => {
    const plan = collectClipPlan(21, 40);
    assert.equal(plan.standard.length, 872);
    assert.equal(plan.extended.length, 34);
    assert.equal(plan.clips.length, 906);
  });

  it('uses s53 not index 48 for Ch40 last sentence', () => {
    const plan = collectClipPlan(40, 40);
    const lastStd = plan.standard[plan.standard.length - 1];
    assert.equal(lastStd.sentenceId, 's53');
    assert.equal(lastStd.contentId, 'sentence:luca-a-roma-40:s53:standard');
    assert.notEqual(lastStd.sentenceId, `s${String(plan.standard.length).padStart(2, '0')}`);
  });

  it('accepts Ch39 gaps without inventing s28', () => {
    const plan = collectClipPlan(39, 39);
    assert.equal(plan.standard.length, 48);
    assert.ok(!plan.standard.some((c) => c.sentenceId === 's28'));
    const gap = plan.idGaps.find((g) => g.chapter === 39);
    assert.ok(gap.missing.includes('s28'));
  });
});
